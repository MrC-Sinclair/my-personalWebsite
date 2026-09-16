<!--
  RetroComputerPostItem - 复古电脑风格的文章条目
  ------------------------------------------------------------
  文章窗口里的一个「文档条目」：像素文档图标 + 标题 + 摘要 +
  元信息行（发布日期 / 标签，等宽字体，白色凹陷槽）。
  悬停时底色变化、图标右移 1px（瞬时切换，符合本风格性格）。
  数据来自共享层 useBlog()；tags 用 Array.isArray 防御。
-->
<template>
  <article class="rc-post">
    <span class="rc-post__icon">
      <RetroComputerPixelIcon variant="doc" />
    </span>

    <div class="rc-post__main">
      <h3 class="rc-post__title">{{ post.title }}</h3>
      <p v-if="post.description" class="rc-post__desc">{{ post.description }}</p>

      <p class="rc-post__meta">
        <time class="rc-post__date" :datetime="post.date">{{ formattedDate }}</time>
        <span v-if="safeTags.length" class="rc-post__tags">
          <span v-for="tag in safeTags" :key="tag" class="rc-post__tag">{{ tag }}</span>
        </span>
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * @file 复古电脑风格的文章条目组件
 * @description 数据来自共享层 useBlog()；日期格式化调用共享层
 *              formatDate（业务逻辑只写一份）；tags 防御非数组输入。
 */
import type { BlogPost } from '~/types/blog'
import RetroComputerPixelIcon from './RetroComputerPixelIcon.vue'

const props = defineProps<{
  /** 文章数据（共享层返回值） */
  post: BlogPost
}>()

const { locale } = useI18n()

/** 按当前语言格式化的发布日期（共享层工具函数） */
const formattedDate = computed(() => formatDate(props.post.date, locale.value))

/** 防御：tags 非数组时回退为空列表 */
const safeTags = computed(() => (Array.isArray(props.post.tags) ? props.post.tags : []))
</script>

<style scoped>
/* —— 条目：图标 + 内容两栏，悬停底色变化 + 图标微动 —— */
.rc-post {
  display: flex;
  gap: 10px;
  padding: 12px;
  border: var(--border-w) solid transparent;
}

.rc-post:hover {
  background: #d4d4d4;
  border-color: var(--c-border);
}

.rc-post + .rc-post {
  margin-top: 8px;
}

.rc-post__icon {
  display: inline-flex;
  flex: none;
  padding-top: 2px;
}

/* 悬停时图标右移 1px（列表项图标微动） */
.rc-post:hover .rc-post__icon {
  transform: translateX(1px);
}

.rc-post__main {
  flex: 1;
  min-width: 0;
}

.rc-post__title {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  line-height: 1.4;
}

.rc-post__desc {
  display: -webkit-box;
  margin: 4px 0 0;
  overflow: hidden;
  color: var(--c-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* —— 元信息行：日期 + 标签（等宽字体）—— */
.rc-post__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 8px 0 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
}

.rc-post__date {
  color: var(--c-muted);
}

.rc-post__tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
}

.rc-post__tag {
  padding: 2px 8px;
  background: #ffffff;
  border: var(--border-w) solid;
  border-color: var(--c-border) #ffffff #ffffff var(--c-border);
  box-shadow: inset 1px 1px 0 0 #0a0a0a;
  color: var(--c-text);
}
</style>
