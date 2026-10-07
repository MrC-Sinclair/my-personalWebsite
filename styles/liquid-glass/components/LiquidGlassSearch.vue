<!--
  LiquidGlassSearch - liquid-glass 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 LiquidGlassTagFilter 同一套语言：玻璃胶囊——半透底 + 高光边 +
  backdrop-filter 模糊，hover 上浮 2px，聚焦描边与文字转强调色
  （玻璃不靠填色，靠光）。

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
  margin-bottom: var(--gap);
}

.field {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* —— 玻璃输入框：半透底 + 高光边 + 背景模糊 —— */
.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 44px;
  padding: 10px 18px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  backdrop-filter: blur(14px) saturate(140%);
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition),
    transform var(--transition);
}

.input::placeholder {
  color: var(--c-muted);
}

.input:hover {
  color: var(--c-accent);
  border-color: var(--c-accent);
  transform: translateY(-2px);
}

/* 聚焦：描边与文字转强调色（玻璃表态靠光，不靠填色） */
.input:focus-visible {
  outline: none;
  color: var(--c-accent);
  border-color: var(--c-accent);
  background: var(--deco);
}

/* —— 清除：下划线文字链，与标签栏同款 —— */
.clear {
  flex: 0 0 auto;
  min-height: 44px;
  padding: 10px 8px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-accent);
  background: transparent;
  border: 0;
  text-decoration: underline;
  text-underline-offset: 5px;
  cursor: pointer;
  transition: color var(--transition);
}

.clear:hover {
  color: var(--c-text);
}

.clear:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

.clear:active {
  transform: var(--press-transform);
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

  .input:hover,
  .clear:active {
    transform: none;
  }
}
</style>
