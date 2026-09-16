<!--
  SciFiHudPanel - sci-fi-hud 风格通用 HUD 面板
  ------------------------------------------------------------
  风格的基础容器：细线框 + 面板头（编号 / 标题 / 读数 meta）
  + 头部下缘刻度尺 + 四角 HUD 括角（::before 用 8 段渐变
  画出四个 L 形括角，hover 时括角点亮）。业务内容全部由
  默认插槽承载，本组件不含任何数据逻辑。
-->
<template>
  <section class="panel">
    <header class="panel-head">
      <span v-if="code" class="panel-code" aria-hidden="true">{{ code }}</span>
      <h2 class="panel-title">{{ title }}</h2>
      <span v-if="meta" class="panel-meta">{{ meta }}</span>
    </header>

    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  /** 面板编号（装饰性读数，如 SEC-01，渲染为 aria-hidden） */
  code?: string
  /** 面板标题（i18n 文案） */
  title: string
  /** 面板头右侧读数（如真实条目数，纯文本） */
  meta?: string
}>()
</script>

<style scoped>
/* —— 面板本体：细线框 + 括角定义 —— */
.panel {
  --corner-c: rgb(74 240 198 / 0.85);
  position: relative;
  min-width: 0;
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  transition:
    border-color var(--transition),
    box-shadow var(--transition);
}

/* 四角 HUD 括角：一个伪元素叠 8 段 L 形渐变（每角横竖各一段） */
.panel::before {
  content: '';
  position: absolute;
  inset: -1px;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(var(--corner-c), var(--corner-c)) top left / 14px 2px,
    linear-gradient(var(--corner-c), var(--corner-c)) top left / 2px 14px,
    linear-gradient(var(--corner-c), var(--corner-c)) top right / 14px 2px,
    linear-gradient(var(--corner-c), var(--corner-c)) top right / 2px 14px,
    linear-gradient(var(--corner-c), var(--corner-c)) bottom left / 14px 2px,
    linear-gradient(var(--corner-c), var(--corner-c)) bottom left / 2px 14px,
    linear-gradient(var(--corner-c), var(--corner-c)) bottom right / 14px 2px,
    linear-gradient(var(--corner-c), var(--corner-c)) bottom right / 2px 14px;
  background-repeat: no-repeat;
}

/* hover：边框与括角点亮 + 克制辉光（交互反馈） */
.panel:hover {
  --corner-c: var(--c-accent);
  border-color: color-mix(in srgb, var(--c-accent) 45%, var(--c-border));
  box-shadow: var(--shadow);
}

/* —— 面板头：编号 + 标题 + 读数 —— */
.panel-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px var(--space) 10px;
  border-bottom: var(--border-w) solid var(--c-border);
}

.panel-code {
  flex: none;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.14em;
  color: var(--c-accent);
  border: var(--border-w) solid color-mix(in srgb, var(--c-accent) 40%, transparent);
  padding: 1px 6px;
}

.panel-title {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  line-height: 1.3;
  color: var(--c-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.panel-meta {
  flex: none;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
  color: var(--c-muted);
}

/* 头部下缘刻度尺：细密刻度向右渐隐（纯装饰） */
.panel-head::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  width: 120px;
  height: 5px;
  background: repeating-linear-gradient(
    90deg,
    color-mix(in srgb, var(--c-accent) 55%, transparent) 0 1px,
    transparent 1px 8px
  );
}

/* —— 面板体 —— */
.panel-body {
  position: relative;
  padding: var(--space);
}

@media (prefers-reduced-motion: reduce) {
  .panel {
    transition: none;
  }
}
</style>
