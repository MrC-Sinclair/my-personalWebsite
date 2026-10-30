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
      v-for="item in shown"
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
  gap: 16px;
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

/* 展开/收起：沿用本风格 clear 的控件语言 */
.more {
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
.more:hover {
  color: var(--c-accent-2);
}

/* 窄屏收成单行横向滚动条：14 个 chip 绕 5 行会把首条正文推出屏幕
   （英文标签更宽，实测 swiss/blog 首条正文到 1016px / 视口 844px）。
   滚动条常驻可见，行尾就是「还有 N 个标签」，全部标签仍可逐个滑到 */
@media (max-width: 639px) {
  .tags {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 4px 0;
    scrollbar-width: thin;
  }

  .tags > * {
    flex: none;
  }
}
</style>
