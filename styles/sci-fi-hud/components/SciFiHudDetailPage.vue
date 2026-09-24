<!--
  SciFiHudDetailPage - sci-fi-hud 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/sci-fi-hud/blog/<slug>、/style/sci-fi-hud/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  科幻 HUD 语法：等宽字体、军绿（内容）/ 琥珀（状态）双色、四角括号锁框、
  SEC 编号、刻度尺分隔。正文承载在带四角括号的面板里，元信息是数据格。
  正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <SciFiHudSubPage>
    <article class="detail">
      <NuxtLink class="back" :to="listPath">
        <span class="back-mark" aria-hidden="true">&lt;&lt;</span>
        {{ t(listTitleKey) }}
      </NuxtLink>

      <header class="head panel">
        <span class="sec">SEC-{{ kindCode }} · {{ kindLabel }}</span>
        <h1 class="title">{{ view.doc.title }}</h1>

        <!-- 数据读出：键值表格（HUD 的信息展示方式） -->
        <dl class="readout">
          <div class="readout-row">
            <dt>{{ t('blog.publishedAt') }}</dt>
            <dd>{{ formatDate(view.doc.date) }}</dd>
          </div>
          <div v-if="category" class="readout-row">
            <dt>{{ t('blog.categories') }}</dt>
            <dd>{{ category }}</dd>
          </div>
          <div v-if="tags.length" class="readout-row">
            <dt>{{ t('blog.tags') }}</dt>
            <dd>{{ tags.join(' / ') }}</dd>
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
  </SciFiHudSubPage>
</template>

<script setup lang="ts">
/**
 * @file SciFiHud 风格详情阅读页
 * @description 四角括号面板 + 键值读出表 + 等宽编号，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import SciFiHudSubPage from './SciFiHudSubPage.vue'

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

/** 面板编号：文章 = 03（与首页博客区块编号一致），项目 = 02 */
const kindCode = computed(() => (props.view.kind === 'post' ? '03' : '02'))
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

/* 四角括号面板：用两层背景画四个角标（HUD 的锁框语法） */
.panel {
  position: relative;
  padding: clamp(18px, 2.8vw, 30px);
  border: 1px solid var(--c-border);
  background: var(--c-surface);
}

.panel::before,
.panel::after {
  position: absolute;
  width: 14px;
  height: 14px;
  content: '';
  border: 2px solid var(--c-accent);
}

.panel::before {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
}

.panel::after {
  right: -1px;
  bottom: -1px;
  border-top: none;
  border-left: none;
}

/* 等宽面板编号 */
.sec {
  display: block;
  margin-bottom: 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.16em;
  color: var(--c-accent-2, #f59e0b);
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
  color: var(--c-accent-2, #f59e0b);
  border-color: var(--c-accent-2, #f59e0b);
}

.back-mark {
  font-size: 10px;
}

.title {
  max-width: 44ch;
  margin: 0 0 var(--gap);
  font-family: var(--font-head);
  font-size: clamp(26px, 4.2vw, 46px);
  font-weight: 700;
  line-height: 1.12;
  color: var(--c-text);
}

/* 键值读出表：点线引导的键值对 */
.readout {
  margin: 0 0 var(--gap);
  border-top: 1px dashed var(--c-border);
}

.readout-row {
  display: flex;
  gap: 16px;
  align-items: baseline;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed var(--c-border);
}

.readout-row dt {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.12em;
  color: var(--c-muted);
}

.readout-row dd {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  text-align: right;
  color: var(--c-text);
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
  letter-spacing: 0.1em;
  color: var(--c-accent-2, #f59e0b);
  text-decoration: none;
  border: 1px solid var(--c-accent-2, #f59e0b);
  transition: background var(--transition);
}

.link:hover {
  background: rgb(245 158 11 / 0.12);
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
  font-family: var(--font-mono);
  font-size: clamp(15px, 1.9vw, 19px);
  font-weight: 700;
  letter-spacing: 0.08em;
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
  border-left: 2px solid var(--c-accent-2, #f59e0b);
  background: rgb(245 158 11 / 0.07);
}

.prose :deep(code) {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--c-accent);
  background: rgb(126 242 182 / 0.08);
}

.prose :deep(pre) {
  padding: 16px 18px;
  margin: 0 0 1.3em;
  overflow-x: auto;
  border: 1px solid var(--c-border);
  background: rgb(2 12 16 / 0.7);
}

.prose :deep(pre code) {
  padding: 0;
  background: none;
}

.prose :deep(img) {
  max-width: 100%;
}

/* 刻度尺分隔线 */
.prose :deep(hr) {
  height: 2px;
  margin: 2.2em 0;
  border: none;
  background: repeating-linear-gradient(90deg, var(--c-accent) 0 2px, transparent 2px 8px);
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
}

.nav-item--empty::before,
.nav-item--empty::after {
  display: none;
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
