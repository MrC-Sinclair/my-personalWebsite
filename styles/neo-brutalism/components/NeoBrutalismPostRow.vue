<!--
  NeoBrutalismPostRow - neo-brutalism 风格最新文章条目
  ------------------------------------------------------------
  「号外报纸」式整行条目：日期铅块 + 粗重标题 + 描述 + 标签，
  行尾一枚大箭头。hover 时整行反白（黑底纸字）、日期铅块
  变海报黄——硬切换的标志性反馈。整行 NuxtLink 跳文章详情。
  数据来自共享层 useBlog（页面传入），slug 换算复用共享层 contentSlug。
-->
<template>
  <NuxtLink
    class="row"
    :to="localePath(`/style/${styleId}/blog/${contentSlug(post.path)}`)"
  >
    <span class="date-box">{{ formatDate(post.date, locale) }}</span>
    <!-- div 包裹保证 h3 嵌套合法（a 元素透明内容模型继承 li 的流内容） -->
    <div class="main">
      <h3 class="title">{{ post.title }}</h3>
      <span v-if="post.description" class="desc">{{ post.description }}</span>
      <span v-if="safeTags.length" class="tags">
        <span v-for="tag in safeTags.slice(0, 3)" :key="tag" class="tag">#{{ tag }}</span>
      </span>
    </div>
    <span class="go" aria-hidden="true">→</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { BlogPost } from '~/types/blog'

const props = defineProps<{
  /** 文章数据（来自 useBlog） */
  post: BlogPost
}>()

const { locale } = useI18n()
const localePath = useLocalePath()
// 详情链接走风格内路由（/style/<id>/blog/<slug>），旧的 /blog/<slug> 已 404
const { styleId } = useStyleContentPath()

/** 防御性归一化：tags 数组字段用 Array.isArray 检查 */
const safeTags = computed<string[]>(() => (Array.isArray(props.post.tags) ? props.post.tags : []))
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 44px;
  padding: 16px 18px;
  color: var(--c-text);
  text-decoration: none;
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  box-shadow: var(--shadow);
  transition:
    color var(--transition),
    background var(--transition),
    transform var(--transition),
    box-shadow var(--transition);
}

/* hover 整行反白：黑底纸字 + 日期铅块点亮海报黄 */
.row:hover {
  color: var(--c-bg);
  background: var(--c-text);
  transform: translate(-3px, -3px);
  box-shadow: 9px 9px 0 var(--c-accent);
}

.row:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

.row:focus-visible {
  outline: var(--border-w) solid var(--c-accent-2);
  outline-offset: 4px;
}

/* —— 日期铅块 —— */
.date-box {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 40px;
  padding: 6px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-bg);
  background: var(--c-text);
  border: 2px solid var(--c-text);
  transition:
    color var(--transition),
    background var(--transition),
    border-color var(--transition);
}

.row:hover .date-box {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

/* —— 主体 —— */
.main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.title {
  margin: 0;
  font-family: var(--font-head);
  font-size: 19px;
  font-weight: 900;
  line-height: 1.3;
  overflow-wrap: break-word;
}

.desc {
  display: -webkit-box;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.6;
  color: var(--c-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  transition: color var(--transition);
}

.row:hover .desc {
  /* 黑底上的描述提亮（对比度 ≥ 4.5:1） */
  color: color-mix(in srgb, var(--c-bg) 78%, var(--c-text));
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

/* —— 行尾大箭头 —— */
.go {
  flex: none;
  font-family: var(--font-head);
  font-size: 26px;
  font-weight: 900;
  transition: transform var(--transition);
}

.row:hover .go {
  transform: translateX(6px);
}

/* —— 窄屏：日期铅块换行到标题上方 —— */
@media (max-width: 640px) {
  .row {
    flex-wrap: wrap;
    gap: 10px;
    padding: 14px;
  }

  .go {
    display: none;
  }

  .main {
    flex-basis: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .row,
  .date-box,
  .go,
  .desc {
    transition: none;
  }

  .row:hover,
  .row:active,
  .row:hover .go {
    transform: none;
  }
}
</style>
