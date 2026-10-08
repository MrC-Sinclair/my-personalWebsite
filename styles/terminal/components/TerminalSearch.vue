<!--
  TerminalSearch - terminal 风格的关键词搜索框
  ------------------------------------------------------------
  形态是一行真正的 shell 命令：`~/blog $ grep <关键词>`——
  提示符 + 等宽描边输入块（与 TerminalTagFilter 的命令参数同款），
  清除做成 `[清除搜索]` 参数块，搜索态在下一行回显 grep 的结果计数。

  为什么不做成「回车才执行」：共享层 useBlogSearch 的契约是输入即过滤
  （全站 20 个风格一致），终端隐喻落在视觉层——长得像命令、结果行像命令输出，
  行为不另搞一套，否则用户会在不同风格里学到两种交互。

  数据流向：页面持有共享层 useBlogSearch → 本组件只收 props 发事件，
  不自己取数、不碰 URL。匹配行为全在 utils/search.ts。
-->
<template>
  <div class="search">
    <div class="line">
      <span class="prompt" aria-hidden="true">~/blog&nbsp;$</span>
      <span class="cmd" aria-hidden="true">grep</span>
      <input
        :value="query"
        type="search"
        class="input"
        :placeholder="t('blog.search')"
        :aria-label="t('blog.search')"
        autocomplete="off"
        spellcheck="false"
        @input="emit('update', ($event.target as HTMLInputElement).value)"
      >
      <button v-if="query" type="button" class="clear" @click="emit('clear')">
        [{{ t('blog.clearSearch') }}]
      </button>
    </div>

    <!-- 结果行：命令输出的样子 -->
    <p v-if="query" class="result" role="status">
      <span class="result-mark" aria-hidden="true">--&gt;</span>
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

.line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* 命令提示符等宽绿字 */
.prompt {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent);
}

/* 命令名：弱一档，像终端回显的命令本体 */
.cmd {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* —— 输入块：命令参数同款（等宽 + 描边暗块） —— */
.input {
  flex: 1 1 200px;
  min-width: 0;
  min-height: 40px;
  padding: 8px 14px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid rgb(124 255 178 / 0.35);
  border-radius: var(--radius-sm);
}

.input::placeholder {
  color: var(--c-muted);
}

.input:hover {
  border-color: var(--c-accent);
}

/* 终端的焦点：实线描边，不用浏览器的默认光晕 */
.input:focus-visible {
  outline: var(--border-w) solid var(--c-accent);
  outline-offset: 2px;
  border-color: var(--c-accent);
}

/* —— 清除：[参数] 形式的命令参数块 —— */
.clear {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 14px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  background: var(--c-surface);
  border: var(--border-w) solid rgb(124 255 178 / 0.35);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.clear:hover {
  color: var(--c-bg);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.clear:focus-visible {
  outline: var(--border-w) solid var(--c-accent);
  outline-offset: 2px;
}

.clear:active {
  transform: var(--press-transform);
}

/* —— 结果行：命令输出 —— */
.result {
  margin: 8px 0 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.result-mark {
  margin-right: 6px;
  color: var(--c-accent);
}
</style>
