<!--
  RetroComputerTagFilter - retro-computer 风格的标签筛选栏
  ------------------------------------------------------------
  形态：Windows 95 工具栏上的一排立体按钮——灰面（--c-surface #c0c0c0）、
  左上白右下黑的斜面边框（inset box-shadow 画的 bevel）、直角；
  hover 只做轻微提亮，按下时斜面翻转 + 内容右移 1px（老系统的按压手感）。
  选中态 = 永久"按下" + 深蓝（--c-accent #000080）文字，像被按住的筛选按钮。

  ⚠️ 本风格 --transition 是 none：老系统不做补间动画，全部靠状态切换。
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
  gap: 8px;
  padding: 8px;
  margin-bottom: var(--gap);
}

/* —— 立体按钮：灰面 + 左上白 / 右下黑的斜面 —— */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 16px;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: 0;
  border-radius: var(--radius-sm);
  box-shadow:
    inset 1px 1px 0 #ffffff,
    inset -1px -1px 0 #4a4a4a,
    inset 2px 2px 0 #dfdfdf,
    inset -2px -2px 0 #808080;
  cursor: pointer;
}

.btn:hover {
  background: #cfcfcf;
}

.btn:focus-visible {
  outline: 1px dotted #000000;
  outline-offset: -4px;
}

/* 按压 / 选中：斜面翻转 + 内容右移 1px */
.btn:active,
.btn--on {
  color: var(--c-accent);
  background: #b4b4b4;
  box-shadow:
    inset 1px 1px 0 #4a4a4a,
    inset -1px -1px 0 #ffffff,
    inset 2px 2px 0 #808080,
    inset -2px -2px 0 #dfdfdf;
  padding: 8px 12px 8px 16px;
}

.btn-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-muted);
}

.btn--on .btn-count {
  color: var(--c-accent);
}

.clear {
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

.clear:active {
  box-shadow:
    inset 1px 1px 0 #4a4a4a,
    inset -1px -1px 0 #ffffff;
}

/* 展开/收起：沿用本风格 clear 的控件语言 */
.more {
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
.more:hover {
  background: #cfcfcf;
}
.more:active {
  box-shadow:
    inset 1px 1px 0 #4a4a4a,
    inset -1px -1px 0 #ffffff;
}

@media (prefers-reduced-motion: reduce) {
  .more {
    transition: none;
  }

  .more:active {
    transform: none;
  }
}
</style>
