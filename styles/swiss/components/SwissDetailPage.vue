<!--
  SwissDetailPage - swiss 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/swiss/blog/<slug>、/style/swiss/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  瑞士国际主义语法：白底、黑红两色（红只出现在编号/指示块）、发丝线分栏、
  编号小注右对齐、Helvetica 风粗黑标题无修饰。正文栏宽受限（阅读节奏），
  元信息做成表格化的行，不用胶囊标签（那是另一种语言）。
  正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <SwissSubPage>
    <article class="detail">
      <!-- 页头行：编号 + 标题 -->
      <header class="head">
        <div class="head-line">
          <span class="num">{{ kindNumber }}</span>
          <h1 class="title">{{ view.doc.title }}</h1>
        </div>
        <div class="rule" aria-hidden="true" />

        <dl class="facts">
          <div class="fact">
            <dt class="fact-key">{{ t('blog.publishedAt') }}</dt>
            <dd class="fact-val">{{ formatDate(view.doc.date) }}</dd>
          </div>
          <div v-if="category" class="fact">
            <dt class="fact-key">{{ t('blog.categories') }}</dt>
            <dd class="fact-val">{{ category }}</dd>
          </div>
          <div v-if="tags.length" class="fact">
            <dt class="fact-key">{{ t('blog.tags') }}</dt>
            <dd class="fact-val">{{ tags.join(' / ') }}</dd>
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
            {{ link.label }}<span class="link-arrow" aria-hidden="true">↗</span>
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

      <NuxtLink class="back" :to="listPath">
        <span class="back-mark" aria-hidden="true">←</span>
        {{ t(listTitleKey) }}
      </NuxtLink>
    </article>
  </SwissSubPage>
</template>

<script setup lang="ts">
/**
 * @file Swiss 风格详情阅读页
 * @description 编号 + 发丝线的事实表 + 受限栏宽正文，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import SwissSubPage from './SwissSubPage.vue'

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

/** 瑞士风的编号注记：文章用 03（博客栏编号），项目用 02 */
const kindNumber = computed(() => (props.view.kind === 'post' ? '03' : '02'))

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
  padding-block: calc(var(--space) * 1.5);
}

.head-line {
  display: flex;
  gap: 18px;
  align-items: baseline;
}

/* 红色编号：全页唯一的彩色锚点 */
.num {
  flex: none;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--c-accent);
}

.title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(28px, 4.6vw, 52px);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.02em;
  color: var(--c-text);
}

.rule {
  height: 1px;
  margin-top: 14px;
  background: var(--c-border);
}

/* —— 事实表：发丝线分栏的表格化元信息 —— */
.facts {
  display: grid;
  gap: 0;
  margin: 0;
}

.fact {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--c-border);
}

.fact-key {
  margin: 0;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-muted);
}

.fact-val {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-text);
}

.lead {
  max-width: 58ch;
  margin: 0;
  font-size: 1.05rem;
  color: var(--c-muted);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin: 0;
}

/* 文字链 + 下划线渐显（瑞士风不做按钮） */
.link {
  position: relative;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-height: 40px;
  font-weight: 700;
  color: var(--c-text);
  text-decoration: none;
}

.link::after {
  position: absolute;
  right: 0;
  bottom: 6px;
  left: 0;
  height: 2px;
  content: '';
  background: var(--c-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition);
}

.link:hover::after {
  transform: scaleX(1);
}

.prose :deep(h2) {
  margin: 2em 0 0.7em;
  font-family: var(--font-head);
  font-size: clamp(20px, 2.4vw, 26px);
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--c-text);
}

.prose :deep(h3) {
  margin: 1.6em 0 0.6em;
  font-family: var(--font-head);
  font-size: clamp(17px, 2vw, 21px);
  font-weight: 700;
  color: var(--c-text);
}

.prose :deep(p) {
  max-width: 62ch;
  margin: 0 0 1.15em;
}

.prose :deep(a) {
  color: var(--c-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.prose :deep(ul),
.prose :deep(ol) {
  max-width: 62ch;
  margin: 0 0 1.15em;
  padding-left: 1.2em;
}

.prose :deep(li) {
  margin-bottom: 0.45em;
}

.prose :deep(blockquote) {
  max-width: 62ch;
  margin: 0 0 1.3em;
  padding-left: 16px;
  color: var(--c-muted);
  border-left: 2px solid var(--c-accent);
}

.prose :deep(code) {
  padding: 2px 5px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
}

.prose :deep(pre) {
  padding: 16px 18px;
  margin: 0 0 1.4em;
  overflow-x: auto;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
}

.prose :deep(pre code) {
  padding: 0;
  background: none;
  border: none;
}

.prose :deep(img) {
  max-width: 100%;
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
  text-decoration: none;
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
  letter-spacing: 0.1em;
  color: var(--c-accent);
}

.nav-title {
  font-weight: 700;
  color: var(--c-text);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: transparent;
  transition: text-decoration-color var(--transition);
}

.nav-item:hover .nav-title {
  text-decoration-color: var(--c-accent);
}

.back {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-height: 40px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-muted);
  text-decoration: none;
  transition: color var(--transition);
}

.back:hover {
  color: var(--c-text);
}

.back-mark {
  transition: transform var(--transition);
}

.back:hover .back-mark {
  transform: translateX(-3px);
}

@media (prefers-reduced-motion: reduce) {
  .link::after,
  .back,
  .back-mark,
  .nav-title {
    transition: none;
  }

  .back:hover .back-mark {
    transform: none;
  }
}
</style>
