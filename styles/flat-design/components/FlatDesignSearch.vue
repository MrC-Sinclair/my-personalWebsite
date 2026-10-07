<!--
  FlatDesignSearch - flat-design 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 FlatDesignTagFilter 同一套语言：半透白块、无描边无阴影，
  状态只靠换色——hover 变纯白，聚焦用点亮黄（#f1c40f）描边标出。
  本风格 --press-transform 是 none：扁平化的反馈靠颜色，不靠位移。

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
  gap: 8px;
}

/* —— 扁平输入块：半透白底，hover 纯白，聚焦黄描边 —— */
.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 44px;
  padding: 11px 16px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: #ffffff;
  background: rgb(255 255 255 / 0.14);
  border: 0;
  border-radius: var(--radius-sm);
  transition:
    background var(--transition),
    color var(--transition),
    outline-color var(--transition);
}

.input::placeholder {
  color: rgb(255 255 255 / 0.65);
}

.input:hover {
  color: var(--c-text);
  background: #ffffff;
}

.input:hover::placeholder {
  color: var(--c-muted);
}

.input:focus-visible {
  outline: 2px solid #f1c40f;
  outline-offset: 2px;
}

/* —— 清除：点亮黄文字链，与标签栏同款 —— */
.clear {
  flex: 0 0 auto;
  min-height: 44px;
  padding: 11px 10px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: #f1c40f;
  background: transparent;
  border: 0;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
  transition: color var(--transition);
}

.clear:hover {
  color: #ffd94d;
}

.clear:focus-visible {
  outline: 2px solid #f1c40f;
  outline-offset: 2px;
}

/* —— 计数：等宽小字 —— */
.count {
  margin: 8px 0 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: rgb(255 255 255 / 0.75);
}

@media (prefers-reduced-motion: reduce) {
  .input,
  .clear {
    transition: none;
  }
}
</style>
