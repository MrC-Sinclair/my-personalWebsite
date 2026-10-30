<!--
  PixelTagFilter - pixel 风格的标签筛选栏
  ------------------------------------------------------------
  形态：8-bit 菜单里的像素按钮——直角（--radius-sm 是 0）、硬边描边、
  右下硬投影（--shadow 4px 4px 0），hover 时整块换成点亮黄（--c-accent），
  按下时位移吃掉投影（像素 UI 的按压没有补间）。
  ⚠️ 本风格 --transition 是 none：不做补间，全部靠状态切换。
  再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <button
      type="button"
      class="btn"
      :class="{ 'btn--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      <span class="btn-label">{{ t('blog.allTags') }}</span>
      <span class="btn-count" aria-hidden="true">{{ total }}</span>
    </button>

    <button
      v-for="item in shown"
      :key="item.tag"
      type="button"
      class="btn"
      :class="{ 'btn--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      <span class="btn-label">{{ item.tag }}</span>
      <span class="btn-count" aria-hidden="true">{{ item.count }}</span>
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
  gap: 12px;
  margin-bottom: var(--gap);
}

/* —— 像素按钮：硬边 + 硬投影 —— */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 12px 16px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  cursor: pointer;
}

.btn:hover {
  color: var(--c-bg);
  background: var(--c-accent);
}

.btn:focus-visible {
  outline: var(--border-w) solid var(--c-accent-2);
  outline-offset: 3px;
}

/* 按下：位移吃掉投影（--transition 是 none，没有补间） */
.btn:active {
  box-shadow: none;
  transform: var(--press-transform);
}

/* 选中：点亮黄常亮 */
.btn--on {
  color: var(--c-bg);
  background: var(--c-accent);
}

.btn-count {
  font-size: 11px;
  color: var(--c-muted);
}

.btn:hover .btn-count,
.btn--on .btn-count {
  color: var(--c-bg);
}

.clear {
  min-height: 44px;
  padding: 12px 16px;
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

/* 展开/收起：沿用本风格 clear 的控件语言 */
.more {
  min-height: 44px;
  padding: 12px 16px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  background: transparent;
  border: var(--border-w) solid var(--c-accent-2);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  cursor: pointer;
}
.more:hover {
  color: var(--c-bg);
  background: var(--c-accent-2);
}
.more:active {
  box-shadow: none;
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
