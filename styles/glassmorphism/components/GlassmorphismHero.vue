<!--
  GlassmorphismHero - glassmorphism 风格的英雄区
  ------------------------------------------------------------
  首屏签名：撑满一屏的开放排版（不包面板，直接暴露在彩色
  mesh 渐变上）——发光徽标胶囊 + 极光渐变巨型姓名 + 标语/
  简介 + 两颗玻璃 CTA 按钮；右侧悬浮 2 枚磨砂圆片（背景
  穿透）与 3 枚真实数据的统计玻璃片（桌面端错位漂浮，
  移动端回落为静态统计行）。
-->
<template>
  <section class="hero">
    <!-- 悬浮磨砂圆片：展示「背景从玻璃后穿透」的签名（仅桌面端） -->
    <span class="hero-disc hero-disc--1" aria-hidden="true"/>
    <span class="hero-disc hero-disc--2" aria-hidden="true"/>

    <div class="hero-copy scroll-reveal scroll-reveal-up">
      <p class="hero-badge">
        <span class="badge-dot" aria-hidden="true"/>
        {{ t('home.greeting') }}
      </p>

      <h1 class="hero-name">{{ t('home.name') }}</h1>
      <p class="hero-tagline">{{ t('home.tagline') }}</p>
      <p class="hero-desc">{{ t('home.description') }}</p>

      <div class="hero-cta">
        <NuxtLink class="btn btn--primary" :to="localePath('/blog')">
          {{ t('home.viewBlog') }}
        </NuxtLink>
        <NuxtLink class="btn btn--ghost" :to="localePath('/projects')">
          {{ t('home.viewProjects') }}
        </NuxtLink>
      </div>
    </div>

    <!-- 真实数据统计片：桌面端错位漂浮，窄屏为静态行 -->
    <div class="hero-chips">
      <div
        v-for="(chip, index) in chips"
        :key="chip.label"
        class="float-chip"
        :class="`float-chip--${index + 1}`"
      >
        <strong class="chip-value">{{ chip.value }}</strong>
        <span class="chip-label">{{ chip.label }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/** 首屏统计片：label 来自 i18n，value 来自共享层真实数据 */
interface HeroChip {
  label: string
  value: number
}

defineProps<{
  /** 统计数据片（文章数 / 项目数 / 技能数） */
  chips: HeroChip[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* 首屏撑满一屏：海报感来自尺寸而非面板 */
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: clamp(560px, 88vh, 860px);
  padding-top: 96px;
  padding-bottom: var(--space);
}

/* —— 悬浮磨砂圆片（背景穿透演示，仅 ≥768px 渲染） —— */
.hero-disc {
  position: absolute;
  display: none;
  border-radius: 50%;
  background: linear-gradient(150deg, rgb(255 255 255 / 0.4) 0%, rgb(255 255 255 / 0.08) 100%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  backdrop-filter: blur(18px) saturate(160%);
  border: var(--border-w) solid rgb(255 255 255 / 0.55);
  box-shadow: var(--shadow), inset 0 1px 0 rgb(255 255 255 / 0.6);
  animation: disc-float 7s ease-in-out infinite;
}

.hero-disc--1 {
  top: 16%;
  right: 6%;
  width: 190px;
  height: 190px;
}

.hero-disc--2 {
  right: 26%;
  bottom: 12%;
  width: 120px;
  height: 120px;
  animation-delay: -3.2s;
}

/* —— 文案区 —— */
.hero-badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 10px;
  margin: 0 0 22px;
  padding: 8px 18px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-accent);
  background: rgb(255 255 255 / 0.5);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border: var(--border-w) solid rgb(255 255 255 / 0.7);
  border-radius: 999px;
  box-shadow: var(--shadow);
}

.badge-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c-accent);
  box-shadow: 0 0 12px rgb(109 40 217 / 0.9);
  animation: badge-breathe 2.8s ease-in-out infinite;
}

/* 巨型姓名：极光渐变文字（大字号 ≥3:1 即满足 AA 大字对比） */
.hero-name {
  margin: 0 0 14px;
  font-family: var(--font-head);
  font-size: clamp(44px, 8.4vw, 96px);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.02em;
  background-image: linear-gradient(118deg, #0e7490 0%, #6d28d9 52%, #be185d 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  overflow-wrap: break-word;
}

.hero-tagline {
  margin: 0 0 6px;
  font-size: clamp(18px, 2.4vw, 24px);
  font-weight: 700;
  color: var(--c-text);
}

.hero-desc {
  max-width: 56ch;
  margin: 0;
  color: var(--c-muted);
}

/* —— CTA 按钮对 —— */
.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 30px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 10px 26px;
  font-size: var(--fs-base);
  font-weight: 700;
  text-decoration: none;
  border-radius: 999px;
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    background var(--transition),
    border-color var(--transition);
}

/* 主按钮：极光渐变实底 + Glow */
.btn--primary {
  color: var(--c-on-accent);
  background-image: linear-gradient(120deg, #6d28d9 0%, #8b5cf6 55%, #db2777 100%);
  box-shadow: 0 8px 22px rgb(139 92 246 / 0.42);
}

.btn--primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgb(139 92 246 / 0.55);
}

/* 幽灵按钮：磨砂玻璃底 */
.btn--ghost {
  color: var(--c-text);
  background: rgb(255 255 255 / 0.5);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border: var(--border-w) solid rgb(255 255 255 / 0.7);
  box-shadow: var(--shadow);
}

.btn--ghost:hover {
  transform: translateY(-3px);
  background: rgb(255 255 255 / 0.72);
  box-shadow: 0 12px 28px rgb(31 38 135 / 0.22);
}

.btn:active {
  transform: var(--press-transform);
}

/* —— 统计片：窄屏为静态玻璃行 —— */
.hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
  margin-top: 36px;
}

.float-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 12px 20px;
  background: rgb(255 255 255 / 0.5);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border: var(--border-w) solid rgb(255 255 255 / 0.7);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
}

.chip-value {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 800;
  color: var(--c-accent);
  font-variant-numeric: tabular-nums;
}

.chip-label {
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-muted);
}

/* 桌面端：统计片脱离文档流，错位漂浮在姓名右侧 */
@media (min-width: 1024px) {
  .hero-chips {
    display: contents;
  }

  .float-chip {
    position: absolute;
    animation: chip-float 6s ease-in-out infinite;
  }

  .float-chip--1 {
    top: 26%;
    right: 7%;
    animation-delay: -0.8s;
  }

  .float-chip--2 {
    top: 47%;
    right: 21%;
    animation-delay: -2.6s;
  }

  .float-chip--3 {
    bottom: 18%;
    right: 5%;
    animation-delay: -4.2s;
  }

  .hero-disc {
    display: block;
  }
}

/* 漂浮动画：小幅上下浮动 */
@keyframes chip-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12px);
  }
}

@keyframes disc-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-16px) rotate(3deg);
  }
}

@keyframes badge-breathe {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 8px rgb(109 40 217 / 0.7);
  }

  50% {
    opacity: 0.65;
    box-shadow: 0 0 18px rgb(109 40 217 / 1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-disc,
  .float-chip,
  .badge-dot {
    animation: none;
  }

  .btn {
    transition: none;
  }

  .btn--primary:hover,
  .btn--ghost:hover {
    transform: none;
  }

  .btn:active {
    transform: none;
  }
}
</style>
