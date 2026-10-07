<!--
  PixelSearch - pixel 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 PixelTagFilter 同一套语言：8-bit 菜单里的输入框——直角
  （--radius-sm 为 0）、硬边描边、右下硬投影（--shadow），hover 整块
  换成点亮色，按下时位移吃掉投影。
  ⚠️ 本风格 --transition 是 none：不做补间，全部靠状态切换（像素 UI 的正确纪律）。

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
  gap: 10px;
}

/* —— 输入框：硬边 + 硬投影，聚焦用 accent-2（绿）描边 —— */
.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 44px;
  padding: 10px 16px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
}

.input::placeholder {
  color: var(--c-muted);
}

.input:hover {
  color: var(--c-bg);
  background: var(--c-accent);
}

.input:hover::placeholder {
  color: var(--c-bg);
}

.input:focus-visible {
  outline: var(--border-w) solid var(--c-accent-2);
  outline-offset: 3px;
}

/* —— 清除：与标签栏的「清除」同款（accent-2 描边 + 硬投影） —— */
.clear {
  flex: 0 0 auto;
  min-height: 44px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  background: transparent;
  border: var(--border-w) solid var(--c-accent-2);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  cursor: pointer;
}

.clear:hover {
  color: var(--c-bg);
  background: var(--c-accent-2);
}

.clear:active {
  box-shadow: none;
  transform: var(--press-transform);
}

/* —— 计数：等宽小字，像素 HUD 的读数感 —— */
.count {
  margin: 8px 0 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
}
</style>
