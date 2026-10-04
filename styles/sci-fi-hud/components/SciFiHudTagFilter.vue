<!--
  SciFiHudTagFilter - sci-fi-hud 风格的标签筛选栏
  ------------------------------------------------------------
  形态：驾驶舱面板上的一排状态按钮——直角（--radius-sm 是 0）、等宽字号、
  两端方括号装饰 `[ ]`，hover 时描边点亮并起青色辉光，选中态是青绿实心 +
  外发光，像该通道被接通。计数用等宽字放在右侧，读数感对齐。
  再次点击同一标签即取消筛选。
-->
<template>
  <div v-if="tags.length" class="tags" role="group" :aria-label="t('blog.filterByTag')">
    <button
      type="button"
      class="port"
      :class="{ 'port--on': !activeTag }"
      :aria-pressed="!activeTag"
      @click="emit('select', '')"
    >
      <span class="port-bracket" aria-hidden="true">[</span>
      <span class="port-label">{{ t('blog.allTags') }}</span>
      <span class="port-count" aria-hidden="true">{{ total }}</span>
      <span class="port-bracket" aria-hidden="true">]</span>
    </button>

    <button
      v-for="item in tags"
      :key="item.tag"
      type="button"
      class="port"
      :class="{ 'port--on': item.tag === activeTag }"
      :aria-pressed="item.tag === activeTag"
      :aria-label="`${item.tag} · ${item.count} ${t('blog.postsUnit')}`"
      @click="emit('select', item.tag)"
    >
      <span class="port-bracket" aria-hidden="true">[</span>
      <span class="port-label">{{ item.tag }}</span>
      <span class="port-count" aria-hidden="true">{{ item.count }}</span>
      <span class="port-bracket" aria-hidden="true">]</span>
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

/* —— 状态按钮：直角 + hairline，hover 点亮起辉光 —— */
.port {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 44px;
  padding: 10px 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid rgb(74 240 198 / 0.3);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    border-color var(--transition),
    box-shadow var(--transition),
    color var(--transition),
    background var(--transition);
}

.port:hover {
  color: var(--c-accent);
  border-color: var(--c-accent);
  box-shadow: var(--shadow);
}

.port:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.port:active {
  transform: var(--press-transform);
}

/* 选中：通道接通——青绿实心 + 外发光 */
.port--on {
  color: #041018;
  background: var(--c-accent);
  border-color: var(--c-accent);
  box-shadow: 0 0 16px rgb(74 240 198 / 0.5);
}

.port-bracket {
  opacity: 0.6;
}

.port-count {
  font-size: 11px;
  color: var(--c-muted);
}

.port--on .port-count {
  color: #041018;
}

.clear {
  min-height: 44px;
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--c-accent-2);
  background: transparent;
  border: var(--border-w) solid var(--c-accent-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition),
    box-shadow var(--transition);
}

.clear:hover {
  color: #1a1004;
  background: var(--c-accent-2);
  box-shadow: 0 0 14px rgb(255 180 84 / 0.4);
}

.clear:active {
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .port,
  .clear {
    transition: none;
  }

  .port:active,
  .clear:active {
    transform: none;
  }
}
</style>
