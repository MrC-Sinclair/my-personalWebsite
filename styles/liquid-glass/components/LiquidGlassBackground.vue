<!--
  LiquidGlassBackground - liquid-glass 风格的液态场景背景
  ------------------------------------------------------------
  固定铺满视口的纯 CSS 深空场景（无图片、无滤镜 blur，柔光
  全部靠径向渐变自身的透明衰减实现，性能友好）：
  - 深空底色渐变 + 远景氛围光斑
  - 中景光斑：玻璃面板 backdrop-blur 的主要「取色」折射源
  - 近景小光点 + 斜向光束：提供水滴感的清晰亮部
  - 边缘压暗 vignette 与底部渐隐，保证前景文字对比度
  三层光斑以不同系数跟随页面滚动视差漂移（--lg-drift 变量），
  自身还有低频呼吸漂移动画；prefers-reduced-motion 下全部静止。
  纯装饰层：aria-hidden，不参与交互。
-->
<template>
  <div class="scene" :style="{ '--lg-drift': `${drift}px` }" aria-hidden="true">
    <!-- 深空底色 -->
    <div class="base"/>

    <!-- 远景：超大氛围光斑（低视差） -->
    <div class="layer layer-deep">
      <span class="orb orb-deep-1"/>
      <span class="orb orb-deep-2"/>
    </div>

    <!-- 中景：折射取色主力光斑（中视差） -->
    <div class="layer layer-mid">
      <span class="orb orb-mid-1"/>
      <span class="orb orb-mid-2"/>
      <span class="orb orb-mid-3"/>
      <span class="orb orb-mid-4"/>
    </div>

    <!--
      折射球体层：位于内容带的实心玻璃球（中视差）
      存在的理由：光斑只是低频渐变，玻璃板 backdrop-filter 采样后
      几乎看不出形变；球体有明确的亮核、彩色晕与边缘高光，折射后
      能在板内呈现可辨识的光学扭曲——这才是「液态玻璃」的材质签名。
    -->
    <div class="layer layer-refract">
      <span class="orb-solid orb-solid--1"/>
      <span class="orb-solid orb-solid--2"/>
      <span class="orb-solid orb-solid--3"/>
    </div>

    <!-- 近景：清晰小光点 + 光束（高视差） -->
    <div class="layer layer-near">
      <span class="orb orb-near-1"/>
      <span class="orb orb-near-2"/>
      <span class="beam beam-1"/>
      <span class="beam beam-2"/>
    </div>

    <!-- 边缘压暗与底部渐隐（保证前景可读性） -->
    <div class="vignette"/>
  </div>
</template>

<script setup lang="ts">
/** 页面滚动量（px）：驱动三层光斑的视差位移，SSR 初始为 0 */
const drift = ref(0)

/** rAF 合帧标记：滚动高频触发时每帧只更新一次 */
let rafId = 0

function onScroll(): void {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    drift.value = window.scrollY
    rafId = 0
  })
}

onMounted(() => {
  // 浏览器 API 守卫：仅客户端注册滚动监听（passive 不阻塞滚动）
  if (!import.meta.client) return
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  // 资源成对清理：监听器 + 未决 rAF
  if (import.meta.client) window.removeEventListener('scroll', onScroll)
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
})
</script>

<style scoped>
.scene {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: var(--c-bg);
}

/* 深空底色渐变：顶蓝紫 → 中紫 → 底近黑紫（有色彩倾向的深色，让光斑能显色） */
.base {
  position: absolute;
  inset: 0;
  background: linear-gradient(168deg, #1b1340 0%, #2c1658 46%, #0f0826 100%);
}

/* —— 视差层：三层不同深度的位移系数（浮动由子元素的呼吸动画承担） —— */
.layer {
  position: absolute;
  inset: -12%;
  will-change: transform;
}

.layer-deep {
  transform: translate3d(0, calc(var(--lg-drift, 0px) * -0.05), 0);
}

.layer-mid {
  transform: translate3d(0, calc(var(--lg-drift, 0px) * -0.1), 0);
}

.layer-near {
  transform: translate3d(0, calc(var(--lg-drift, 0px) * -0.16), 0);
}

/* 折射球体层：与中景同视差，保证球体与玻璃板相对位置稳定 */
.layer-refract {
  transform: translate3d(0, calc(var(--lg-drift, 0px) * -0.1), 0);
}

/* —— 实心玻璃球：亮核 + 彩色晕 + 边缘高光 ——
   三层叠加：偏心白色高光（模拟单点光源）→ 彩色球体 → 外发光。
   边缘用 inset 高光勾出球体的「壳」，折射时轮廓最容易被看见。 */
.orb-solid {
  position: absolute;
  display: block;
  border-radius: 50%;
  animation: orb-drift 17s ease-in-out infinite alternate;
}

.orb-solid--1 {
  width: 17vmin;
  height: 17vmin;
  left: 12%;
  top: 24%;
  background:
    radial-gradient(circle at 32% 26%, rgb(255 255 255 / 0.6), transparent 40%),
    radial-gradient(closest-side, rgb(124 92 255 / 0.52), transparent 72%);
  box-shadow:
    inset -3px -4px 10px rgb(255 255 255 / 0.22),
    inset 2px 3px 8px rgb(255 255 255 / 0.14),
    0 0 46px rgb(124 92 255 / 0.4);
}

.orb-solid--2 {
  width: 13vmin;
  height: 13vmin;
  right: 14%;
  top: 46%;
  background:
    radial-gradient(circle at 34% 24%, rgb(255 255 255 / 0.58), transparent 42%),
    radial-gradient(closest-side, rgb(94 227 255 / 0.46), transparent 72%);
  box-shadow:
    inset -3px -4px 10px rgb(255 255 255 / 0.2),
    inset 2px 3px 8px rgb(255 255 255 / 0.12),
    0 0 40px rgb(94 227 255 / 0.36);
  animation-direction: alternate-reverse;
  animation-duration: 21s;
}

.orb-solid--3 {
  width: 10vmin;
  height: 10vmin;
  left: 46%;
  bottom: 12%;
  background:
    radial-gradient(circle at 30% 28%, rgb(255 255 255 / 0.55), transparent 42%),
    radial-gradient(closest-side, rgb(255 122 184 / 0.44), transparent 72%);
  box-shadow:
    inset -2px -3px 8px rgb(255 255 255 / 0.2),
    inset 2px 2px 6px rgb(255 255 255 / 0.12),
    0 0 34px rgb(255 122 184 / 0.34);
  animation-duration: 24s;
}

/* —— 光斑：径向渐变自衰减（不用 filter: blur，避免大面积滤镜开销） —— */
.orb {
  position: absolute;
  display: block;
  border-radius: 50%;
}

.orb-deep-1 {
  width: 56vmax;
  height: 56vmax;
  left: -18vmax;
  top: -10vmax;
  background: radial-gradient(closest-side, rgb(124 58 237 / 0.4), transparent 72%);
  animation: orb-drift 26s ease-in-out infinite alternate;
}

.orb-deep-2 {
  width: 48vmax;
  height: 48vmax;
  right: -14vmax;
  top: 42%;
  background: radial-gradient(closest-side, rgb(14 165 233 / 0.34), transparent 72%);
  animation: orb-drift 31s ease-in-out infinite alternate-reverse;
}

.orb-mid-1 {
  width: 42vmax;
  height: 42vmax;
  left: -2vmax;
  top: 14%;
  background: radial-gradient(closest-side, rgb(124 92 255 / 0.5), transparent 70%);
  animation: orb-drift 19s ease-in-out infinite alternate;
}

.orb-mid-2 {
  width: 34vmax;
  height: 34vmax;
  left: 52%;
  top: -6%;
  background: radial-gradient(closest-side, rgb(33 212 253 / 0.42), transparent 70%);
  animation: orb-drift 23s ease-in-out infinite alternate-reverse;
}

.orb-mid-3 {
  width: 36vmax;
  height: 36vmax;
  right: -2vmax;
  top: 32%;
  background: radial-gradient(closest-side, rgb(255 122 184 / 0.36), transparent 70%);
  animation: orb-drift 21s ease-in-out infinite alternate;
}

.orb-mid-4 {
  width: 32vmax;
  height: 32vmax;
  left: 24%;
  bottom: -2%;
  background: radial-gradient(closest-side, rgb(94 227 255 / 0.34), transparent 70%);
  animation: orb-drift 27s ease-in-out infinite alternate-reverse;
}

.orb-near-1 {
  width: 12vmin;
  height: 12vmin;
  left: 18%;
  top: 30%;
  background: radial-gradient(closest-side, rgb(94 227 255 / 0.55), transparent 68%);
  animation: orb-drift 12s ease-in-out infinite alternate;
}

.orb-near-2 {
  width: 9vmin;
  height: 9vmin;
  right: 22%;
  top: 52%;
  background: radial-gradient(closest-side, rgb(255 122 184 / 0.5), transparent 68%);
  animation: orb-drift 15s ease-in-out infinite alternate-reverse;
}

/* 光斑呼吸漂移：小幅位移，模拟液体的缓慢流动 */
@keyframes orb-drift {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }

  to {
    transform: translate3d(4.5vmax, 3vmax, 0) scale(1.08);
  }
}

/* —— 斜向光束：极低透明度的长条渐变，模拟穿过玻璃的光路 —— */
.beam {
  position: absolute;
  display: block;
  width: 140vmax;
  height: 10vmin;
}

.beam-1 {
  left: -20vmax;
  top: 16%;
  transform: rotate(-24deg);
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.05) 45%, transparent 82%);
  animation: beam-sway 18s ease-in-out infinite alternate;
}

.beam-2 {
  left: -20vmax;
  top: 64%;
  transform: rotate(-24deg);
  background: linear-gradient(90deg, transparent, rgb(94 227 255 / 0.06) 40%, transparent 78%);
  animation: beam-sway 24s ease-in-out infinite alternate-reverse;
}

@keyframes beam-sway {
  from {
    opacity: 0.4;
  }

  to {
    opacity: 1;
  }
}

/* —— 边缘压暗 + 底部渐隐（vignette）：保证任何位置的前景文字对比度 —— */
.vignette {
  position: absolute;
  inset: 0;
  /* 中央透明区从 55% 放宽到 63%：折射球体与中景光斑位于内容带，
     被 vignette 压暗就等于白放——只压边角与底部，保证文字对比度 */
  background:
    radial-gradient(120% 90% at 50% 30%, transparent 63%, rgb(5 4 23 / 0.46) 100%),
    linear-gradient(180deg, transparent 78%, rgb(5 4 23 / 0.45) 100%);
}

/* 尊重 prefers-reduced-motion：光斑与光束全部静止（全局规则已关动画，这里再显式声明位移归零） */
@media (prefers-reduced-motion: reduce) {
  .orb,
  .orb-solid,
  .beam {
    animation: none;
  }
}
</style>
