<!--
  GlassmorphismPostRow - glassmorphism 风格的最新文章行
  ------------------------------------------------------------
  单行磨砂玻璃条：日期胶囊 + 标题 + 标签药丸 + 悬浮箭头，
  整行 NuxtLink 跳转到过渡层博客详情页（localePath 包裹，
  不写死路径）。hover 时行内亮起玻璃底、箭头右滑（列表项
  微动签名），日期用共享层 formatDate 格式化，slug 换算
  复用共享层 contentSlug。
-->
<template>
  <NuxtLink class="post-row" :to="localePath(`/blog/${contentSlug(post.path)}`)" :aria-label="`${t('blog.readMore')}：${post.title}`">
    <time class="row-date" :datetime="post.date">{{ formatDate(post.date, locale) }}</time>
    <span class="row-main">
      <span class="row-title">{{ post.title }}</span>
      <span v-if="safeTags.length" class="row-tags">
        <span v-for="tag in safeTags" :key="tag" class="row-tag">{{ tag }}</span>
      </span>
    </span>
    <span class="row-arrow" aria-hidden="true">→</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { BlogPost } from '~/types/blog'

const props = defineProps<{
  /** 文章数据（来自 useBlog，只读展示） */
  post: BlogPost
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

// 数组字段防御：tags 必须是数组才渲染
const safeTags = computed(() => (Array.isArray(props.post.tags) ? props.post.tags : []))
</script>

<style scoped>
/* 单行玻璃条：网格排布（日期 | 内容 | 箭头） */
.post-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  text-decoration: none;
  background: rgb(255 255 255 / 0.38);
  border: var(--border-w) solid rgb(255 255 255 / 0.55);
  border-radius: var(--radius-sm);
  transition:
    background var(--transition),
    border-color var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

/* 交互反馈：亮起玻璃底 + 右移微动 + Glow */
.post-row:hover {
  background: rgb(255 255 255 / 0.62);
  border-color: rgb(255 255 255 / 0.85);
  box-shadow: var(--shadow-press), 0 0 22px rgb(139 92 246 / 0.16);
  transform: translateX(6px);
}

.post-row:active {
  transform: var(--press-transform);
}

/* 日期：等宽字胶囊 */
.row-date {
  flex: none;
  padding: 4px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  white-space: nowrap;
  color: var(--c-accent-2);
  background: rgb(255 255 255 / 0.55);
  border: var(--border-w) solid rgb(255 255 255 / 0.7);
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}

.row-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.row-title {
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--transition);
}

.post-row:hover .row-title {
  color: var(--c-accent);
}

.row-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.row-tag {
  padding: 2px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
  background: rgb(255 255 255 / 0.45);
  border-radius: 999px;
}

/* 箭头：hover 右滑（列表项微动） */
.row-arrow {
  font-family: var(--font-mono);
  font-size: 18px;
  color: var(--c-accent);
  transition: transform var(--transition);
}

.post-row:hover .row-arrow {
  transform: translateX(4px);
}

/* 窄屏：日期与内容上下堆叠 */
@media (max-width: 560px) {
  .post-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .row-date {
    grid-column: 1 / -1;
    justify-self: start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .post-row,
  .row-title,
  .row-arrow {
    transition: none;
  }

  .post-row:hover {
    transform: none;
  }

  .post-row:active {
    transform: none;
  }

  .post-row:hover .row-arrow {
    transform: none;
  }
}
</style>
