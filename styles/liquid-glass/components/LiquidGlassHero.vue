<!--
  LiquidGlassHero - liquid-glass 风格的英雄区
  ------------------------------------------------------------
  首屏撑满一屏的巨型玻璃主板（min-height 随视口缩放）：
  问候语 eyebrow → 巨型渐变名字（玻璃内部折射染色）→
  职业标签玻璃胶囊 → 简介文案 → 两颗玻璃 CTA（页内锚点）。
  玻璃签名全部在此呈现：半透填充、折射微染色、半透描边、
  上缘高光弧、顶部镜面高光、缓慢扫过的折射光带；周围漂浮
  两颗小玻璃片与字符装饰（aria-hidden），营造层叠景深。
-->
<template>
  <section id="home" data-section="home" class="hero-zone">
    <!-- 漂浮的小玻璃片（景深装饰，无业务含义） -->
    <span class="shard shard-1" aria-hidden="true"/>
    <span class="shard shard-2" aria-hidden="true"/>

    <div class="hero glass">
      <!-- 折射光带：缓慢扫过玻璃的镜面反光（纯装饰） -->
      <span class="sheen" aria-hidden="true"/>

      <div class="hero-body">
        <p class="greeting">{{ t('home.greeting') }}</p>
        <h1 class="name">{{ t('home.name') }}</h1>
        <p class="tagline">{{ t('home.tagline') }}</p>
        <p class="desc">{{ t('home.description') }}</p>

        <div class="cta-row">
          <a class="cta cta-primary" href="#projects">{{ t('home.viewProjects') }}</a>
          <a class="cta cta-ghost" href="#posts">{{ t('home.viewBlog') }}</a>
        </div>
      </div>

      <!-- 向下探索提示（纯装饰箭头，随呼吸浮动） -->
      <a class="scroll-hint" href="#about" :aria-label="t('nav.about')">
        <span class="hint-chevron" aria-hidden="true">▾</span>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.hero-zone {
  position: relative;
  display: grid;
  place-items: center;
  min-height: clamp(520px, 82vh, 860px);
  padding: var(--space) var(--gap);
}

/* —— 巨型玻璃主板：与导航同源的玻璃配方，模糊半径更深 —— */
.glass {
  position: relative;
  width: 100%;
  max-width: calc(var(--page-w) - 2 * var(--space));
  overflow: hidden;
  padding: clamp(32px, 6vw, 72px);
  background:
    linear-gradient(115deg, rgb(167 139 255 / 0.1), rgb(94 227 255 / 0.05) 46%, rgb(255 122 184 / 0.1)),
    linear-gradient(180deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.04));
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  box-shadow:
    var(--shadow),
    inset 0 1px 0 rgb(255 255 255 / 0.32),
    inset 0 -1px 0 rgb(255 255 255 / 0.06);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
}

@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: rgb(24 17 60 / 0.94);
  }
}

/* 上缘高光弧：消费 token 契约的 --deco（中亮两端渐隐） */
.glass::after {
  position: absolute;
  top: 0;
  right: 14%;
  left: 14%;
  height: 1px;
  content: '';
  background: var(--deco);
}

/* 顶部镜面高光：玻璃顶端的球面反光 */
.glass::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: radial-gradient(110% 55% at 50% 0%, rgb(255 255 255 / 0.2), transparent 62%);
}

/* 折射光带：斜向高光缓慢扫过玻璃（reduced-motion 下静止） */
.sheen {
  position: absolute;
  top: -30%;
  bottom: -30%;
  left: -40%;
  width: 34%;
  pointer-events: none;
  content: '';
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.09), transparent);
  transform: rotate(14deg);
  animation: sheen-sweep 9s cubic-bezier(0.45, 0, 0.2, 1) infinite;
}

@keyframes sheen-sweep {
  0% {
    left: -40%;
    opacity: 0;
  }

  12% {
    opacity: 1;
  }

  46% {
    opacity: 1;
  }

  58%,
  100% {
    left: 116%;
    opacity: 0;
  }
}

.hero-body {
  position: relative;
  max-width: 30em;
}

/* 问候 eyebrow：强调色小字 + 发光字距 */
.greeting {
  margin: 0 0 6px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.22em;
  color: var(--c-accent);
}

/* 巨型名字：玻璃后的折射染色文字（强调色 → 电光紫 → 霓虹粉签名渐变） */
.name {
  margin: 0 0 18px;
  font-family: var(--font-head);
  font-size: clamp(44px, 9vw, 108px);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
  background: linear-gradient(100deg, var(--c-text) 8%, var(--c-accent) 42%, var(--c-accent-2) 72%, #ff7ab8 96%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  filter: drop-shadow(0 6px 24px rgb(94 227 255 / 0.18));
}

/* 职业标签：玻璃内胶囊（半透白 + 半透描边） */
.tagline {
  display: inline-block;
  margin: 0 0 14px;
  padding: 8px 16px;
  font-size: var(--fs-base);
  color: var(--c-text);
  background: rgb(255 255 255 / 0.09);
  border: var(--border-w) solid rgb(255 255 255 / 0.22);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.25);
}

.desc {
  max-width: 46ch;
  margin: 0;
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-muted);
}

/* CTA 行：主按钮（液态渐变玻璃）+ 幽灵按钮（透明玻璃） */
.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
  margin-top: 30px;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 12px 26px;
  font-size: var(--fs-base);
  font-weight: 600;
  text-decoration: none;
  border-radius: 999px;
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.cta-primary {
  color: var(--c-on-accent);
  background: linear-gradient(140deg, var(--c-accent), var(--c-accent-2));
  border: var(--border-w) solid rgb(255 255 255 / 0.4);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.55),
    0 10px 26px rgb(94 227 255 / 0.3);
}

.cta-primary:hover {
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.55),
    0 14px 34px rgb(94 227 255 / 0.45);
  transform: translateY(-2px);
}

.cta-primary:active {
  transform: var(--press-transform);
}

.cta-ghost {
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.28);
}

.cta-ghost:hover {
  background: rgb(255 255 255 / 0.13);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.34),
    0 10px 24px rgb(4 2 18 / 0.3);
  transform: translateY(-2px);
}

.cta-ghost:active {
  transform: var(--press-transform);
}

/* 向下探索：呼吸浮动的玻璃圆钮 */
.scroll-hint {
  position: absolute;
  bottom: 22px;
  left: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: var(--c-muted);
  text-decoration: none;
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: 50%;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.3);
  transform: translateX(-50%);
  transition:
    color var(--transition),
    background var(--transition);
  animation: hint-bob 2.6s ease-in-out infinite;
}

.scroll-hint:hover {
  color: var(--c-accent);
  background: rgb(255 255 255 / 0.12);
}

@keyframes hint-bob {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }

  50% {
    transform: translateX(-50%) translateY(6px);
  }
}

/* 漂浮小玻璃片：层叠景深装饰 */
.shard {
  position: absolute;
  display: block;
  pointer-events: none;
  background: linear-gradient(140deg, rgb(255 255 255 / 0.14), rgb(255 255 255 / 0.03));
  border: var(--border-w) solid rgb(255 255 255 / 0.22);
  box-shadow:
    0 14px 30px rgb(4 2 18 / 0.35),
    inset 0 1px 0 rgb(255 255 255 / 0.35);
}

.shard-1 {
  width: 92px;
  height: 92px;
  top: 14%;
  right: 8%;
  border-radius: 30% 70% 62% 38% / 46% 40% 60% 54%;
  animation: shard-bob 11s ease-in-out infinite alternate;
}

.shard-2 {
  width: 60px;
  height: 60px;
  bottom: 16%;
  left: 6%;
  border-radius: 62% 38% 44% 56% / 52% 60% 40% 48%;
  animation: shard-bob 14s ease-in-out infinite alternate-reverse;
}

@keyframes shard-bob {
  from {
    transform: translate3d(0, -8px, 0) rotate(-3deg);
  }

  to {
    transform: translate3d(0, 10px, 0) rotate(4deg);
  }
}

/* 窄屏：布局回退（单列、缩小留白），玻璃签名保留 */
@media (max-width: 640px) {
  .shard-1 {
    top: 6%;
    right: -18px;
    opacity: 0.7;
  }

  .shard-2 {
    left: -14px;
    opacity: 0.7;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sheen,
  .scroll-hint,
  .shard-1,
  .shard-2 {
    animation: none;
  }

  .cta-primary,
  .cta-ghost {
    transition: none;
  }

  .cta-primary:hover,
  .cta-ghost:hover {
    transform: none;
  }

  .cta-primary:active,
  .cta-ghost:active {
    transform: none;
  }
}
</style>
