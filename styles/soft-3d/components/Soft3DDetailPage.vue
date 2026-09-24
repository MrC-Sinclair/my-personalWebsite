<!--
  Soft3DDetailPage - soft-3d 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/soft-3d/blog/<slug>、/style/soft-3d/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  柔和立体语法：卡片带纵向错位（Z 轴漂浮）+ 大范围柔影 + 3D 光泽小球图标，
  深空底 + 尘埃景深。h1 由 Soft3DSubPage 外壳渲染（它带 title/eyebrow
  props），本组件只写正文与导航。
  正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <Soft3DSubPage
    :eyebrow="kindLabel"
    :title="view.doc.title"
    :description="view.doc.description ?? ''"
    variant="violet"
  >
    <article class="detail">
      <div class="meta">
        <span class="badge badge--date">{{ formatDate(view.doc.date) }}</span>
        <span v-if="category" class="badge badge--cat">{{ category }}</span>
        <span v-for="tag in tags" :key="tag" class="badge">{{ tag }}</span>
      </div>

      <div v-if="projectLinks.length" class="links">
        <a
          v-for="link in projectLinks"
          :key="link.href"
          class="link"
          :href="link.href"
          target="_blank"
          rel="noopener"
        >
          {{ link.label }}<span aria-hidden="true">↗</span>
        </a>
      </div>

      <!-- 正文卡：柔影 + 轻微上浮（与其他卡错落一致） -->
      <div class="body float-card">
        <ContentRenderer v-if="view.content" :value="view.content" class="prose" />
        <p v-else class="empty">{{ t('common.noData') }}</p>
      </div>

      <nav v-if="view.prev || view.next" class="nav" aria-label="上下篇">
        <NuxtLink
          v-if="view.prev"
          class="nav-item float-card float-card--a"
          :to="view.prev.to"
        >
          <span class="nav-label">{{ t('blog.prev') }}</span>
          <span class="nav-title">{{ view.prev.title }}</span>
        </NuxtLink>
        <span v-else class="nav-item nav-item--empty" />
        <NuxtLink
          v-if="view.next"
          class="nav-item nav-item--next float-card float-card--b"
          :to="view.next.to"
        >
          <span class="nav-label">{{ t('blog.next') }}</span>
          <span class="nav-title">{{ view.next.title }}</span>
        </NuxtLink>
      </nav>

      <NuxtLink class="back" :to="listPath">
        <span aria-hidden="true">←</span>
        {{ t(listTitleKey) }}
      </NuxtLink>
    </article>
  </Soft3DSubPage>
</template>

<script setup lang="ts">
/**
 * @file Soft3D 风格详情阅读页
 * @description 漂浮柔影卡承载正文，h1 交给 SubPage 外壳，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import Soft3DSubPage from './Soft3DSubPage.vue'

const props = defineProps<{ view: DetailView }>()

const { t } = useI18n()
const localePath = useLocalePath()
const { styleId } = useStyleContentPath()

const listPath = computed(() =>
  localePath(
    props.view.kind === 'post'
      ? `/style/${styleId.value}/blog`
      : `/style/${styleId.value}/projects`,
  ),
)
const listTitleKey = computed(() => (props.view.kind === 'post' ? 'blog.title' : 'projects.title'))
const kindLabel = computed(() => t(props.view.kind === 'post' ? 'nav.blog' : 'nav.projects'))

const tags = computed(() => props.view.doc.tags ?? [])

/** 分类只有文章有：用 in 守卫在联合类型上取字段 */
const category = computed(() => {
  const doc = props.view.doc
  return 'category' in doc ? doc.category : undefined
})

const projectLinks = computed(() => {
  const doc = props.view.doc
  if (!isProjectDoc(doc)) return []
  const links: Array<{ href: string; label: string }> = []
  if (doc.demoUrl) links.push({ href: doc.demoUrl, label: t('projects.demo') })
  if (doc.githubUrl) links.push({ href: doc.githubUrl, label: t('projects.github') })
  return links
})
</script>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

/* 漂浮卡：大范围柔影 + 纵向错位（与其他卡不同 top） */
.float-card {
  padding: clamp(18px, 2.8vw, 30px);
  border-radius: var(--radius);
  background: var(--c-surface);
  box-shadow: var(--shadow);
}

.float-card--a {
  transform: translateY(-6px);
}

.float-card--b {
  transform: translateY(6px);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.badge {
  padding: 5px 14px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-muted);
  border-radius: 999px;
  background: var(--c-surface);
  box-shadow: var(--shadow);
}

.badge--date {
  font-family: var(--font-mono);
}

.badge--cat {
  color: var(--c-on-accent, #10102a);
  background: var(--c-accent);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* 3D 感按钮：径向高光 + 落影 */
.link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-height: 44px;
  padding: 0 20px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-on-accent, #10102a);
  text-decoration: none;
  border-radius: 999px;
  background: radial-gradient(120% 120% at 30% 20%, #ffffff 0%, var(--c-accent) 45%, var(--c-accent-2, #8b5cf6) 100%);
  box-shadow: var(--shadow);
  transition: transform var(--transition);
}

.link:hover {
  transform: translateY(-2px);
}

.prose :deep(h2) {
  margin: 1.8em 0 0.7em;
  font-family: var(--font-head);
  font-size: clamp(19px, 2.3vw, 25px);
  font-weight: 700;
  color: var(--c-text);
}

.prose :deep(h3) {
  margin: 1.5em 0 0.6em;
  font-family: var(--font-head);
  font-size: clamp(16px, 1.9vw, 20px);
  font-weight: 700;
  color: var(--c-text);
}

.prose :deep(p) {
  margin: 0 0 1.15em;
}

.prose :deep(a) {
  color: var(--c-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin: 0 0 1.15em;
  padding-left: 1.3em;
}

.prose :deep(li) {
  margin-bottom: 0.45em;
}

.prose :deep(blockquote) {
  margin: 0 0 1.3em;
  padding: 14px 18px;
  color: var(--c-muted);
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 0.05);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.12);
}

.prose :deep(code) {
  padding: 3px 7px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  border-radius: 8px;
  background: rgb(255 255 255 / 0.08);
}

.prose :deep(pre) {
  padding: 16px 18px;
  margin: 0 0 1.4em;
  overflow-x: auto;
  border-radius: var(--radius-sm);
  background: rgb(2 2 18 / 0.6);
}

.prose :deep(pre code) {
  padding: 0;
  background: none;
}

.prose :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-sm);
}

.prose :deep(hr) {
  height: 1px;
  margin: 2.2em 0;
  border: none;
  background: var(--c-border);
}

.prose :deep(table) {
  width: 100%;
  margin-bottom: 1.4em;
  border-collapse: collapse;
}

.prose :deep(th),
.prose :deep(td) {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--c-border);
}

.empty {
  margin: 0;
  color: var(--c-muted);
}

.nav {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  padding-top: 6px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 20px;
  text-decoration: none;
  transition: transform var(--transition);
}

.nav-item:hover {
  transform: translateY(-4px);
}

.nav-item--next {
  text-align: right;
}

.nav-item--empty {
  background: none;
  box-shadow: none;
}

.nav-label {
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--c-muted);
}

.nav-title {
  font-weight: 600;
  color: var(--c-text);
}

.back {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  min-height: 44px;
  padding: 0 18px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-muted);
  text-decoration: none;
  border-radius: 999px;
  background: var(--c-surface);
  box-shadow: var(--shadow);
  transition: color var(--transition);
}

.back:hover {
  color: var(--c-text);
}

@media (prefers-reduced-motion: reduce) {
  .link,
  .nav-item,
  .back {
    transition: none;
  }

  .link:hover,
  .nav-item:hover {
    transform: none;
  }
}
</style>
