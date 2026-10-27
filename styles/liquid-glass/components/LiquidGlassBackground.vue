<!--
  LiquidGlassBackground - liquid-glass 风格的液态场景背景
  ------------------------------------------------------------
  固定铺满视口的纯 CSS 深空场景（无图片、无滤镜 blur，柔光
  全部靠径向渐变自身的透明衰减实现，性能友好）：
  - 深空底色渐变 + 远景氛围光斑
  - 中景光斑：玻璃面板 backdrop-blur 的主要「取色」折射源
  - 折射球体：给玻璃提供可辨识的光学形状
  - 近景小光点 + 斜向光束：提供水滴感的清晰亮部
  - 噪点层：消除大面积渐变的色带
  - 边缘压暗 vignette，保证前景文字对比度
  三层光斑以不同系数跟随页面滚动视差漂移（--lg-drift 变量），
  自身还有低频呼吸漂移动画；prefers-reduced-motion 下全部静止。
  纯装饰层：aria-hidden，不参与交互。

  ★ 三次迭代：本层做的是**减法**
  上一版为了「让折射看得见」，往背景里塞了高频硬边纹理
  （30px 间距的同心环、20px 间距的斜条纹、扰流弧）。高频细节
  经过 28px 的 backdrop-blur 之后并不会变成漂亮的波纹，而是被
  揉成一片浑浊的色斑——玻璃板因此发脏，这是「粗糙感」的第一
  来源，且它比玻璃配方本身更显眼。

  正确解法是反过来：背景保持**低频、大尺度、低对比**（iOS 的
  壁纸就是这样），把「可折射的形状」交给少量边界明确的柔和
  球体——球有亮核与软晕，模糊后仍能留下可辨的明暗起伏，这不
  会像条纹那样退化成噪声。保留一组超大尺度的极淡涟漪（间距
  从 30px 拉到 64px、透明度砍到 0.06）作为液态感的底噪。
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
    </div>

    <!-- 大尺度涟漪：间距 64px、透明度 0.06，blur 后是柔和的明暗起伏而非噪声 -->
    <div class="layer layer-caustic">
      <span class="caustic caustic-rings"/>
    </div>

    <!--
      折射球体层：位于内容带的柔和发光球（中视差）
      存在的理由：光斑只是渐变，玻璃板 backdrop-filter 采样后看不出
      形变；球有明确的亮核与边缘，折射后能在板内留下可辨识的光学
      扭曲——这才是「液态玻璃」的材质签名。
      三次迭代：去掉了球体上的 inset 硬高光描边。那两道 inset 让球
      看起来像塑料珠子（也是旧版廉价感的来源之一），现在只保留
      亮核 + 软晕 + 大范围外发光，球是「一团光」而不是「一颗球」。
    -->
    <div class="layer layer-refract">
      <span class="orb-solid orb-solid--1"/>
      <span class="orb-solid orb-solid--2"/>
      <span class="orb-solid orb-solid--3"/>
    </div>

    <!-- 近景：清晰小光点 + 光束（高视差） -->
    <div class="layer layer-near">
      <span class="orb orb-near-1"/>
      <span class="beam beam-1"/>
    </div>

    <!-- 噪点：消色带 -->
    <div class="grain"/>

    <!-- 边缘压暗（保证前景可读性） -->
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

/* 深空底色：低频、低对比。
   ★ 底色不能太暗：玻璃是「透光的介质」，它依赖背后有东西可透。底色
   太暗时透过来的只有黑，玻璃就成了一块深色卡片——这是本轮最重要的
   一条结论。中段的紫从 #2a1a4e 提到 #2f1d55，给玻璃留出可透的底子，
   同时仍属于深空范畴，不破坏本风格「常暗」的签名。 */
.base {
  position: absolute;
  inset: 0;
  /* 大尺度柔和色块（mesh）：四团明确的彩色区域，而不是一层均匀底色。
     ★ 这是「玻璃透得出东西」的前提——玻璃只能折射已经存在的像素，
     底色如果是一整片均匀的深紫，再怎么调 backdrop-filter 都只会出现
     一块均匀的深紫板。iOS 的液态玻璃之所以成立，一半的功劳在它背后
     那张色彩丰富的壁纸。
     ★ 与旧版「高频硬边条纹」的区别：这里的色块尺度是视口的 50~60%，
     边缘靠 radial 自身的衰减化开，blur 之后仍是柔和的大块色彩，不会
     退化成噪声。 */
  background:
    radial-gradient(60% 50% at 18% 22%, rgb(124 92 255 / 0.5), transparent 70%),
    radial-gradient(52% 46% at 78% 16%, rgb(94 227 255 / 0.3), transparent 70%),
    radial-gradient(56% 48% at 68% 74%, rgb(255 122 184 / 0.26), transparent 72%),
    radial-gradient(48% 42% at 20% 80%, rgb(14 165 233 / 0.3), transparent 72%),
    linear-gradient(168deg, #1b1440 0%, #2f1d55 46%, #0d0722 100%);
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

/* 涟漪层：视差略快于球体，玻璃板内产生轻微的相对滑移（液态感） */
.layer-caustic {
  transform: translate3d(0, calc(var(--lg-drift, 0px) * -0.12), 0);
}

/* —— 大尺度涟漪 ——
   间距 64px（旧版 30px）+ 透明度 0.06（旧版 0.2）：高频硬环被 blur
   揉开会变成浑浊色斑，拉大间距、压低对比之后，它退化为板内一层
   几乎察觉不到的明暗起伏，只提供「液态」的暗示而不提供噪声。
   圆心仍对准首屏 hero 玻璃板的中部（约视口 42% 高）。 */
.caustic {
  position: absolute;
  display: block;
  pointer-events: none;
}

.caustic-rings {
  width: 62vmax;
  height: 62vmax;
  left: calc(50% - 31vmax);
  top: calc(42% - 31vmax);
  background:
    repeating-radial-gradient(
      circle at 50% 50%,
      rgb(255 255 255 / 0.06) 0,
      rgb(255 255 255 / 0.06) 3px,
      transparent 3px,
      transparent 64px
    );
  mask-image: radial-gradient(closest-side, #000 12%, rgb(0 0 0 / 0.5) 52%, transparent 76%);
  animation: caustic-breathe 23s ease-in-out infinite alternate;
}

/* 涟漪呼吸：位移极小（纹理怕大幅移动，会像在爬） */
@keyframes caustic-breathe {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }

  to {
    transform: translate3d(2.6vmax, 2vmax, 0) scale(1.05);
  }
}

/* —— 柔和发光球：亮核 + 软晕 + 外发光（无 inset 描边） ——
   球体存在的意义是「给玻璃提供可折射的形状」，所以它必须是一团
   边界清楚的光，而不是一颗有壳的珠子：任何 inset 高光都会在
   blur 后变成一圈硬边，把玻璃内部搅脏。 */
.orb-solid {
  position: absolute;
  display: block;
  border-radius: 50%;
  animation: orb-drift 17s ease-in-out infinite alternate;
}

/* 球体再提亮一档：它们不是装饰，是玻璃的「光源」。
   玻璃板内看到的就是这些球被模糊后的样子——球本身没有足够亮度，
   透过玻璃就只剩一层若有若无的色，玻璃自然显得不透。 */
.orb-solid--1 {
  width: 22vmin;
  height: 22vmin;
  /* 位置对准 hero 玻璃板的左中部：球体必须落在**板的正下方**，
     观察者才能在板内看到「一团被玻璃柔化的光」。放在板的边缘之外
     时，板内只剩被抹平的底色，玻璃自然读起来是实心的。
     （在 1440×900 下板覆盖约 x 164~1276、y 80~818，此处约 x 432~630） */
  left: 30%;
  top: 26%;
  background:
    radial-gradient(circle at 34% 28%, rgb(255 255 255 / 0.72), transparent 40%),
    radial-gradient(closest-side, rgb(124 92 255 / 0.62), transparent 74%);
  box-shadow: 0 0 80px rgb(124 92 255 / 0.44);
}

.orb-solid--2 {
  width: 17vmin;
  height: 17vmin;
  /* 第二颗落在板的右中下部（约 x 913~1066），与第一颗形成对角，
     板内因此有明暗两块而不是一整片均匀色 */
  right: 26%;
  top: 52%;
  background:
    radial-gradient(circle at 36% 26%, rgb(255 255 255 / 0.66), transparent 42%),
    radial-gradient(closest-side, rgb(94 227 255 / 0.54), transparent 74%);
  box-shadow: 0 0 70px rgb(94 227 255 / 0.38);
  animation-direction: alternate-reverse;
  animation-duration: 21s;
}

.orb-solid--3 {
  width: 13vmin;
  height: 13vmin;
  left: 44%;
  bottom: 10%;
  background:
    radial-gradient(circle at 32% 30%, rgb(255 255 255 / 0.6), transparent 42%),
    radial-gradient(closest-side, rgb(255 122 184 / 0.46), transparent 74%);
  box-shadow: 0 0 60px rgb(255 122 184 / 0.36);
  animation-duration: 24s;
}

/* —— 光斑：径向渐变自衰减（不用 filter: blur，避免大面积滤镜开销） ——
   三次迭代：光斑的透明度整体下调约四成、尺寸整体上调。
   理由：大而淡 = 氛围；小而浓 = 脏点。旧版 6 个 0.34~0.5 的光斑
   在深底上互相叠加，压出一处处高饱和的色团，玻璃 blur 之后再
   saturate 1.55 放大，就变成发腻的彩色污渍。 */
.orb {
  position: absolute;
  display: block;
  border-radius: 50%;
}

.orb-deep-1 {
  width: 62vmax;
  height: 62vmax;
  left: -20vmax;
  top: -12vmax;
  background: radial-gradient(closest-side, rgb(124 58 237 / 0.34), transparent 74%);
  animation: orb-drift 26s ease-in-out infinite alternate;
}

.orb-deep-2 {
  width: 54vmax;
  height: 54vmax;
  right: -16vmax;
  top: 42%;
  background: radial-gradient(closest-side, rgb(14 165 233 / 0.3), transparent 74%);
  animation: orb-drift 31s ease-in-out infinite alternate-reverse;
}

.orb-mid-1 {
  width: 48vmax;
  height: 48vmax;
  left: -4vmax;
  top: 14%;
  background: radial-gradient(closest-side, rgb(124 92 255 / 0.4), transparent 72%);
  animation: orb-drift 19s ease-in-out infinite alternate;
}

.orb-mid-2 {
  width: 40vmax;
  height: 40vmax;
  left: 52%;
  top: -6%;
  background: radial-gradient(closest-side, rgb(33 212 253 / 0.36), transparent 72%);
  animation: orb-drift 23s ease-in-out infinite alternate-reverse;
}

.orb-mid-3 {
  width: 42vmax;
  height: 42vmax;
  right: -4vmax;
  top: 32%;
  background: radial-gradient(closest-side, rgb(255 122 184 / 0.3), transparent 72%);
  animation: orb-drift 21s ease-in-out infinite alternate;
}

.orb-near-1 {
  width: 11vmin;
  height: 11vmin;
  left: 18%;
  top: 30%;
  background: radial-gradient(closest-side, rgb(94 227 255 / 0.42), transparent 68%);
  animation: orb-drift 12s ease-in-out infinite alternate;
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
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.035) 45%, transparent 82%);
  animation: beam-sway 18s ease-in-out infinite alternate;
}

@keyframes beam-sway {
  from {
    opacity: 0.4;
  }

  to {
    opacity: 1;
  }
}

/* —— 噪点：消除大面积渐变的色带（banding） ——
   深底 + 大跨度渐变在 8bit 面板上必然出现一圈圈台阶，那是最容易被
   读成「做工粗糙」的细节。4% 的噪点足以打散台阶，成本几乎为零。 */
.grain {
  position: absolute;
  inset: 0;
  /* 不透明度已写在 --lg-noise 的 SVG 内部（rect opacity='0.05'），
     这里不再叠加 CSS opacity，免得两层相乘把噪点压到看不见 */
  background-image: var(--lg-noise);
}

/* —— 边缘压暗（vignette）：保证任何位置的前景文字对比度 ——
   三次迭代：中央透明区 63% → 68%、压暗 0.46 → 0.34。
   旧版把内容带也压暗了，等于把折射球体白放，还让整屏发闷。 */
.vignette {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(120% 90% at 50% 30%, transparent 68%, rgb(5 4 23 / 0.34) 100%),
    linear-gradient(180deg, transparent 80%, rgb(5 4 23 / 0.32) 100%);
}

/* 尊重 prefers-reduced-motion：光斑与光束全部静止（全局规则已关动画，这里再显式声明位移归零） */
@media (prefers-reduced-motion: reduce) {
  .orb,
  .orb-solid,
  .beam,
  .caustic {
    animation: none;
  }
}
</style>
