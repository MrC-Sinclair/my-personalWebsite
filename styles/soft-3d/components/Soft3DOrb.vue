<!--
  Soft3DOrb - soft-3d 风格纯 CSS 3D 球体
  ------------------------------------------------------------
  风格的核心「3D 图标」物体：radial-gradient 受光体（左上
  高光 → 主色 → 暗底收口）+ 内底阴影 + 主色外辉光 + 镜面
  高光斑，可选「星环」。漂浮动画为纯 CSS（可配时长 / 延迟），
  在 prefers-reduced-motion 下自动关闭。
  仅作装饰（aria-hidden），不承载交互与文案。
-->
<template>
  <span
    class="orb"
    :class="[`orb-${variant}`, { 'orb-float': float, 'orb-ring': ring }]"
    :style="{ '--orb-size': `${size}px`, '--orb-dur': `${duration}s`, '--orb-delay': `${delay}s` }"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
/** 球体配色变体（糖果渐变体系，取自参考项目的柔光配色） */
type OrbVariant = 'violet' | 'cyan' | 'pink' | 'mint' | 'sun'

withDefaults(
  defineProps<{
    /** 球体直径（px） */
    size?: number
    /** 配色变体 */
    variant?: OrbVariant
    /** 是否漂浮 */
    float?: boolean
    /** 漂浮周期（秒） */
    duration?: number
    /** 漂浮延迟（秒，错开相位用） */
    delay?: number
    /** 是否带星环 */
    ring?: boolean
  }>(),
  {
    size: 120,
    variant: 'violet',
    float: false,
    duration: 7,
    delay: 0,
    ring: false,
  },
)
</script>

<style scoped>
.orb {
  --orb-size: 120px;
  --orb-dur: 7s;
  --orb-delay: 0s;
  position: relative;
  display: inline-block;
  flex: none;
  width: var(--orb-size);
  height: var(--orb-size);
  border-radius: 50%;
  /* 受光体通用配方：内底暗弧 + 内顶亮弧 + 主色外辉光（辉光色随变体覆盖） */
  box-shadow:
    inset -10px -14px 24px rgb(9 5 40 / 0.5),
    inset 3px 5px 10px rgb(255 255 255 / 0.32);
}

/* —— 镜面高光斑（左上光源点） —— */
.orb::before {
  content: '';
  position: absolute;
  top: 12%;
  left: 18%;
  width: 34%;
  height: 24%;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgb(255 255 255 / 0.9), rgb(255 255 255 / 0) 72%);
  filter: blur(2px);
}

/* —— 星环（压扁的光环椭圆） —— */
.orb-ring::after {
  content: '';
  position: absolute;
  top: 30%;
  left: -26%;
  width: 152%;
  height: 44%;
  border: 2px solid rgb(255 255 255 / 0.5);
  border-radius: 50%;
  transform: rotate(-16deg);
  box-shadow: 0 0 14px rgb(255 255 255 / 0.22);
}

/* —— 糖果配色变体（亮顶 → 主色 → 暗底收口 + 同色辉光） —— */
.orb-violet {
  background: radial-gradient(
    circle at 32% 26%,
    #e9d5ff 0%,
    #a78bfa 34%,
    #7c3aed 66%,
    #3f2d8f 100%
  );
  box-shadow:
    inset -10px -14px 24px rgb(9 5 40 / 0.5),
    inset 3px 5px 10px rgb(255 255 255 / 0.32),
    0 18px 32px rgb(139 92 246 / 0.4);
}

.orb-cyan {
  background: radial-gradient(
    circle at 32% 26%,
    #cffafe 0%,
    #67e8f9 34%,
    #22d3ee 66%,
    #0e7490 100%
  );
  box-shadow:
    inset -10px -14px 24px rgb(9 5 40 / 0.5),
    inset 3px 5px 10px rgb(255 255 255 / 0.32),
    0 18px 32px rgb(34 211 238 / 0.34);
}

.orb-pink {
  background: radial-gradient(
    circle at 32% 26%,
    #fce7f3 0%,
    #f9a8d4 34%,
    #ec4899 66%,
    #9d174d 100%
  );
  box-shadow:
    inset -10px -14px 24px rgb(9 5 40 / 0.5),
    inset 3px 5px 10px rgb(255 255 255 / 0.32),
    0 18px 32px rgb(236 72 153 / 0.34);
}

.orb-mint {
  background: radial-gradient(
    circle at 32% 26%,
    #d1fae5 0%,
    #6ee7b7 34%,
    #34d399 66%,
    #047857 100%
  );
  box-shadow:
    inset -10px -14px 24px rgb(9 5 40 / 0.5),
    inset 3px 5px 10px rgb(255 255 255 / 0.32),
    0 18px 32px rgb(52 211 153 / 0.3);
}

.orb-sun {
  background: radial-gradient(
    circle at 32% 26%,
    #fef3c7 0%,
    #fcd34d 34%,
    #f59e0b 66%,
    #b45309 100%
  );
  box-shadow:
    inset -10px -14px 24px rgb(9 5 40 / 0.5),
    inset 3px 5px 10px rgb(255 255 255 / 0.32),
    0 18px 32px rgb(245 158 11 / 0.3);
}

/* —— 漂浮：缓升缓降的正弦浮动 —— */
.orb-float {
  animation: orb-float var(--orb-dur) ease-in-out var(--orb-delay) infinite;
}

@keyframes orb-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12px);
  }
}

/* reduced-motion：漂浮停住，球体本身仍是静态 3D 观感 */
@media (prefers-reduced-motion: reduce) {
  .orb-float {
    animation: none;
  }
}
</style>
