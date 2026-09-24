<!--
  EditorialDetailPage - editorial 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/editorial/blog/<slug>、/style/editorial/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  杂志编辑语法：米纸底、衬线标题 + 黑体正文（字体切换承担层级）、编号目录
  感、粗黑规则线分节、红色小注（编号/句点）。正文栏宽受限，首段做首字下沉，
  元信息用小型大写红字小注。正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <EditorialSubPage>
    <article class="detail">
      <header class="head">
        <p class="kicker">
          <span class="kicker-num">{{ kindNumber }}</span>
          <span class="kicker-label">{{ kindLabel }}</span>
        </p>

        <h1 class="title">{{ view.doc.title }}<span class="period" aria-hidden="true">.</span></h1>

        <p class="meta">
          <span class="meta-date">{{ formatDate(view.doc.date) }}</span>
          <template v-if="category">
            <span class="sep" aria-hidden="true">/</span>
            <span>{{ category }}</span>
          </template>
          <template v-for="tag in tags" :key="tag">
            <span class="sep" aria-hidden="true">/</span>
            <span>{{ tag }}</span>
          </template>
        </p>

        <p v-if="view.doc.description" class="standfirst">{{ view.doc.description }}</p>

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

      <div class="rule" aria-hidden="true" />

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
        <span aria-hidden="true">←</span>
        {{ t(listTitleKey) }}
      </NuxtLink>
    </article>
  </EditorialSubPage>
</template>

<script setup lang="ts">
/**
 * @file Editorial 风格详情阅读页
 * @description 杂志版面：衬线大标题 + 首字下沉 + 粗黑规则线，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import EditorialSubPage from './EditorialSubPage.vue'

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

/** 杂志栏目的编号与栏目名：文章 = 03 博客，项目 = 02 项目集锦 */
const kindNumber = computed(() => (props.view.kind === 'post' ? '03' : '02'))
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

/* 栏目小注：红色编号 + 小型大写栏目名 */
.kicker {
  display: flex;
  gap: 10px;
  align-items: baseline;
  margin: 0 0 10px;
}

.kicker-num {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--c-accent);
}

.kicker-label {
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-muted);
}

.title {
  max-width: 30ch;
  margin: 0 0 var(--gap);
  font-family: var(--font-head);
  font-size: clamp(30px, 5vw, 58px);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.01em;
  color: var(--c-text);
}

/* 红色句点：杂志标题的签名 */
.period {
  color: var(--c-accent);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 0 0 var(--gap);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.meta-date {
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
}

.sep {
  color: var(--c-accent);
}

/* 导语：斜体衬线，比正文大一档 */
.standfirst {
  max-width: 58ch;
  margin: 0;
  font-family: var(--font-head);
  font-size: 1.1rem;
  font-style: italic;
  line-height: 1.6;
  color: var(--c-muted);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin: 0;
}

.link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-height: 40px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-text);
  text-decoration: none;
  border-bottom: 2px solid var(--c-accent);
  transition: color var(--transition);
}

.link:hover {
  color: var(--c-accent);
}

/* 粗黑规则线：杂志分节 */
.rule {
  height: 3px;
  background: var(--c-text);
}

.prose :deep(h2) {
  margin: 2em 0 0.6em;
  font-family: var(--font-head);
  font-size: clamp(21px, 2.6vw, 28px);
  font-weight: 700;
  color: var(--c-text);
}

.prose :deep(h3) {
  margin: 1.6em 0 0.5em;
  font-family: var(--font-head);
  font-size: clamp(17px, 2vw, 21px);
  font-weight: 700;
  color: var(--c-text);
}

.prose :deep(p) {
  max-width: 64ch;
  margin: 0 0 1.2em;
}

/* 首段首字下沉（杂志的标志性手法） */
.prose :deep(p:first-of-type)::first-letter {
  float: left;
  margin: 0.06em 0.08em 0 0;
  font-family: var(--font-head);
  font-size: 3.2em;
  font-weight: 700;
  line-height: 0.9;
  color: var(--c-accent);
}

.prose :deep(a) {
  color: var(--c-accent);
  text-underline-offset: 3px;
}

.prose :deep(ul),
.prose :deep(ol) {
  max-width: 64ch;
  margin: 0 0 1.2em;
  padding-left: 1.2em;
}

.prose :deep(li) {
  margin-bottom: 0.45em;
}

.prose :deep(blockquote) {
  max-width: 60ch;
  margin: 0 0 1.4em;
  padding: 4px 0 4px 18px;
  font-family: var(--font-head);
  font-style: italic;
  color: var(--c-muted);
  border-left: 3px solid var(--c-accent);
}

.prose :deep(code) {
  padding: 2px 5px;
  font-family: var(--font-mono);
  font-size: 0.88em;
  background: var(--c-surface);
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
}

.prose :deep(img) {
  max-width: 100%;
}

.prose :deep(hr) {
  height: 1px;
  margin: 2.6em 0;
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
  gap: 18px;
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
  letter-spacing: 0.14em;
  color: var(--c-accent);
}

.nav-title {
  font-family: var(--font-head);
  font-weight: 700;
  color: var(--c-text);
}

.back {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-height: 40px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-muted);
  text-decoration: none;
  transition: color var(--transition);
}

.back:hover {
  color: var(--c-text);
}

@media (prefers-reduced-motion: reduce) {
  .back,
  .link {
    transition: none;
  }
}
</style>
