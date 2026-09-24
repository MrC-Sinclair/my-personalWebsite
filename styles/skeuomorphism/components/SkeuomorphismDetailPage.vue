<!--
  SkeuomorphismDetailPage - skeuomorphism 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/skeuomorphism/blog/<slug>、/style/skeuomorphism/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  拟物语法：容器 = 皮革（带缝线/铆钉）、内容 = 纸张、点缀 = 黄铜。
  正文承载在缝线皮革板里的一张米色纸上，元信息是金色铭牌，
  分隔用红色装订线。正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <SkeuomorphismSubPage>
    <article class="detail leather">
      <NuxtLink class="back" :to="listPath">
        <span class="back-mark" aria-hidden="true">◄</span>
        {{ t(listTitleKey) }}
      </NuxtLink>

      <header class="head">
        <span class="plate">{{ kindLabel }}</span>
        <h1 class="title">{{ view.doc.title }}</h1>

        <div class="meta">
          <span class="plate plate--date">{{ formatDate(view.doc.date) }}</span>
          <span v-if="category" class="plate plate--cat">{{ category }}</span>
          <span v-for="tag in tags" :key="tag" class="plate">{{ tag }}</span>
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

      <!-- 装订线：拟物的红色分节线 -->
      <div class="stitch" aria-hidden="true" />

      <div class="body paper">
        <ContentRenderer v-if="view.content" :value="view.content" class="prose" />
        <p v-else class="empty">{{ t('common.noData') }}</p>
      </div>

      <nav v-if="view.prev || view.next" class="nav" aria-label="上下篇">
        <NuxtLink v-if="view.prev" class="nav-item paper" :to="view.prev.to">
          <span class="nav-label">{{ t('blog.prev') }}</span>
          <span class="nav-title">{{ view.prev.title }}</span>
        </NuxtLink>
        <span v-else class="nav-item nav-item--empty" />
        <NuxtLink v-if="view.next" class="nav-item nav-item--next paper" :to="view.next.to">
          <span class="nav-label">{{ t('blog.next') }}</span>
          <span class="nav-title">{{ view.next.title }}</span>
        </NuxtLink>
      </nav>
    </article>
  </SkeuomorphismSubPage>
</template>

<script setup lang="ts">
/**
 * @file Skeuomorphism 风格详情阅读页
 * @description 皮革容器 + 纸张正文 + 黄铜铭牌，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import SkeuomorphismSubPage from './SkeuomorphismSubPage.vue'

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

/* 皮革容器：棕底 + 虚线缝线 + 内阴影 */
.leather {
  position: relative;
  padding: clamp(18px, 2.8vw, 30px);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: var(--c-surface);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.06),
    inset 0 2px 10px rgb(0 0 0 / 0.35),
    var(--shadow);
}

.leather::before {
  position: absolute;
  inset: 8px;
  content: '';
  border: 1px dashed rgb(232 213 181 / 0.45);
  border-radius: calc(var(--radius) - 6px);
  pointer-events: none;
}

/* 纸张：正文与导航都落在纸上 */
.paper {
  padding: clamp(18px, 2.6vw, 28px);
  border-radius: 4px;
  background: #f6efe2;
  box-shadow: 0 8px 18px rgb(0 0 0 / 0.28);
}

.back {
  position: relative;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  min-height: 44px;
  padding: 0 18px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-text);
  text-decoration: none;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.14), rgb(0 0 0 / 0.12));
}

.back:hover {
  color: var(--c-accent);
}

.back-mark {
  font-size: 10px;
}

/* 黄铜铭牌 */
.plate {
  display: inline-block;
  padding: 3px 12px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: #4a3212;
  border: 1px solid rgb(120 84 32 / 0.7);
  border-radius: 3px;
  background: linear-gradient(180deg, #e8c98a 0%, #c8a45c 55%, #a9813c 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.55);
}

.plate--date {
  font-family: var(--font-mono);
}

.plate--cat {
  color: #fff;
  border-color: rgb(90 30 20 / 0.8);
  background: linear-gradient(180deg, #c0503a 0%, #982f1e 100%);
}

.title {
  margin: 12px 0 var(--gap);
  font-family: var(--font-head);
  font-size: clamp(26px, 4.2vw, 46px);
  font-weight: 700;
  line-height: 1.14;
  color: var(--c-text);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: var(--gap);
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
  font-weight: 700;
  color: #4a3212;
  text-decoration: none;
  border: 1px solid rgb(120 84 32 / 0.7);
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, #e8c98a 0%, #c8a45c 55%, #a9813c 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.55);
  transition: filter var(--transition);
}

.link:hover {
  filter: brightness(1.08);
}

/* 红色装订线 */
.stitch {
  height: 2px;
  border-radius: 2px;
  background: repeating-linear-gradient(90deg, #b23a24 0 8px, transparent 8px 16px);
}

/* —— 纸上的正文：深色字配米纸 —— */
.prose :deep(h2) {
  margin: 1.8em 0 0.7em;
  font-family: var(--font-head);
  font-size: clamp(19px, 2.3vw, 25px);
  font-weight: 700;
  color: #2c1d0e;
}

.prose :deep(h3) {
  margin: 1.5em 0 0.6em;
  font-family: var(--font-head);
  font-size: clamp(16px, 1.9vw, 20px);
  font-weight: 700;
  color: #2c1d0e;
}

.prose :deep(p) {
  margin: 0 0 1.15em;
  color: #3b2a17;
}

.prose :deep(a) {
  color: #982f1e;
  text-underline-offset: 3px;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin: 0 0 1.15em;
  padding-left: 1.3em;
  color: #3b2a17;
}

.prose :deep(li) {
  margin-bottom: 0.45em;
}

.prose :deep(blockquote) {
  margin: 0 0 1.3em;
  padding: 12px 16px;
  color: #5a4326;
  border-left: 3px solid #b23a24;
  background: rgb(180 140 90 / 0.16);
}

.prose :deep(code) {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: #2c1d0e;
  border-radius: 3px;
  background: rgb(120 84 32 / 0.14);
}

.prose :deep(pre) {
  padding: 16px 18px;
  margin: 0 0 1.4em;
  overflow-x: auto;
  border-radius: 4px;
  background: #2a1c0d;
}

.prose :deep(pre code) {
  padding: 0;
  color: #f2e6d2;
  background: none;
}

.prose :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}

.prose :deep(hr) {
  height: 2px;
  margin: 2.2em 0;
  border: none;
  background: repeating-linear-gradient(90deg, #b23a24 0 8px, transparent 8px 16px);
}

.prose :deep(table) {
  width: 100%;
  margin-bottom: 1.4em;
  border-collapse: collapse;
}

.prose :deep(th),
.prose :deep(td) {
  padding: 9px 12px;
  color: #3b2a17;
  text-align: left;
  border-bottom: 1px solid rgb(120 84 32 / 0.35);
}

.empty {
  margin: 0;
  color: #5a4326;
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
  transition: transform var(--transition);
}

.nav-item:hover {
  transform: translateY(-2px);
}

.nav-item--next {
  text-align: right;
}

.nav-item--empty {
  background: none;
  box-shadow: none;
}

.nav-label {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: #7a5a32;
}

.nav-title {
  font-weight: 700;
  color: #2c1d0e;
}

@media (prefers-reduced-motion: reduce) {
  .link,
  .nav-item {
    transition: none;
  }

  .nav-item:hover {
    transform: none;
  }
}
</style>
