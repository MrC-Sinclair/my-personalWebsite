<!--
  CyberpunkDetailPage - cyberpunk 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/cyberpunk/blog/<slug>、/style/cyberpunk/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  赛博朋克语法：等宽字体贯穿、青粉双霓虹、切角面板（clip-path）+ 四角 HUD
  括号、点线引导的元信息行、扫描线氛围（由外壳的 CyberpunkScanOverlay 提供）。
  正文承载在描边切角面板里，标签是等宽描边芯片。
  正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <CyberpunkSubPage>
    <article class="detail">
      <NuxtLink class="back" :to="listPath">
        <span class="back-mark" aria-hidden="true">&lt;&lt;&lt;</span>
        {{ t(listTitleKey) }}
      </NuxtLink>

      <header class="head panel">
        <span class="tag-corner" aria-hidden="true">{{ kindTag }}</span>
        <h1 class="title">{{ view.doc.title }}</h1>

        <div class="meta">
          <span class="meta-date">{{ formatDate(view.doc.date) }}</span>
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
  </CyberpunkSubPage>
</template>

<script setup lang="ts">
/**
 * @file Cyberpunk 风格详情阅读页
 * @description 切角描边面板 + 等宽霓虹标签的正文页，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import CyberpunkSubPage from './CyberpunkSubPage.vue'

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

/** 右上角等宽状态标（HUD 语法） */
const kindTag = computed(() => (props.view.kind === 'post' ? 'LOG/DOC' : 'LOG/PRJ'))

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

/* 切角描边面板：赛博朋克的容器签名 */
.panel {
  position: relative;
  padding: clamp(18px, 2.8vw, 30px);
  border: 1px solid var(--c-border);
  background: var(--c-surface);
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
}

/* 等宽状态标：右上角 HUD 感 */
.tag-corner {
  position: absolute;
  top: 10px;
  right: 14px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.16em;
  color: var(--c-accent);
  opacity: 0.85;
}

.back {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  min-height: 44px;
  padding: 0 16px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--c-accent);
  text-decoration: none;
  border: 1px solid var(--c-border);
  transition:
    color var(--transition),
    border-color var(--transition);
}

.back:hover {
  color: var(--c-accent-2);
  border-color: var(--c-accent-2);
}

.back-mark {
  font-size: 10px;
}

.title {
  max-width: 46ch;
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

.meta-date {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
  color: var(--c-muted);
}

/* 等宽描边芯片 */
.chip {
  padding: 3px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
  border: 1px solid var(--c-border);
}

.chip--cat {
  color: var(--c-accent-2);
  border-color: var(--c-accent-2);
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
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-on-accent, #04121a);
  text-decoration: none;
  background: var(--c-accent);
  transition: box-shadow var(--transition);
}

.link:hover {
  box-shadow: 0 0 16px var(--c-accent);
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
  color: var(--c-accent);
}

.prose :deep(p) {
  margin: 0 0 1.1em;
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
  border-left: 2px solid var(--c-accent-2);
  background: rgb(255 43 214 / 0.07);
}

.prose :deep(code) {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--c-accent);
  background: rgb(0 229 255 / 0.08);
}

.prose :deep(pre) {
  padding: 16px 18px;
  margin: 0 0 1.3em;
  overflow-x: auto;
  border: 1px solid var(--c-border);
  background: rgb(4 6 16 / 0.8);
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
  background: linear-gradient(90deg, var(--c-accent), transparent);
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
  transition: border-color var(--transition);
}

.nav-item:hover {
  border-color: var(--c-accent);
}

.nav-item--next {
  text-align: right;
}

.nav-item--empty {
  border: none;
  background: none;
  clip-path: none;
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

@media (prefers-reduced-motion: reduce) {
  .back,
  .link,
  .nav-item {
    transition: none;
  }
}
</style>
