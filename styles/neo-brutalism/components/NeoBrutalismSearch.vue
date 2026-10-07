<!--
  NeoBrutalismSearch - neo-brutalism 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 NeoBrutalismTagFilter 同一套语言：实心方块——粗黑边 + 硬阴影，
  hover 黑底反白，按压时整体平移吃掉阴影（被压进纸里）。

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
  gap: 12px;
}

/* —— 输入框：粗黑边 + 硬阴影，聚焦用强调黄描边 —— */
.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 46px;
  padding: 12px 18px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  transition:
    background var(--transition),
    color var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.input::placeholder {
  color: var(--c-muted);
  font-weight: 400;
}

.input:hover {
  color: #ffffff;
  background: #111111;
}

.input:hover::placeholder {
  color: rgb(255 255 255 / 0.6);
}

.input:focus-visible {
  outline: 3px solid var(--c-accent);
  outline-offset: 2px;
}

.input:active {
  box-shadow: none;
  transform: var(--press-transform);
}

/* —— 清除：与标签栏同款（accent-2 实心 + 硬阴影） —— */
.clear {
  flex: 0 0 auto;
  min-height: 46px;
  padding: 12px 14px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 700;
  color: #111111;
  background: var(--c-accent-2);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition:
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.clear:hover {
  color: #ffffff;
  background: #111111;
}

.clear:focus-visible {
  outline: 3px solid var(--c-accent-2);
  outline-offset: 2px;
}

.clear:active {
  box-shadow: none;
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

  .input:active,
  .clear:active {
    transform: none;
  }
}
</style>
