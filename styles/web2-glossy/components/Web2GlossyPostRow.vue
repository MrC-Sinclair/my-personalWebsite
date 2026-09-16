<!--
  Web2GlossyPostRow - Web 2.0 光泽风格的文章行条目
  ------------------------------------------------------------
  白色光泽行卡：左侧日期胶囊（凝胶小按钮质感）+ 标题/摘要 +
  标签胶囊；hover 时整行提亮并浮出左侧蓝色指示条（本风格未实现
  文章详情页，行条目不做假链接，仅保留列表 hover 反馈）。
  日期用共享层 utils/formatDate 按当前语言格式化。
-->
<template>
  <article class="prow">
    <time class="prow__date" :datetime="post.date">{{ formattedDate }}</time>

    <div class="prow__main">
      <h3 class="prow__title">{{ post.title }}</h3>
      <p v-if="post.description" class="prow__desc">{{ post.description }}</p>
      <ul v-if="safeTags.length" class="prow__tags">
        <li v-for="tag in safeTags" :key="tag" class="prow__tag">{{ tag }}</li>
      </ul>
    </div>

    <span class="prow__indicator" aria-hidden="true"/>
  </article>
</template>

<script setup lang="ts">
/**
 * @file Web 2.0 光泽风格的文章行条目组件
 * @description 数据来自共享层 useBlog()；tags 用 Array.isArray 防御；
 *              日期格式化调用共享层 formatDate（业务逻辑只写一份）。
 */
import type { BlogPost } from '~/types/blog'

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
/* —— 白色光泽行卡 —— */
.prow {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--gap);
  padding: 16px 20px;
  overflow: hidden;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: linear-gradient(180deg, #ffffff 0%, #f3f9ff 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    0 2px 6px rgb(23 74 128 / 0.12),
    0 8px 18px rgb(23 74 128 / 0.1);
  transition:
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

/* hover：整行提亮 + 左侧指示条浮出 */
.prow:hover {
  background: linear-gradient(180deg, #ffffff 0%, #e9f2fc 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    0 4px 10px rgb(23 74 128 / 0.18),
    0 14px 28px rgb(23 74 128 / 0.14);
  transform: translateX(4px);
}

/* 左侧蓝色指示条（默认收起） */
.prow__indicator {
  position: absolute;
  inset: 10px auto 10px 0;
  width: 5px;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  background: linear-gradient(180deg, #58a6f5 0%, #1d5fae 100%);
  box-shadow: 1px 0 3px rgb(23 74 128 / 0.3);
  transform: scaleY(0);
  transition: transform var(--transition);
}

.prow:hover .prow__indicator {
  transform: scaleY(1);
}

/* —— 日期胶囊 —— */
.prow__date {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 34px;
  padding: 5px 14px;
  overflow: hidden;
  border: 1px solid #14417e;
  border-radius: var(--radius-sm);
  color: var(--c-on-accent);
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  white-space: nowrap;
  background: linear-gradient(180deg, #2b72c6 0%, #1d5fae 55%, #174a8f 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.45),
    0 2px 5px rgb(23 74 128 / 0.25);
}

/* 日期胶囊顶部高光 */
.prow__date::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.35) 0%, rgb(255 255 255 / 0) 60%);
  pointer-events: none;
}

/* —— 文本区 —— */
.prow__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.prow__title {
  margin: 0;
  font-family: var(--font-head);
  font-size: 1.125rem;
  font-weight: 800;
  line-height: 1.4;
  color: var(--c-text);
}

.prow__desc {
  margin: 0;
  color: var(--c-muted);
  font-size: 0.9375rem;
}

/* —— 标签胶囊 —— */
.prow__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
}

.prow__tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 11px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  font-size: var(--fs-small);
  font-weight: 600;
  color: #1a5fc0;
  background: linear-gradient(180deg, #ffffff 0%, #e9f2fc 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.9);
}

/* —— 窄屏：日期胶囊移到标题上方 —— */
@media (max-width: 560px) {
  .prow {
    flex-direction: column;
    gap: 10px;
  }

  .prow__date {
    align-self: flex-start;
  }
}
</style>
