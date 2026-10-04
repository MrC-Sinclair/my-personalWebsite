<!--
  SkeuomorphismTagFilter - skeuomorphism 风格的标签筛选栏
  ------------------------------------------------------------
  形态：木纹桌面上的一排「铜质小标牌」——纸面底（--c-surface #f3ead7）
  带顶部高光渐变与底部微影，做出被摸过很多次的厚度；hover 微微抬起，
  选中态是金铜（--c-accent #b8893a）拉丝底 + 深色字，像牌子被翻到正面。
  再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <button
      type="button"
      class="plate"
      :class="{ 'plate--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      {{ t('blog.allTags') }}<span class="plate-count" aria-hidden="true">{{ total }}</span>
    </button>

    <button
      v-for="item in tags"
      :key="item.tag"
      type="button"
      class="plate"
      :class="{ 'plate--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      {{ item.tag }}<span class="plate-count" aria-hidden="true">{{ item.count }}</span>
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

/* —— 铜牌：顶部高光渐变 + 底部微影，做出厚度 —— */
.plate {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  min-height: 46px;
  padding: 12px 18px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 500;
  color: var(--c-text);
  background: linear-gradient(180deg, #fffdf6 0%, var(--c-surface) 62%, #e4d7bd 100%);
  border: var(--border-w) solid rgb(120 84 40 / 0.35);
  border-radius: var(--radius-sm);
  box-shadow:
    var(--shadow),
    inset 0 1px 0 rgb(255 255 255 / 0.85);
  cursor: pointer;
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    color var(--transition),
    background var(--transition);
}

.plate:hover {
  color: var(--c-accent);
  transform: translateY(-2px);
}

.plate:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* 按压：下沉 2px + 内凹阴影（本风格的按压行程） */
.plate:active {
  transform: var(--press-transform);
  box-shadow:
    inset 0 2px 4px rgb(90 60 25 / 0.35),
    inset 0 -1px 0 rgb(255 255 255 / 0.6);
}

/* 选中：金铜拉丝底 */
.plate--on {
  color: #2b1a0f;
  background: linear-gradient(180deg, #d9ab63 0%, var(--c-accent) 58%, #8f6524 100%);
  border-color: rgb(90 60 25 / 0.5);
}

.plate-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-muted);
}

.plate--on .plate-count {
  color: #2b1a0f;
}

.clear {
  min-height: 46px;
  padding: 12px 10px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-accent-2);
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

@media (prefers-reduced-motion: reduce) {
  .plate,
  .clear {
    transition: none;
  }

  .plate:hover,
  .plate:active {
    transform: none;
  }
}
</style>
