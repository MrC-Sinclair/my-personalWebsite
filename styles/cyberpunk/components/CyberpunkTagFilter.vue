<!--
  CyberpunkTagFilter - cyberpunk 风格的标签筛选栏
  ------------------------------------------------------------
  形态：暗底上的直角数据块（--radius-sm 是 0），hairline 描边 + 等宽计数；
  hover 时点亮青色描边并起辉光，选中态是青色实心块 + 外发光
  （cyberpunk 的「通电」语言：状态靠发光强度，不靠位移）。
  再次点击同一标签即取消筛选。
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
      <span class="chip-mark" aria-hidden="true">▚</span>
      <span class="chip-label">{{ t('blog.allTags') }}</span>
      <span class="chip-count" aria-hidden="true">{{ total }}</span>
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
      <span class="chip-mark" aria-hidden="true">▚</span>
      <span class="chip-label">{{ item.tag }}</span>
      <span class="chip-count" aria-hidden="true">{{ item.count }}</span>
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

/* —— 数据块：直角 + hairline，hover 起辉光 —— */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 16px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid rgb(34 211 238 / 0.35);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    border-color var(--transition),
    box-shadow var(--transition),
    color var(--transition),
    background var(--transition);
}

.chip:hover {
  color: var(--c-accent);
  border-color: var(--c-accent);
  box-shadow: var(--shadow);
}

.chip:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.chip:active {
  transform: var(--press-transform);
}

/* 选中：通电状态——青色底 + 外发光 */
.chip--on {
  color: #04121a;
  background: var(--c-accent);
  border-color: var(--c-accent);
  box-shadow: 0 0 18px rgb(34 211 238 / 0.55);
}

.chip-mark {
  font-size: 10px;
  color: var(--c-accent);
  opacity: 0.8;
}

.chip--on .chip-mark {
  color: #04121a;
}

.chip-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-muted);
}

.chip--on .chip-count {
  color: #04121a;
}

.clear {
  min-height: 44px;
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  background: transparent;
  border: var(--border-w) solid var(--c-accent-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition),
    box-shadow var(--transition);
}

.clear:hover {
  color: #12000a;
  background: var(--c-accent-2);
  box-shadow: 0 0 16px rgb(255 45 149 / 0.45);
}

.clear:active {
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .chip,
  .clear {
    transition: none;
  }

  .chip:active,
  .clear:active {
    transform: none;
  }
}
</style>
