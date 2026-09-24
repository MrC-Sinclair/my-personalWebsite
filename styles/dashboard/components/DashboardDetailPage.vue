<!--
  DashboardDetailPage - dashboard 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/dashboard/blog/<slug>、/style/dashboard/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  仪表盘语法：KPI 卡 / 数据格 / 明细表的排版纪律，双强调色分工
  （蓝 = 内容量，琥珀 = 标签与状态），等宽字体承载数值，标题由
  DashboardSubPage 外壳渲染 h1（它带 eyebrow/title/description props）。
  正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <DashboardSubPage
    :eyebrow="kindLabel"
    :title="view.doc.title"
    :description="view.doc.description ?? ''"
  >
    <div class="detail">
      <!-- 元信息：KPI 风格的数据格 -->
      <div class="kpis">
        <div class="kpi">
          <span class="kpi-label">{{ t('blog.publishedAt') }}</span>
          <span class="kpi-value kpi-value--sm">{{ formatDate(view.doc.date) }}</span>
        </div>
        <div v-if="category" class="kpi">
          <span class="kpi-label">{{ t('blog.categories') }}</span>
          <span class="kpi-value kpi-value--sm">{{ category }}</span>
        </div>
        <div v-if="tags.length" class="kpi">
          <span class="kpi-label">{{ t('blog.tags') }}</span>
          <span class="kpi-value kpi-value--sm">{{ tags.length }}</span>
        </div>
      </div>

      <div v-if="tags.length" class="tagrow">
        <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
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

      <!-- 正文：明细表面板 -->
      <section class="panel">
        <header class="panel-head">
          <span class="panel-dot" aria-hidden="true" />
          <h2 class="panel-title">{{ t('blog.title') }}</h2>
          <span class="panel-meta">{{ kindCode }}</span>
        </header>

        <div class="panel-body">
          <ContentRenderer v-if="view.content" :value="view.content" class="prose" />
          <p v-else class="empty">{{ t('common.noData') }}</p>
        </div>
      </section>

      <!-- 上下篇：表格行 -->
      <nav v-if="view.prev || view.next" class="nav" aria-label="上下篇">
        <NuxtLink v-if="view.prev" class="nav-row" :to="view.prev.to">
          <span class="nav-cell nav-cell--label">{{ t('blog.prev') }}</span>
          <span class="nav-cell nav-cell--title">{{ view.prev.title }}</span>
        </NuxtLink>
        <NuxtLink v-if="view.next" class="nav-row" :to="view.next.to">
          <span class="nav-cell nav-cell--label">{{ t('blog.next') }}</span>
          <span class="nav-cell nav-cell--title">{{ view.next.title }}</span>
        </NuxtLink>
      </nav>

      <NuxtLink class="back" :to="listPath">
        <span aria-hidden="true">←</span>
        {{ t(listTitleKey) }}
      </NuxtLink>
    </div>
  </DashboardSubPage>
</template>

<script setup lang="ts">
/**
 * @file Dashboard 风格详情阅读页
 * @description KPI 数据格 + 明细表面板 + 表格行导航，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import DashboardSubPage from './DashboardSubPage.vue'

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
/** 面板右上角等宽计数（仪表盘的读数语义） */
const kindCode = computed(() => (props.view.kind === 'post' ? 'DOC' : 'PRJ'))

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

/* —— KPI 数据格 —— */
.kpis {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
}

.kpi {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-surface);
}

.kpi-label {
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.kpi-value {
  font-family: var(--font-mono);
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--c-text);
}

/* 日期/分类不是数值，降一档字号避免抢 KPI 的视觉重量 */
.kpi-value--sm {
  font-size: 1rem;
}

.tagrow {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 琥珀色标签：与「内容量用蓝色」形成维度分工 */
.tag {
  padding: 3px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent-2, #f59e0b);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  background: rgb(245 158 11 / 0.1);
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
  color: var(--c-on-accent, #04121a);
  text-decoration: none;
  border-radius: var(--radius-sm);
  background: var(--c-accent);
  transition: opacity var(--transition);
}

.link:hover {
  opacity: 0.85;
}

/* —— 明细表面板 —— */
.panel {
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-surface);
}

.panel-head {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--c-border);
}

/* 蓝色小方块引导（KPI 卡的同一语言） */
.panel-dot {
  width: 10px;
  height: 10px;
  background: var(--c-accent);
  border-radius: 2px;
}

.panel-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
}

.panel-meta {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.panel-body {
  padding: clamp(16px, 2.4vw, 24px);
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

.prose :deep(blockquote) {
  margin: 0 0 1.2em;
  padding: 12px 16px;
  color: var(--c-muted);
  border-left: 3px solid var(--c-accent);
  background: rgb(59 130 246 / 0.08);
}

.prose :deep(code) {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  border-radius: 4px;
  background: var(--c-bg);
}

.prose :deep(pre) {
  padding: 16px 18px;
  margin: 0 0 1.3em;
  overflow-x: auto;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
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

/* —— 上下篇：表格行（与文章明细表同语言） —— */
.nav {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-surface);
}

.nav-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 12px;
  align-items: baseline;
  padding: 12px 16px;
  text-decoration: none;
  border-bottom: 1px solid var(--c-border);
  transition: background var(--transition);
}

.nav-row:last-child {
  border-bottom: none;
}

.nav-row:hover {
  background: var(--c-bg);
}

.nav-cell--label {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent);
}

.nav-cell--title {
  font-weight: 600;
  color: var(--c-text);
}

.back {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  min-height: 44px;
  padding: 0 16px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-muted);
  text-decoration: none;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  transition:
    color var(--transition),
    border-color var(--transition);
}

.back:hover {
  color: var(--c-text);
  border-color: var(--c-accent);
}

@media (prefers-reduced-motion: reduce) {
  .link,
  .nav-row,
  .back {
    transition: none;
  }
}
</style>
