<!--
  GlassmorphismTagFilter - glassmorphism 风格的标签筛选栏
  ------------------------------------------------------------
  形态：一排「磨砂小片」——--c-surface（半透白 0.55）+ backdrop blur +
  hairline 白边，浮在紫色渐变背景上。hover 时整片提亮并轻微上浮，
  选中态收白度提高 + 强调紫 (#6d28d9) 文字。玻璃不靠描边表达状态，靠通透度。
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
  gap: 10px;
  margin-bottom: var(--gap);
}

/* —— 磨砂小片：半透 + 模糊 + hairline 白边 —— */
.chip {
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  min-height: 44px;
  padding: 11px 18px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid rgb(255 255 255 / 0.45);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  backdrop-filter: blur(12px) saturate(150%);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition),
    transform var(--transition);
}

.chip:hover {
  color: var(--c-accent);
  transform: translateY(-2px);
}

.chip:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

.chip:active {
  transform: var(--press-transform);
}

/* 选中：提高白度并上强调紫，玻璃质感不丢 */
.chip--on {
  color: var(--c-accent);
  background: rgb(255 255 255 / 0.82);
  border-color: rgb(255 255 255 / 0.9);
}

.chip-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-muted);
}

.chip--on .chip-count {
  color: var(--c-accent);
}

.clear {
  min-height: 44px;
  padding: 11px 8px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-accent);
  background: transparent;
  border: 0;
  text-decoration: underline;
  text-underline-offset: 5px;
  cursor: pointer;
  transition: color var(--transition);
}

.clear:hover {
  color: var(--c-accent-2);
}

.clear:active {
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .chip,
  .clear {
    transition: none;
  }

  .chip:hover,
  .chip:active,
  .clear:active {
    transform: none;
  }
}
</style>
