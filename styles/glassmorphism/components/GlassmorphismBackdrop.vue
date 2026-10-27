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
    <span class="blob blob--indigo"/>
    <span class="veil"/>
    <span class="grain"/>
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
  background: radial-gradient(circle at 50% 50%, rgb(34 211 238 / 0.62), transparent 66%);
  animation-duration: 24s;
  animation-delay: -3s;
}

.blob--blue {
  top: 6%;
  right: -20vmax;
  width: 64vmax;
  height: 64vmax;
  background: radial-gradient(circle at 50% 50%, rgb(79 140 255 / 0.3), transparent 66%);
  animation-duration: 30s;
  animation-delay: -12s;
}

.blob--violet {
  bottom: -22vmax;
  left: 8%;
  width: 70vmax;
  height: 70vmax;
  background: radial-gradient(circle at 50% 50%, rgb(139 92 246 / 0.58), transparent 66%);
  animation-duration: 28s;
  animation-delay: -20s;
}

.blob--pink {
  top: 44%;
  right: -8vmax;
  width: 44vmax;
  height: 44vmax;
  background: radial-gradient(circle at 50% 50%, rgb(244 114 182 / 0.24), transparent 66%);
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

/* 深靛光斑：本轮新增的「暗部」。
   上一版的问题不是不透，而是整屏全是高明度的青/紫/粉，缺少一块
   压得住的深色——没有暗部就没有明暗对比，玻璃的「透」与背景的
   「实」也就分不出来（卡片和背景一样亮，等于没有层次）。
   这一团放在中右部（hero 玻璃板覆盖区），让板内真的出现明暗起伏。 */
.blob--indigo {
  top: 30%;
  right: 12%;
  width: 40vmax;
  height: 40vmax;
  background: radial-gradient(circle at 50% 50%, rgb(85 74 217 / 0.34), transparent 66%);
  animation-duration: 29s;
  animation-delay: -5s;
}

/* 渐晕：边缘拉回底色，压住光斑亮度，保证边缘文本区可读。
   强度从 0.7 降到 0.55——上一版把光斑压得太狠，等于白放了那些
   彩色；0.55 仍足以把边缘收干净，同时让中部的色彩真正显出来。 */
.veil {
  position: absolute;
  inset: 0;
  background: radial-gradient(115% 88% at 50% 36%, transparent 52%, rgb(233 237 251 / 0.55) 100%);
}

/* 噪点：打散大面积渐变的色带（亮底比暗底更容易出现可见台阶） */
.grain {
  position: absolute;
  inset: 0;
  background-image: var(--gm-noise);
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
