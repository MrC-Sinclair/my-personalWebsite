<!--
  MinimalismDetailPage - minimalism 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/minimalism/blog/<slug>、/style/minimalism/projects/<slug>
  取数由路由壳完成（业务层只写一份），本组件只接收 DetailView 负责排版。

  极简的语法：发丝线分隔、灰阶两级文字、唯一强调色（蓝点）只出现在链接与
  指示点上。h1 由 MinimalismSubPage 外壳渲染（传 title），本页不再另起 h1。
  正文排版（prose）是本风格自己写的：ContentRenderer 输出的 HTML 是动态
  内容，scoped 管不到，统一用 :deep() 覆盖。
-->
<template>
  <MinimalismSubPage :title="view.doc.title">
    <article class="detail">
      <!-- 返回栏：回到对应列表 -->
      <NuxtLink class="back" :to="listPath">
        <span class="back-arrow" aria-hidden="true">←</span>
        {{ t(listTitleKey) }}
      </NuxtLink>

      <!-- 元信息行：日期 · 分类 · 标签 -->
      <p class="meta">
        <span class="meta-date">{{ formatDate(view.doc.date) }}</span>
        <template v-if="category">
          <span class="dot" aria-hidden="true">·</span>
          <span>{{ category }}</span>
        </template>
        <template v-for="tag in tags" :key="tag">
          <span class="dot" aria-hidden="true">·</span>
          <span>{{ tag }}</span>
        </template>
      </p>

      <p v-if="view.doc.description" class="lead">{{ view.doc.description }}</p>

      <!-- 项目专有的两个外链（极简语法：下划线文字链，不做按钮） -->
      <p v-if="projectLinks.length" class="links">
        <a
          v-for="link in projectLinks"
          :key="link.href"
          class="link"
          :href="link.href"
          target="_blank"
          rel="noopener"
        >
          {{ link.label }}<span class="link-arrow" aria-hidden="true">↗</span>
        </a>
      </p>

      <div class="rule" aria-hidden="true" />

      <div class="body">
        <ContentRenderer v-if="view.content" :value="view.content" class="prose" />
        <p v-else class="empty">{{ t('common.noData') }}</p>
      </div>

      <!-- 上下篇 -->
      <nav v-if="view.prev || view.next" class="nav" aria-label="上下篇">
        <NuxtLink v-if="view.prev" class="nav-item" :to="view.prev.to">
          <span class="nav-label">{{ t('blog.prev') }}</span>
          <span class="nav-title">{{ view.prev.title }}</span>
        </NuxtLink>
        <span v-else class="nav-item nav-item--empty" />
        <NuxtLink v-if="view.next" class="nav-item nav-item--next" :to="view.next.to">
          <span class="nav-label">{{ t('blog.next') }}</span>
          <span class="nav-title">{{ view.next.title }}</span>
        </NuxtLink>
      </nav>
    </article>
  </MinimalismSubPage>
</template>

<script setup lang="ts">
/**
 * @file Minimalism 风格详情阅读页
 * @description 发丝线 + 灰阶两级的极简正文页，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import MinimalismSubPage from './MinimalismSubPage.vue'

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

/* —— 返回栏：下划线文字链（极简不做按钮） —— */
.back {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  min-height: 40px;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-decoration: none;
  transition: color var(--transition);
}

.back:hover {
  color: var(--c-text);
}

.back-arrow {
  transition: transform var(--transition);
}

.back:hover .back-arrow {
  transform: translateX(-3px);
}

/* —— 元信息：灰阶两级 + 点分隔符 —— */
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.meta-date {
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}

.dot {
  opacity: 0.6;
}

.lead {
  max-width: 62ch;
  margin: 0;
  color: var(--c-muted);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 0;
}

/* 唯一强调色：下划线链接 */
.link {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  min-height: 40px;
  font-size: var(--fs-small);
  color: var(--c-accent);
  text-decoration: none;
  border-bottom: 1px solid var(--c-accent);
  transition: opacity var(--transition);
}

.link:hover {
  opacity: 0.7;
}

.rule {
  height: 1px;
  background: var(--c-border);
}

/* —— 正文排版 —— */
.prose :deep(h2) {
  margin: 2em 0 0.7em;
  font-family: var(--font-head);
  font-size: clamp(19px, 2.2vw, 24px);
  font-weight: 500;
  color: var(--c-text);
}

.prose :deep(h3) {
  margin: 1.6em 0 0.6em;
  font-family: var(--font-head);
  font-size: clamp(16px, 1.8vw, 19px);
  font-weight: 500;
  color: var(--c-text);
}

.prose :deep(p) {
  max-width: 68ch;
  margin: 0 0 1.15em;
}

.prose :deep(a) {
  color: var(--c-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.prose :deep(ul),
.prose :deep(ol) {
  max-width: 68ch;
  margin: 0 0 1.15em;
  padding-left: 1.3em;
}

.prose :deep(li) {
  margin-bottom: 0.45em;
}

.prose :deep(blockquote) {
  max-width: 68ch;
  margin: 0 0 1.3em;
  padding-left: 16px;
  color: var(--c-muted);
  border-left: 1px solid var(--c-border);
}

.prose :deep(code) {
  padding: 2px 5px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 3px;
}

.prose :deep(pre) {
  padding: 16px 18px;
  margin: 0 0 1.4em;
  overflow-x: auto;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
}

.prose :deep(pre code) {
  padding: 0;
  background: none;
  border: none;
}

.prose :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-sm);
}

.prose :deep(hr) {
  height: 1px;
  margin: 2.4em 0;
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
  padding: 9px 12px;
  text-align: left;
  border-bottom: 1px solid var(--c-border);
}

.empty {
  margin: 0;
  color: var(--c-muted);
}

/* —— 上下篇：发丝线分隔的双栏 —— */
.nav {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  padding-top: var(--gap);
  border-top: 1px solid var(--c-border);
}

.nav-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 0;
  text-decoration: none;
  transition: opacity var(--transition);
}

.nav-item:hover {
  opacity: 0.65;
}

.nav-item--next {
  text-align: right;
}

.nav-item--empty {
  border: none;
}

.nav-label {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.nav-title {
  font-weight: 500;
  color: var(--c-text);
}

@media (prefers-reduced-motion: reduce) {
  .back-arrow,
  .back,
  .link,
  .nav-item {
    transition: none;
  }

  .back:hover .back-arrow {
    transform: none;
  }
}
</style>
