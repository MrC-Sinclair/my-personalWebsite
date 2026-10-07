<!--
  DashboardSearch - dashboard 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 DashboardTagFilter 同一套语言：仪表盘筛选条上的一枚 metric 输入位——
  小圆角（--radius-sm 2px）、无阴影（本风格 --shadow 是 none）、
  hover 描边点亮成天蓝（--c-accent），计数用等宽大写小字。

  dashboard 的 blog 页同时有分类切片 + 标签筛选 + 关键词搜索三个维度，
  全部由共享层正交组合（取交集），本组件只负责关键词这一维。

  数据流向：页面持有共享层 useBlogSearch → 本组件只收 props 发事件，
  不自己取数、不碰 URL。匹配行为全在 utils/search.ts。
-->
<template>
  <div class="search">
    <div class="field">
      <span class="field-label">{{ t('blog.search') }}</span>
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
  display: grid;
  gap: 6px;
}

.field {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

/* —— 维度标签：与标签栏同款（等宽大写小字） —— */
.field-label {
  margin-right: 2px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* —— 输入框：metric chip 的形态，聚焦描边点亮 —— */
.input {
  flex: 1 1 220px;
  min-width: 0;
  min-height: 34px;
  padding: 7px 12px;
  font-family: inherit;
  font-size: var(--fs-small);
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

/* —— 清除：与标签栏同款（琥珀描边，hover 实心） —— */
.clear {
  min-height: 34px;
  padding: 7px 10px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  background: transparent;
  border: var(--border-w) solid var(--c-accent-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition);
}

.clear:hover {
  color: #1a1206;
  background: var(--c-accent-2);
}

.clear:focus-visible {
  outline: 2px solid var(--c-accent-2);
  outline-offset: 2px;
}

.clear:active {
  transform: var(--press-transform);
}

/* —— 计数：等宽小字，仪表盘读数感 —— */
.count {
  margin: 0;
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
