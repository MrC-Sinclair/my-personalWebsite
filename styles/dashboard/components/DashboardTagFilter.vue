<!--
  DashboardTagFilter - dashboard 风格的标签筛选栏
  ------------------------------------------------------------
  形态：仪表盘筛选条上的一排 metric chip——小圆角（--radius-sm 2px）、无阴影
  （本风格 --shadow 是 none）、等宽计数右对齐，hover 时描边点亮成天蓝
  （--c-accent），选中态是天蓝实心 + 深底反白，像该维度的切片被激活。

  注意：dashboard 的 blog 页**同时**有分类筛选（页面自带的切片条）与标签筛选，
  两者由共享层 useBlogFilters 正交组合（取交集），本组件只负责标签这一维。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <span class="tags-label">{{ t('blog.tags') }}</span>

    <button
      type="button"
      class="chip"
      :class="{ 'chip--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      {{ t('blog.allTags') }}<span class="chip-count" aria-hidden="true">{{ total }}</span>
    </button>

    <button
      v-for="item in shown"
      :key="item.tag"
      type="button"
      class="chip"
      :class="{ 'chip--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      {{ item.tag }}<span class="chip-count" aria-hidden="true">{{ item.count }}</span>
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
}

.tags-label {
  margin-right: 2px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* —— metric chip：小圆角、无阴影，靠描边与填色表达状态 —— */
.chip {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  min-height: 40px;
  /* 触控命中：靠上下内边距长高，保住 13px 标签 / 11px 计数之间的基线对齐 */
  padding: 12px 12px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition),
    border-color var(--transition);
}

.chip:hover {
  color: var(--c-accent);
  border-color: var(--c-accent);
}

.chip:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.chip:active {
  transform: var(--press-transform);
}

/* 选中：天蓝实心 + 深底字 */
.chip--on {
  color: #06121f;
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.chip-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-muted);
}

.chip--on .chip-count {
  color: #06121f;
}

.clear {
  min-height: 40px;
  padding: 8px 12px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  background: transparent;
  border: var(--border-w) solid var(--c-accent-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition);
}

.clear:hover {
  color: #1a1206;
  background: var(--c-accent-2);
}

@media (prefers-reduced-motion: reduce) {
  .chip,
  .clear {
    transition: none;
  }

  .chip:active {
    transform: none;
  }
}

/* 展开/收起：沿用本风格 clear 的控件语言 */
.more {
  min-height: 40px;
  padding: 8px 12px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  background: transparent;
  border: var(--border-w) solid var(--c-accent-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition);
}
.more:hover {
  color: #1a1206;
  background: var(--c-accent-2);
}
</style>
