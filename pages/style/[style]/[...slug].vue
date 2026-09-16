<!--
  风格路由薄壳 —— 多风格架构的统一入口
  （架构契约见 docs/architecture/multi-style-ui.md）

  职责只有两个：
  1. 从 styles/registry.ts 解析风格 id，未知风格抛 404
  2. 按 slug 从该风格 index.ts 的页面映射中取组件渲染

  本文件不含任何 UI：页面骨架（导航/页脚/区块）由各风格自己实现。
  包裹元素上的 data-style 属性是 token 契约的挂载点
  （styles/<id>/tokens.css 以 [data-style='<id>'] 选择器生效）。
-->
<script setup lang="ts">
import { computed, defineAsyncComponent, watch } from 'vue'
import type { Component } from 'vue'
import { styleRegistry, type StyleEntry } from '~/styles/registry'

// 使用裸布局：不注入过渡层的导航/页脚
definePageMeta({ layout: 'style' })

const route = useRoute()
const { t, locale } = useI18n()

// 风格 id 与页面路径：/style/xxx → '/'；/style/xxx/about → '/about'
const styleId = computed(() => String(route.params.style ?? ''))
const pagePath = computed(() => {
  const parts = route.params.slug
  const segments = Array.isArray(parts) ? parts : parts ? [parts] : []
  return '/' + segments.join('/')
})

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

// 中文名/英文名按当前语言展示
const displayName = computed(() => (locale.value.startsWith('zh') ? meta.value!.name : meta.value!.en))

useHead({
  title: () => `${displayName.value} · ${t('styles.pageTitleSuffix')}`,
  meta: () => [
    { name: 'description', content: meta.value!.note },
    { property: 'og:title', content: `${displayName.value} · ${t('styles.pageTitleSuffix')}` },
    { property: 'og:description', content: meta.value!.note },
  ],
})
</script>

<template>
  <div :data-style="styleId" class="style-page" :class="`style-${styleId}`">
    <component :is="pageComponent" v-if="pageComponent" />
  </div>
</template>
