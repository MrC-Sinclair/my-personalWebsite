<!--
  NeoBrutalismTagFilter - neo-brutalism 风格的标签筛选栏
  ------------------------------------------------------------
  形态：粗黑边（--border-w）+ 硬阴影（--shadow 6px 6px 0）的实心方块，直角；
  hover 整块反相（黑底白字），选中态是荧光黄（--c-accent #ffe600）底 + 黑字，
  按下时按 --press-transform 整体平移 4px 并丢掉阴影——「被压进纸里」。
  再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <button
      type="button"
      class="brick"
      :class="{ 'brick--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      {{ t('blog.allTags') }}<span class="brick-count" aria-hidden="true">{{ total }}</span>
    </button>

    <button
      v-for="item in shown"
      :key="item.tag"
      type="button"
      class="brick"
      :class="{ 'brick--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      {{ item.tag }}<span class="brick-count" aria-hidden="true">{{ item.count }}</span>
    </button>

    <button v-if="activeTag" type="button" class="clear" @click="emit('select', '')">
      {{ t('blog.clearFilter') }}
    </button>

    <!-- 展开/收起：只在真有被收起的标签时出现 -->
    <button
      v-if="hidden > 0 || expanded"
      type="button"
      class="more"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      {{ expanded ? t('blog.fewerTags') : t('blog.moreTags', { n: hidden }) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TagCount } from '~/utils/tags'
import { limitTags, VISIBLE_TAG_LIMIT } from '~/utils/tags'

const props = defineProps<{
  /** 标签清单（含文章数，已按文章数降序） */
  tags: TagCount[]
  /** 当前选中标签，空串表示未筛选 */
  activeTag: string
  /** 未筛选时的文章总数 */
  total: number
}>()

const emit = defineEmits<{ select: [tag: string] }>()

const { t } = useI18n()

// 平铺上限与「选中项必须可见」由共享层 limitTags 决定，组件只管展开态
const expanded = ref(false)
const limited = computed(() => limitTags(props.tags, VISIBLE_TAG_LIMIT, props.activeTag))
const shown = computed(() => (expanded.value ? props.tags : limited.value.shown))
const hidden = computed(() => (expanded.value ? 0 : limited.value.hidden))
</script>

<style scoped>
.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: var(--gap);
}

/* —— 实心方块：粗黑边 + 硬阴影 —— */
.brick {
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  min-height: 46px;
  padding: 12px 18px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.brick:hover {
  color: #ffffff;
  background: #111111;
}

.brick:focus-visible {
  outline: 3px solid var(--c-accent-2);
  outline-offset: 2px;
}

/* 按压：整体平移 + 阴影消失（被压进纸里） */
.brick:active {
  box-shadow: none;
  transform: var(--press-transform);
}

/* 选中：荧光黄底黑字 */
.brick--on,
.brick--on:hover {
  color: #111111;
  background: var(--c-accent);
}

.brick-count {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 400;
  color: var(--c-muted);
}

.brick:hover .brick-count,
.brick--on .brick-count {
  color: inherit;
}

.clear {
  min-height: 46px;
  padding: 12px 14px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 700;
  color: #111111;
  background: var(--c-accent-2);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition:
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.clear:hover {
  background: #ffffff;
}

.clear:active {
  box-shadow: none;
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .brick,
  .clear {
    transition: none;
  }

  .brick:active,
  .clear:active {
    transform: none;
  }
}

/* 展开/收起：沿用本风格 clear 的控件语言 */
.more {
  min-height: 46px;
  padding: 12px 14px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 700;
  color: #111111;
  background: var(--c-accent-2);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition:
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}
.more:hover {
  background: #ffffff;
}
.more:active {
  box-shadow: none;
  transform: var(--press-transform);
}
</style>
