<!--
  Y2KStarfield - y2k 风格星空氛围装饰层
  ------------------------------------------------------------
  纯 CSS 绘制的全页氛围背景（fixed 铺满视口、pointer-events none、
  aria-hidden）：两组不同密度的星点视差层（radial-gradient 平铺）
  + 三颗铬质透明气泡（漂浮动画）+ 一颗流星划过 + 底部蓝紫地平线
  辉光。对应 tokens 契约的 --deco: bubbles 开关（本风格常开）。
  所有动画在 prefers-reduced-motion 下关闭。
-->
<template>
  <div class="starfield" aria-hidden="true">
    <span class="stars stars--far" />
    <span class="stars stars--near" />
    <span class="meteor" />
    <span class="bubble bubble--a" />
    <span class="bubble bubble--b" />
    <span class="bubble bubble--c" />
    <span class="horizon" />
  </div>
</template>

<script setup lang="ts">
/**
 * @file Y2K 风格的星空/气泡装饰背景组件
 * @description 纯 CSS 星点、气泡、流星与地平线辉光，无任何图片资源。
 */
</script>

<style scoped>
.starfield {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

/* —— 星点：两组平铺 radial-gradient 形成视差 —— */
.stars {
  position: absolute;
  inset: 0;
  background-repeat: repeat;
}

.stars--far {
  background-image:
    radial-gradient(1px 1px at 22px 34px, rgb(255 255 255 / 0.55), transparent 100%),
    radial-gradient(1px 1px at 118px 92px, rgb(200 210 255 / 0.4), transparent 100%),
    radial-gradient(1.5px 1.5px at 210px 26px, rgb(255 255 255 / 0.45), transparent 100%),
    radial-gradient(1px 1px at 310px 150px, rgb(255 255 255 / 0.3), transparent 100%);
  background-size: 340px 220px;
  animation: twinkle 5.5s ease-in-out infinite;
}

.stars--near {
  background-image:
    radial-gradient(2px 2px at 64px 120px, rgb(255 255 255 / 0.9), transparent 100%),
    radial-gradient(1.5px 1.5px at 178px 46px, rgb(255 214 250 / 0.75), transparent 100%),
    radial-gradient(2px 2px at 262px 190px, rgb(190 235 255 / 0.7), transparent 100%),
    radial-gradient(1.5px 1.5px at 88px 226px, rgb(255 255 255 / 0.6), transparent 100%);
  background-size: 300px 280px;
  animation: twinkle 4s ease-in-out 1.2s infinite;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}

/* —— 流星：细渐变线周期划过 —— */
.meteor {
  position: absolute;
  top: 16%;
  right: -12%;
  width: 150px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.9));
  transform: rotate(-24deg);
  animation: meteor 7.5s ease-in infinite;
}

@keyframes meteor {
  0% {
    opacity: 0;
    transform: rotate(-24deg) translateX(0);
  }

  6% {
    opacity: 1;
  }

  22% {
    opacity: 0;
    transform: rotate(-24deg) translateX(-46vw);
  }

  100% {
    opacity: 0;
    transform: rotate(-24deg) translateX(-46vw);
  }
}

/* —— 气泡：透明塑料球体（radial 高光 + 白描边） —— */
.bubble {
  position: absolute;
  border: 1px solid rgb(255 255 255 / 0.4);
  border-radius: 50%;
  background:
    radial-gradient(120% 120% at 30% 24%, rgb(255 255 255 / 0.85) 0%, rgb(255 255 255 / 0.1) 26%, transparent 48%),
    radial-gradient(100% 100% at 68% 82%, rgb(255 92 225 / 0.28) 0%, transparent 55%),
    radial-gradient(100% 100% at 50% 50%, rgb(139 123 255 / 0.16) 0%, rgb(139 123 255 / 0.04) 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.4);
  animation: floaty 9s ease-in-out infinite alternate;
}

.bubble--a {
  top: 20%;
  left: 6%;
  width: 88px;
  height: 88px;
}

.bubble--b {
  top: 58%;
  right: 9%;
  width: 56px;
  height: 56px;
  animation-duration: 11s;
  animation-delay: 1.6s;
}

.bubble--c {
  top: 76%;
  left: 16%;
  width: 34px;
  height: 34px;
  animation-duration: 7.5s;
  animation-delay: 0.8s;
}

@keyframes floaty {
  0% {
    transform: translateY(0) translateX(0);
  }

  100% {
    transform: translateY(-30px) translateX(10px);
  }
}

/* —— 底部地平线辉光（蓝紫 + 品红） —— */
.horizon {
  position: absolute;
  right: -20%;
  bottom: -34%;
  left: -20%;
  height: 64%;
  background: radial-gradient(
    52% 62% at 50% 100%,
    rgb(139 123 255 / 0.4) 0%,
    rgb(255 92 225 / 0.14) 46%,
    transparent 72%
  );
}

/* —— 动效尊重 prefers-reduced-motion —— */
@media (prefers-reduced-motion: reduce) {
  .stars--far,
  .stars--near,
  .bubble,
  .meteor {
    animation: none;
  }

  .meteor {
    display: none;
  }
}
</style>
