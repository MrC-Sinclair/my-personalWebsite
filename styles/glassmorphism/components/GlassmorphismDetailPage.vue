<!--
  GlassmorphismDetailPage - glassmorphism 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/glassmorphism/blog/<slug>、/style/glassmorphism/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  玻璃拟态语法：磨砂白玻璃层（backdrop-filter）+ 极细白描边 + 极光底色
  从板后透出；层级靠透明度阶梯（外层更透、内层更白）而非描边粗细。
  正文承载在玻璃大板里，元信息做成小玻璃胶囊。
  正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <GlassmorphismSubPage>
    <article class="detail glass">
      <NuxtLink class="back" :to="listPath">
        <span aria-hidden="true">←</span>
        {{ t(listTitleKey) }}
      </NuxtLink>

      <header class="head">
        <h1 class="title">{{ view.doc.title }}</h1>

        <div class="meta">
          <span class="date">{{ formatDate(view.doc.date) }}</span>
          <span v-if="category" class="pill pill--cat">{{ category }}</span>
          <span v-for="tag in tags" :key="tag" class="pill">{{ tag }}</span>
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

      <div class="body glass-inner">
        <ContentRenderer v-if="view.content" :value="view.content" class="prose" />
        <p v-else class="empty">{{ t('common.noData') }}</p>
      </div>

      <nav v-if="view.prev || view.next" class="nav" aria-label="上下篇">
        <NuxtLink v-if="view.prev" class="nav-item glass-inner" :to="view.prev.to">
          <span class="nav-label">{{ t('blog.prev') }}</span>
          <span class="nav-title">{{ view.prev.title }}</span>
        </NuxtLink>
        <span v-else class="nav-item nav-item--empty" />
        <NuxtLink
          v-if="view.next"
          class="nav-item nav-item--next glass-inner"
          :to="view.next.to"
        >
          <span class="nav-label">{{ t('blog.next') }}</span>
          <span class="nav-title">{{ view.next.title }}</span>
        </NuxtLink>
      </nav>
    </article>
  </GlassmorphismSubPage>
</template>

<script setup lang="ts">
/**
 * @file Glassmorphism 风格详情阅读页
 * @description 磨砂玻璃板承载正文 + 玻璃胶囊元信息，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import GlassmorphismSubPage from './GlassmorphismSubPage.vue'

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
/* 外层玻璃：更透 */
.glass {
  border: 1px solid rgb(255 255 255 / 0.28);
  border-radius: var(--radius);
  background: rgb(255 255 255 / 0.16);
  backdrop-filter: blur(22px) saturate(1.3);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.5),
    0 16px 40px rgb(31 20 60 / 0.28);
}

/* 内层玻璃：更白（透明度阶梯造层级） */
.glass-inner {
  border: 1px solid rgb(255 255 255 / 0.24);
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 0.26);
  backdrop-filter: blur(16px) saturate(1.2);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.45);
}

.detail {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  padding: clamp(20px, 3vw, 34px);
}

.back {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  min-height: 40px;
  padding: 0 16px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-text);
  text-decoration: none;
  border: 1px solid rgb(255 255 255 / 0.4);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.22);
  transition: background var(--transition);
}

.back:hover {
  background: rgb(255 255 255 / 0.38);
}

.title {
  margin: 0 0 var(--gap);
  font-family: var(--font-head);
  font-size: clamp(26px, 4.2vw, 46px);
  font-weight: 700;
  line-height: 1.15;
  color: var(--c-text);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: var(--gap);
}

.date {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.pill {
  padding: 4px 14px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-text);
  border: 1px solid rgb(255 255 255 / 0.4);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.26);
}

.pill--cat {
  border-color: rgb(167 139 255 / 0.65);
  background: rgb(167 139 255 / 0.3);
}

.lead {
  max-width: 62ch;
  margin: 0;
  color: var(--c-muted);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-height: 44px;
  padding: 0 18px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-text);
  text-decoration: none;
  border: 1px solid rgb(255 255 255 / 0.45);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.34);
  transition: background var(--transition);
}

.link:hover {
  background: rgb(255 255 255 / 0.5);
}

.body {
  padding: clamp(18px, 2.6vw, 28px);
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
  margin: 0 0 1.15em;
}

.prose :deep(a) {
  color: var(--c-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin: 0 0 1.15em;
  padding-left: 1.3em;
}

.prose :deep(li) {
  margin-bottom: 0.45em;
}

.prose :deep(blockquote) {
  margin: 0 0 1.3em;
  padding: 12px 16px;
  color: var(--c-muted);
  border-left: 3px solid rgb(167 139 255 / 0.8);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  background: rgb(255 255 255 / 0.3);
}

.prose :deep(code) {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  border-radius: 6px;
  background: rgb(255 255 255 / 0.4);
}

.prose :deep(pre) {
  padding: 16px 18px;
  margin: 0 0 1.4em;
  overflow-x: auto;
  border: 1px solid rgb(255 255 255 / 0.3);
  border-radius: var(--radius-sm);
  background: rgb(31 20 60 / 0.35);
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
  background: rgb(255 255 255 / 0.35);
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
  border: 1px solid rgb(255 255 255 / 0.3);
}

.empty {
  margin: 0;
  color: var(--c-muted);
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
  padding: 14px 18px;
  text-decoration: none;
  transition: transform var(--transition);
}

.nav-item:hover {
  transform: translateY(-2px);
}

.nav-item--next {
  text-align: right;
}

.nav-item--empty {
  border: none;
  background: none;
}

.nav-label {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.nav-title {
  font-weight: 600;
  color: var(--c-text);
}

@media (prefers-reduced-motion: reduce) {
  .nav-item:hover {
    transform: none;
  }
}
</style>
