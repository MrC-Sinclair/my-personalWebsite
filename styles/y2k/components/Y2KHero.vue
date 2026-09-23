<!--
  Y2KHero - y2k 风格英雄区
  ------------------------------------------------------------
  首屏撑满一屏的「千禧年星空海报」：巨型铬金属 3D 标题
  （background-clip: text 多段灰白蓝渐变 + 投影）+ 问候胶囊 +
  行星球（带土星环的铬球，漂浮动画）+ 轨道环 + 星芒闪光。
  CTA 为风格内 Y2KChromeButton（页内锚点跳转）。
  动画在 prefers-reduced-motion 下关闭。
-->
<template>
  <section id="hero" data-section="hero" class="hero" aria-labelledby="hero-title">
    <!-- 装饰：轨道环 / 行星球 / 星芒 -->
    <span class="hero-ring hero-ring--1" aria-hidden="true" />
    <span class="hero-ring hero-ring--2" aria-hidden="true" />
    <span class="hero-orbit" aria-hidden="true">
      <span class="hero-orb">
        <span class="hero-orb-glint" />
        <span class="hero-orb-ring" />
      </span>
    </span>
    <span class="hero-spark hero-spark--1" aria-hidden="true">✦</span>
    <span class="hero-spark hero-spark--2" aria-hidden="true">✧</span>
    <span class="hero-spark hero-spark--3" aria-hidden="true">✦</span>

    <div class="hero-inner">
      <p class="hero-greeting">
        <span class="hero-greeting-dot" aria-hidden="true" />
        {{ t('home.greeting') }}
      </p>

      <h1 id="hero-title" class="hero-name">{{ t('home.name') }}</h1>

      <p class="hero-tagline">{{ t('home.tagline') }}</p>
      <p class="hero-desc">{{ t('home.description') }}</p>

      <div class="hero-actions">
        <Y2KChromeButton href="#posts" size="lg">{{ t('home.viewBlog') }}</Y2KChromeButton>
        <Y2KChromeButton href="#projects" variant="plastic" size="lg">
          {{ t('home.viewProjects') }}
        </Y2KChromeButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * @file Y2K 风格的英雄区组件
 * @description 铬金属大标题 + 行星球 + 轨道环的千禧年首屏。
 */
// styles/ 下组件不走自动导入，引用同风格组件必须显式 import；
// 漏掉这行会让 Vue 把 <Y2KChromeButton> 当未知标签原样输出——
// 按钮只剩下裸文字，背景/描边/圆角全部丢失。
import Y2KChromeButton from './Y2KChromeButton.vue'

const { t } = useI18n()
</script>

<style scoped>
.hero {
  position: relative;
  display: grid;
  align-items: center;
  min-height: clamp(560px, 88vh, 860px);
  padding: calc(var(--space) * 2) 0;
  overflow: hidden;
}

.hero-inner {
  position: relative;
  z-index: 2;
  width: min(100% - 2 * var(--space), var(--page-w));
  margin-inline: auto;
}

/* —— 问候胶囊：品红指示点 + 塑料胶囊 —— */
.hero-greeting {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 var(--gap);
  padding: 6px 18px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--c-muted);
  border: var(--border-w) solid rgb(190 200 255 / 0.4);
  border-radius: 999px;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.16) 0%, rgb(255 255 255 / 0.04) 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.4);
}

.hero-greeting-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c-accent-2);
  box-shadow: 0 0 10px rgb(255 92 225 / 0.8);
}

/* —— 巨型铬金属 3D 标题（背景裁切渐变文字） —— */
.hero-name {
  margin: 0 0 var(--gap);
  font-family: var(--font-head);
  font-size: clamp(46px, 9.5vw, 122px);
  font-weight: 900;
  line-height: 0.98;
  letter-spacing: 0.01em;
  overflow-wrap: break-word;
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    #dfe6ff 26%,
    #9fabdd 46%,
    #55629f 54%,
    #8f9ce0 72%,
    #eef1ff 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  filter: drop-shadow(0 2px 0 rgb(255 255 255 / 0.3)) drop-shadow(0 16px 28px rgb(4 0 38 / 0.7));
}

.hero-tagline {
  margin: 0 0 6px;
  font-size: var(--fs-title);
  font-weight: 700;
  color: var(--c-text);
}

.hero-desc {
  max-width: 56ch;
  margin: 0 0 calc(var(--space) * 1.5);
  color: var(--c-muted);
}

/* CTA 按钮对：横向排列 + 间距（否则两个按钮粘连） */
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

/* —— 行星球：铬球 + 土星环（漂浮动画） —— */
.hero-orbit {
  position: absolute;
  top: 14%;
  right: 4%;
  z-index: 1;
  animation: orb-float 8s ease-in-out infinite alternate;
}

/* 球体：多段径向铬 */
.hero-orb {
  position: relative;
  display: block;
  width: clamp(96px, 14vw, 190px);
  height: clamp(96px, 14vw, 190px);
  border-radius: 50%;
  background: radial-gradient(
    120% 120% at 32% 26%,
    #ffffff 0%,
    #c3cdf2 26%,
    #7d89c9 50%,
    #3a4484 76%,
    #1c1454 100%
  );
  box-shadow:
    inset 0 2px 0 rgb(255 255 255 / 0.85),
    inset 0 -14px 26px rgb(10 4 60 / 0.55),
    0 0 44px rgb(139 123 255 / 0.45);
}

/* 球面高光 */
.hero-orb-glint {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(46% 34% at 30% 22%, rgb(255 255 255 / 0.85), transparent 70%);
}

/* 土星环：旋转椭圆描边 */
.hero-orb-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 168%;
  height: 52%;
  border: 2px solid rgb(200 210 255 / 0.55);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotate(-18deg);
  box-shadow: 0 0 12px rgb(139 123 255 / 0.4);
}

@keyframes orb-float {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-22px);
  }
}

/* —— 轨道环：大椭圆铬线装饰 —— */
.hero-ring {
  position: absolute;
  border: 1px solid rgb(160 172 235 / 0.22);
  border-radius: 50%;
  pointer-events: none;
}

.hero-ring--1 {
  top: -34%;
  left: -12%;
  width: 56vw;
  height: 56vw;
  transform: rotate(-16deg);
}

.hero-ring--2 {
  right: -18%;
  bottom: -42%;
  width: 64vw;
  height: 64vw;
  border-color: rgb(255 92 225 / 0.16);
  transform: rotate(12deg);
}

/* —— 星芒闪光（字符 + 缩放闪烁） —— */
.hero-spark {
  position: absolute;
  z-index: 1;
  color: rgb(255 255 255 / 0.9);
  text-shadow: 0 0 12px rgb(139 123 255 / 0.9);
  animation: spark-twinkle 3.2s ease-in-out infinite;
}

.hero-spark--1 {
  top: 22%;
  left: 46%;
  font-size: 26px;
}

.hero-spark--2 {
  top: 58%;
  left: 8%;
  font-size: 18px;
  animation-delay: 0.9s;
  color: rgb(255 214 250 / 0.9);
}

.hero-spark--3 {
  top: 12%;
  right: 30%;
  font-size: 15px;
  animation-delay: 1.7s;
  color: rgb(190 235 255 / 0.9);
}

@keyframes spark-twinkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.3;
    transform: scale(0.72);
  }
}

/* —— 窄屏：行星球退到标题后方，弱化但不消失（布局回退、设计保留） —— */
@media (max-width: 767px) {
  .hero-orbit {
    top: 6%;
    right: -14%;
    opacity: 0.55;
  }

  .hero-spark--1 {
    left: auto;
    right: 12%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-orbit,
  .hero-spark {
    animation: none;
  }
}
</style>
