<!--
  RetroComputerDetailPage - retro-computer 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/retro-computer/blog/<slug>、/style/retro-computer/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  复古电脑语法：Win95 窗口隐喻——标题渲染在窗口标题栏里（h1 由
  RetroComputerSubPage 外壳的窗口组件渲染，本页不另起 h1），正文是窗口内的
  银灰客户区，按钮是凸起斜面，输入框是下凹槽。元信息做成凹槽里的文本行，
  标签是凸起小按钮。
  正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <RetroComputerSubPage
    window-id="win-detail"
    :title="view.doc.title"
    :icon="view.kind === 'post' ? 'doc' : 'folder'"
    :status-text="statusText"
  >
    <div class="detail">
      <!-- 返回：凸起斜面按钮 -->
      <NuxtLink class="rc-btn back" :to="listPath">
        <span class="back-mark" aria-hidden="true">&lt;&lt;</span>
        {{ t(listTitleKey) }}
      </NuxtLink>

      <!-- 元信息：下凹输入框（该风格「把内容塞进表单控件」的转译） -->
      <div class="field">
        <div class="field-row">
          <span class="field-key">{{ t('blog.publishedAt') }}</span>
          <span class="field-val">{{ formatDate(view.doc.date) }}</span>
        </div>
        <div v-if="category" class="field-row">
          <span class="field-key">{{ t('blog.categories') }}</span>
          <span class="field-val">{{ category }}</span>
        </div>
        <div v-if="tags.length" class="field-row">
          <span class="field-key">{{ t('blog.tags') }}</span>
          <span class="field-val">{{ tags.join(', ') }}</span>
        </div>
      </div>

      <p v-if="view.doc.description" class="lead">{{ view.doc.description }}</p>

      <div v-if="projectLinks.length" class="links">
        <a
          v-for="link in projectLinks"
          :key="link.href"
          class="rc-btn link"
          :href="link.href"
          target="_blank"
          rel="noopener"
        >
          {{ link.label }}<span aria-hidden="true">↗</span>
        </a>
      </div>

      <div class="rule" aria-hidden="true" />

      <div class="body">
        <ContentRenderer v-if="view.content" :value="view.content" class="prose" />
        <p v-else class="empty">{{ t('common.noData') }}</p>
      </div>

      <!-- 上下篇：窗口底部的文档列表 -->
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
    </div>
  </RetroComputerSubPage>
</template>

<script setup lang="ts">
/**
 * @file RetroComputer 风格详情阅读页
 * @description Win95 窗口内的正文页：标题在标题栏、元信息在凹槽输入框。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import RetroComputerSubPage from './RetroComputerSubPage.vue'

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

/** 窗口底部状态条：仿老系统的文件信息行 */
const statusText = computed(() => `${formatDate(props.view.doc.date)} · ${props.view.doc.title}`)

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
  gap: 12px;
}

/* 凸起斜面按钮（按钮凸、输入框凹，方向语义是这套隐喻的核心） */
.rc-btn {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  min-height: 32px;
  padding: 0 14px;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-text);
  text-decoration: none;
  cursor: pointer;
  border-top: 2px solid #fff;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  border-left: 2px solid #fff;
  background: #c8c8c8;
}

.rc-btn:active {
  border-top: 2px solid #404040;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  border-left: 2px solid #404040;
}

.back-mark {
  font-size: 10px;
}

/* 下凹输入框：把元信息塞进表单控件 */
.field {
  padding: 8px 10px;
  border-top: 2px solid #404040;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  border-left: 2px solid #404040;
  background: #fff;
}

.field-row {
  display: flex;
  gap: 12px;
  align-items: baseline;
  justify-content: space-between;
  padding: 3px 0;
}

.field-key {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: #404040;
}

.field-val {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  text-align: right;
  color: var(--c-text);
}

.lead {
  max-width: 64ch;
  margin: 0;
  color: var(--c-text);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 分组线：窗口内的分隔 */
.rule {
  height: 2px;
  border-top: 1px solid #808080;
  border-bottom: 1px solid #fff;
}

.prose :deep(h2) {
  margin: 1.6em 0 0.6em;
  font-family: var(--font-head);
  font-size: clamp(18px, 2.2vw, 23px);
  font-weight: 700;
  color: var(--c-text);
}

.prose :deep(h3) {
  margin: 1.4em 0 0.5em;
  font-family: var(--font-head);
  font-size: clamp(15px, 1.9vw, 19px);
  font-weight: 700;
  color: var(--c-text);
}

.prose :deep(p) {
  margin: 0 0 1.1em;
}

.prose :deep(a) {
  color: #0000c8;
  text-underline-offset: 2px;
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
  padding: 10px 14px;
  color: #404040;
  border-top: 2px solid #404040;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  border-left: 2px solid #404040;
  background: #efefef;
}

.prose :deep(code) {
  padding: 1px 5px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: #e4e4e4;
}

.prose :deep(pre) {
  padding: 14px 16px;
  margin: 0 0 1.3em;
  overflow-x: auto;
  border-top: 2px solid #404040;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  border-left: 2px solid #404040;
  background: #0a1a2a;
}

.prose :deep(pre code) {
  padding: 0;
  color: #33ff66;
  background: none;
}

.prose :deep(img) {
  max-width: 100%;
}

.prose :deep(hr) {
  height: 2px;
  margin: 1.8em 0;
  border: none;
  border-top: 1px solid #808080;
  border-bottom: 1px solid #fff;
}

.prose :deep(table) {
  width: 100%;
  margin-bottom: 1.3em;
  border-collapse: collapse;
}

.prose :deep(th),
.prose :deep(td) {
  padding: 6px 10px;
  text-align: left;
  border: 1px solid #808080;
}

.empty {
  margin: 0;
  color: #404040;
}

.nav {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  padding-top: 10px;
  border-top: 1px solid #808080;
}

.nav-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  text-decoration: none;
}

.nav-item:hover {
  background: #dcdcdc;
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
  color: #404040;
}

.nav-title {
  font-weight: 700;
  color: #0000c8;
  text-decoration: underline;
}
</style>
