<!--
  NeoBrutalismDetailPage - neo-brutalism 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/neo-brutalism/blog/<slug>、/style/neo-brutalism/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  新粗野主义语法：粗黑描边（2-3px）+ 硬投影（零模糊、纯色偏移）+ 高饱和撞色
  贴纸标签 + 尺寸悬殊的排版。正文承载在有硬阴影的卡片里，元信息是黑底白字
  贴纸，标题带错位投影。
  正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <NeoBrutalismSubPage>
    <article class="detail">
      <NuxtLink class="back" :to="listPath">
        <span class="back-mark" aria-hidden="true">◄</span>
        {{ t(listTitleKey) }}
      </NuxtLink>

      <header class="head card">
        <span class="sticker">{{ kindLabel }}</span>
        <h1 class="title">{{ view.doc.title }}</h1>

        <div class="meta">
          <span class="chip chip--date">{{ formatDate(view.doc.date) }}</span>
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

      <div class="body card">
        <ContentRenderer v-if="view.content" :value="view.content" class="prose" />
        <p v-else class="empty">{{ t('common.noData') }}</p>
      </div>

      <nav v-if="view.prev || view.next" class="nav" aria-label="上下篇">
        <NuxtLink v-if="view.prev" class="nav-item card" :to="view.prev.to">
          <span class="nav-label">{{ t('blog.prev') }}</span>
          <span class="nav-title">{{ view.prev.title }}</span>
        </NuxtLink>
        <span v-else class="nav-item nav-item--empty" />
        <NuxtLink v-if="view.next" class="nav-item nav-item--next card" :to="view.next.to">
          <span class="nav-label">{{ t('blog.next') }}</span>
          <span class="nav-title">{{ view.next.title }}</span>
        </NuxtLink>
      </nav>
    </article>
  </NeoBrutalismSubPage>
</template>

<script setup lang="ts">
/**
 * @file NeoBrutalism 风格详情阅读页
 * @description 粗黑描边 + 硬投影 + 贴纸标签的正文页，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import NeoBrutalismSubPage from './NeoBrutalismSubPage.vue'

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

/* 硬边卡片：粗黑描边 + 零模糊硬投影 */
.card {
  padding: clamp(18px, 2.8vw, 30px);
  border: 3px solid var(--c-text);
  background: var(--c-surface);
  box-shadow: var(--shadow);
}

.back {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  min-height: 44px;
  padding: 0 16px;
  font-size: var(--fs-small);
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-text);
  text-decoration: none;
  border: 3px solid var(--c-text);
  background: #fff;
  box-shadow: 4px 4px 0 var(--c-text);
  transition: transform var(--transition);
}

.back:hover {
  transform: translate(-2px, -2px);
}

.back-mark {
  font-size: 10px;
}

.head {
  position: relative;
}

/* 黑底白字贴纸（ brutalist 海报技法） */
.sticker {
  display: inline-block;
  padding: 4px 12px;
  margin-bottom: 12px;
  font-size: var(--fs-small);
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-on-accent, #fff);
  background: var(--c-text);
  transform: rotate(-1.5deg);
}

.title {
  margin: 0 0 var(--gap);
  font-family: var(--font-head);
  font-size: clamp(28px, 4.8vw, 54px);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--c-text);
  /* 错位硬投影：粗野主义的标题签名 */
  text-shadow: 4px 4px 0 var(--c-accent);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: var(--gap);
}

.chip {
  padding: 4px 10px;
  font-size: var(--fs-small);
  font-weight: 800;
  color: var(--c-text);
  border: 2px solid var(--c-text);
  background: #fff;
}

.chip--date {
  font-family: var(--font-mono);
}

.chip--cat {
  color: var(--c-on-accent, #fff);
  background: var(--c-accent);
}

.lead {
  max-width: 62ch;
  margin: 0;
  font-weight: 600;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* 撞色按钮 + 按压位移（硬投影缩短） */
.link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-height: 48px;
  padding: 0 18px;
  font-size: var(--fs-small);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-text);
  text-decoration: none;
  border: 3px solid var(--c-text);
  background: var(--c-accent-2, #ffd60a);
  box-shadow: 4px 4px 0 var(--c-text);
  transition:
    box-shadow var(--transition),
    transform var(--transition);
}

.link:hover {
  box-shadow: 6px 6px 0 var(--c-text);
  transform: translate(-2px, -2px);
}

.prose :deep(h2) {
  margin: 1.8em 0 0.7em;
  font-family: var(--font-head);
  font-size: clamp(20px, 2.5vw, 27px);
  font-weight: 900;
  color: var(--c-text);
}

.prose :deep(h3) {
  margin: 1.5em 0 0.6em;
  font-family: var(--font-head);
  font-size: clamp(17px, 2vw, 21px);
  font-weight: 900;
  color: var(--c-text);
}

.prose :deep(p) {
  margin: 0 0 1.15em;
}

.prose :deep(a) {
  font-weight: 700;
  color: var(--c-text);
  background: var(--c-accent);
  text-underline-offset: 3px;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin: 0 0 1.15em;
  padding-left: 1.2em;
}

.prose :deep(li) {
  margin-bottom: 0.45em;
}

.prose :deep(blockquote) {
  margin: 0 0 1.3em;
  padding: 14px 18px;
  font-weight: 600;
  border: 3px solid var(--c-text);
  background: var(--c-accent);
  box-shadow: 4px 4px 0 var(--c-text);
}

.prose :deep(code) {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  font-weight: 700;
  border: 2px solid var(--c-text);
  background: #fff;
}

.prose :deep(pre) {
  padding: 16px 18px;
  margin: 0 0 1.4em;
  overflow-x: auto;
  border: 3px solid var(--c-text);
  background: #fff;
}

.prose :deep(pre code) {
  padding: 0;
  border: none;
  background: none;
}

.prose :deep(img) {
  max-width: 100%;
  border: 3px solid var(--c-text);
}

.prose :deep(hr) {
  height: 4px;
  margin: 2.4em 0;
  border: none;
  background: var(--c-text);
}

.prose :deep(table) {
  width: 100%;
  margin-bottom: 1.4em;
  border-collapse: collapse;
}

.prose :deep(th),
.prose :deep(td) {
  padding: 10px 12px;
  text-align: left;
  border: 2px solid var(--c-text);
}

.empty {
  margin: 0;
  font-weight: 700;
}

.nav {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
}

.nav-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-decoration: none;
  transition:
    box-shadow var(--transition),
    transform var(--transition);
}

.nav-item:hover {
  box-shadow: 6px 6px 0 var(--c-text);
  transform: translate(-2px, -2px);
}

.nav-item--next {
  text-align: right;
}

.nav-item--empty {
  border: none;
  background: none;
  box-shadow: none;
}

.nav-label {
  font-size: var(--fs-small);
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.nav-title {
  font-weight: 800;
  color: var(--c-text);
}

@media (prefers-reduced-motion: reduce) {
  .back,
  .link,
  .nav-item {
    transition: none;
  }

  .back:hover,
  .link:hover,
  .nav-item:hover {
    transform: none;
  }
}
</style>
