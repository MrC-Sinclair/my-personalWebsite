<!--
  Y2KDetailPage - y2k 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/y2k/blog/<slug>、/style/y2k/projects/<slug>
  取数由路由壳完成（业务层只写一份），本组件只接收 DetailView 负责排版。

  结构：返回栏 → 标题区（铬标题 + 元信息气泡）→ 正文（塑料面板承载）
       → 上下篇导航 → 页脚（沿用 Y2KSubPage 外壳）

  正文排版（prose）是本风格自己写的：ContentRenderer 输出的 HTML 是
  动态内容，scoped 样式管不到，因此统一用 :deep() 覆盖。
-->
<template>
  <Y2KSubPage>
    <article class="detail">
      <!-- 返回栏：回到对应列表 -->
      <NuxtLink class="detail-back" :to="listPath">
        <span class="detail-back-arrow" aria-hidden="true">◄</span>
        {{ t(listTitleKey) }}
      </NuxtLink>

      <header class="detail-head">
        <h1 class="detail-title">{{ view.doc.title }}</h1>

        <div class="detail-meta">
          <span class="detail-date">{{ formatDate(view.doc.date) }}</span>
          <span v-if="category" class="detail-chip detail-chip--cat">{{ category }}</span>
          <span v-for="tag in tags" :key="tag" class="detail-chip">{{ tag }}</span>
        </div>

        <p v-if="view.doc.description" class="detail-desc">{{ view.doc.description }}</p>

        <!-- 项目专有的两个外链 -->
        <div v-if="projectLinks.length" class="detail-links">
          <Y2KChromeButton
            v-for="link in projectLinks"
            :key="link.href"
            :href="link.href"
            external
            variant="plastic"
          >
            {{ link.label }}
          </Y2KChromeButton>
        </div>
      </header>

      <!-- 正文：塑料面板承载 Markdown 渲染结果 -->
      <div class="detail-body">
        <ContentRenderer v-if="view.content" :value="view.content" class="prose" />
        <p v-else class="detail-empty">{{ t('common.noData') }}</p>
      </div>

      <!-- 上下篇 -->
      <nav v-if="view.prev || view.next" class="detail-nav" aria-label="上下篇">
        <NuxtLink v-if="view.prev" class="detail-nav-item" :to="view.prev.to">
          <span class="detail-nav-label">{{ t('blog.prev') }}</span>
          <span class="detail-nav-title">{{ view.prev.title }}</span>
        </NuxtLink>
        <span v-else class="detail-nav-item detail-nav-item--empty" />

        <NuxtLink v-if="view.next" class="detail-nav-item detail-nav-item--next" :to="view.next.to">
          <span class="detail-nav-label">{{ t('blog.next') }}</span>
          <span class="detail-nav-title">{{ view.next.title }}</span>
        </NuxtLink>
      </nav>
    </article>
  </Y2KSubPage>
</template>

<script setup lang="ts">
/**
 * @file Y2K 风格详情阅读页
 * @description 铬标题 + 气泡元信息 + 塑料面板正文，文章与项目共用一套排版。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import Y2KSubPage from './Y2KSubPage.vue'
import Y2KChromeButton from './Y2KChromeButton.vue'

const props = defineProps<{ view: DetailView }>()

const { t } = useI18n()
const localePath = useLocalePath()

const route = useRoute()
const styleId = computed(() => String(route.params.style ?? ''))

// 列表返回地址：详情页在风格内，列表页也在风格内
const listPath = computed(() =>
  localePath(props.view.kind === 'post' ? `/style/${styleId.value}/blog` : `/style/${styleId.value}/projects`),
)
const listTitleKey = computed(() => (props.view.kind === 'post' ? 'blog.title' : 'projects.title'))

const tags = computed(() => props.view.doc.tags ?? [])

/** 分类只有文章有：用 in 守卫在联合类型上取字段，避免类型报错 */
const category = computed(() => {
  const doc = props.view.doc
  return 'category' in doc ? doc.category : undefined
})

/** 项目文档才有的外链（demo / github） */
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
  padding-block: calc(var(--space) * 1.5);
}

/* —— 返回栏 —— */
.detail-back {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  padding: 6px 16px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--c-muted);
  text-decoration: none;
  border: var(--border-w) solid rgb(190 200 255 / 0.4);
  border-radius: 999px;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.16) 0%, rgb(255 255 255 / 0.04) 100%);
  transition:
    color var(--transition),
    border-color var(--transition);
}

.detail-back:hover {
  color: var(--c-text);
  border-color: rgb(190 200 255 / 0.75);
}

.detail-back-arrow {
  font-size: 10px;
}

/* —— 标题区 —— */
.detail-title {
  margin: 0 0 var(--gap);
  font-family: var(--font-head);
  font-size: clamp(28px, 4.4vw, 52px);
  font-weight: 900;
  line-height: 1.12;
  color: var(--c-text);
  text-shadow: 0 2px 0 rgb(139 123 255 / 0.35);
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: var(--gap);
}

.detail-date {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.12em;
  color: var(--c-muted);
}

.detail-chip {
  padding: 4px 14px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-text);
  border: var(--border-w) solid rgb(255 255 255 / 0.5);
  border-radius: 999px;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.3) 0%, rgb(139 123 255 / 0.22) 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.5);
}

.detail-chip--cat {
  border-color: rgb(255 92 225 / 0.6);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.5),
    0 0 12px rgb(255 92 225 / 0.3);
}

.detail-desc {
  max-width: 60ch;
  margin: 0;
  color: var(--c-muted);
}

.detail-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
}

/* —— 正文面板：塑料气泡质感 —— */
.detail-body {
  padding: clamp(20px, 3vw, 34px);
  border: var(--border-w) solid rgb(190 200 255 / 0.35);
  border-radius: var(--radius);
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 0.09) 0%,
    rgb(139 123 255 / 0.1) 100%
  );
  box-shadow: var(--shadow);
}

.detail-empty {
  margin: 0;
  color: var(--c-muted);
}

/* —— 正文排版（ContentRenderer 输出的动态 HTML，必须 :deep） —— */
.prose :deep(h2) {
  margin: 1.6em 0 0.6em;
  font-family: var(--font-head);
  font-size: clamp(20px, 2.4vw, 26px);
  font-weight: 800;
  color: var(--c-text);
}

.prose :deep(h3) {
  margin: 1.4em 0 0.5em;
  font-family: var(--font-head);
  font-size: clamp(17px, 2vw, 21px);
  font-weight: 800;
  color: var(--c-text);
}

.prose :deep(p) {
  margin: 0 0 1.1em;
  color: var(--c-text);
}

.prose :deep(a) {
  color: var(--c-accent-2);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin: 0 0 1.1em;
  padding-left: 1.4em;
  color: var(--c-text);
}

.prose :deep(li) {
  margin-bottom: 0.4em;
}

.prose :deep(blockquote) {
  margin: 0 0 1.2em;
  padding: 10px 16px;
  color: var(--c-muted);
  border-left: 3px solid var(--c-accent);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  background: rgb(139 123 255 / 0.1);
}

.prose :deep(code) {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 0.92em;
  color: var(--c-text);
  border-radius: 6px;
  background: rgb(255 255 255 / 0.12);
}

.prose :deep(pre) {
  padding: 16px;
  margin: 0 0 1.3em;
  overflow-x: auto;
  border: var(--border-w) solid rgb(190 200 255 / 0.3);
  border-radius: var(--radius-sm);
  background: rgb(6 2 32 / 0.75);
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
  margin: 2em 0;
  border: none;
  background: rgb(190 200 255 / 0.3);
}

.prose :deep(table) {
  width: 100%;
  margin-bottom: 1.3em;
  overflow-x: auto;
  border-collapse: collapse;
}

.prose :deep(th),
.prose :deep(td) {
  padding: 8px 12px;
  text-align: left;
  border: var(--border-w) solid rgb(190 200 255 / 0.25);
}

/* —— 上下篇 —— */
.detail-nav {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
}

.detail-nav-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 18px;
  text-decoration: none;
  border: var(--border-w) solid rgb(190 200 255 / 0.35);
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.08) 0%, rgb(139 123 255 / 0.12) 100%);
  transition:
    border-color var(--transition),
    transform var(--transition);
}

.detail-nav-item:hover {
  border-color: rgb(255 92 225 / 0.6);
  transform: translateY(-2px);
}

.detail-nav-item--next {
  text-align: right;
}

.detail-nav-item--empty {
  border: none;
  background: none;
}

.detail-nav-label {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.14em;
  color: var(--c-muted);
}

.detail-nav-title {
  font-weight: 700;
  color: var(--c-text);
}

@media (prefers-reduced-motion: reduce) {
  .detail-nav-item:hover {
    transform: none;
  }
}
</style>
