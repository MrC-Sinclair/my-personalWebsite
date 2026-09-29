<!--
  EditorialTagFilter - editorial 风格的标签筛选栏
  ------------------------------------------------------------
  形态：纸媒的「刊头小铅字块」——米色 paper 底（--c-surface #ece4d3）、
  直角、无阴影（--shadow 是 none），标签名走等宽小字号，
  选中态是深红（--c-accent #8e2318）实心反白 + 上下细规则线夹住，
  像报纸栏目标记被油墨印实。再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <button
      type="button"
      class="slug"
      :class="{ 'slug--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      {{ t('blog.allTags') }}<span class="slug-count" aria-hidden="true">{{ total }}</span>
    </button>

    <button
      v-for="item in tags"
      :key="item.tag"
      type="button"
      class="slug"
      :class="{ 'slug--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      {{ item.tag }}<span class="slug-count" aria-hidden="true">{{ item.count }}</span>
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
  align-items: stretch;
  gap: 8px;
  padding: 10px 0;
  margin-bottom: var(--gap);
  border-top: var(--border-w) solid var(--c-border);
  border-bottom: var(--border-w) solid var(--c-border);
}

/* —— 铅字块：直角、纸底、细规则线 —— */
.slug {
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  min-height: 44px;
  padding: 10px 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
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

.slug:hover {
  color: var(--c-accent);
  border-color: var(--c-accent);
}

.slug:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.slug:active {
  transform: var(--press-transform);
}

/* 选中：油墨印实（深红反白） */
.slug--on,
.slug--on:hover {
  color: #f6f1e7;
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.slug-count {
  font-size: 11px;
  color: var(--c-muted);
}

.slug:hover .slug-count,
.slug--on .slug-count {
  color: inherit;
}

.clear {
  min-height: 44px;
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--c-accent);
  background: transparent;
  border: var(--border-w) dashed var(--c-accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition);
}

.clear:hover {
  color: #f6f1e7;
  background: var(--c-accent);
}

.clear:active {
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .slug,
  .clear {
    transition: none;
  }

  .slug:active,
  .clear:active {
    transform: none;
  }
}
</style>
