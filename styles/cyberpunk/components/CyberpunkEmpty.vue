<!--
  CyberpunkEmpty - cyberpunk 风格空态警示板
  ------------------------------------------------------------
  列表 / 网格为空时的提示板：粉色切角警示框 + 闪烁警示符
  （reduced-motion 下静止）+ 主文案与可选提示文案（均由
  父级传入 i18n 文案，本组件不写死业务文案）。
-->
<template>
  <div class="empty" role="status">
    <span class="glyph" aria-hidden="true">⚠</span>
    <p class="msg">{{ message }}</p>
    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 空态主文案（i18n） */
  message: string
  /** 空态提示文案（可选，i18n） */
  hint?: string
}>()
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: calc(var(--space) * 1.5) var(--space);
  text-align: center;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
  box-shadow: inset 0 0 0 var(--border-w) rgb(255 45 149 / 0.45);
}

/* 警示符：粉色闪烁 */
.glyph {
  font-size: 26px;
  color: var(--c-accent-2);
  text-shadow: 0 0 12px rgb(255 45 149 / 0.6);
  animation: glyph-blink 1.6s steps(2, start) infinite;
}

@keyframes glyph-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

.msg {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  color: var(--c-text);
}

.hint {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .glyph {
    animation: none;
    opacity: 0.8;
  }
}
</style>
