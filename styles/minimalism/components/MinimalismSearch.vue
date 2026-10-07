<!--
  MinimalismSearch - minimalism 风格的关键词搜索框
  ------------------------------------------------------------
  形态：一枚 hairline 输入框（无图标、无圆角色块），右侧在搜索态浮出
  「清除」文字链，下方一行等宽计数「命中 / 总数」。与标签筛选栏同一套
  视觉语言（hairline 边框 + 40px 触控目标 + 文字色表达状态）。

  数据流向：页面持有共享层 useBlogSearch → 本组件只收 props 发事件，
  不自己取数、不碰 URL，符合「风格层不写业务逻辑」。
  匹配行为（分词、AND、标题优先排序）全在 utils/search.ts。
-->
<template>
  <div class="search">
    <div class="field">
      <input
        :value="query"
        type="search"
        class="input"
        :placeholder="t('blog.search')"
        :aria-label="t('blog.search')"
        autocomplete="off"
        @input="emit('update', ($event.target as HTMLInputElement).value)"
      >
      <button v-if="query" type="button" class="clear" @click="emit('clear')">
        {{ t('blog.clearSearch') }}
      </button>
    </div>

    <!-- 结果计数：role=status 让读屏软件在筛选后播报 -->
    <p v-if="query" class="count" role="status">
      {{ resultCount }} / {{ total }} {{ t('blog.postsUnit') }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 输入框当前值（受控：来自共享层 useBlogSearch） */
  query: string
  /** 命中数量 */
  resultCount: number
  /** 未搜索时的文章总数 */
  total: number
}>()

const emit = defineEmits<{
  /** 输入关键词 */
  update: [value: string]
  /** 清除搜索 */
  clear: []
}>()

const { t } = useI18n()
</script>

<style scoped>
.search {
  margin: 0 0 var(--space);
}

/* —— 输入框：hairline 边框，聚焦才变深（minimalism 不靠色块表态） —— */
.field {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 40px;
  padding: 8px 12px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: transparent;
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  transition:
    border-color var(--transition),
    color var(--transition);
}

.input::placeholder {
  color: var(--c-muted);
}

.input:hover {
  border-color: var(--c-muted);
}

.input:focus-visible {
  outline: none;
  border-color: var(--c-accent);
}

/* —— 清除：只在搜索态出现，弱化到只剩文字 —— */
.clear {
  flex: 0 0 auto;
  min-height: 40px;
  padding: 8px 4px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-muted);
  background: transparent;
  border: 0;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
  transition: color var(--transition);
}

.clear:hover {
  color: var(--c-accent);
}

.clear:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.clear:active {
  transform: var(--press-transform);
}

/* —— 计数：等宽字，与标签栏角标同一声部 —— */
.count {
  margin: 8px 0 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .input,
  .clear {
    transition: none;
  }

  .clear:active {
    transform: none;
  }
}
</style>
