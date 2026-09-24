<!--
  MetroDetailPage - metro 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/metro/blog/<slug>、/style/metro/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  Metro 语法：直角（零圆角）、纯色瓦片块、左上小标签 + 左下大标题的瓦片文法、
  超细体大标题、黑缝分格。正文承载在一块深色瓦片上，标签做成小方标。
  正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <MetroSubPage>
    <article class="detail">
      <NuxtLink class="back tile" :to="listPath">
        <span class="back-mark" aria-hidden="true">◀</span>
        <span class="back-text">{{ t(listTitleKey) }}</span>
      </NuxtLink>

      <header class="head tile tile--accent">
        <span class="eyebrow">{{ kindLabel }}</span>
        <h1 class="title">{{ view.doc.title }}</h1>

        <div class="meta">
          <span class="chip chip--date">{{ formatDate(view.doc.date) }}</span>
          <span v-if="category" class="chip">{{ category }}</span>
          <span v-for="tag in tags" :key="tag" class="chip">{{ tag }}</span>
        </div>

        <p v-if="view.doc.description" class="lead">{{ view.doc.description }}</p>

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
      </header>

      <div class="body tile">
        <ContentRenderer v-if="view.content" :value="view.content" class="prose" />
        <p v-else class="empty">{{ t('common.noData') }}</p>
      </div>

      <nav v-if="view.prev || view.next" class="nav" aria-label="上下篇">
        <NuxtLink v-if="view.prev" class="nav-item tile" :to="view.prev.to">
          <span class="nav-label">{{ t('blog.prev') }}</span>
          <span class="nav-title">{{ view.prev.title }}</span>
        </NuxtLink>
        <span v-else class="nav-item nav-item--empty" />
        <NuxtLink v-if="view.next" class="nav-item nav-item--next tile" :to="view.next.to">
          <span class="nav-label">{{ t('blog.next') }}</span>
          <span class="nav-title">{{ view.next.title }}</span>
        </NuxtLink>
      </nav>
    </article>
  </MetroSubPage>
</template>

<script setup lang="ts">
/**
 * @file Metro 风格详情阅读页
 * @description 直角纯色瓦片承载正文，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import MetroSubPage from './MetroSubPage.vue'

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
const kindLabel = computed(() =>
  props.view.kind === 'post' ? t('nav.blog') : t('nav.projects'),
)

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
  display: grid;
  gap: 8px;
  padding: 8px;
}

/* —— 瓦片：直角 + 纯色块（Metro 的形态签名） —— */
.tile {
  padding: clamp(18px, 2.6vw, 28px);
  background: var(--c-surface);
  border: 3px solid var(--c-bg);
}

.tile--accent {
  background: linear-gradient(135deg, var(--c-accent) 0%, color-mix(in srgb, var(--c-accent) 70%, #000) 100%);
  color: var(--c-on-accent);
}

/* —— 返回瓦片 —— */
.back {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 56px;
  color: var(--c-text);
  text-decoration: none;
  transition: background var(--transition);
}

.back:hover {
  background: color-mix(in srgb, var(--c-accent) 22%, var(--c-surface));
}

.back-mark {
  font-size: 11px;
}

.back-text {
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* —— 标题瓦片 —— */
.head {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.eyebrow {
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.85;
}

.title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(26px, 4.4vw, 48px);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 3px 10px;
  font-size: var(--fs-small);
  font-weight: 600;
  background: rgb(0 0 0 / 0.28);
}

.chip--date {
  font-family: var(--font-mono);
}

.lead {
  max-width: 62ch;
  margin: 0;
  opacity: 0.9;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-height: 44px;
  padding: 0 16px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: inherit;
  text-decoration: none;
  background: rgb(0 0 0 / 0.3);
}

.prose :deep(h2) {
  margin: 1.8em 0 0.7em;
  font-family: var(--font-head);
  font-size: clamp(19px, 2.3vw, 25px);
  font-weight: 400;
  color: var(--c-text);
}

.prose :deep(h3) {
  margin: 1.5em 0 0.6em;
  font-family: var(--font-head);
  font-size: clamp(16px, 1.9vw, 20px);
  font-weight: 400;
  color: var(--c-text);
}

.prose :deep(p) {
  margin: 0 0 1.1em;
  color: var(--c-text);
}

.prose :deep(a) {
  color: var(--c-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin: 0 0 1.1em;
  padding-left: 1.3em;
}

.prose :deep(li) {
  margin-bottom: 0.4em;
}

.prose :deep(blockquote) {
  margin: 0 0 1.2em;
  padding: 12px 16px;
  color: var(--c-muted);
  border-left: 4px solid var(--c-accent);
  background: var(--c-surface-2, rgb(255 255 255 / 0.05));
}

.prose :deep(code) {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: rgb(255 255 255 / 0.1);
}

.prose :deep(pre) {
  padding: 16px 18px;
  margin: 0 0 1.3em;
  overflow-x: auto;
  background: rgb(0 0 0 / 0.5);
}

.prose :deep(pre code) {
  padding: 0;
  background: none;
}

.prose :deep(img) {
  max-width: 100%;
}

.prose :deep(hr) {
  height: 1px;
  margin: 2.2em 0;
  border: none;
  background: var(--c-border);
}

.prose :deep(table) {
  width: 100%;
  margin-bottom: 1.3em;
  border-collapse: collapse;
}

.prose :deep(th),
.prose :deep(td) {
  padding: 9px 12px;
  text-align: left;
  border-bottom: 1px solid var(--c-border);
}

.empty {
  margin: 0;
  color: var(--c-muted);
}

.nav {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
}

.nav-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 84px;
  text-decoration: none;
  color: var(--c-text);
  transition: background var(--transition);
}

.nav-item:hover {
  background: color-mix(in srgb, var(--c-accent) 22%, var(--c-surface));
}

.nav-item--next {
  text-align: right;
}

.nav-item--empty {
  background: none;
}

.nav-label {
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.16em;
  color: var(--c-muted);
}

.nav-title {
  font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
  .back,
  .nav-item {
    transition: none;
  }
}
</style>
