<!--
  TerminalDetailPage - terminal 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/terminal/blog/<slug>、/style/terminal/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  终端语法：h1 由 TerminalSubPage 渲染成 `$ <标题>`（命令行提示符形式，
  保留该风格「UI 几乎消失」的纯度）；正文按终端输出排版——等宽字体、绿色
  正文、amber 提示符、元信息做成 `key: value` 的文件头输出块，上下篇是
  `cd` 式的命令行链接。不使用卡片、圆角、阴影。
  正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <TerminalSubPage :title="view.doc.title">
    <article class="detail">
      <!-- 文件头输出块：cat 命令的输出形态 -->
      <div class="outfile">
        <p class="line">
          <span class="prompt" aria-hidden="true">$</span>
          <span class="cmd">cat {{ fileName }}</span>
        </p>
        <dl class="header">
          <div class="header-row">
            <dt>date</dt>
            <dd>{{ formatDate(view.doc.date) }}</dd>
          </div>
          <div v-if="category" class="header-row">
            <dt>category</dt>
            <dd>{{ category }}</dd>
          </div>
          <div v-if="tags.length" class="header-row">
            <dt>tags</dt>
            <dd>{{ tags.join(', ') }}</dd>
          </div>
        </dl>
        <p v-if="view.doc.description" class="line line--desc">{{ view.doc.description }}</p>
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

      <div class="body">
        <ContentRenderer v-if="view.content" :value="view.content" class="prose" />
        <p v-else class="empty">{{ t('common.noData') }}</p>
      </div>

      <!-- 上下篇：cd 命令式导航 -->
      <nav v-if="view.prev || view.next" class="nav" aria-label="上下篇">
        <NuxtLink v-if="view.prev" class="nav-line" :to="view.prev.to">
          <span class="prompt" aria-hidden="true">$</span>
          <span class="cmd">cd ../{{ prevSlug }}</span>
          <span class="nav-title"># {{ view.prev.title }}</span>
        </NuxtLink>
        <NuxtLink v-if="view.next" class="nav-line" :to="view.next.to">
          <span class="prompt" aria-hidden="true">$</span>
          <span class="cmd">cd ../{{ nextSlug }}</span>
          <span class="nav-title"># {{ view.next.title }}</span>
        </NuxtLink>
      </nav>

      <NuxtLink class="nav-line back" :to="listPath">
        <span class="prompt" aria-hidden="true">$</span>
        <span class="cmd">cd ..</span>
        <span class="nav-title"># {{ t(listTitleKey) }}</span>
      </NuxtLink>
    </article>
  </TerminalSubPage>
</template>

<script setup lang="ts">
/**
 * @file Terminal 风格详情阅读页
 * @description 终端输出式正文页：提示符 + 等宽文本 + cd 式导航，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import { contentSlug } from '~/utils/content'
import TerminalSubPage from './TerminalSubPage.vue'

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

/** 文件名：cat 的对象（文章 .md / 项目 .md） */
const fileName = computed(() => `${contentSlug(props.view.doc.path)}.md`)
const prevSlug = computed(() =>
  props.view.prev ? contentSlugFromLink(props.view.prev.to) : '',
)
const nextSlug = computed(() =>
  props.view.next ? contentSlugFromLink(props.view.next.to) : '',
)

/** 从详情链接里取出末段 slug（链接形如 /style/<id>/blog/<slug>） */
function contentSlugFromLink(to: string): string {
  const parts = to.split('/').filter(Boolean)
  return parts[parts.length - 1] || ''
}

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
  gap: 14px;
}

/* —— 命令行输出块：等宽 + 提示符 —— */
.outfile {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.line {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
}

.prompt {
  color: var(--c-accent-2, #ffb000);
}

.cmd {
  color: var(--c-text);
}

.line--desc {
  max-width: 70ch;
  color: var(--c-muted);
}

/* 文件头：key: value 的输出形态 */
.header {
  margin: 0;
  padding-left: 18px;
  border-left: 1px solid var(--c-border);
}

.header-row {
  display: flex;
  gap: 10px;
  align-items: baseline;
}

.header-row dt {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.header-row dd {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-text);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.link {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent);
  text-decoration: none;
  border-bottom: 1px solid var(--c-accent);
}

.link:hover {
  background: rgb(51 255 102 / 0.12);
}

.body {
  padding-top: 6px;
}

.prose :deep(h2) {
  margin: 1.7em 0 0.6em;
  font-family: var(--font-mono);
  font-size: clamp(17px, 2.1vw, 22px);
  font-weight: 700;
  color: var(--c-text);
}

.prose :deep(h2)::before {
  margin-right: 8px;
  color: var(--c-accent-2, #ffb000);
  content: '##';
}

.prose :deep(h3) {
  margin: 1.4em 0 0.5em;
  font-family: var(--font-mono);
  font-size: clamp(15px, 1.9vw, 19px);
  font-weight: 700;
  color: var(--c-accent);
}

.prose :deep(h3)::before {
  margin-right: 8px;
  color: var(--c-muted);
  content: '###';
}

.prose :deep(p) {
  max-width: 76ch;
  margin: 0 0 1.05em;
  font-family: var(--font-mono);
  line-height: 1.75;
}

.prose :deep(a) {
  color: var(--c-accent);
  text-underline-offset: 3px;
}

.prose :deep(ul),
.prose :deep(ol) {
  max-width: 76ch;
  margin: 0 0 1.05em;
  padding-left: 1.4em;
  font-family: var(--font-mono);
}

.prose :deep(li) {
  margin-bottom: 0.35em;
}

.prose :deep(li)::marker {
  color: var(--c-accent);
}

.prose :deep(blockquote) {
  max-width: 74ch;
  margin: 0 0 1.2em;
  padding-left: 14px;
  font-family: var(--font-mono);
  color: var(--c-muted);
  border-left: 1px solid var(--c-accent);
}

.prose :deep(code) {
  padding: 1px 5px;
  font-family: var(--font-mono);
  font-size: 0.92em;
  color: var(--c-accent-2, #ffb000);
  background: rgb(255 255 255 / 0.06);
}

.prose :deep(pre) {
  padding: 14px 16px;
  margin: 0 0 1.3em;
  overflow-x: auto;
  border: 1px solid var(--c-border);
  background: rgb(0 0 0 / 0.45);
}

.prose :deep(pre code) {
  padding: 0;
  color: var(--c-text);
  background: none;
}

.prose :deep(img) {
  max-width: 100%;
}

/* 终端分隔线用字符而不是规则线 */
.prose :deep(hr) {
  height: auto;
  margin: 1.8em 0;
  overflow: hidden;
  font-family: var(--font-mono);
  line-height: 1;
  color: var(--c-border);
  border: none;
}

.prose :deep(hr)::before {
  content: '----------------------------------------------------------------------';
}

.prose :deep(table) {
  width: 100%;
  margin-bottom: 1.3em;
  font-family: var(--font-mono);
  border-collapse: collapse;
}

.prose :deep(th),
.prose :deep(td) {
  padding: 6px 10px;
  text-align: left;
  border-bottom: 1px solid var(--c-border);
}

.empty {
  margin: 0;
  font-family: var(--font-mono);
  color: var(--c-muted);
}

/* —— cd 式导航 —— */
.nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid var(--c-border);
}

.nav-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: baseline;
  min-height: 32px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  text-decoration: none;
  transition: background var(--transition);
}

.nav-line:hover {
  background: rgb(51 255 102 / 0.1);
}

.nav-title {
  color: var(--c-muted);
}

.back {
  align-self: flex-start;
}

@media (prefers-reduced-motion: reduce) {
  .nav-line {
    transition: none;
  }
}
</style>
