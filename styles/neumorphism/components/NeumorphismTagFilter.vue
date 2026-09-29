<!--
  NeumorphismTagFilter - neumorphism 风格的标签筛选栏
  ------------------------------------------------------------
  形态：一排「从同一块材料里压出来的软键」——背景与 --c-bg 同色（#e0e5ec），
  靠 --shadow 的双向投影（右上暗、左下亮）获得体积；hover 时凸起更高，
  选中态反过来变**内凹**（inset 阴影，按下去留在坑里）。
  ⚠️ 本风格的 --press-transform 是 none：按压反馈靠阴影方向切换，不做位移。
  再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <button
      type="button"
      class="soft"
      :class="{ 'soft--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      {{ t('blog.allTags') }}<span class="soft-count" aria-hidden="true">{{ total }}</span>
    </button>

    <button
      v-for="item in tags"
      :key="item.tag"
      type="button"
      class="soft"
      :class="{ 'soft--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      {{ item.tag }}<span class="soft-count" aria-hidden="true">{{ item.count }}</span>
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
  gap: 14px;
  margin-bottom: var(--gap);
}

/* —— 软键：同色底 + 双向投影 —— */
.soft {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  min-height: 46px;
  padding: 12px 20px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: 0;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition:
    box-shadow var(--transition),
    color var(--transition);
}

.soft:hover {
  color: var(--c-accent);
  box-shadow: 12px 12px 22px #a3b1c6, -12px -12px 22px #ffffff;
}

.soft:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

/* 选中：内凹（--press-transform 是 none，压下去靠 inset 阴影） */
.soft--on {
  color: var(--c-accent);
  box-shadow:
    inset 5px 5px 10px #a3b1c6,
    inset -5px -5px 10px #ffffff;
}

.soft-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-muted);
}

.soft--on .soft-count {
  color: var(--c-accent);
}

.clear {
  min-height: 46px;
  padding: 12px 8px;
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

@media (prefers-reduced-motion: reduce) {
  .soft,
  .clear {
    transition: none;
  }
}
</style>
