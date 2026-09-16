<!--
  GlassmorphismBackdrop - glassmorphism 风格的固定渐变背景
  ------------------------------------------------------------
  风格签名之一：大面积多彩 mesh 渐变底。多个预柔化的
  radial-gradient 光斑（青/蓝/紫/粉/琥珀）缓慢漂移，边缘用
  暗角式渐晕拉回底色，保证正文区可读。
  性能说明：光斑用「预柔化的径向渐变」而非 filter: blur，
  避免常驻大面积高斯模糊；动画只动 transform。
  纯装饰元素：aria-hidden + pointer-events: none。
-->
<template>
  <div class="mesh" aria-hidden="true">
    <span class="blob blob--cyan"/>
    <span class="blob blob--blue"/>
    <span class="blob blob--violet"/>
    <span class="blob blob--pink"/>
    <span class="blob blob--amber"/>
    <span class="veil"/>
  </div>
</template>

<style scoped>
/* 固定铺满视口的渐变底，位于内容层之下 */
.mesh {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: var(--c-bg);
}

/* 光斑：预柔化径向渐变，动画只改 transform，性能友好 */
.blob {
  position: absolute;
  border-radius: 50%;
  will-change: transform;
  animation: blob-drift 26s ease-in-out infinite alternate;
}

.blob--cyan {
  top: -16vmax;
  left: -14vmax;
  width: 58vmax;
  height: 58vmax;
  background: radial-gradient(circle at 50% 50%, rgb(34 211 238 / 0.5), transparent 66%);
  animation-duration: 24s;
  animation-delay: -3s;
}

.blob--blue {
  top: 6%;
  right: -20vmax;
  width: 64vmax;
  height: 64vmax;
  background: radial-gradient(circle at 50% 50%, rgb(79 140 255 / 0.44), transparent 66%);
  animation-duration: 30s;
  animation-delay: -12s;
}

.blob--violet {
  bottom: -22vmax;
  left: 8%;
  width: 70vmax;
  height: 70vmax;
  background: radial-gradient(circle at 50% 50%, rgb(139 92 246 / 0.42), transparent 66%);
  animation-duration: 28s;
  animation-delay: -20s;
}

.blob--pink {
  top: 44%;
  right: -8vmax;
  width: 44vmax;
  height: 44vmax;
  background: radial-gradient(circle at 50% 50%, rgb(244 114 182 / 0.36), transparent 66%);
  animation-duration: 32s;
  animation-delay: -8s;
}

.blob--amber {
  bottom: 18%;
  left: 30%;
  width: 34vmax;
  height: 34vmax;
  background: radial-gradient(circle at 50% 50%, rgb(251 191 36 / 0.26), transparent 66%);
  animation-duration: 34s;
  animation-delay: -16s;
}

/* 渐晕：边缘拉回底色，压住光斑亮度，保证边缘文本区可读 */
.veil {
  position: absolute;
  inset: 0;
  background: radial-gradient(115% 88% at 50% 36%, transparent 44%, rgb(233 237 251 / 0.78) 100%);
}

/* 光斑漂移：小幅位移 + 轻微缩放，营造「背景在呼吸」 */
@keyframes blob-drift {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(4vmax, 3vmax, 0) scale(1.08);
  }

  100% {
    transform: translate3d(-3vmax, -2vmax, 0) scale(0.96);
  }
}

/* 减少动态：光斑静止 */
@media (prefers-reduced-motion: reduce) {
  .blob {
    animation: none;
  }
}
</style>
