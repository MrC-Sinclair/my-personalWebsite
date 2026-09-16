<!--
  SciFiHudRadar - sci-fi-hud 风格雷达扫描仪
  ------------------------------------------------------------
  纯 CSS 仪表（tier 2 动效，无图片 / 无脚本动画库）：
  - 同心圆刻度环：嵌套圆环 + repeating-conic-gradient 外圈刻度
  - 扫描扇形：conic-gradient 楔形 + 旋转动画（reduced-motion
    下停止旋转，保留静态扇形仪表外观）
  - 目标光点：固定坐标数组（禁止 Math.random，保证 SSR 一致），
    ping 扩散动画按固定延迟错开
  整体为纯装饰仪表，aria-hidden，不承载任何业务信息。
-->
<template>
  <div class="radar" aria-hidden="true">
    <!-- 外圈刻度环 + 同心圆 -->
    <span class="ticks" />
    <span class="ring ring-outer" />
    <span class="ring ring-mid" />
    <span class="ring ring-inner" />

    <!-- 十字准线 -->
    <span class="cross cross-h" />
    <span class="cross cross-v" />

    <!-- 旋转扫描扇形 -->
    <span class="sweep" />

    <!-- 目标光点（固定坐标 + 错峰 ping） -->
    <span
      v-for="blip in blips"
      :key="`${blip.x}-${blip.y}`"
      class="blip"
      :style="{ left: `${blip.x}%`, top: `${blip.y}%`, '--blip-delay': `${blip.delay}ms` }"
    />

    <!-- 中心点 -->
    <span class="core" />
  </div>
</template>

<script setup lang="ts">
/** 目标光点：固定坐标（百分比）与固定延迟，纯装饰数据 */
interface RadarBlip {
  x: number
  y: number
  delay: number
}

/** 固定光点阵（不使用随机数，SSR / 客户端渲染一致） */
const blips: RadarBlip[] = [
  { x: 64, y: 30, delay: 0 },
  { x: 32, y: 56, delay: 900 },
  { x: 72, y: 68, delay: 1700 },
  { x: 46, y: 22, delay: 2400 },
]
</script>

<style scoped>
/* —— 雷达盘面：正方形，随容器缩放 —— */
.radar {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 50%, rgb(74 240 198 / 0.1) 0%, transparent 62%),
    color-mix(in srgb, var(--c-bg) 72%, var(--c-surface));
  border: var(--border-w) solid var(--c-border);
}

/* 外圈刻度：repeating-conic-gradient 画放射刻度，mask 只留外缘细环 */
.ticks {
  position: absolute;
  inset: 0;
  background: repeating-conic-gradient(
    from 0deg,
    rgb(74 240 198 / 0.6) 0deg 0.7deg,
    transparent 0.7deg 15deg
  );
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px));
}

/* 同心圆刻度环 */
.ring {
  position: absolute;
  border: var(--border-w) solid color-mix(in srgb, var(--c-accent) 34%, transparent);
  border-radius: 50%;
}

.ring-outer {
  inset: 12%;
}

.ring-mid {
  inset: 28%;
  border-style: dashed;
}

.ring-inner {
  inset: 44%;
}

/* 十字准线 */
.cross {
  position: absolute;
  background: color-mix(in srgb, var(--c-accent) 30%, transparent);
}

.cross-h {
  top: 50%;
  right: 4%;
  left: 4%;
  height: 1px;
}

.cross-v {
  top: 4%;
  bottom: 4%;
  left: 50%;
  width: 1px;
}

/* 扫描扇形：conic 楔形 + 旋转（尾迹向 12 点方向渐隐） */
.sweep {
  position: absolute;
  inset: 0;
  background: conic-gradient(
    from 0deg,
    rgb(74 240 198 / 0.5) 0deg,
    rgb(74 240 198 / 0.08) 52deg,
    transparent 78deg,
    transparent 360deg
  );
  border-radius: 50%;
  animation: radar-spin 3.6s linear infinite;
}

@keyframes radar-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 目标光点：常亮核 + 错峰 ping 扩散环 */
.blip {
  position: absolute;
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  background: var(--c-accent);
  border-radius: 50%;
  box-shadow: 0 0 8px rgb(74 240 198 / 0.9);
}

.blip::after {
  content: '';
  position: absolute;
  inset: -3px;
  border: 1px solid var(--c-accent);
  border-radius: 50%;
  opacity: 0;
  animation: blip-ping 3.2s ease-out infinite;
  animation-delay: var(--blip-delay, 0ms);
}

@keyframes blip-ping {
  0% {
    opacity: 0.9;
    transform: scale(0.6);
  }

  45% {
    opacity: 0;
    transform: scale(2.6);
  }

  100% {
    opacity: 0;
    transform: scale(2.6);
  }
}

/* 中心点 */
.core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  margin: -2px 0 0 -2px;
  background: var(--c-accent);
  border-radius: 50%;
}

/* —— reduced-motion：停转、停 ping，保留静态仪表外观 —— */
@media (prefers-reduced-motion: reduce) {
  .sweep {
    animation: none;
    opacity: 0.4;
  }

  .blip::after {
    animation: none;
    opacity: 0;
  }
}
</style>
