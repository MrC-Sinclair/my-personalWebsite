<!--
  EditorialSearch - editorial 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 EditorialTagFilter 同一套语言：铅字块——直角、纸底、细规则线，
  等宽小字 + 字距拉开（杂志的元数据声部），聚焦边框转红（--c-accent）。
  整条筛选区上下各有规则线（与标签栏同款），像报纸的分栏线。

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
        {{ t('blog.clearSearch') }}
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
  padding: 10px 0;
  margin-bottom: var(--gap);
  border-bottom: var(--border-w) solid var(--c-border);
}

.field {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

/* —— 铅字输入框：直角、纸底、细规则线 —— */
.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 44px;
  padding: 10px 14px;
  font-family: var(--font-mono);
  font-size: 12px;
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
  color: var(--c-accent);
  border-color: var(--c-accent);
}

.input:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* —— 清除：红字下划线（杂志的编辑性文字链） —— */
.clear {
  flex: 0 0 auto;
  min-height: 44px;
  padding: 10px 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--c-accent);
  background: transparent;
  border: 0;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
  transition: color var(--transition);
}

.clear:hover {
  color: #8f1d1d;
}

.clear:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* —— 计数：等宽小字 —— */
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
}
</style>
