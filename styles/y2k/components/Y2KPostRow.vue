<!--
  Y2KPostRow - y2k 风格文章列表行
  ------------------------------------------------------------
  整行为一个 NuxtLink（无内嵌链接，HTML 合法）：
  序号铬球 + 标题/摘要 + 分类胶囊 + 日期铭牌 + 箭头。
  悬浮：塑料高光扫过 + 右移 + 边框辉光；数据来自共享层 useBlog()，
  slug 换算复用共享层 contentSlug（不在风格里重写业务逻辑）。
-->
<template>
  <NuxtLink class="prow" :to="postPath(contentSlug(post.path))">
    <span class="prow-index" aria-hidden="true">{{ padIndex }}</span>
    <span class="prow-main">
      <span class="prow-title">{{ post.title }}</span>
      <span v-if="post.description" class="prow-desc">{{ post.description }}</span>
    </span>
    <span class="prow-meta">
      <span v-if="post.category" class="prow-cat">{{ post.category }}</span>
      <time class="prow-date" :datetime="post.date">{{ formatDate(post.date, locale) }}</time>
    </span>
    <span class="prow-arrow" aria-hidden="true">»</span>
  </NuxtLink>
</template>

<script setup lang="ts">
/**
 * @file Y2K 风格的文章列表行组件
 * @description 序号铬球 + 塑料高光行，整行可点击进入过渡层文章详情。
 */
import { contentSlug } from '~/utils/content'
import type { BlogPost } from '~/types/blog'

const props = withDefaults(
  defineProps<{
    /** 文章数据（共享层 useBlog 返回值） */
    post: BlogPost
    /** 行序号（从 0 起，展示为 01/02…） */
    index?: number
  }>(),
  {
    index: 0,
  },
)

const { locale } = useI18n()
// 详情链接走风格内路由（/style/<id>/blog/<slug>），旧的 /blog/<slug> 已 404
const { postPath } = useStyleContentPath()

/** 序号格式化为两位数铭牌（01、02…） */
const padIndex = computed(() => String(props.index + 1).padStart(2, '0'))
</script>

<style scoped>
.prow {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--gap);
  overflow: hidden;
  min-height: 40px;
  padding: 16px 18px;
  text-decoration: none;
  border: var(--border-w) solid rgb(190 200 255 / 0.3);
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.09) 0%, rgb(255 255 255 / 0.03) 100%);
  transition:
    transform var(--transition),
    border-color var(--transition),
    box-shadow var(--transition),
    background var(--transition);
}

/* hover：右移 + 铬边点亮 + 辉光 */
.prow:hover {
  transform: translateX(4px);
  border-color: rgb(200 210 255 / 0.65);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.14) 0%, rgb(139 123 255 / 0.1) 100%);
  box-shadow: 0 10px 26px rgb(5 0 42 / 0.5), 0 0 18px rgb(139 123 255 / 0.28);
}

.prow:active {
  transform: translateX(2px) var(--press-transform);
}

/* 高光扫过 */
.prow::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 36%, rgb(255 255 255 / 0.22) 50%, transparent 62%);
  transform: translateX(-130%);
  transition: transform 560ms ease;
  pointer-events: none;
}

.prow:hover::after {
  transform: translateX(130%);
}

/* —— 序号铬球 —— */
.prow-index {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-on-accent);
  border: 1px solid rgb(255 255 255 / 0.6);
  border-radius: 50%;
  background: radial-gradient(120% 120% at 32% 26%, #ffffff 0%, #c3cdf2 34%, #7d89c9 62%, #4a569e 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.9),
    0 0 10px rgb(139 123 255 / 0.4);
}

/* —— 标题 + 摘要 —— */
.prow-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.prow-title {
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 700;
  color: var(--c-text);
  transition: color var(--transition);
}

.prow:hover .prow-title {
  color: var(--c-accent);
}

.prow-desc {
  display: none;
  overflow: hidden;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* —— 元信息 —— */
.prow-meta {
  display: none;
  flex: none;
  align-items: center;
  gap: 10px;
}

.prow-cat {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: #2b0733;
  border: var(--border-w) solid rgb(255 255 255 / 0.5);
  border-radius: 999px;
  background: linear-gradient(180deg, #ffd7f4 0%, #ff5ce1 60%, #e23cc4 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.7);
}

.prow-date {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.06em;
  color: rgb(190 235 255 / 1);
  white-space: nowrap;
}

.prow-arrow {
  flex: none;
  font-family: var(--font-head);
  font-size: 20px;
  color: var(--c-accent);
  transition: transform var(--transition);
}

.prow:hover .prow-arrow {
  transform: translateX(4px);
}

/* —— 桌面端：显示摘要与元信息 —— */
@media (min-width: 768px) {
  .prow-desc {
    display: block;
  }

  .prow-meta {
    display: inline-flex;
  }
}

@media (prefers-reduced-motion: reduce) {
  .prow,
  .prow::after,
  .prow-title,
  .prow-arrow {
    transition: none;
  }

  .prow::after {
    display: none;
  }

  .prow:hover,
  .prow:active,
  .prow:hover .prow-arrow {
    transform: none;
  }
}
</style>
