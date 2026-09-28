<!--
  FlatDesignTagFilter - flat-design 风格的标签筛选栏
  ------------------------------------------------------------
  ⚠️ 位置前提：blog 子页整体落在 `band--dark` 里（底色是 --c-text #2c3e50、
  前景固定 #ffffff），因此本组件**按深色底设计**，不能搬到浅色带上直接用。

  形态：扁平实心块（--radius-sm 3px、无阴影、无渐变——扁平化的铁律），
  hover 换成白底深字，选中态用次级强调色 #f1c40f（与 SectionHead 的 bar-color
  同源，全站强调次序列：主色蓝 + 点亮黄）。再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
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
      v-for="item in tags"
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

/* —— 扁平块：小圆角 + 半透白底，状态只靠换色 —— */
.chip {
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  min-height: 44px;
  padding: 11px 16px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: #ffffff;
  background: rgb(255 255 255 / 0.14);
  border: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition);
}

.chip:hover {
  color: var(--c-text);
  background: #ffffff;
}

.chip:focus-visible {
  outline: 2px solid #f1c40f;
  outline-offset: 2px;
}

/* 选中：点亮黄（--press-transform 是 none，扁平化用颜色反馈） */
.chip--on,
.chip--on:hover {
  color: var(--c-text);
  background: #f1c40f;
}

.chip-count {
  font-family: var(--font-mono);
  font-size: 11px;
  opacity: 0.75;
}

.clear {
  min-height: 44px;
  padding: 11px 10px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: #ffffff;
  background: transparent;
  border: var(--border-w) solid rgb(255 255 255 / 0.4);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition);
}

.clear:hover {
  color: var(--c-text);
  background: #ffffff;
}

.clear:active {
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .chip,
  .clear {
    transition: none;
  }
}
</style>
