<!--
  Soft3DBackground - soft-3d 风格深空背景层
  ------------------------------------------------------------
  纯 CSS 绘制的空间氛围：深空纵向渐变 + 三团缓漂柔光斑
  （紫 / 青 / 粉，大半径 blur 形成远处景深）+ 前景虚化微光
  粒（近处失焦，构成前后景深）+ 边缘暗角。
  固定定位铺满视口、pointer-events: none，不参与交互；
  所有漂移动画均为纯 CSS，并在 prefers-reduced-motion 下关闭。
-->
<template>
  <div class="bg3d" aria-hidden="true">
    <!-- 远景：三团缓漂柔光斑（远景区，重度虚化） -->
    <div class="bg3d-blob bg3d-blob-a"/>
    <div class="bg3d-blob bg3d-blob-b"/>
    <div class="bg3d-blob bg3d-blob-c"/>

    <!-- 前景：失焦微光粒（近景区，轻微漂移） -->
    <div class="bg3d-speck bg3d-speck-1"/>
    <div class="bg3d-speck bg3d-speck-2"/>
    <div class="bg3d-speck bg3d-speck-3"/>

    <!-- 边缘暗角：把视线收拢到舞台中央 -->
    <div class="bg3d-vignette"/>
  </div>
</template>

<style scoped>
.bg3d {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--c-accent) 13%, var(--c-bg)) 0%,
    var(--c-bg) 46%,
    color-mix(in srgb, #000 38%, var(--c-bg)) 100%
  );
}

/* —— 远景柔光斑：--deco 是柔紫辉光，另两团用风格签名色 —— */
.bg3d-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(72px);
  animation: bg3d-drift 38s ease-in-out infinite alternate;
}

.bg3d-blob-a {
  top: -12%;
  left: -8%;
  width: 44vw;
  height: 44vw;
  min-width: 320px;
  min-height: 320px;
  background: var(--deco);
}

.bg3d-blob-b {
  top: 18%;
  right: -14%;
  width: 40vw;
  height: 40vw;
  min-width: 300px;
  min-height: 300px;
  background: radial-gradient(closest-side, rgb(34 211 238 / 0.28), rgb(34 211 238 / 0));
  animation-duration: 46s;
  animation-delay: -12s;
}

.bg3d-blob-c {
  bottom: -18%;
  left: 24%;
  width: 48vw;
  height: 48vw;
  min-width: 340px;
  min-height: 340px;
  background: radial-gradient(closest-side, rgb(244 114 182 / 0.22), rgb(244 114 182 / 0));
  animation-duration: 54s;
  animation-delay: -26s;
}

@keyframes bg3d-drift {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(4%, -3%, 0) scale(1.08);
  }

  100% {
    transform: translate3d(-3%, 4%, 0) scale(0.96);
  }
}

/* —— 前景失焦微光粒：近景浅虚化，与远景 blob 拉开景深 —— */
.bg3d-speck {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 255 255 / 0.35), rgb(255 255 255 / 0));
  filter: blur(7px);
  animation: bg3d-float 11s ease-in-out infinite alternate;
}

.bg3d-speck-1 {
  top: 30%;
  left: 6%;
  width: 26px;
  height: 26px;
}

.bg3d-speck-2 {
  top: 64%;
  right: 9%;
  width: 34px;
  height: 34px;
  animation-duration: 14s;
  animation-delay: -5s;
}

.bg3d-speck-3 {
  bottom: 12%;
  left: 16%;
  width: 18px;
  height: 18px;
  animation-duration: 9s;
  animation-delay: -2s;
}

@keyframes bg3d-float {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.55;
  }

  100% {
    transform: translateY(-34px) scale(1.15);
    opacity: 1;
  }
}

/* —— 边缘暗角 —— */
.bg3d-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 52%, rgb(6 3 26 / 0.5) 100%);
}

/* reduced-motion：所有漂移停住，静态氛围保留 */
@media (prefers-reduced-motion: reduce) {
  .bg3d-blob,
  .bg3d-speck {
    animation: none;
  }
}
</style>
