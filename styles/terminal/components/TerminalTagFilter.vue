<!--
  TerminalTagFilter - terminal 风格的标签筛选栏
  ------------------------------------------------------------
  形态：终端里的一行命令参数——等宽字、`--tag=<值>` 的写法、方括号包住计数，
  未选中是绿色描边的暗块，hover 整块反显（绿底黑字），选中态常亮反显 + 光标块 ▊。
  按下只做 1px 下沉（本风格 --transition 是 none，终端不做补间）。
  再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <span class="prompt" aria-hidden="true">$</span>

    <button
      type="button"
      class="arg"
      :class="{ 'arg--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      <span class="arg-flag">--tag=</span><span class="arg-value">{{ t('blog.allTags') }}</span>
      <span class="arg-count" aria-hidden="true">[{{ total }}]</span>
    </button>

    <button
      v-for="item in tags"
      :key="item.tag"
      type="button"
      class="arg"
      :class="{ 'arg--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      <span class="arg-flag">--tag=</span><span class="arg-value">{{ item.tag }}</span>
      <span class="arg-count" aria-hidden="true">[{{ item.count }}]</span>
    </button>

    <button v-if="activeTag" type="button" class="clear" @click="emit('select', '')">
      {{ t('blog.clearFilter') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { TagCount } from '~/utils/tags'

defineProps<{
  /** 标签清单（含文章数，已按文章数降序） */
  tags: TagCount[]
  /** 当前选中标签，空串表示未筛选 */
  activeTag: string
  /** 未筛选时的文章总数 */
  total: number
}>()

const emit = defineEmits<{ select: [tag: string] }>()

const { t } = useI18n()
</script>

<style scoped>
.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: var(--gap);
}

/* 命令提示符 */
.prompt {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent);
}

/* —— 命令参数：等宽 + 描边暗块 —— */
.arg {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-height: 40px;
  padding: 8px 14px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid rgb(124 255 178 / 0.35);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.arg:hover {
  color: var(--c-bg);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.arg:focus-visible {
  outline: var(--border-w) solid var(--c-accent);
  outline-offset: 2px;
}

.arg:active {
  transform: var(--press-transform);
}

/* 选中：反显常亮 + 光标块 */
.arg--on,
.arg--on:hover {
  color: var(--c-bg);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.arg--on::after {
  margin-left: 6px;
  content: '▊';
}

.arg-flag {
  color: var(--c-muted);
}

.arg:hover .arg-flag,
.arg--on .arg-flag {
  color: inherit;
}

.arg-count {
  margin-left: 6px;
  font-size: 11px;
  color: var(--c-muted);
}

.arg:hover .arg-count,
.arg--on .arg-count {
  color: inherit;
}

.clear {
  min-height: 40px;
  padding: 8px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  background: transparent;
  border: var(--border-w) solid var(--c-accent-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.clear:hover {
  color: var(--c-bg);
  background: var(--c-accent-2);
}

.clear:active {
  transform: var(--press-transform);
}
</style>
