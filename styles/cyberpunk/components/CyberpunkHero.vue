<!--
  CyberpunkHero - cyberpunk 风格全屏英雄区
  ------------------------------------------------------------
  「未来城市天台」首屏：撑满一屏，底部是透视网格地面
  （repeating-linear-gradient + rotateX，纯 CSS）与地平线
  光带；中央是 glitch 故障感巨标题（伪元素复制文本做青/粉
  色偏错位动画，SSR 安全纯 CSS）、等宽眉标（闪烁光标）、
  霓虹标语与描述，以及两枚切角 CTA（页内锚点跳转）。
  四角 HUD 边角括号 + 底部符号数据条均为装饰（aria-hidden）。
  reduced-motion 下：故障抖动、光标闪烁、地面滚动全部静止，
  霓虹辉光本身保留。
-->
<template>
  <section id="home" data-section="home" class="hero">
    <!-- 场景层：透视网格地面 + 地平线光带 -->
    <div class="grid-floor" aria-hidden="true"/>
    <div class="horizon" aria-hidden="true"/>

    <!-- 内容层 -->
    <div class="hero-inner">
      <p class="eyebrow">
        <span class="cursor" aria-hidden="true">▮</span>
        <span class="eyebrow-text">{{ t('home.greeting') }}</span>
      </p>

      <h1 class="glitch" :data-text="t('home.name')">{{ t('home.name') }}</h1>

      <p class="tagline">{{ t('home.tagline') }}</p>
      <p class="desc">{{ t('home.description') }}</p>

      <div class="cta-row">
        <a class="cta cta-cyan" href="#posts">
          {{ t('home.viewBlog') }}<span class="cta-arrow" aria-hidden="true">>>></span>
        </a>
        <a class="cta cta-pink" href="#projects">
          {{ t('home.viewProjects') }}<span class="cta-arrow" aria-hidden="true">>>></span>
        </a>
      </div>
    </div>

    <!-- 四角 HUD 边角括号 -->
    <span class="corner corner-tl" aria-hidden="true"/>
    <span class="corner corner-tr" aria-hidden="true"/>
    <span class="corner corner-bl" aria-hidden="true"/>
    <span class="corner corner-br" aria-hidden="true"/>

    <!-- 底部符号数据条（纯装饰字符，不承载业务文案） -->
    <p class="data-strip" aria-hidden="true">
      <span>▚▞</span><span class="strip-dim">::</span><span>0x2F</span><span class="strip-dim">::</span><span>▞▚</span><span class="strip-blink">▮</span>
    </p>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
/* —— 场景：撑满一屏的夜空 + 网格地面 —— */
.hero {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  min-height: clamp(560px, 92vh, 920px);
  padding: calc(var(--space) * 2) var(--gap) calc(var(--space) * 3);
  background:
    radial-gradient(ellipse 120% 60% at 50% 0%, rgb(55 36 110 / 0.35), transparent 60%),
    var(--c-bg);
}

/* 透视网格地面：两方向 repeating 渐变 + rotateX 压出纵深 */
.grid-floor {
  position: absolute;
  right: -20%;
  bottom: -12%;
  left: -20%;
  height: 52%;
  background:
    repeating-linear-gradient(90deg, rgb(34 211 238 / 0.16) 0 1px, transparent 1px 58px),
    repeating-linear-gradient(0deg, rgb(255 45 149 / 0.12) 0 1px, transparent 1px 46px);
  transform: perspective(480px) rotateX(58deg);
  transform-origin: top center;
  mask-image: linear-gradient(180deg, #000 40%, transparent);
  -webkit-mask-image: linear-gradient(180deg, #000 40%, transparent);
}

/* 地平线光带：一条横贯的青→粉辉光线 */
.horizon {
  position: absolute;
  right: 0;
  bottom: 34%;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--c-accent) 30%, var(--c-accent-2) 70%, transparent);
  box-shadow:
    0 0 18px rgb(34 211 238 / 0.6),
    0 0 42px rgb(255 45 149 / 0.35);
  opacity: 0.8;
}

/* —— 内容层：居中偏左的巨标题堆栈 —— */
.hero-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: var(--page-w);
  padding: 0 var(--space);
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  font-family: var(--font-head);
  font-size: clamp(14px, 1.6vw, 18px);
  letter-spacing: 0.32em;
  color: var(--c-accent);
  text-shadow: 0 0 10px rgb(34 211 238 / 0.55);
}

/* 闪烁光标（街机待机） */
.cursor {
  color: var(--c-accent-2);
  animation: cursor-blink 1.1s steps(2, start) infinite;
}

@keyframes cursor-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

/* —— glitch 巨标题：本体霓虹青光 + 伪元素错位色偏 —— */
.glitch {
  position: relative;
  margin: 0 0 14px;
  font-family: var(--font-head);
  font-size: clamp(46px, 9vw, 124px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: 0.02em;
  color: var(--c-text);
  text-shadow:
    0 0 12px rgb(34 211 238 / 0.65),
    0 0 46px rgb(34 211 238 / 0.28);
  overflow-wrap: break-word;
}

.glitch::before,
.glitch::after {
  position: absolute;
  top: 0;
  left: 0;
  content: attr(data-text);
  pointer-events: none;
  overflow: hidden;
}

/* 青色错位层：偶尔左偏 */
.glitch::before {
  color: var(--c-accent);
  text-shadow: -3px 0 0 rgb(34 211 238 / 0.8);
  animation: glitch-cyan 3.4s steps(1) infinite;
}

/* 粉色错位层：偶尔右偏 */
.glitch::after {
  color: var(--c-accent-2);
  text-shadow: 3px 0 0 rgb(255 45 149 / 0.8);
  animation: glitch-pink 2.9s steps(1) infinite;
}

@keyframes glitch-cyan {
  0%,
  92%,
  100% {
    clip-path: inset(0 0 100% 0);
    transform: translate(0);
  }

  93% {
    clip-path: inset(12% 0 55% 0);
    transform: translate(-6px, -2px);
  }

  96% {
    clip-path: inset(58% 0 8% 0);
    transform: translate(5px, 1px);
  }
}

@keyframes glitch-pink {
  0%,
  88%,
  100% {
    clip-path: inset(0 0 100% 0);
    transform: translate(0);
  }

  89% {
    clip-path: inset(38% 0 30% 0);
    transform: translate(7px, 2px);
  }

  94% {
    clip-path: inset(4% 0 74% 0);
    transform: translate(-5px, -1px);
  }
}

.tagline {
  margin: 0 0 6px;
  font-family: var(--font-head);
  font-size: clamp(16px, 2vw, 22px);
  color: color-mix(in srgb, var(--c-accent) 42%, var(--c-accent-2));
  text-shadow: 0 0 12px rgb(255 45 149 / 0.35);
}

.desc {
  max-width: 58ch;
  margin: 0 0 30px;
  color: var(--c-muted);
}

/* —— CTA 行：切角按钮组 —— */
.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 12px 26px;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
  clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.cta:active {
  transform: var(--press-transform);
}

/* 青色实心按钮：深底字 + 青辉光 */
.cta-cyan {
  color: var(--c-on-accent);
  background: var(--c-accent);
  box-shadow: 0 0 18px rgb(34 211 238 / 0.45);
}

.cta-cyan:hover {
  box-shadow: 0 0 30px rgb(34 211 238 / 0.75);
}

/* 粉色描边按钮：hover 粉色填充 */
.cta-pink {
  color: var(--c-accent-2);
  background: rgb(255 45 149 / 0.08);
  box-shadow: inset 0 0 0 var(--border-w) rgb(255 45 149 / 0.6);
}

.cta-pink:hover {
  color: var(--c-on-accent);
  background: var(--c-accent-2);
  box-shadow:
    inset 0 0 0 var(--border-w) var(--c-accent-2),
    0 0 24px rgb(255 45 149 / 0.55);
}

/* CTA 箭头：hover 右移 */
.cta-arrow {
  font-family: var(--font-mono);
  transition: transform var(--transition);
}

.cta:hover .cta-arrow {
  transform: translateX(4px);
}

/* —— 四角 HUD 边角括号 —— */
.corner {
  position: absolute;
  width: 26px;
  height: 26px;
  border: 2px solid rgb(34 211 238 / 0.55);
  pointer-events: none;
}

.corner-tl {
  top: 86px;
  left: 18px;
  border-right: 0;
  border-bottom: 0;
}

.corner-tr {
  top: 86px;
  right: 18px;
  border-bottom: 0;
  border-left: 0;
}

.corner-bl {
  bottom: 18px;
  left: 18px;
  border-top: 0;
  border-right: 0;
}

.corner-br {
  right: 18px;
  bottom: 18px;
  border-top: 0;
  border-left: 0;
}

/* —— 底部符号数据条 —— */
.data-strip {
  position: absolute;
  right: var(--space);
  bottom: var(--space);
  display: flex;
  gap: 10px;
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: rgb(34 211 238 / 0.6);
}

.strip-dim {
  opacity: 0.45;
}

.strip-blink {
  color: var(--c-accent-2);
  animation: cursor-blink 1.1s steps(2, start) infinite;
}

/* 窄屏：回退布局（内容左对齐、角标收进安全边距），设计签名保留 */
@media (max-width: 640px) {
  .hero {
    place-items: end center;
    padding-bottom: 96px;
  }

  .corner-tl,
  .corner-tr {
    top: 78px;
  }

  .data-strip {
    left: var(--space);
  }
}

@media (prefers-reduced-motion: reduce) {
  .glitch::before,
  .glitch::after {
    animation: none;
    clip-path: inset(0 0 100% 0);
  }

  .cursor,
  .strip-blink {
    animation: none;
  }

  .cta,
  .cta-arrow {
    transition: none;
  }

  .cta:active,
  .cta:hover .cta-arrow {
    transform: none;
  }
}
</style>
