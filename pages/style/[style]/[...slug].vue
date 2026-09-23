<!--
  风格路由薄壳 —— 多风格架构的统一入口
  （架构契约见 docs/architecture/multi-style-ui.md）

  职责：
  1. 从 styles/registry.ts 解析风格 id，未知风格抛 404
  2. 按 slug 从该风格 index.ts 的页面映射中取组件渲染
  3. 详情路由（/blog/<slug>、/projects/<slug>）：取数后交给风格的 detail 组件

  本文件不含任何 UI：页面骨架与正文排版由各风格自己实现。
  关键分工：取数（含上下篇）属于业务层，只写在这里一份；
  风格组件只接收 DetailView 数据负责「长什么样」。
  包裹元素上的 data-style 属性是 token 契约的挂载点
  （styles/<id>/tokens.css 以 [data-style='<id>'] 选择器生效）。
-->
<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import type { Component } from 'vue'
import { styleRegistry, type StyleEntry } from '~/styles/registry'
import type { DetailView } from '~/types/detail'

// 使用裸布局：不注入过渡层的导航/页脚
definePageMeta({ layout: 'style' })

const route = useRoute()
const { t, locale } = useI18n()

const styleId = computed(() => String(route.params.style ?? ''))

// slug 段：/style/xxx → []；/style/xxx/about → ['about']；/style/xxx/blog/foo → ['blog','foo']
const slugSegments = computed(() => {
  const parts = route.params.slug
  return Array.isArray(parts) ? parts : parts ? [parts] : []
})

/** 详情类型：第二段路径存在且首段是 blog / projects 时进入详情页 */
const detailKind = computed<'post' | 'project' | null>(() => {
  const seg = slugSegments.value
  if (seg.length === 2 && seg[0] === 'blog') return 'post'
  if (seg.length === 2 && seg[0] === 'projects') return 'project'
  return null
})
const detailSlug = computed(() => (detailKind.value ? slugSegments.value[1] : ''))
const pagePath = computed(() => '/' + slugSegments.value.join('/'))

// 按需加载各风格入口模块：每风格独立 chunk，互不加载
const styleEntries = import.meta.glob('/styles/*/index.ts') as Record<
  string,
  () => Promise<{ default?: StyleEntry }>
>

// 注册表与入口模块校验：未知风格 404（SSG 预渲染阶段同样生效）
const meta = computed(() => styleRegistry.find((item) => item.id === styleId.value))
if (!meta.value || !styleEntries[`/styles/${styleId.value}/index.ts`]) {
  throw createError({ statusCode: 404, fatal: true })
}

// 防御：同实例内切换到未注册风格（正常导航不会发生）
watch(styleId, (id) => {
  if (!styleRegistry.some((item) => item.id === id)) {
    showError({ statusCode: 404 })
  }
})

// slug 变化时重建异步组件；该风格未实现的页面抛 404
const pageComponent = computed<Component | null>(() => {
  if (detailKind.value) return null
  const loader = styleEntries[`/styles/${styleId.value}/index.ts`]
  const targetPath = pagePath.value
  if (!loader) {
    return null
  }
  return defineAsyncComponent(async () => {
    const mod = await loader()
    const page = mod.default?.pages?.[targetPath]
    if (!page) {
      throw createError({ statusCode: 404, fatal: true })
    }
    return page
  })
})

/** 风格自己的详情阅读页组件（未导出 detail 的风格，详情路由 404） */
const detailComponent = computed<Component | null>(() => {
  if (!detailKind.value) return null
  const loader = styleEntries[`/styles/${styleId.value}/index.ts`]
  if (!loader) return null
  return defineAsyncComponent(async () => {
    const mod = await loader()
    const detail = mod.default?.detail
    if (!detail) {
      throw createError({ statusCode: 404, fatal: true })
    }
    return detail
  })
})

/**
 * 详情数据：取数在业务层（composables）完成一次，再把结果交给风格组件。
 * 内容不存在的 slug 直接抛 404（SEO 需要真实状态码，不能静默显示空页）。
 */
const detailView = ref<DetailView | null>(null)

/** path 形如 /blog/zh/<slug> 或 /projects/en/<slug>，末段即 slug */
function slugFromPath(path: string): string {
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1] || ''
}

async function loadDetail(): Promise<void> {
  const kind = detailKind.value
  if (!kind) {
    detailView.value = null
    return
  }

  if (kind === 'post') {
    const { getPostBySlug, getPostNeighbors } = useBlog()
    const { post, content } = await getPostBySlug(detailSlug.value)
    if (!post) throw createError({ statusCode: 404, fatal: true })
    const { prev, next } = await getPostNeighbors(post.path)
    detailView.value = {
      kind: 'post',
      doc: post,
      content: (content ?? null) as Record<string, unknown> | null,
      prev: prev ? { title: prev.title, to: `/style/${styleId.value}/blog/${slugFromPath(prev.path)}` } : null,
      next: next ? { title: next.title, to: `/style/${styleId.value}/blog/${slugFromPath(next.path)}` } : null,
    }
    return
  }

  const { getProjectBySlug, getProjectNeighbors } = useProjects()
  const { project, content } = await getProjectBySlug(detailSlug.value)
  if (!project) throw createError({ statusCode: 404, fatal: true })
  const { prev, next } = await getProjectNeighbors(project.path)
  detailView.value = {
    kind: 'project',
    doc: project,
    content: (content ?? null) as Record<string, unknown> | null,
    prev: prev
      ? { title: prev.title, to: `/style/${styleId.value}/projects/${slugFromPath(prev.path)}` }
      : null,
    next: next
      ? { title: next.title, to: `/style/${styleId.value}/projects/${slugFromPath(next.path)}` }
      : null,
  }
}

// 首次（SSR / 预渲染）必须同步拿到数据，否则生成的是空页面
await loadDetail()
// 客户端同页导航到另一篇时重新取数
watch([detailKind, detailSlug, locale], loadDetail)

// 中文名/英文名按当前语言展示
const displayName = computed(() =>
  locale.value.startsWith('zh') ? meta.value!.name : meta.value!.en,
)

// SEO：页面级 canonical / og:url / og:locale（路由相关标签必须每页自设）
const siteUrl = String(useRuntimeConfig().public.siteUrl || '')
const baseURL = String(useRuntimeConfig().app.baseURL || '/')
const pageUrl = computed(() => `${siteUrl}${baseURL}${route.path.slice(1)}`)

// 详情页用文章/项目自身的信息做 SEO，列表页与子页用风格名
const detailTitle = computed(() =>
  detailView.value ? detailView.value.doc.title : `${displayName.value} · ${t('styles.pageTitleSuffix')}`,
)
const detailDescription = computed(() => {
  const view = detailView.value
  if (view && view.doc.description) return view.doc.description
  return meta.value!.note
})

useHead({
  title: () => detailTitle.value,
  link: [{ rel: 'canonical', href: pageUrl.value }],
  meta: () => {
    const isZh = locale.value.startsWith('zh')
    return [
      { name: 'description', content: detailDescription.value },
      { property: 'og:title', content: detailTitle.value },
      { property: 'og:description', content: detailDescription.value },
      { property: 'og:url', content: pageUrl.value },
      { property: 'og:locale', content: isZh ? 'zh_CN' : 'en_US' },
      { property: 'og:locale:alternate', content: isZh ? 'en_US' : 'zh_CN' },
    ]
  },
})
</script>

<template>
  <div :data-style="styleId" class="style-page" :class="`style-${styleId}`">
    <component :is="detailComponent" v-if="detailComponent && detailView" :view="detailView" />
    <component :is="pageComponent" v-else-if="pageComponent" />
  </div>
</template>
