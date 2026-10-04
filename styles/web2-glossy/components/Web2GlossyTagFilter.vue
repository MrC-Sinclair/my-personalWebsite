<!--
  Web2GlossyTagFilter - web2-glossy 风格的标签筛选栏
  ------------------------------------------------------------
  形态：Web 2.0 招牌的**全圆角胶囊**（本风格 --radius-sm 是 999px），
  上半部有 Glossy 高光（linear-gradient 的白亮带），下缘柔和投影；
  hover 时高光更亮并微微上抬，选中态换成蓝色渐变 + 白字 + 内高光，
  像一颗被按下并点亮的糖果按钮。再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <button
      type="button"
      class="caps"
      :class="{ 'caps--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      {{ t('blog.allTags') }}<span class="caps-count" aria-hidden="true">{{ total }}</span>
    </button>

    <button
      v-for="item in tags"
      :key="item.tag"
      type="button"
      class="caps"
      :class="{ 'caps--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      {{ item.tag }}<span class="caps-count" aria-hidden="true">{{ item.count }}</span>
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
  margin-bottom: var(--gap);
}

/* —— 胶囊：全圆角 + 上半高光 + 柔和投影 —— */
.caps {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  min-height: 44px;
  padding: 11px 20px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-text);
  background: linear-gradient(180deg, #ffffff 0%, #f2f7fd 48%, #dce9f8 100%);
  border: var(--border-w) solid rgb(30 111 217 / 0.35);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    color var(--transition),
    background var(--transition),
    border-color var(--transition);
}

.caps:hover {
  color: var(--c-accent);
  border-color: var(--c-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgb(23 74 128 / 0.2), 0 18px 34px rgb(23 74 128 / 0.18);
}

.caps:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

.caps:active {
  transform: var(--press-transform);
}

/* 选中：蓝色渐变 + 白字 + 顶部内高光（糖果按钮被点亮） */
.caps--on,
.caps--on:hover {
  color: #ffffff;
  background: linear-gradient(180deg, #5aa3f0 0%, var(--c-accent) 52%, #14508f 100%);
  border-color: var(--c-accent);
  box-shadow:
    var(--shadow),
    inset 0 1px 0 rgb(255 255 255 / 0.6);
}

.caps-count {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 400;
  color: var(--c-muted);
}

.caps--on .caps-count {
  color: #ffffff;
}

.clear {
  min-height: 44px;
  padding: 11px 14px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-accent-2);
  background: linear-gradient(180deg, #ffffff 0%, #fdeee1 100%);
  border: var(--border-w) solid rgb(191 77 0 / 0.4);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    color var(--transition),
    background var(--transition),
    transform var(--transition);
}

.clear:hover {
  color: #ffffff;
  background: linear-gradient(180deg, #e2703a 0%, var(--c-accent-2) 100%);
}

.clear:active {
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .caps,
  .clear {
    transition: none;
  }

  .caps:hover,
  .caps:active,
  .clear:active {
    transform: none;
  }
}
</style>
