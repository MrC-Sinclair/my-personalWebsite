<!--
  SciFiHudSearch - sci-fi-hud 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 SciFiHudTagFilter 同一套语言：直角状态按钮 + hairline 青绿边，
  等宽字 + 字距拉开，聚焦时点亮起辉光；前缀 [ ] 括号延续 HUD 的通道标记。

  数据流向：页面持有共享层 useBlogSearch → 本组件只收 props 发事件，
  不自己取数、不碰 URL。匹配行为全在 utils/search.ts。
-->
<template>
  <div class="search">
    <div class="field">
      <span class="bracket" aria-hidden="true">[</span>
      <input
        :value="query"
        type="search"
        class="input"
        :placeholder="t('blog.search')"
        :aria-label="t('blog.search')"
        autocomplete="off"
        @input="emit('update', ($event.target as HTMLInputElement).value)"
      >
      <span class="bracket" aria-hidden="true">]</span>
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

/* —— 通道括号：等宽青绿字，HUD 的标记声部 —— */
.bracket {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--c-accent);
  opacity: 0.7;
}

/* —— 状态输入框：直角 + hairline 青绿边，聚焦点亮 —— */
.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 44px;
  padding: 10px 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid rgb(74 240 198 / 0.3);
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

/* —— 清除：琥珀色描边（HUD 的警告色），hover 接通 —— */
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
  color: #041018;
  background: var(--c-accent-2);
  box-shadow: 0 0 16px rgb(245 158 11 / 0.45);
}

.clear:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
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

  .clear:active {
    transform: none;
  }
}
</style>
