<!--
  FlatDesignDetailPage - flat-design 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/flat-design/blog/<slug>、/style/flat-design/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  扁平化语法：零圆角、零阴影、零渐变，全部靠纯色块与几何形组织层级；
  四色编码（蓝/绿/紫/红）只承担分类语义。正文区用一块纯色面承载，
  标签是方角小色块。正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <FlatDesignSubPage>
    <article class="detail">
      <NuxtLink class="back" :to="listPath">
        <span class="back-mark" aria-hidden="true">◄</span>
        {{ t(listTitleKey) }}
      </NuxtLink>

      <header class="head">
        <span class="bar" aria-hidden="true" />
        <h1 class="title">{{ view.doc.title }}</h1>

        <div class="meta">
          <span class="date">{{ formatDate(view.doc.date) }}</span>
          <span v-if="category" class="chip chip--cat">{{ category }}</span>
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

      <div class="body">
        <ContentRenderer v-if="view.content" :value="view.content" class="prose" />
        <p v-else class="empty">{{ t('common.noData') }}</p>
      </div>

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
  </FlatDesignSubPage>
</template>

<script setup lang="ts">
/**
 * @file FlatDesign 风格详情阅读页
 * @description 纯色块 + 方角标签的扁平正文页，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import FlatDesignSubPage from './FlatDesignSubPage.vue'

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

/* —— 返回：方角文字链 + 箭头左移 —— */
.back {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  min-height: 44px;
  padding: 0 14px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-accent);
  text-decoration: none;
  background: var(--c-surface);
  transition: color var(--transition);
}

.back:hover {
  color: var(--c-text);
}

.back-mark {
  font-size: 10px;
  transition: transform var(--transition);
}

.back:hover .back-mark {
  transform: translateX(-3px);
}

.head {
  padding: clamp(20px, 3vw, 32px);
  background: var(--c-surface);
}

/* 标题上方的短色条（扁平风的引导线） */
.bar {
  display: block;
  width: 56px;
  height: 4px;
  margin-bottom: 14px;
  background: var(--c-accent);
}

.title {
  margin: 0 0 var(--gap);
  font-family: var(--font-head);
  font-size: clamp(26px, 4.2vw, 46px);
  font-weight: 800;
  line-height: 1.14;
  color: var(--c-text);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: var(--gap);
}

.date {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* 方角标签：零圆角是扁平的形态签名 */
.chip {
  padding: 4px 10px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-text);
  background: var(--c-border);
}

.chip--cat {
  color: var(--c-on-accent);
  background: var(--c-accent);
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
  min-height: 44px;
  padding: 0 16px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-on-accent);
  text-decoration: none;
  background: var(--c-accent);
  transition: opacity var(--transition);
}

.link:hover {
  opacity: 0.85;
}

.body {
  padding: clamp(20px, 3vw, 32px);
  background: var(--c-surface);
}

.prose :deep(h2) {
  margin: 1.8em 0 0.7em;
  font-family: var(--font-head);
  font-size: clamp(19px, 2.3vw, 25px);
  font-weight: 800;
  color: var(--c-text);
}

.prose :deep(h3) {
  margin: 1.5em 0 0.6em;
  font-family: var(--font-head);
  font-size: clamp(16px, 1.9vw, 20px);
  font-weight: 800;
  color: var(--c-text);
}

.prose :deep(p) {
  margin: 0 0 1.1em;
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
  background: var(--c-border);
}

.prose :deep(code) {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--c-border);
}

.prose :deep(pre) {
  padding: 16px 18px;
  margin: 0 0 1.3em;
  overflow-x: auto;
  background: var(--c-bg);
}

.prose :deep(pre code) {
  padding: 0;
  background: none;
}

.prose :deep(img) {
  max-width: 100%;
}

.prose :deep(hr) {
  height: 2px;
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
  border-bottom: 2px solid var(--c-border);
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
  padding: 14px 16px;
  text-decoration: none;
  background: var(--c-surface);
  border-left: 4px solid var(--c-border);
  transition: border-color var(--transition);
}

.nav-item:hover {
  border-left-color: var(--c-accent);
}

.nav-item--next {
  text-align: right;
  border-left: none;
  border-right: 4px solid var(--c-border);
}

.nav-item--next:hover {
  border-right-color: var(--c-accent);
}

.nav-item--empty {
  background: none;
  border: none;
}

.nav-label {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.nav-title {
  font-weight: 700;
  color: var(--c-text);
}

@media (prefers-reduced-motion: reduce) {
  .back,
  .back-mark,
  .link,
  .nav-item {
    transition: none;
  }

  .back:hover .back-mark {
    transform: none;
  }
}
</style>
