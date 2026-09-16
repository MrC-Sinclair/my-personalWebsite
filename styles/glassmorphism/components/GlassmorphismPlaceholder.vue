<!--
  GlassmorphismPlaceholder - glassmorphism 风格的加载/空状态
  ------------------------------------------------------------
  两种形态：
  - loading：磨砂玻璃骨架条（流光扫过动画），role="status"
    并附视觉隐藏的加载文案
  - empty：玻璃空状态片（发光圆点 + 提示文案 + 次级提示）
  异步数据（文章/项目）加载与空结果时使用，避免内容突变。
-->
<template>
  <div v-if="variant === 'loading'" class="ph-loading" role="status">
    <span class="sr-only">{{ message }}</span>
    <span v-for="i in 3" :key="i" class="ph-bar" :style="{ animationDelay: `${i * 0.18}s` }"/>
  </div>

  <div v-else class="ph-empty">
    <span class="ph-dot" aria-hidden="true"/>
    <p class="ph-message">{{ message }}</p>
    <p v-if="hint" class="ph-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 形态：loading = 骨架条；empty = 空状态提示 */
    variant?: 'loading' | 'empty'
    /** 主文案（来自 i18n） */
    message: string
    /** 次级提示（可选，来自 i18n） */
    hint?: string
  }>(),
  {
    variant: 'empty',
    hint: '',
  },
)
</script>

<style scoped>
/* —— 加载骨架：流光扫过磨砂条 —— */
.ph-loading {
  display: grid;
  gap: var(--gap);
}

.ph-bar {
  position: relative;
  display: block;
  height: 64px;
  overflow: hidden;
  background: rgb(255 255 255 / 0.4);
  border: var(--border-w) solid rgb(255 255 255 / 0.55);
  border-radius: var(--radius-sm);
  animation: ph-sweep 1.6s ease-in-out infinite;
}

/* 流光：伪元素横向扫过 */
.ph-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgb(255 255 255 / 0.65) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  animation: ph-slide 1.6s ease-in-out infinite;
}

@keyframes ph-sweep {
  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 0.9;
  }
}

@keyframes ph-slide {
  to {
    transform: translateX(100%);
  }
}

/* —— 空状态 —— */
.ph-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: clamp(24px, 4vw, 48px);
  text-align: center;
  background: rgb(255 255 255 / 0.32);
  border: var(--border-w) dashed rgb(255 255 255 / 0.8);
  border-radius: var(--radius-sm);
}

.ph-dot {
  width: 16px;
  height: 16px;
  margin-bottom: 6px;
  background: var(--deco);
  border-radius: 50%;
  box-shadow: 0 0 16px rgb(139 92 246 / 0.55);
}

.ph-message {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
}

.ph-hint {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* 视觉隐藏（读屏可用） */
.sr-only {
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .ph-bar,
  .ph-bar::after {
    animation: none;
  }
}
</style>
