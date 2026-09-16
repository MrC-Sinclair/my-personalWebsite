<!--
  SwissPostList - swiss 风格最新文章列表
  ------------------------------------------------------------
  条目式细则线排版：每行「编号 | 日期 | 标题 + 摘要 | 分类」，
  整行是一个 NuxtLink（进入文章详情，路由与过渡层同一约定）。
  交互反馈：hover 时标题出现强调色下划线、行尾箭头右移。
  数据来自共享层 useBlog（页面获取后传入）。
-->
<template>
  <div class="post-list">
    <NuxtLink
      v-for="(post, i) in posts"
      :key="post.path"
      class="post-row"
      :to="localePath(postPath(post))"
    >
      <span class="row-no" aria-hidden="true">{{ pad(i + 1) }}</span>
      <time class="row-date" :datetime="post.date">{{ formatDate(post.date, locale) }}</time>

      <span class="row-main">
        <span class="row-title">
          {{ post.title }}
          <span class="row-arrow" aria-hidden="true">→</span>
        </span>
        <span v-if="post.description" class="row-desc">{{ post.description }}</span>
      </span>

      <span class="row-cat" :class="{ 'is-empty': !metaOf(post) }">
        {{ metaOf(post) || '—' }}
      </span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import { contentSlug } from '~/utils/content'

defineProps<{
  /** 文章列表（来自 useBlog，已按日期倒序） */
  posts: BlogPost[]
}>()

const { locale } = useI18n()
const localePath = useLocalePath()

/** 编号格式化：补零到两位 */
function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** 文章详情路由（slug 换算复用共享层 contentSlug，链接形态不变） */
function postPath(post: BlogPost): string {
  return `/blog/${contentSlug(post.path)}`
}

/** 行尾分类信息：优先分类，无则取首个标签（数组字段防御） */
function metaOf(post: BlogPost): string {
  if (post.category) return post.category
  const tags = Array.isArray(post.tags) ? post.tags : []
  return tags.length > 0 ? String(tags[0]).trim() : ''
}
</script>

<style scoped>
.post-list {
  border-bottom: var(--border-w) solid var(--c-border);
}

/* 整行可点击：细则线行，内部四段栅格对齐 */
.post-row {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 6px var(--gap);
  align-items: baseline;
  padding: 22px 0;
  color: inherit;
  text-decoration: none;
  border-top: var(--border-w) solid var(--c-border);
  transition: color var(--transition);
}

.row-no {
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-accent);
  font-variant-numeric: tabular-nums;
}

.row-date {
  grid-column: 2;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;
}

.row-main {
  grid-column: 1 / -1;
  display: grid;
  gap: 6px;
}

/* 标题行：大号 + hover 强调色下划线生长 + 箭头右移 */
.row-title {
  font-size: clamp(19px, 2.4vw, 26px);
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--c-text);
}

.row-arrow {
  display: inline-block;
  margin-left: 4px;
  color: var(--c-accent);
  transition: transform var(--transition);
}

.row-desc {
  max-width: 68ch;
  font-size: 14px;
  color: var(--c-muted);
}

/* 分类 / 标签：小号宽字距 */
.row-cat {
  grid-column: 1 / -1;
  font-size: var(--fs-small);
  color: var(--c-text);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.row-cat.is-empty {
  color: var(--c-muted);
}

/* 行级反馈：hover 时标题下划线生长（画在行背景上） */
.post-row:hover .row-title,
.post-row:focus-visible .row-title {
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 100% 3px;
}

.post-row:hover .row-arrow,
.post-row:focus-visible .row-arrow {
  transform: translateX(6px);
}

.post-row:active .row-title {
  color: var(--c-accent);
}

/* —— 桌面端：编号 | 日期 | 主内容 | 分类 四栏 —— */
@media (min-width: 900px) {
  .post-row {
    grid-template-columns: 40px 140px minmax(0, 1fr) minmax(90px, 160px);
  }

  .row-date {
    grid-column: 2;
  }

  .row-main {
    grid-column: 3;
  }

  .row-cat {
    grid-column: 4;
    justify-self: end;
    text-align: right;
  }
}

@media (prefers-reduced-motion: reduce) {
  .row-arrow {
    transition: none;
  }
}
</style>
