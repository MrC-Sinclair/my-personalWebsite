<!--
  Soft3DTagFilter - soft-3d 风格的标签筛选栏
  ------------------------------------------------------------
  形态：一排「漂浮在 Z 轴上的小丸子」——每个标签自带投影抬升高度，
  hover 时再往上浮一档（阴影跟着变大变淡，符合软 3D 的光照直觉），
  选中态是紫色实心（--c-accent）+ 更远更柔的投影，看起来离视点更近。
  再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <button
      type="button"
      class="pill"
      :class="{ 'pill--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      {{ t('blog.allTags') }}<span class="pill-count" aria-hidden="true">{{ total }}</span>
    </button>

    <button
      v-for="item in shown"
      :key="item.tag"
      type="button"
      class="pill"
      :class="{ 'pill--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      {{ item.tag }}<span class="pill-count" aria-hidden="true">{{ item.count }}</span>
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

/* —— 小丸子：surface 底 + 投影抬升 —— */
.pill {
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
    transform var(--transition),
    box-shadow var(--transition),
    color var(--transition),
    background var(--transition);
}

/* hover：抬高一档（阴影变大变淡 = 离面更远） */
.pill:hover {
  color: var(--c-accent);
  transform: translateY(-4px);
  box-shadow: var(--shadow-press);
}

.pill:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

.pill:active {
  transform: var(--press-transform);
}

/* 选中：紫底 + 青色描边光（离视点最近） */
.tile--on,
.pill--on {
  /* 白字压 --c-accent(#a78bfa) 只有 2.72:1。这个紫被 8 处当**前景**用，
     调深 token 会连累那些用法，所以只在「白字压紫」的选中态改用更深的紫。
     #7c4ddb 是同色相加深一档，白字 5.33:1，不必再动字号。 */
  color: #ffffff;
  background: #7c4ddb;
  box-shadow:
    var(--shadow),
    0 0 0 2px rgb(34 211 238 / 0.5);
}

.pill-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--c-muted);
}

.pill--on .pill-count {
  color: #ffffff;
}

.clear {
  min-height: 46px;
  padding: 12px 8px;
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
  .pill,
  .clear {
    transition: none;
  }

  .pill:hover,
  .pill:active {
    transform: none;
  }
}

/* 展开/收起：沿用本风格 clear 的控件语言 */
.more {
  min-height: 46px;
  padding: 12px 8px;
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
.more:hover {
  color: var(--c-accent);
}
</style>
