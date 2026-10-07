<!--
  Soft3DSearch - soft-3d 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 Soft3DTagFilter 同一套语言：surface 底 + 投影抬升的小丸子，
  hover 抬高一档（阴影变大变淡 = 离面更远），聚焦加青色描边光。

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

/* —— 小丸子输入框：surface 底 + 投影抬升 —— */
.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 46px;
  padding: 12px 20px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: 0;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    color var(--transition);
}

.input::placeholder {
  color: var(--c-muted);
}

/* hover：抬高一档（离面更远） */
.input:hover {
  color: var(--c-accent);
  transform: translateY(-4px);
  box-shadow: var(--shadow-press);
}

/* 聚焦：青色描边光（离视点最近） */
.input:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
  box-shadow:
    var(--shadow),
    0 0 0 2px rgb(34 211 238 / 0.5);
}

/* —— 清除：下划线文字链，与标签栏同款 —— */
.clear {
  flex: 0 0 auto;
  min-height: 46px;
  padding: 12px 8px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  background: transparent;
  border: 0;
  text-decoration: underline;
  text-underline-offset: 5px;
  cursor: pointer;
  transition: color var(--transition);
}

.clear:hover {
  color: var(--c-accent);
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
