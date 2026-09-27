<!--
  LiquidGlassTagFilter - liquid-glass 风格的标签筛选栏
  ------------------------------------------------------------
  形态：一排「悬浮玻璃胶囊」，背景是 --c-surface（半透白）+ hairline 高光边，
  选中态用强调色（#5ee3ff）文字 + 内发光描边，hover 时胶囊整体提亮并微微上浮。
  再次点击同一标签即取消筛选（行为由共享层 useBlogTagFilter 决定，这里只发事件）。

  只用风格 token，不写死 rgba：玻璃质感由 --c-surface / --c-border / --shadow
  决定，风格调 token 时本组件自动跟随。
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
  margin-bottom: 2px;
}

/* —— 玻璃胶囊：半透底 + 高光边，hover 提亮上浮 —— */
.tag {
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  min-height: 44px;
  padding: 10px 18px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  backdrop-filter: blur(14px) saturate(140%);
  cursor: pointer;
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition),
    transform var(--transition);
}

.tag:hover {
  color: var(--c-accent);
  border-color: var(--c-accent);
  transform: translateY(-2px);
}

.tag:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

.tag:active {
  transform: var(--press-transform);
}

/* 选中：强调色文字 + 强调色描边（玻璃不靠填色，靠光） */
.tag--on {
  color: var(--c-accent);
  border-color: var(--c-accent);
  background: var(--deco);
}

.tag-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-muted);
}

.tag--on .tag-count {
  color: var(--c-accent);
}

.clear {
  min-height: 44px;
  padding: 10px 6px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-muted);
  background: transparent;
  border: 0;
  text-decoration: underline;
  text-underline-offset: 5px;
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

  .tag:hover,
  .tag:active,
  .clear:active {
    transform: none;
  }
}
</style>
