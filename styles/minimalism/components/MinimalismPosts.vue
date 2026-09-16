<!--
  MinimalismPosts - minimalism 风格的「最新文章」区块
  ------------------------------------------------------------
  索引式目录：等宽日期 → 标题 + 元信息（分类 · 标签），
  整行 NuxtLink 进入文章详情页；悬停时强调色 + 箭头右移。
  区块头附注位放「查看全部」入口（localePath('/blog')）。
  列表为空时显示带提示的静默空状态。
  数据来自共享层 useBlog（由页面获取后传入 props）。
-->
<template>
  <MinimalismSection
    id="posts"
    data-section="posts"
    :eyebrow="t('nav.blog')"
    :title="t('home.latestPosts')"
  >
    <template #aside>
      <NuxtLink class="more" :to="localePath('/blog')">
        {{ t('home.viewAll') }}<span class="more-arrow" aria-hidden="true">→</span>
      </NuxtLink>
    </template>

    <ul v-if="posts.length" class="idx">
      <li v-for="post in posts" :key="post.path" class="idx-item">
        <NuxtLink class="row" :to="localePath(postRoute(post))">
          <div class="row-date">{{ formatDate(post.date, locale) }}</div>
          <div class="row-main">
            <h3 class="row-title">
              {{ post.title }}<span class="row-arrow" aria-hidden="true">→</span>
            </h3>
            <p v-if="metaOf(post)" class="row-meta">{{ metaOf(post) }}</p>
          </div>
        </NuxtLink>
      </li>
    </ul>
    <div v-else class="empty">
      <p class="empty-title">{{ t('blog.noResults') }}</p>
      <p class="empty-hint">{{ t('blog.noResultsHint') }}</p>
    </div>
  </MinimalismSection>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import { contentSlug } from '~/utils/content'
import MinimalismSection from './MinimalismSection.vue'

defineProps<{
  /** 最新文章列表（来自共享层 useBlog，按日期倒序） */
  posts: BlogPost[]
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

/** 元信息行：分类 + 标签串（数组字段做防御，最多取 3 个标签） */
function metaOf(post: BlogPost): string {
  const tags = (Array.isArray(post.tags) ? post.tags : [])
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 3)
  const parts = [typeof post.category === 'string' ? post.category.trim() : '', ...tags].filter(
    Boolean,
  )
  return parts.join(' · ')
}

/** 由内容路径推导详情页路由（slug 换算复用共享层 contentSlug，链接形态不变） */
function postRoute(post: BlogPost): string {
  return `/blog/${contentSlug(post.path)}`
}
</script>

<style scoped>
/* —— 「查看全部」附注链接：下划线渐显 + 箭头右移 —— */
.more {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  font-size: var(--fs-small);
  color: var(--c-text);
  text-decoration: underline;
  text-decoration-color: var(--c-border);
  text-decoration-thickness: 1px;
  text-underline-offset: 6px;
  transition:
    color var(--transition),
    text-decoration-color var(--transition);
}

.more:hover {
  color: var(--c-accent);
  text-decoration-color: var(--c-accent);
}

.more:active {
  transform: var(--press-transform);
}

.more-arrow {
  transition: transform var(--transition);
}

.more:hover .more-arrow {
  transform: translateX(4px);
}

/* —— 目录行：日期 | 标题 + 元信息，hairline 分隔 —— */
.idx {
  margin: 0;
  padding: 0;
  list-style: none;
}

.idx-item {
  border-top: var(--border-w) solid var(--c-border);
}

.idx-item:last-child {
  border-bottom: var(--border-w) solid var(--c-border);
}

.row {
  display: grid;
  grid-template-columns: 128px minmax(0, 1fr);
  gap: 4px 20px;
  padding: 18px 10px;
  color: inherit;
  text-decoration: none;
  transition: background var(--transition);
}

.row:hover {
  background: var(--deco);
}

.row:active {
  transform: var(--press-transform);
}

.row-date {
  padding-top: 4px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
  white-space: nowrap;
}

.row-main {
  display: block;
  min-width: 0;
}

/* —— 标题：悬停强调色 + 箭头右移 —— */
.row-title {
  margin: 0;
  font-size: clamp(17px, 2vw, 20px);
  font-weight: 500;
  line-height: 1.45;
  color: var(--c-text);
  transition: color var(--transition);
}

.row:hover .row-title {
  color: var(--c-accent);
}

.row-arrow {
  display: inline-block;
  margin-left: 8px;
  color: var(--c-muted);
  transition:
    transform var(--transition),
    color var(--transition);
}

.row:hover .row-arrow {
  color: var(--c-accent);
  transform: translateX(4px);
}

.row-meta {
  margin: 4px 0 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* —— 空状态：白色浮起面板 + 提示（全页少数使用软阴影的地方） —— */
.empty {
  margin: 0;
  padding: 26px var(--space);
  background: var(--c-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.empty-title {
  margin: 0;
  font-weight: 500;
  color: var(--c-text);
}

.empty-hint {
  margin: 6px 0 0;
  color: var(--c-muted);
}

/* —— 窄屏：日期退到标题上方（回退布局不回退设计） —— */
@media (max-width: 560px) {
  .row {
    grid-template-columns: 1fr;
  }

  .row-date {
    padding-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .more,
  .more-arrow,
  .row,
  .row-title,
  .row-arrow {
    transition: none;
  }

  .more:hover .more-arrow,
  .row:hover .row-arrow {
    transform: none;
  }

  .more:active,
  .row:active {
    transform: none;
  }
}
</style>
