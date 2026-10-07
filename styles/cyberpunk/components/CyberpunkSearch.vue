<!--
  CyberpunkSearch - cyberpunk 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 CyberpunkTagFilter 同一套语言：直角数据块 + hairline 青边，
  聚焦时起辉光（--shadow），前缀 `>` 提示符延续命令行的等宽声部。

  数据流向：页面持有共享层 useBlogSearch → 本组件只收 props 发事件，
  不自己取数、不碰 URL。匹配行为全在 utils/search.ts。
-->
<template>
  <div class="search">
    <div class="field">
      <span class="prompt" aria-hidden="true">&gt;</span>
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

/* —— 提示符：等宽青字，与按钮的 >>> 同声部 —— */
.prompt {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent);
}

/* —— 数据块输入框：直角 + hairline 青边，聚焦起辉光 —— */
.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 44px;
  padding: 10px 16px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid rgb(34 211 238 / 0.35);
  border-radius: var(--radius-sm);
  transition:
    border-color var(--transition),
    box-shadow var(--transition),
    color var(--transition);
}

.input::placeholder {
  color: var(--c-muted);
}

.input:hover {
  color: var(--c-accent);
  border-color: var(--c-accent);
}

.input:focus-visible {
  outline: none;
  border-color: var(--c-accent);
  box-shadow: var(--shadow);
}

/* —— 清除：品红直角块，与标签栏的清除同款 —— */
.clear {
  flex: 0 0 auto;
  min-height: 44px;
  padding: 10px 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--c-accent-2);
  background: transparent;
  border: var(--border-w) solid var(--c-accent-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition);
}

.clear:hover {
  color: #04121a;
  background: var(--c-accent-2);
  box-shadow: 0 0 16px rgb(217 70 239 / 0.45);
}

.clear:focus-visible {
  outline: 2px solid var(--c-accent-2);
  outline-offset: 2px;
}

.clear:active {
  transform: var(--press-transform);
}

/* —— 计数：等宽小字，HUD 读数 —— */
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

  .clear:active {
    transform: none;
  }
}
</style>
