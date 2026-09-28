<!--
  ClaymorphismTagFilter - claymorphism 风格的标签筛选栏
  ------------------------------------------------------------
  形态：一排「小黏土丸」——超大圆角（--radius-sm 20px）+ 厚钝外形，
  上缘高光 / 下缘微影构成被捏出来的体积感；hover 时整颗浮起，
  选中态按下去变成强调紫 (#7d3fc9) 反白（黏土被按压进版面的感觉）。
  再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <button
      type="button"
      class="clay"
      :class="{ 'clay--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      {{ t('blog.allTags') }}<span class="clay-count" aria-hidden="true">{{ total }}</span>
    </button>

    <button
      v-for="item in tags"
      :key="item.tag"
      type="button"
      class="clay"
      :class="{ 'clay--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      {{ item.tag }}<span class="clay-count" aria-hidden="true">{{ item.count }}</span>
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

/* —— 黏土丸：超大圆角 + 上高光下微影的体积感 —— */
.clay {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  min-height: 48px;
  padding: 13px 20px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 500;
  color: var(--c-text);
  background: var(--c-surface);
  border: 0;
  border-radius: var(--radius-sm);
  box-shadow:
    var(--shadow),
    inset 0 2px 3px rgb(255 255 255 / 0.9),
    inset 0 -3px 6px rgb(122 90 150 / 0.16);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition),
    transform var(--transition),
    box-shadow var(--transition);
}

.clay:hover {
  color: var(--c-accent);
  transform: translateY(-3px);
}

.clay:focus-visible {
  outline: 3px solid var(--c-accent);
  outline-offset: 3px;
}

.clay:active {
  transform: var(--press-transform);
}

/* 选中：按下去变成实心紫，内阴影反向（凹进去） */
.clay--on,
.clay--on:hover {
  color: #ffffff;
  background: var(--c-accent);
  box-shadow:
    var(--shadow),
    inset 0 3px 6px rgb(60 20 100 / 0.35);
}

.clay-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-muted);
}

.clay--on .clay-count {
  color: #ffffff;
}

.clear {
  min-height: 48px;
  padding: 13px 10px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 500;
  color: var(--c-accent);
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  text-decoration: underline;
  text-underline-offset: 5px;
  cursor: pointer;
  transition:
    color var(--transition),
    transform var(--transition);
}

.clear:hover {
  transform: translateY(-2px);
}

.clear:active {
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .clay,
  .clear {
    transition: none;
  }

  .clay:hover,
  .clay:active,
  .clear:hover,
  .clear:active {
    transform: none;
  }
}
</style>
