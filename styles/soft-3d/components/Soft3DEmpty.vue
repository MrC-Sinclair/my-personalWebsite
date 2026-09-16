<!--
  Soft3DEmpty - soft-3d 风格空状态 / 加载态浮空提示牌
  ------------------------------------------------------------
  一块悬浮在空间中的小提示牌：加载态展示脉动的小球体组
  （纯 CSS 动画），空态展示消息与提示文案。
  role="status" 让读屏设备可感知状态变化。
-->
<template>
  <div class="empty" role="status">
    <!-- 加载态：三颗相位错开的脉动小球 -->
    <div v-if="loading" class="empty-orbs" aria-hidden="true">
      <span class="empty-orb empty-orb-1"/>
      <span class="empty-orb empty-orb-2"/>
      <span class="empty-orb empty-orb-3"/>
    </div>
    <p class="empty-message">{{ message }}</p>
    <p v-if="hint" class="empty-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 状态消息（i18n 文案） */
    message: string
    /** 补充提示（可选） */
    hint?: string
    /** 是否为加载态（展示脉动小球） */
    loading?: boolean
  }>(),
  {
    hint: '',
    loading: false,
  },
)
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: calc(var(--space) * 1.4) var(--space);
  text-align: center;
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

/* —— 加载小球：三颗渐变球体波浪脉动 —— */
.empty-orbs {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 6px;
}

.empty-orb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  animation: empty-bounce 1.2s ease-in-out infinite;
}

.empty-orb-1 {
  background: radial-gradient(circle at 32% 28%, #e9d5ff, #7c3aed 72%);
  box-shadow: 0 8px 14px rgb(139 92 246 / 0.4);
}

.empty-orb-2 {
  background: radial-gradient(circle at 32% 28%, #cffafe, #22d3ee 72%);
  box-shadow: 0 8px 14px rgb(34 211 238 / 0.35);
  animation-delay: 0.15s;
}

.empty-orb-3 {
  background: radial-gradient(circle at 32% 28%, #fce7f3, #ec4899 72%);
  box-shadow: 0 8px 14px rgb(236 72 153 / 0.35);
  animation-delay: 0.3s;
}

@keyframes empty-bounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-10px) scale(1.08);
  }
}

.empty-message {
  margin: 0;
  font-size: var(--fs-base);
  color: var(--c-text);
}

.empty-hint {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .empty-orb {
    animation: none;
  }
}
</style>
