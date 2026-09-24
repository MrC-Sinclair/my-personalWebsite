<!--
  SciFiHudPostStream - sci-fi-hud 风格文章「数据流」
  ------------------------------------------------------------
  文章列表呈现为数据流条目：每行 = 行号读数 + 发布日期
  （等宽，共享层 formatDate）+ 标题 + 标签（琥珀警示色，
  最多 2 个，防御读取）+ 流向箭头。整行 NuxtLink 跳详情页
  （路由规则与过渡层一致：详情页 slug 由共享层 contentSlug
  从内容路径推导），
  hover 时左缘数据指示条点亮、行背景提亮。
-->
<template>
  <ul class="stream">
    <li v-for="(post, index) in posts" :key="post.path || index" class="stream-item">
      <NuxtLink :to="localePath(postRoute(post))" class="row">
        <span class="row-idx" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="row-date">{{ formatDate(post.date, locale) }}</span>

        <span class="row-main">
          <span class="row-title">{{ post.title }}</span>
          <span v-if="displayTags(post).length" class="row-tags">
            <span v-for="tag in displayTags(post)" :key="tag" class="row-tag">{{ tag }}</span>
          </span>
        </span>

        <span class="row-arrow" aria-hidden="true">▶</span>
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { BlogPost } from '~/types/blog'

defineProps<{
  /** 文章列表（来自 useBlog，字段已在共享层做防御映射） */
  posts: BlogPost[]
}>()

const { locale } = useI18n()
const localePath = useLocalePath()
// 详情链接走风格内路由（/style/<id>/blog/<slug>），旧的 /blog/<slug> 已 404
const { styleId } = useStyleContentPath()

/** 标签防御：最多取前 2 个非空标签（警示色芯片成本高，克制展示） */
function displayTags(post: BlogPost): string[] {
  return (Array.isArray(post.tags) ? post.tags : [])
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 2)
}

/** 由内容路径推导详情页路由（风格内：/style/<id>/blog/<slug>） */
function postRoute(post: BlogPost): string {
  return `/style/${styleId.value}/blog/${contentSlug(post.path)}`
}
</script>

<style scoped>
/* —— 数据流列表 —— */
.stream {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.stream-item {
  min-width: 0;
}

/* —— 单行条目：左缘数据指示条 —— */
.row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 10px 10px 10px 14px;
  text-decoration: none;
  background: color-mix(in srgb, var(--c-bg) 55%, transparent);
  border: var(--border-w) solid transparent;
  transition:
    background var(--transition),
    border-color var(--transition);
}

/* 左缘指示条：默认暗置，hover 点亮 */
.row::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  background: var(--c-border);
  transition: background var(--transition);
}

.row:hover {
  background: color-mix(in srgb, var(--c-accent) 7%, var(--c-bg));
  border-color: color-mix(in srgb, var(--c-accent) 30%, transparent);
}

.row:hover::before {
  background: var(--c-accent);
}

.row:active {
  transform: var(--press-transform);
}

/* 行号读数（装饰） */
.row-idx {
  flex: none;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: color-mix(in srgb, var(--c-accent) 62%, transparent);
  font-variant-numeric: tabular-nums;
}

/* 日期：等宽弱化 */
.row-date {
  flex: none;
  display: none;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
}

.row-main {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

/* 标题：hover 变信号色 */
.row-title {
  overflow: hidden;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  font-weight: 600;
  line-height: 1.5;
  color: var(--c-text);
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--transition);
}

.row:hover .row-title {
  color: var(--c-accent);
}

.row-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 标签芯片：琥珀警示色描边 */
.row-tag {
  padding: 0 6px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  line-height: 1.8;
  color: var(--c-accent-2);
  border: var(--border-w) solid color-mix(in srgb, var(--c-accent-2) 42%, transparent);
}

/* 流向箭头：hover 右移 */
.row-arrow {
  flex: none;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-border);
  transition:
    color var(--transition),
    transform var(--transition);
}

.row:hover .row-arrow {
  color: var(--c-accent);
  transform: translateX(3px);
}

/* 日期在窄屏以上显示 */
@media (min-width: 640px) {
  .row-date {
    display: block;
  }
}

@media (prefers-reduced-motion: reduce) {
  .row,
  .row-title,
  .row-arrow {
    transition: none;
  }

  .row:hover .row-arrow {
    transform: none;
  }

  .row:active {
    transform: none;
  }
}
</style>
