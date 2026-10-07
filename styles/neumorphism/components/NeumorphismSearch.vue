<!--
  NeumorphismSearch - neumorphism 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 NeumorphismTagFilter 同一套语言：同色底 + 双向投影的软键，
  hover 时投影扩散（浮起），聚焦用强调色描边。
  本风格 --press-transform 是 none：压下去靠 inset 阴影，不做位移。

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
  gap: 14px;
}

/* —— 软键输入框：同色底 + 双向投影 —— */
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
    box-shadow var(--transition),
    color var(--transition);
}

.input::placeholder {
  color: var(--c-muted);
}

/* 聚焦：转内凹（被按进材料里），与选中态的语义一致 */
.input:hover {
  color: var(--c-accent);
  box-shadow: 12px 12px 22px #a3b1c6, -12px -12px 22px #ffffff;
}

.input:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
  box-shadow:
    inset 5px 5px 10px #a3b1c6,
    inset -5px -5px 10px #ffffff;
}

/* —— 清除：下划线文字链，与标签栏同款 —— */
.clear {
  flex: 0 0 auto;
  min-height: 46px;
  padding: 12px 8px;
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
  color: var(--c-accent-2);
}

.clear:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
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
