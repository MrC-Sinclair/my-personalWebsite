<!--
  Y2KSearch - y2k 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 Y2KTagFilter 同一套语言：塑料键——大圆角 + 顶部气泡高光 +
  底部内阴影，hover 上浮 3px，聚焦用 accent-2 描边；清除键是紫→品红
  渐变实心（与选中态同款渐变）。

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

/* —— 塑料键输入框：气泡高光 + 底部内阴影 —— */
.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 46px;
  padding: 12px 20px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 0.22) 0%,
    rgb(255 255 255 / 0.04) 55%,
    rgb(0 0 0 / 0.12) 100%
  );
  border: var(--border-w) solid rgb(139 123 255 / 0.55);
  border-radius: var(--radius-sm);
  box-shadow:
    var(--shadow),
    inset 0 1px 0 rgb(255 255 255 / 0.6),
    inset 0 -3px 6px rgb(10 4 40 / 0.35);
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    color var(--transition),
    border-color var(--transition);
}

.input::placeholder {
  color: var(--c-muted);
}

.input:hover {
  color: #ffffff;
  border-color: var(--c-accent-2);
  transform: translateY(-3px);
}

.input:focus-visible {
  outline: 2px solid var(--c-accent-2);
  outline-offset: 3px;
}

/* —— 清除：紫→品红渐变实心（与选中态同款） —— */
.clear {
  flex: 0 0 auto;
  min-height: 46px;
  padding: 12px 18px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: #ffffff;
  background: linear-gradient(180deg, var(--c-accent) 0%, var(--c-accent-2) 100%);
  border: var(--border-w) solid var(--c-accent-2);
  border-radius: var(--radius-sm);
  box-shadow:
    var(--shadow),
    inset 0 2px 0 rgb(255 255 255 / 0.55),
    inset 0 -4px 8px rgb(60 10 80 / 0.4);
  cursor: pointer;
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.clear:hover {
  transform: translateY(-3px);
}

.clear:focus-visible {
  outline: 2px solid var(--c-accent-2);
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
  .clear:hover,
  .clear:active {
    transform: none;
  }
}
</style>
