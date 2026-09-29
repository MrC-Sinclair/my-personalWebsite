<!--
  NeoBrutalismTagFilter - neo-brutalism 风格的标签筛选栏
  ------------------------------------------------------------
  形态：粗黑边（--border-w）+ 硬阴影（--shadow 6px 6px 0）的实心方块，直角；
  hover 整块反相（黑底白字），选中态是荧光黄（--c-accent #ffe600）底 + 黑字，
  按下时按 --press-transform 整体平移 4px 并丢掉阴影——「被压进纸里」。
  再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <button
      type="button"
      class="brick"
      :class="{ 'brick--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      {{ t('blog.allTags') }}<span class="brick-count" aria-hidden="true">{{ total }}</span>
    </button>

    <button
      v-for="item in tags"
      :key="item.tag"
      type="button"
      class="brick"
      :class="{ 'brick--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      {{ item.tag }}<span class="brick-count" aria-hidden="true">{{ item.count }}</span>
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
  gap: 12px;
  margin-bottom: var(--gap);
}

/* —— 实心方块：粗黑边 + 硬阴影 —— */
.brick {
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  min-height: 46px;
  padding: 12px 18px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.brick:hover {
  color: #ffffff;
  background: #111111;
}

.brick:focus-visible {
  outline: 3px solid var(--c-accent-2);
  outline-offset: 2px;
}

/* 按压：整体平移 + 阴影消失（被压进纸里） */
.brick:active {
  box-shadow: none;
  transform: var(--press-transform);
}

/* 选中：荧光黄底黑字 */
.brick--on,
.brick--on:hover {
  color: #111111;
  background: var(--c-accent);
}

.brick-count {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 400;
  color: var(--c-muted);
}

.brick:hover .brick-count,
.brick--on .brick-count {
  color: inherit;
}

.clear {
  min-height: 46px;
  padding: 12px 14px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 700;
  color: #111111;
  background: var(--c-accent-2);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition:
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.clear:hover {
  background: #ffffff;
}

.clear:active {
  box-shadow: none;
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .brick,
  .clear {
    transition: none;
  }

  .brick:active,
  .clear:active {
    transform: none;
  }
}
</style>
