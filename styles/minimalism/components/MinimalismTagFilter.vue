<!--
  MinimalismTagFilter - minimalism 风格的标签筛选栏
  ------------------------------------------------------------
  形态：一行 hairline 胶囊，「全部」+ 各标签，右侧小字是文章数。
  选中态用强调色文字 + 下划线（minimalism 不用色块，避免破坏留白节奏）；
  再次点击同一标签即取消筛选（行为由共享层 useBlogTagFilter 决定，这里只发事件）。

  数据流向：页面持有 useBlogTagFilter → 本组件只收 props 发事件，
  不自己取数、不碰 URL，符合「风格层不写业务逻辑」。
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
      {{ t('blog.allTags') }}<span class="tag-count" aria-hidden="true">{{ total }}</span>
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
      {{ item.tag }}<span class="tag-count" aria-hidden="true">{{ item.count }}</span>
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
  /** 未筛选时的文章总数（「全部」角标用） */
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
  margin-bottom: 4px;
}

/* —— 胶囊：hairline 边框 + 等宽计数，选中态靠文字色与下划线 —— */
.tag {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  min-height: 40px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-muted);
  background: transparent;
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    color var(--transition),
    border-color var(--transition),
    background var(--transition);
}

.tag:hover {
  color: var(--c-text);
  border-color: var(--c-text);
}

.tag:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.tag:active {
  transform: var(--press-transform);
}

.tag--on {
  color: var(--c-accent);
  border-color: var(--c-accent);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.tag-count {
  font-family: var(--font-mono);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
}

.tag--on .tag-count {
  color: var(--c-accent);
}

/* —— 清除筛选：只在筛选态出现，弱化到只剩文字 —— */
.clear {
  min-height: 40px;
  padding: 8px 4px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-muted);
  background: transparent;
  border: 0;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
  transition: color var(--transition);
}

.clear:hover {
  color: var(--c-accent);
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
