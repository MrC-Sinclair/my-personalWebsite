<!--
  MetroSearch - metro 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 MetroTagFilter 同一套语言：直角 tile、无边框、靠底色区分状态，
  hover / 聚焦时长出顶部指示条（--c-accent-2），Metro 干脆：不做位移只换色。

  数据流向：页面持有共享层 useBlogSearch → 本组件只收 props 发事件，
  不自己取数、不碰 URL。匹配行为全在 utils/search.ts。
-->
<template>
  <div class="search">
    <input
      :value="query"
      type="search"
      class="tile-input"
      :placeholder="t('blog.search')"
      :aria-label="t('blog.search')"
      autocomplete="off"
      @input="emit('update', ($event.target as HTMLInputElement).value)"
    >
    <div class="row">
      <p v-if="query" class="count" role="status">
        {{ resultCount }} / {{ total }} {{ t('blog.postsUnit') }}
      </p>
      <button v-if="query" type="button" class="clear" @click="emit('clear')">
        {{ t('blog.clearSearch') }}
      </button>
    </div>
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

/* —— 输入框：直角 tile，聚焦时长出顶部指示条 —— */
.tile-input {
  position: relative;
  display: block;
  width: 100%;
  min-height: 44px;
  margin-bottom: 4px;
  padding: 12px 16px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: 0;
  border-radius: var(--radius-sm);
  transition:
    background var(--transition),
    color var(--transition);
}

.tile-input::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 3px;
  content: '';
  background: var(--c-accent-2);
  transition: width var(--transition);
}

.tile-input::placeholder {
  color: var(--c-muted);
}

.tile-input:hover {
  background: var(--c-border);
}

.tile-input:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

/* —— 计数：等宽小字 —— */
.count {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
}

/* —— 清除：与标签栏同款（青色文字 tile） —— */
.clear {
  min-height: 34px;
  padding: 6px 14px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: #ffffff;
  background: var(--c-accent-2);
  border: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition);
}

.clear:hover {
  background: var(--c-accent);
}

.clear:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.clear:active {
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .tile-input,
  .tile-input::before,
  .clear {
    transition: none;
  }
}
</style>
