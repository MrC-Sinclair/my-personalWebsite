<!--
  SwissSearch - swiss 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 SwissTagFilter 同一套语言：直角方块（--radius-sm 为 0）、
  纯黑细则边框、字距拉开的大写标签、等宽计数；hover = 黑底反白
  （瑞士海报的「直接反相」，不用渐变不用阴影——--shadow 是 none）。

  数据流向：页面持有共享层 useBlogSearch → 本组件只收 props 发事件，
  不自己取数、不碰 URL。匹配行为全在 utils/search.ts。
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
        {{ t('blog.clearSearch') }}<span aria-hidden="true"> ×</span>
      </button>
    </div>

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
  margin-bottom: var(--space);
}

.field {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

/* —— 输入框：直角 + 细则黑边，聚焦用强调色（红）标出 —— */
.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 44px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 0.04em;
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  transition:
    background var(--transition),
    color var(--transition),
    border-color var(--transition);
}

.input::placeholder {
  color: var(--c-muted);
}

.input:hover {
  border-color: var(--c-text);
}

.input:focus-visible {
  outline: none;
  border-color: var(--c-accent);
}

/* —— 清除：与标签栏的「清除」同款（强调色描边，hover 实心反白） —— */
.clear {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  min-height: 44px;
  padding: 0 8px;
  font-family: inherit;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-accent);
  background: transparent;
  border: var(--border-w) solid var(--c-accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition);
}

.clear:hover {
  color: #ffffff;
  background: var(--c-accent);
}

.clear:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.clear:active {
  transform: var(--press-transform);
}

/* —— 计数：等宽小字，与标签角标同一声部 —— */
.count {
  margin: 8px 0 0;
  font-family: var(--font-mono);
  font-size: 11px;
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
