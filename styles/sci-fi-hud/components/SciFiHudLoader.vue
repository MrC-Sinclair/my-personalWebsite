<!--
  SciFiHudLoader - sci-fi-hud 风格加载状态
  ------------------------------------------------------------
  异步数据加载中的占位：数条「数据流」动画进度线（错峰流动）
  + 加载文案（t('common.loading')）。reduced-motion 下动画
  停止，保留静态条纹。
-->
<template>
  <div class="loader" role="status" :aria-label="t('common.loading')">
    <span v-for="line in 3" :key="line" class="flux" :style="{ '--flux-delay': `${(line - 1) * 240}ms` }"/>
    <p class="label">{{ t('common.loading') }}</p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
/* —— 加载占位 —— */
.loader {
  display: grid;
  gap: 10px;
  padding: 8px 0;
}

/* 数据流线：暗轨道 + 信号色流动段 */
.flux {
  position: relative;
  display: block;
  height: 10px;
  overflow: hidden;
  background: color-mix(in srgb, var(--c-bg) 70%, var(--c-surface));
  border: var(--border-w) solid var(--c-border);
}

.flux::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -35%;
  width: 35%;
  background: repeating-linear-gradient(
    90deg,
    var(--c-accent) 0 8px,
    transparent 8px 14px
  );
  opacity: 0.7;
  animation: flux-run 1.6s linear infinite;
  animation-delay: var(--flux-delay, 0ms);
}

@keyframes flux-run {
  to {
    left: 100%;
  }
}

.label {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .flux::after {
    animation: none;
    left: 0;
    opacity: 0.35;
  }
}
</style>
