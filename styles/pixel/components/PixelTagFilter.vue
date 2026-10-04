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
      v-for="item in tags"
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
  gap: 10px;
  margin-bottom: var(--gap);
}

/* —— 像素按钮：硬边 + 硬投影 —— */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 16px;
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
</style>
