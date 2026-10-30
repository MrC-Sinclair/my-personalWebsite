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
      v-for="item in shown"
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

    <!-- 展开/收起：只在真有被收起的标签时出现 -->
    <button
      v-if="hidden > 0 || expanded"
      type="button"
      class="more"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      {{ expanded ? t('blog.fewerTags') : t('blog.moreTags', { n: hidden }) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TagCount } from '~/utils/tags'
import { limitTags, VISIBLE_TAG_LIMIT } from '~/utils/tags'

const props = defineProps<{
  /** 标签清单（含文章数，已按文章数降序） */
  tags: TagCount[]
  /** 当前选中标签，空串表示未筛选 */
  activeTag: string
  /** 未筛选时的文章总数 */
  total: number
}>()

const emit = defineEmits<{ select: [tag: string] }>()

const { t } = useI18n()

// 平铺上限与「选中项必须可见」由共享层 limitTags 决定，组件只管展开态
const expanded = ref(false)
const limited = computed(() => limitTags(props.tags, VISIBLE_TAG_LIMIT, props.activeTag))
const shown = computed(() => (expanded.value ? props.tags : limited.value.shown))
const hidden = computed(() => (expanded.value ? 0 : limited.value.hidden))
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
  padding: 8px 16px;
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
  margin-left: 8px;
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
  margin-left: 8px;
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

/* 展开/收起：沿用本风格 clear 的控件语言 */
.more {
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
.more:hover {
  color: var(--c-bg);
  background: var(--c-accent-2);
}
.more:active {
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .more {
    transition: none;
  }

  .more:active {
    transform: none;
  }
}

/* 窄屏收成单行横向滚动条：14 个 chip 绕 5 行会把首条正文推出屏幕
   （英文标签更宽，实测 swiss/blog 首条正文到 1016px / 视口 844px）。
   滚动条常驻可见，行尾就是「还有 N 个标签」，全部标签仍可逐个滑到 */
@media (max-width: 639px) {
  .tags {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 4px 0;
    scrollbar-width: thin;
  }

  .tags > * {
    flex: none;
  }
}
</style>
