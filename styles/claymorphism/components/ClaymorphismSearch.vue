<!--
  ClaymorphismSearch - claymorphism 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 ClaymorphismTagFilter 同一套语言：一枚「黏土丸输入框」——
  超大圆角（--radius-sm 20px）+ 厚钝外形，上缘高光 / 下缘微影构成被捏出来的
  体积感；hover 时整颗浮起（-3px），清除按钮按下去变实心紫。

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

/* —— 黏土输入框：超大圆角 + 上高光下微影的体积感 —— */
.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 48px;
  padding: 13px 20px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 500;
  color: var(--c-text);
  background: var(--c-surface);
  border: 0;
  border-radius: var(--radius-sm);
  box-shadow:
    var(--shadow),
    inset 0 2px 3px rgb(255 255 255 / 0.9),
    inset 0 -3px 6px rgb(122 90 150 / 0.16);
  transition:
    background var(--transition),
    color var(--transition),
    transform var(--transition),
    box-shadow var(--transition);
}

.input::placeholder {
  color: var(--c-muted);
}

.input:hover {
  transform: translateY(-3px);
}

.input:focus-visible {
  outline: 3px solid var(--c-accent);
  outline-offset: 3px;
}

/* —— 清除：与标签栏同款（下划线文字链，按下去是实心紫的反向） —— */
.clear {
  flex: 0 0 auto;
  min-height: 48px;
  padding: 13px 10px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 500;
  color: var(--c-accent);
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  text-decoration: underline;
  text-underline-offset: 5px;
  cursor: pointer;
  transition: color var(--transition);
}

.clear:hover {
  color: #5a2a96;
}

.clear:focus-visible {
  outline: 3px solid var(--c-accent);
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
