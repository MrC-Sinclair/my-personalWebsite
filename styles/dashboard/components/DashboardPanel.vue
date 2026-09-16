<!--
  DashboardPanel - dashboard 风格通用面板容器
  ------------------------------------------------------------
  仪表盘网格里的「面板」单元：顶部 2px 数据高光条（--deco）+
  面板头（eyebrow 小标 + 标题 + 右侧 meta）+ 内容插槽。
  通过 fallthrough 属性接收 id / data-section / 布局 class。
-->
<template>
  <section class="panel">
    <header class="panel-head">
      <div class="panel-titles">
        <p v-if="eyebrow" class="panel-eyebrow">{{ eyebrow }}</p>
        <h2 v-if="title" class="panel-title">{{ title }}</h2>
      </div>
      <div class="panel-side">
        <slot name="actions" />
        <p v-if="meta" class="panel-meta">{{ meta }}</p>
      </div>
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  /** 面板头上方的小号等宽标签 */
  eyebrow?: string
  /** 面板标题 */
  title?: string
  /** 面板头右侧的统计元信息（如文章总数） */
  meta?: string
}>()
</script>

<style scoped>
.panel {
  position: relative;
  overflow: hidden;
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
}

/* 顶部数据高光条 —— --deco 装饰开关的用途 */
.panel::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 2px;
  background: var(--deco);
  opacity: 0.9;
  pointer-events: none;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--gap);
  padding: var(--space) var(--space) 0;
}

.panel-eyebrow {
  margin: 0 0 2px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-muted);
}

.panel-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 600;
  line-height: 1.3;
  color: var(--c-text);
}

.panel-side {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--gap);
}

.panel-meta {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
}

.panel-body {
  padding: var(--space);
}
</style>
