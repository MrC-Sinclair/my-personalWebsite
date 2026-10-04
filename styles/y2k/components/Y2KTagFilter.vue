<!--
  Y2KTagFilter - y2k 风格的标签筛选栏
  ------------------------------------------------------------
  形态：千禧年的透明塑料键——大圆角（--radius-sm 16px）、顶部气泡高光 +
  底部内阴影做出注塑厚度，紫（--c-accent）描边；hover 浮起并换成
  品红（--c-accent-2）渐变，选中态是紫→品红渐变实心 + 白字 + 顶部高光带，
  像一颗被按下去的水晶糖。计数用 Courier 等宽（本风格的打字机铭牌字体）。
  再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <button
      type="button"
      class="blob"
      :class="{ 'blob--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      {{ t('blog.allTags') }}<span class="blob-count" aria-hidden="true">{{ total }}</span>
    </button>

    <button
      v-for="item in tags"
      :key="item.tag"
      type="button"
      class="blob"
      :class="{ 'blob--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      {{ item.tag }}<span class="blob-count" aria-hidden="true">{{ item.count }}</span>
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

/* —— 塑料键：大圆角 + 顶部气泡高光 + 底部内阴影 —— */
.blob {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  min-height: 46px;
  padding: 12px 20px;
  font-family: inherit;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.22) 0%, rgb(255 255 255 / 0.04) 55%, rgb(0 0 0 / 0.12) 100%);
  border: var(--border-w) solid rgb(139 123 255 / 0.55);
  border-radius: var(--radius-sm);
  box-shadow:
    var(--shadow),
    inset 0 1px 0 rgb(255 255 255 / 0.6),
    inset 0 -3px 6px rgb(10 4 40 / 0.35);
  cursor: pointer;
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    color var(--transition),
    background var(--transition),
    border-color var(--transition);
}

.blob:hover {
  color: #ffffff;
  border-color: var(--c-accent-2);
  transform: translateY(-3px);
}

.blob:focus-visible {
  outline: 2px solid var(--c-accent-2);
  outline-offset: 3px;
}

.blob:active {
  transform: var(--press-transform);
}

/* 选中：紫→品红渐变实心 + 顶部高光带 */
.blob--on,
.blob--on:hover {
  color: #ffffff;
  background: linear-gradient(180deg, var(--c-accent) 0%, var(--c-accent-2) 100%);
  border-color: var(--c-accent-2);
  box-shadow:
    var(--shadow),
    inset 0 2px 0 rgb(255 255 255 / 0.55),
    inset 0 -4px 8px rgb(60 10 80 / 0.4);
}

.blob-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-muted);
}

.blob:hover .blob-count,
.blob--on .blob-count {
  color: #ffffff;
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
  color: #ffffff;
}

@media (prefers-reduced-motion: reduce) {
  .blob,
  .clear {
    transition: none;
  }

  .blob:hover,
  .blob:active {
    transform: none;
  }
}
</style>
