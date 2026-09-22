<!--
  PixelPanel - pixel 风格通用 8-bit 对话框面板
  ------------------------------------------------------------
  所有内容区块的统一「游戏对话框」外壳：面板蓝底 + 4px 纯黑
  边框 + 内圈亮色框 + 右下硬偏移阴影（无模糊）。头部为
  「装饰词（STATUS/INVENTORY 等游戏词汇，aria-hidden）+
  i18n 标题 + 右侧计数」三段式；正文走默认插槽。
  id / data-section / class / role 等属性由使用处透传到根元素。
-->
<template>
  <section class="panel">
    <header class="panel-head">
      <span v-if="head" class="panel-tag" aria-hidden="true">{{ head }}</span>
      <component :is="headingTag" class="panel-title">{{ title }}</component>
      <span v-if="meta" class="panel-meta">{{ meta }}</span>
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
const { head = '', meta = '', title, level = 2 } = defineProps<{
  /** 面板头装饰词（游戏词汇，纯装饰，读屏跳过） */
  head?: string
  /** 面板标题（i18n 文案） */
  title: string
  /** 面板头右侧计数（语言无关的数字字符串） */
  meta?: string
  /** 标题层级：子页把它当页头时用 1（否则整页没有一级标题），首页区块用 2 */
  level?: 1 | 2
}>()

/** 子页整页只有一个主题标题，必须升为 h1；首页 hero 已有 h1，区块维持 h2 */
const headingTag = computed(() => (level === 1 ? 'h1' : 'h2'))
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: var(--space);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  /* 内圈亮框 + 右下硬偏移阴影：8-bit 对话框的经典双层描边 */
  box-shadow:
    inset 0 0 0 3px color-mix(in srgb, var(--c-muted) 55%, transparent),
    var(--shadow);
}

.panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid color-mix(in srgb, var(--c-muted) 45%, transparent);
}

/* 装饰词：草绿 + 硬偏移文字阴影，全大写宽字距 */
.panel-tag {
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-accent-2);
  text-shadow: 2px 2px 0 var(--c-border);
}

.panel-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-text);
  text-shadow: 2px 2px 0 var(--c-border);
}

.panel-meta {
  margin-left: auto;
  font-size: var(--fs-small);
  color: var(--c-muted);
  font-variant-numeric: tabular-nums;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
</style>
