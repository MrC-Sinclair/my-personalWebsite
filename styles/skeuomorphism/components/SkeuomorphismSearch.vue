<!--
  SkeuomorphismSearch - skeuomorphism 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 SkeuomorphismTagFilter 同一套语言：纸面输入框——顶高光 / 底微影的
  米纸渐变 + 细棕边，hover 上浮 2px，按压下沉 2px 并转内凹阴影，
  清除按钮是金铜色下划线文字链（与标签栏同款）。

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

/* —— 纸面输入框：米纸渐变 + 细棕边 + 内高光 —— */
.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 46px;
  padding: 12px 18px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 500;
  color: var(--c-text);
  background: linear-gradient(180deg, #fffdf6 0%, #f6efe0 62%, #e4d7bd 100%);
  border: var(--border-w) solid rgb(120 84 40 / 0.35);
  border-radius: var(--radius-sm);
  box-shadow:
    var(--shadow),
    inset 0 1px 0 rgb(255 255 255 / 0.85);
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    color var(--transition);
}

.input::placeholder {
  color: var(--c-muted);
}

.input:hover {
  color: var(--c-accent);
  transform: translateY(-2px);
}

.input:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* 按压：下沉 2px + 内凹阴影（本风格的按压行程） */
.input:active {
  transform: var(--press-transform);
  box-shadow:
    inset 0 2px 4px rgb(90 60 25 / 0.35),
    inset 0 -1px 0 rgb(255 255 255 / 0.6);
}

/* —— 清除：金铜色下划线文字链，与标签栏同款 —— */
.clear {
  flex: 0 0 auto;
  min-height: 46px;
  padding: 12px 10px;
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
  outline: 2px solid var(--c-accent-2);
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

  .input:hover,
  .input:active {
    transform: none;
  }
}
</style>
