<!--
  MetroTagFilter - Metro 风格的标签筛选栏
  ------------------------------------------------------------
  形态：一排 Metro Tile 式**直角方块**（--radius-sm 是 0，锐利直角是本风格签名），
  深底浅字；hover 时方块染上强调蓝并在左上角长出一根指示条，
  选中态是实心强调蓝 + 反白——Metro 用「整块换色」而不是描边表达状态。
  再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <button
      type="button"
      class="tile"
      :class="{ 'tile--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      <span class="tile-label">{{ t('blog.allTags') }}</span>
      <span class="tile-count" aria-hidden="true">{{ total }}</span>
    </button>

    <button
      v-for="item in tags"
      :key="item.tag"
      type="button"
      class="tile"
      :class="{ 'tile--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      <span class="tile-label">{{ item.tag }}</span>
      <span class="tile-count" aria-hidden="true">{{ item.count }}</span>
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
  gap: 4px;
  margin-bottom: var(--gap);
}

/* —— Tile：直角、无边框、靠底色区分状态 —— */
.tile {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  min-height: 44px;
  padding: 12px 16px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
  /* Metro 干脆：不做位移，只换色 */
  transition:
    background var(--transition),
    color var(--transition);
}

/* hover / 选中时长出的顶部指示条 */
.tile::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 3px;
  content: '';
  background: var(--c-accent-2);
  transition: width var(--transition);
}

.tile:hover::before,
.tile--on::before {
  width: 100%;
}

.tile:hover {
  background: var(--c-border);
}

.tile:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.tile:active {
  transform: var(--press-transform);
}

.tile--on {
  color: #ffffff;
  background: var(--c-accent);
}

.tile-label {
  letter-spacing: 0.02em;
}

.tile-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-muted);
}

.tile--on .tile-count {
  color: #ffffff;
}

.clear {
  min-height: 44px;
  padding: 12px 14px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-accent);
  background: transparent;
  border: var(--border-w) solid var(--c-border);
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
  .tile,
  .tile::before,
  .clear {
    transition: none;
  }

  .tile:active,
  .clear:active {
    transform: none;
  }
}
</style>
