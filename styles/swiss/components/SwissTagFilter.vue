<!--
  SwissTagFilter - swiss 风格的标签筛选栏
  ------------------------------------------------------------
  形态：直角方块（--radius-sm 填 0，瑞士排版只有直角）、纯黑细则边框，
  标签名大写 + 字距拉开，计数用等宽字放在右下角。
  选中态 = 强调色（#e30613）实心块反白，hover = 黑底反白——瑞士海报的
  「直接反相」语言，不用渐变不用阴影（--shadow 是 none）。
  再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <button
      type="button"
      class="tag"
      :class="{ 'tag--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      <span class="tag-label">{{ t('blog.allTags') }}</span>
      <span class="tag-count" aria-hidden="true">{{ total }}</span>
    </button>

    <button
      v-for="item in tags"
      :key="item.tag"
      type="button"
      class="tag"
      :class="{ 'tag--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      <span class="tag-label">{{ item.tag }}</span>
      <span class="tag-count" aria-hidden="true">{{ item.count }}</span>
    </button>

    <button v-if="activeTag" type="button" class="clear" @click="emit('select', '')">
      {{ t('blog.clearFilter') }}<span aria-hidden="true"> ×</span>
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
  align-items: stretch;
  gap: 8px;
  margin-bottom: var(--space);
}

/* —— 方块标签：直角 + 细则黑边，hover 反相 —— */
.tag {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  min-height: 44px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 12px;
  letter-spacing: 0.06em;
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

.tag-label {
  text-transform: uppercase;
}

.tag:hover {
  color: var(--c-surface);
  background: var(--c-text);
  border-color: var(--c-text);
}

.tag:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.tag:active {
  transform: var(--press-transform);
}

/* 选中：强调色实心反白 */
.tag--on,
.tag--on:hover {
  color: #ffffff;
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.tag-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-muted);
}

.tag:hover .tag-count,
.tag--on .tag-count {
  color: inherit;
}

.clear {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 8px;
  font-family: inherit;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-accent);
  background: transparent;
  border: var(--border-w) solid var(--c-accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition);
}

.clear:hover {
  color: #ffffff;
  background: var(--c-accent);
}

.clear:active {
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .tag,
  .clear {
    transition: none;
  }

  .tag:active,
  .clear:active {
    transform: none;
  }
}
</style>
