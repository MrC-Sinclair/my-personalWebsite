<!--
  PixelDetailPage - pixel 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/pixel/blog/<slug>、/style/pixel/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  像素语法：无圆角、无过渡、有限色板（藏青/白/绿/黄）、双线像素边框、
  点阵网格底、等宽点阵标题。正文承载在双线边框面板里，元信息做成
  STATUS 数据格，标签是绿色描边像素框。
  正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <PixelSubPage>
    <article class="detail">
      <NuxtLink class="back" :to="listPath">
        <span class="back-mark" aria-hidden="true">▸</span>
        {{ t(listTitleKey) }}
      </NuxtLink>

      <header class="head panel">
        <p class="eyebrow">{{ kindLabel }}</p>
        <h1 class="title">{{ view.doc.title }}</h1>

        <dl class="status">
          <div class="status-row">
            <dt>{{ t('blog.publishedAt') }}</dt>
            <dd>{{ formatDate(view.doc.date) }}</dd>
          </div>
          <div v-if="category" class="status-row">
            <dt>{{ t('blog.categories') }}</dt>
            <dd>{{ category }}</dd>
          </div>
          <div v-if="tags.length" class="status-row">
            <dt>{{ t('blog.tags') }}</dt>
            <dd>
              <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
            </dd>
          </div>
        </dl>

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

      <div class="body panel">
        <ContentRenderer v-if="view.content" :value="view.content" class="prose" />
        <p v-else class="empty">{{ t('common.noData') }}</p>
      </div>

      <nav v-if="view.prev || view.next" class="nav" aria-label="上下篇">
        <NuxtLink v-if="view.prev" class="nav-item panel" :to="view.prev.to">
          <span class="nav-label">{{ t('blog.prev') }}</span>
          <span class="nav-title">{{ view.prev.title }}</span>
        </NuxtLink>
        <span v-else class="nav-item nav-item--empty" />
        <NuxtLink v-if="view.next" class="nav-item nav-item--next panel" :to="view.next.to">
          <span class="nav-label">{{ t('blog.next') }}</span>
          <span class="nav-title">{{ view.next.title }}</span>
        </NuxtLink>
      </nav>
    </article>
  </PixelSubPage>
</template>

<script setup lang="ts">
/**
 * @file Pixel 风格详情阅读页
 * @description 双线像素边框面板 + STATUS 数据格，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import PixelSubPage from './PixelSubPage.vue'

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

/* 双线像素边框 + 硬描边（无圆角、无阴影） */
.panel {
  padding: clamp(16px, 2.6vw, 28px);
  border: 2px solid var(--c-border);
  background: var(--c-surface);
  box-shadow:
    inset 0 0 0 2px var(--c-bg),
    inset 0 0 0 3px var(--c-border);
}

.back {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  min-height: 40px;
  padding: 0 14px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--c-accent);
  text-decoration: none;
  border: 2px solid var(--c-border);
  background: var(--c-surface);
}

.back:hover {
  color: var(--c-bg);
  background: var(--c-accent);
}

.back-mark {
  font-size: 10px;
}

.eyebrow {
  margin: 0 0 8px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.18em;
  color: var(--c-accent-2, #ffd23f);
}

.title {
  margin: 0 0 var(--gap);
  font-family: var(--font-head);
  font-size: clamp(22px, 3.6vw, 40px);
  font-weight: 700;
  line-height: 1.16;
  color: var(--c-text);
}

/* STATUS 数据格：像素 RPG 的状态栏语义 */
.status {
  margin: 0 0 var(--gap);
  border-top: 1px solid var(--c-border);
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: baseline;
  justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px solid var(--c-border);
}

.status-row dt {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: var(--c-muted);
}

.status-row dd {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  text-align: right;
  color: var(--c-text);
}

/* 绿色描边像素标签 */
.tag {
  padding: 2px 8px;
  color: var(--c-accent);
  border: 1px solid var(--c-accent);
}

.lead {
  max-width: 62ch;
  margin: 0;
  color: var(--c-muted);
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
  min-height: 40px;
  padding: 0 16px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-bg);
  text-decoration: none;
  background: var(--c-accent);
}

.link:hover {
  background: var(--c-accent-2, #ffd23f);
}

.prose :deep(h2) {
  margin: 1.7em 0 0.7em;
  font-family: var(--font-head);
  font-size: clamp(18px, 2.2vw, 24px);
  font-weight: 700;
  color: var(--c-text);
}

.prose :deep(h3) {
  margin: 1.4em 0 0.6em;
  font-family: var(--font-head);
  font-size: clamp(15px, 1.9vw, 19px);
  font-weight: 700;
  color: var(--c-accent);
}

.prose :deep(p) {
  margin: 0 0 1.1em;
  line-height: 1.8;
}

.prose :deep(a) {
  color: var(--c-accent);
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

.prose :deep(li)::marker {
  color: var(--c-accent);
}

.prose :deep(blockquote) {
  margin: 0 0 1.2em;
  padding: 12px 16px;
  color: var(--c-muted);
  border-left: 4px solid var(--c-accent);
  background: rgb(51 255 102 / 0.08);
}

.prose :deep(code) {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--c-accent);
  background: rgb(51 255 102 / 0.1);
}

.prose :deep(pre) {
  padding: 16px 18px;
  margin: 0 0 1.3em;
  overflow-x: auto;
  border: 2px solid var(--c-border);
  background: #06060f;
}

.prose :deep(pre code) {
  padding: 0;
  background: none;
}

.prose :deep(img) {
  max-width: 100%;
}

/* 像素虚线分隔 */
.prose :deep(hr) {
  height: 2px;
  margin: 2.2em 0;
  border: none;
  background: repeating-linear-gradient(90deg, var(--c-accent) 0 4px, transparent 4px 8px);
}

.prose :deep(table) {
  width: 100%;
  margin-bottom: 1.3em;
  border-collapse: collapse;
}

.prose :deep(th),
.prose :deep(td) {
  padding: 8px 10px;
  text-align: left;
  border: 1px solid var(--c-border);
}

.empty {
  margin: 0;
  color: var(--c-muted);
}

.nav {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
}

.nav-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-decoration: none;
}

.nav-item:hover {
  background: rgb(51 255 102 / 0.08);
}

.nav-item--next {
  text-align: right;
}

.nav-item--empty {
  border: none;
  background: none;
  box-shadow: none;
}

.nav-label {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.14em;
  color: var(--c-accent);
}

.nav-title {
  font-weight: 700;
  color: var(--c-text);
}
</style>
