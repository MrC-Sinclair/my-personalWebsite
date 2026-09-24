<!--
  NeumorphismDetailPage - neumorphism 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/neumorphism/blog/<slug>、/style/neumorphism/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  新拟态语法：零边框、零色差，形体全靠双光源阴影（左上亮、右下暗）从同一
  底色里「压」出来；凹槽用 inset。正文承载在一块凸起面板里，元信息是凸起
  胶囊，分隔线用内凹细槽（而不是描边）。
  正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <NeumorphismSubPage>
    <article class="detail">
      <NuxtLink class="back raised" :to="listPath">
        <span class="back-mark" aria-hidden="true">←</span>
        {{ t(listTitleKey) }}
      </NuxtLink>

      <header class="head raised">
        <h1 class="title">{{ view.doc.title }}</h1>

        <div class="meta">
          <span class="pill">{{ formatDate(view.doc.date) }}</span>
          <span v-if="category" class="pill pill--cat">{{ category }}</span>
          <span v-for="tag in tags" :key="tag" class="pill">{{ tag }}</span>
        </div>

        <p v-if="view.doc.description" class="lead">{{ view.doc.description }}</p>

        <div v-if="projectLinks.length" class="links">
          <a
            v-for="link in projectLinks"
            :key="link.href"
            class="link raised"
            :href="link.href"
            target="_blank"
            rel="noopener"
          >
            {{ link.label }}<span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <!-- 内凹细槽：新拟态的分隔不用描边 -->
      <div class="groove" aria-hidden="true" />

      <div class="body raised">
        <ContentRenderer v-if="view.content" :value="view.content" class="prose" />
        <p v-else class="empty">{{ t('common.noData') }}</p>
      </div>

      <nav v-if="view.prev || view.next" class="nav" aria-label="上下篇">
        <NuxtLink v-if="view.prev" class="nav-item raised" :to="view.prev.to">
          <span class="nav-label">{{ t('blog.prev') }}</span>
          <span class="nav-title">{{ view.prev.title }}</span>
        </NuxtLink>
        <span v-else class="nav-item nav-item--empty" />
        <NuxtLink v-if="view.next" class="nav-item nav-item--next raised" :to="view.next.to">
          <span class="nav-label">{{ t('blog.next') }}</span>
          <span class="nav-title">{{ view.next.title }}</span>
        </NuxtLink>
      </nav>
    </article>
  </NeumorphismSubPage>
</template>

<script setup lang="ts">
/**
 * @file Neumorphism 风格详情阅读页
 * @description 凸起面板承载正文 + 双光源阴影，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import NeumorphismSubPage from './NeumorphismSubPage.vue'

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
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

/* 凸起：双光源（左上亮、右下暗），与新拟态其他构件同一角度 */
.raised {
  border-radius: var(--radius);
  background: var(--c-bg);
  box-shadow: var(--shadow);
}

.back {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  align-self: flex-start;
  min-height: 44px;
  padding: 0 18px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-muted);
  text-decoration: none;
  border-radius: 999px;
  transition:
    color var(--transition),
    box-shadow var(--transition);
}

.back:hover {
  color: var(--c-text);
  box-shadow: var(--shadow-press);
}

.back-mark {
  transition: transform var(--transition);
}

.back:hover .back-mark {
  transform: translateX(-3px);
}

.head {
  padding: clamp(20px, 3vw, 32px);
}

.title {
  margin: 0 0 var(--gap);
  font-family: var(--font-head);
  font-size: clamp(26px, 4.2vw, 46px);
  font-weight: 800;
  line-height: 1.16;
  color: var(--c-text);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: var(--gap);
}

.pill {
  padding: 5px 15px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-muted);
  border-radius: 999px;
  background: var(--c-bg);
  box-shadow: var(--shadow);
}

.pill--cat {
  color: var(--c-accent);
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
  padding: 0 20px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-accent);
  text-decoration: none;
  border-radius: 999px;
  transition: box-shadow var(--transition);
}

.link:hover {
  box-shadow: var(--shadow-press);
}

/* 内凹细槽（不是描边） */
.groove {
  height: 4px;
  border-radius: 999px;
  box-shadow: var(--shadow-press);
}

.body {
  padding: clamp(20px, 3vw, 32px);
}

.prose :deep(h2) {
  margin: 1.8em 0 0.7em;
  font-family: var(--font-head);
  font-size: clamp(19px, 2.3vw, 25px);
  font-weight: 800;
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
  padding: 14px 18px;
  color: var(--c-muted);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-press);
}

.prose :deep(code) {
  padding: 3px 7px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  border-radius: 8px;
  box-shadow: var(--shadow-press);
}

.prose :deep(pre) {
  padding: 16px 18px;
  margin: 0 0 1.4em;
  overflow-x: auto;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-press);
}

.prose :deep(pre code) {
  padding: 0;
  box-shadow: none;
}

.prose :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-sm);
}

.prose :deep(hr) {
  height: 4px;
  margin: 2.4em 0;
  border: none;
  border-radius: 999px;
  box-shadow: var(--shadow-press);
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
  padding: 16px 20px;
  text-decoration: none;
  transition:
    box-shadow var(--transition),
    transform var(--transition);
}

.nav-item:hover {
  box-shadow: var(--shadow-press);
  transform: var(--press-transform);
}

.nav-item--next {
  text-align: right;
}

.nav-item--empty {
  background: none;
  box-shadow: none;
}

.nav-label {
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-muted);
}

.nav-title {
  font-weight: 600;
  color: var(--c-text);
}

@media (prefers-reduced-motion: reduce) {
  .back,
  .back-mark,
  .link,
  .nav-item {
    transition: none;
  }

  .nav-item:hover {
    transform: none;
  }

  .back:hover .back-mark {
    transform: none;
  }
}
</style>
