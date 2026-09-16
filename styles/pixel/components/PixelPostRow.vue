<!--
  PixelPostRow - pixel 风格文章日志行
  ------------------------------------------------------------
  最新文章不做缩略图卡片，做成「冒险日志」的行条目（根元素
  <li>）：▶ 光标 + 日期 + 标题（NuxtLink 伪元素拉伸铺满整行）
  + 分类徽标（2px currentColor 边框）。整行 hover 色块反转
  为金黄底。数据来自共享层 useBlog 的 getAllPosts（页面传入），
  slug 换算复用共享层 contentSlug。
-->
<template>
  <li class="row">
    <span class="row-cursor" aria-hidden="true">▶</span>
    <span class="row-date">{{ dateText }}</span>
    <span class="row-title">
      <NuxtLink class="row-link" :to="localePath(`/blog/${slug}`)">{{ post.title }}</NuxtLink>
    </span>
    <span v-if="post.category" class="row-badge">{{ post.category }}</span>
    <span v-else class="row-badge row-badge--none" aria-hidden="true">···</span>
  </li>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { BlogPost } from '~/types/blog'

const props = defineProps<{
  /** 文章数据（来自共享层，已按日期倒序） */
  post: BlogPost
}>()

const { locale } = useI18n()
const localePath = useLocalePath()

/** 从内容路径提取 slug（复用共享层 contentSlug，详情页链接形态不变） */
const slug = computed(() => contentSlug(props.post.path))

/** 本地化日期（日期字段为必填，异常时留空不阻塞渲染） */
const dateText = computed(() =>
  props.post.date ? formatDate(props.post.date, locale.value) : '',
)
</script>

<style scoped>
.row {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 12px;
  min-height: 44px;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--c-bg) 55%, var(--c-surface));
  border: 2px solid color-mix(in srgb, var(--c-muted) 40%, transparent);
}

/* hover 色块反转：整行变金黄底 + 纯黑边 */
.row:hover {
  background: var(--c-accent);
  border-color: var(--c-border);
  color: var(--c-on-accent);
}

.row-cursor {
  font-size: var(--fs-small);
  color: var(--c-accent-2);
}

.row-date {
  font-size: var(--fs-small);
  color: var(--c-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.row-title {
  flex: 1 1 200px;
  min-width: 0;
}

/* 标题链接拉伸铺满整行（相对 .row 定位） */
.row-link {
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--c-text);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.row-link::after {
  content: '';
  position: absolute;
  inset: 0;
}

/* 分类徽标：2px currentColor 边框随反色自动变色 */
.row-badge {
  flex: none;
  margin-left: auto;
  padding: 2px 8px;
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  border: 2px solid currentColor;
  white-space: nowrap;
}

.row-badge--none {
  color: var(--c-muted);
}

/* hover 反转后全部文字转深色 */
.row:hover .row-cursor,
.row:hover .row-date,
.row:hover .row-link,
.row:hover .row-badge {
  color: var(--c-on-accent);
}

.row-link:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}
</style>
