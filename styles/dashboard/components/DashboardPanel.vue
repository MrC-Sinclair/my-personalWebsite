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
  /* 动作区放不下时整块换到标题下一行，而不是把标题挤成逐字换行 */
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--gap);
  padding: var(--space) var(--space) 0;
}

/* 标题不参与收缩：CJK 的 min-content 只有一个字，让它收缩等于把标题压成竖排 */
.panel-titles {
  flex: none;
  max-width: 100%;
  min-width: 0;
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
  /* 原来 flex:none：动作区多一组标签就把整行顶出面板，再被 .panel 的
     overflow:hidden 裁掉——筛选项看不见也点不到。改成可收缩、可换行 */
  flex: 1 1 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--gap);
  min-width: 0;
}

@media (min-width: 1024px) {
  /* 桌面仍靠右对齐；窄屏换行后左对齐才不别扭 */
  .panel-side {
    justify-content: flex-end;
  }
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
