<!--
  RetroComputerSearch - retro-computer 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 RetroComputerTagFilter 同一套语言：Win95 立体输入框——灰面 +
  左上白 / 右下黑的斜面内阴影，聚焦用点线框（老系统的焦点样式），
  清除按钮是同一套斜面的凸起小按钮。不做位移补间（老系统没有动画）。

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
  gap: 6px;
  padding: 6px;
}

/* —— 立体输入框：灰面 + 斜面内阴影（凹陷，与按钮的凸起相反） —— */
.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 40px;
  padding: 8px 14px;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: 0;
  border-radius: var(--radius-sm);
  box-shadow:
    inset 1px 1px 0 #4a4a4a,
    inset -1px -1px 0 #ffffff,
    inset 2px 2px 0 #808080,
    inset -2px -2px 0 #dfdfdf;
}

.input::placeholder {
  color: var(--c-muted);
}

.input:hover {
  background: #cfcfcf;
}

/* 老系统的焦点：点线框内缩 */
.input:focus-visible {
  outline: 1px dotted #000000;
  outline-offset: -4px;
}

/* —— 清除：同一套斜面的凸起小按钮 —— */
.clear {
  flex: 0 0 auto;
  min-height: 40px;
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  color: var(--c-accent);
  background: var(--c-surface);
  border: 0;
  border-radius: var(--radius-sm);
  box-shadow:
    inset 1px 1px 0 #ffffff,
    inset -1px -1px 0 #4a4a4a;
  text-decoration: underline;
  cursor: pointer;
}

.clear:hover {
  background: #cfcfcf;
}

/* 按下：斜面翻转 + 内容右移 1px（与标签按钮同款按压） */
.clear:active {
  padding: 9px 11px 7px 13px;
  box-shadow:
    inset 1px 1px 0 #4a4a4a,
    inset -1px -1px 0 #ffffff;
}

/* —— 计数：等宽小字，老系统的状态栏读数 —— */
.count {
  margin: 6px 0 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
}
</style>
