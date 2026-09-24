<!--
  LiquidGlassDetailPage - liquid-glass 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/liquid-glass/blog/<slug>、/style/liquid-glass/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  液态玻璃语法：正文承载在一块半透明玻璃板上——背板的 backdrop-filter
  会采样 LiquidGlassBackground 的高频光纹（caustic），板缘一圈 1px 亮边
  模拟玻璃折边。h1 由本组件自己渲染（该风格的 SubPage 外壳不带标题位）。
  正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <LiquidGlassSubPage>
    <article class="detail glass">
      <NuxtLink class="back" :to="listPath">
        <span aria-hidden="true">←</span>
        {{ t(listTitleKey) }}
      </NuxtLink>

      <header class="head">
        <h1 class="title">{{ view.doc.title }}</h1>

        <div class="meta">
          <span class="date">{{ formatDate(view.doc.date) }}</span>
          <span v-if="category" class="tag tag--cat">{{ category }}</span>
          <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
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

      <div class="body">
        <ContentRenderer v-if="view.content" :value="view.content" class="prose" />
        <p v-else class="empty">{{ t('common.noData') }}</p>
      </div>

      <nav v-if="view.prev || view.next" class="nav" aria-label="上下篇">
        <NuxtLink v-if="view.prev" class="nav-item glass-sm" :to="view.prev.to">
          <span class="nav-label">{{ t('blog.prev') }}</span>
          <span class="nav-title">{{ view.prev.title }}</span>
        </NuxtLink>
        <span v-else class="nav-item nav-item--empty" />
        <NuxtLink v-if="view.next" class="nav-item nav-item--next glass-sm" :to="view.next.to">
          <span class="nav-label">{{ t('blog.next') }}</span>
          <span class="nav-title">{{ view.next.title }}</span>
        </NuxtLink>
      </nav>
    </article>
  </LiquidGlassSubPage>
</template>

<script setup lang="ts">
/**
 * @file LiquidGlass 风格详情阅读页
 * @description 玻璃板承载正文 + 板缘亮边，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import LiquidGlassSubPage from './LiquidGlassSubPage.vue'

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
/* —— 玻璃板：半透明 + 板缘 1px 亮边（折边感） —— */
.glass {
  border: 1px solid rgb(255 255 255 / 0.16);
  border-radius: var(--radius);
  background: linear-gradient(
    160deg,
    rgb(255 255 255 / 0.1) 0%,
    rgb(255 255 255 / 0.04) 55%,
    rgb(94 227 255 / 0.05) 100%
  );
  backdrop-filter: blur(18px) saturate(1.2);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.28),
    0 18px 44px rgb(4 2 24 / 0.45);
}

.glass-sm {
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 0.07);
  backdrop-filter: blur(14px) saturate(1.15);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.22);
}

.detail {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  padding: clamp(20px, 3vw, 36px);
}

.back {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  min-height: 40px;
  padding: 0 14px;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-decoration: none;
  border: 1px solid rgb(255 255 255 / 0.16);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.06);
  transition:
    color var(--transition),
    border-color var(--transition);
}

.back:hover {
  color: var(--c-text);
  border-color: rgb(94 227 255 / 0.5);
}

.title {
  margin: 0 0 var(--gap);
  font-family: var(--font-head);
  font-size: clamp(26px, 4vw, 46px);
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
  letter-spacing: 0.08em;
  color: var(--c-muted);
}

.tag {
  padding: 4px 12px;
  font-size: var(--fs-small);
  color: var(--c-text);
  border: 1px solid rgb(255 255 255 / 0.18);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.08);
}

.tag--cat {
  color: var(--c-accent);
  border-color: rgb(94 227 255 / 0.45);
}

.lead {
  max-width: 62ch;
  margin: 0;
  color: var(--c-muted);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-height: 40px;
  padding: 0 16px;
  font-size: var(--fs-small);
  color: var(--c-text);
  text-decoration: none;
  border: 1px solid rgb(94 227 255 / 0.4);
  border-radius: 999px;
  background: rgb(94 227 255 / 0.12);
  transition: background var(--transition);
}

.link:hover {
  background: rgb(94 227 255 / 0.22);
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
  padding: 10px 16px;
  color: var(--c-muted);
  border-left: 2px solid var(--c-accent);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  background: rgb(94 227 255 / 0.08);
}

.prose :deep(code) {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  border-radius: 6px;
  background: rgb(255 255 255 / 0.1);
}

.prose :deep(pre) {
  padding: 16px 18px;
  margin: 0 0 1.4em;
  overflow-x: auto;
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: var(--radius-sm);
  background: rgb(4 2 24 / 0.6);
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
  background: rgb(255 255 255 / 0.16);
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
  border: 1px solid rgb(255 255 255 / 0.14);
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
