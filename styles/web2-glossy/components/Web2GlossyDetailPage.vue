<!--
  Web2GlossyDetailPage - web2-glossy 风格的详情阅读页（文章 / 项目通用）
  ------------------------------------------------------------
  路由：/style/web2-glossy/blog/<slug>、/style/web2-glossy/projects/<slug>
  取数由路由壳完成，本组件只接收 DetailView 负责排版。

  Web 2.0 光泽语法：大圆角白卡 + 顶部半高光（果冻面）+ 正上方光源的高光、
  Aqua 蓝渐变条、蓝（信息）/ 橙（强调）互补色分工、标题带镜像倒影渐隐。
  正文承载在白卡里，元信息是光泽胶囊。
  正文排版（prose）用 :deep() 覆盖动态 HTML。
-->
<template>
  <Web2GlossySubPage>
    <article class="detail">
      <NuxtLink class="back" :to="listPath">
        <span class="back-mark" aria-hidden="true">«</span>
        {{ t(listTitleKey) }}
      </NuxtLink>

      <header class="head card">
        <span class="ribbon">{{ kindLabel }}</span>
        <h1 class="title">{{ view.doc.title }}</h1>
        <!-- 标题倒影：Web 2.0 的招牌手法 -->
        <span class="reflect" aria-hidden="true">{{ view.doc.title }}</span>

        <div class="meta">
          <span class="pill pill--date">{{ formatDate(view.doc.date) }}</span>
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
  </Web2GlossySubPage>
</template>

<script setup lang="ts">
/**
 * @file Web2Glossy 风格详情阅读页
 * @description 白卡 + 果冻高光 + 标题倒影，文章与项目共用。
 */
import { computed } from 'vue'
import type { DetailView } from '~/types/detail'
import { isProjectDoc } from '~/types/detail'
import Web2GlossySubPage from './Web2GlossySubPage.vue'

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

/* 白卡 + 顶部半高光（果冻面） */
.card {
  position: relative;
  padding: clamp(18px, 2.8vw, 30px);
  overflow: hidden;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: #fff;
  box-shadow: var(--shadow);
}

.card::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 42%;
  content: '';
  background: linear-gradient(180deg, rgb(255 255 255 / 0.95) 0%, rgb(255 255 255 / 0.35) 100%);
  pointer-events: none;
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
  color: #fff;
  text-decoration: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #58a6f5 0%, #1d6fae 55%, #0b4c9c 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.6),
    0 3px 6px rgb(11 76 156 / 0.35);
}

.back:hover {
  filter: brightness(1.08);
}

.back-mark {
  font-size: 14px;
}

/* 顶部蓝色渐变条 */
.ribbon {
  position: relative;
  display: inline-block;
  padding: 3px 14px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: #fff;
  border-radius: 999px;
  background: linear-gradient(180deg, #58a6f5 0%, #1d6fae 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.55);
}

.title {
  position: relative;
  margin: 12px 0 0;
  font-family: var(--font-head);
  font-size: clamp(26px, 4.4vw, 48px);
  font-weight: 800;
  line-height: 1.12;
  color: var(--c-text);
}

/* 倒影：垂直翻转 + 渐隐遮罩 */
.reflect {
  display: block;
  margin-bottom: var(--gap);
  font-family: var(--font-head);
  font-size: clamp(26px, 4.4vw, 48px);
  font-weight: 800;
  line-height: 1.12;
  color: var(--c-text);
  opacity: 0.25;
  transform: scaleY(-1);
  mask-image: linear-gradient(180deg, transparent 40%, #000 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 40%, #000 100%);
}

.meta {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: var(--gap);
}

.pill {
  padding: 4px 14px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: #1d6fae;
  border-radius: 999px;
  background: #e8f3fd;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.8);
}

.pill--date {
  font-family: var(--font-mono);
}

/* 橙色强调：互补色分工 */
.pill--cat {
  color: #fff;
  background: linear-gradient(180deg, #ffb45c 0%, #e0701a 100%);
}

.lead {
  position: relative;
  max-width: 62ch;
  margin: 0;
  color: var(--c-muted);
}

.links {
  position: relative;
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
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffb45c 0%, #e0701a 55%, #b7540d 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.6),
    0 3px 6px rgb(183 84 13 / 0.35);
  transition: filter var(--transition);
}

.link:hover {
  filter: brightness(1.08);
}

.prose :deep(h2) {
  position: relative;
  margin: 1.8em 0 0.7em;
  font-family: var(--font-head);
  font-size: clamp(19px, 2.3vw, 25px);
  font-weight: 800;
  color: var(--c-text);
}

.prose :deep(h3) {
  position: relative;
  margin: 1.5em 0 0.6em;
  font-family: var(--font-head);
  font-size: clamp(16px, 1.9vw, 20px);
  font-weight: 800;
  color: var(--c-text);
}

.prose :deep(p) {
  position: relative;
  margin: 0 0 1.15em;
}

.prose :deep(a) {
  color: #1d6fae;
  text-underline-offset: 3px;
}

.prose :deep(ul),
.prose :deep(ol) {
  position: relative;
  margin: 0 0 1.15em;
  padding-left: 1.3em;
}

.prose :deep(li) {
  margin-bottom: 0.45em;
}

.prose :deep(blockquote) {
  position: relative;
  margin: 0 0 1.3em;
  padding: 12px 16px;
  color: var(--c-muted);
  border-left: 4px solid #ffb45c;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  background: #fff6ea;
}

.prose :deep(code) {
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  border-radius: 4px;
  background: #f1f5f9;
}

.prose :deep(pre) {
  position: relative;
  padding: 16px 18px;
  margin: 0 0 1.4em;
  overflow-x: auto;
  border-radius: var(--radius-sm);
  background: #0f2740;
}

.prose :deep(pre code) {
  padding: 0;
  color: #eaf2fb;
  background: none;
}

.prose :deep(img) {
  position: relative;
  max-width: 100%;
  border-radius: var(--radius-sm);
}

.prose :deep(hr) {
  position: relative;
  height: 3px;
  margin: 2.2em 0;
  border: none;
  border-radius: 999px;
  background: linear-gradient(90deg, #58a6f5, #e8f3fd);
}

.prose :deep(table) {
  position: relative;
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
  position: relative;
  margin: 0;
  color: var(--c-muted);
}

.nav {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-decoration: none;
  transition: transform var(--transition);
}

.nav-item:hover {
  transform: translateY(-3px);
}

.nav-item--next {
  text-align: right;
}

.nav-item--empty {
  background: none;
  box-shadow: none;
}

.nav-item--empty::before {
  display: none;
}

.nav-label {
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #e0701a;
}

.nav-title {
  font-weight: 700;
  color: var(--c-text);
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
