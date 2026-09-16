<!--
  FlatDesignSkeleton - 扁平化风格加载骨架
  ------------------------------------------------------------
  纯色浅灰块 + 呼吸脉冲（纯 CSS 动画，prefers-reduced-motion
  下关闭），作为异步数据就绪前的占位反馈。
-->
<template>
  <div class="sk" role="status" :aria-label="t('common.loading')">
    <span v-for="(w, i) in widths" :key="i" class="sk__block" :style="{ width: w }"/>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

/** 各占位块的宽度（静态数组，SSR / 客户端一致） */
const widths = ['38%', '82%', '64%', '90%', '46%'] as const
</script>

<style scoped>
.sk {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px 0;
}

.sk__block {
  display: block;
  height: 18px;
  background: #e2e8ef;
  border-radius: var(--radius-sm);
  animation: sk-pulse 1.4s ease-in-out infinite alternate;
}

/* 呼吸脉冲：透明度渐变（不动布局、无位移） */
@keyframes sk-pulse {
  from {
    opacity: 1;
  }

  to {
    opacity: 0.5;
  }
}

/* reduced-motion：关闭脉冲，保留静态占位块 */
@media (prefers-reduced-motion: reduce) {
  .sk__block {
    animation: none;
  }
}
</style>
