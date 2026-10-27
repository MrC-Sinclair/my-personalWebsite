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
    <!-- 漂浮小玻璃片已整体移除：不承载任何信息的漂浮方块在深底上
         只会变成一团被读成「模糊污渍」的深色形状，而 iOS 的界面里
         不存在无意义的漂浮装饰。景深改由玻璃板自身的边缘光学承担。 -->

    <!--
      板下光源：位于玻璃板正下方的两团彩色光。
      存在的理由：玻璃的通透感不是靠把板子调透明，而是靠「板内有东西
      可看」。全局背景的光斑离板太远、太散，采样进板里只剩一片均匀
      暗色，玻璃因此读起来是实心的。这两团光紧贴 hero 板（一部分露在
      板外、一部分被板盖住），露在外面的部分清晰、被盖住的部分经
      backdrop-blur 柔化——「同一团光在玻璃内外呈现两种清晰度」，
      这正是玻璃透光的判据，也是本轮最关键的一处改动。
    -->
    <span class="glow glow-1" aria-hidden="true"/>
    <span class="glow glow-2" aria-hidden="true"/>

    <div class="hero glass">
      <!-- 折射环 + 扫光带：玻璃边缘的光学增厚与镜面反光（纯装饰） -->
      <span class="lens" aria-hidden="true"/>
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

/* —— 板下光源 ——
   两团紧贴玻璃板的高亮彩色光，是板内「有东西可透」的保证。
   尺寸刻意做大（46vmin / 38vmin）且跨过板的边界：只有一部分被板
   盖住，玻璃内外才形成可对比的清晰度差；完全藏在板后的光只会让板
   内变亮，看不出「透」。 */
.glow {
  position: absolute;
  display: block;
  border-radius: 50%;
  pointer-events: none;
}

.glow-1 {
  width: 46vmin;
  height: 46vmin;
  /* 亮核必须露在板外：top 取负值把光团中心推到板的上边界之上，
     于是板外能看到一团清晰的紫光、板内看到它柔化后的延续——
     「同一光源、两种清晰度」才是透光的判据。中心若落在板内，
     外面只剩一圈几乎看不见的暗边，等于没有光源。 */
  left: 14%;
  top: -12%;
  background: radial-gradient(closest-side, rgb(139 108 255 / 0.75), rgb(124 92 255 / 0.28) 52%, transparent 74%);
}

.glow-2 {
  width: 38vmin;
  height: 38vmin;
  /* 同上：亮核推到板的下边界之下 */
  right: 16%;
  bottom: -10%;
  background: radial-gradient(closest-side, rgb(94 227 255 / 0.6), rgb(94 227 255 / 0.22) 52%, transparent 74%);
}

/* —— 巨型玻璃主板 ——
   hero 是全站最大的一块玻璃，取分级里最深的一档模糊（--lg-blur-lg）
   与最散的一档投影（--lg-shadow-lg 已并入 --shadow-lg）。
   三次迭代：删掉了这里的 3 层填充渐变、4 条 inset 边缘光、2 道色散
   细线——它们叠在一块 1000px 宽的大板上时，互相抵消的结果是板子
   整片发灰，越大的板子越明显（面积越大，叠加的浑浊越容易被看见）。
   现在它与 Panel 共用同一套四项配方，只是尺寸档位更高。 */
.glass {
  position: relative;
  width: 100%;
  max-width: calc(var(--page-w) - 2 * var(--space));
  overflow: hidden;
  padding: clamp(32px, 6vw, 72px);
  background: var(--lg-depth), var(--lg-fill);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(var(--lg-blur-lg)) saturate(1.3) brightness(1.04) contrast(1.14);
  -webkit-backdrop-filter: blur(var(--lg-blur-lg)) saturate(1.3) brightness(1.04) contrast(1.14);
}

@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: rgb(24 17 60 / 0.94);
  }
}

/* 镜面高光环：大板子的环要略宽一点（1.2px 在 1000px 宽的板子上
   会细到看不见），亮度仍沿轮廓连续衰减 */
.glass::after {
  position: absolute;
  inset: 0;
  padding: 1.6px;
  border-radius: inherit;
  pointer-events: none;
  content: '';
  background: var(--lg-spec);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

/* 顶部镜面泛光：与 Panel 同源 */
.glass::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: var(--lg-luster);
}

/* 折射环：与 Panel 同源，大板子加宽到 18px（尺寸越大，边缘的
   光学过渡区在视觉上就该越宽，否则会像描了一条边） */
.lens {
  position: absolute;
  inset: 0;
  padding: 18px;
  border-radius: inherit;
  pointer-events: none;
  /* 透镜环带 + 折射染色 */
  backdrop-filter: blur(6px) saturate(1.7) brightness(1.15) contrast(1.1);
  -webkit-backdrop-filter: blur(6px) saturate(1.7) brightness(1.15) contrast(1.1);
  background: var(--lg-refract);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

.lens::after {
  position: absolute;
  inset: 0;
  padding: 7px;
  border-radius: inherit;
  content: '';
  /* 透镜环带 + 折射染色 */
  backdrop-filter: blur(6px) saturate(1.7) brightness(1.15) contrast(1.1);
  -webkit-backdrop-filter: blur(6px) saturate(1.7) brightness(1.15) contrast(1.1);
  background: var(--lg-refract);
  opacity: 0.6;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

/* 折射光带：斜向高光缓慢扫过玻璃（reduced-motion 下静止）
   三次迭代：峰值从 1 压到 0.45、周期从 9s 拉到 14s。一道总在板上
   来回滚的亮条是玻璃拟态最俗套的动效，压暗放慢之后它才像「光掠过
   表面」而不是「特效在播放」。 */
.sheen {
  position: absolute;
  top: -30%;
  bottom: -30%;
  left: -40%;
  width: 34%;
  pointer-events: none;
  content: '';
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.06), transparent);
  transform: rotate(14deg);
  animation: sheen-sweep 14s cubic-bezier(0.45, 0, 0.2, 1) infinite;
}

@keyframes sheen-sweep {
  0% {
    left: -40%;
    opacity: 0;
  }

  12% {
    opacity: 0.45;
  }

  46% {
    opacity: 0.45;
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
  overflow-wrap: break-word;
  /* 尾色从霓虹粉 #ff7ab8 换成淡紫 #e6d9ff：荧光粉在深底上是最扎眼的
     一档，会把整个标题拽向「霓虹感」而离开玻璃的冷调。收在淡紫，
     渐变从白到青到紫是连续的，不会再有末梢突然跳色的断层感。 */
  background: linear-gradient(100deg, var(--c-text) 6%, var(--c-accent) 40%, var(--c-accent-2) 72%, #e6d9ff 96%);
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
  box-shadow: inset 0 1px 0 var(--lg-bevel);
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
  /* 描边从 0.4 降到 0.16：实心按钮上的亮白描边是最典型的塑料感来源，
     Apple 的 filled button 只有一层极淡的顶边，没有整圈白框 */
  border: var(--border-w) solid rgb(255 255 255 / 0.16);
  box-shadow:
    inset 0 1px 0 var(--lg-bevel-solid),
    0 10px 26px rgb(94 227 255 / 0.3);
}

.cta-primary:hover {
  box-shadow:
    inset 0 1px 0 var(--lg-bevel-solid),
    0 14px 34px rgb(94 227 255 / 0.45);
  transform: translateY(-2px);
}

.cta-primary:active {
  transform: var(--press-transform);
}

.cta-ghost {
  color: var(--c-text);
  background: rgb(255 255 255 / 0.09);
  border: var(--border-w) solid var(--c-border);
  box-shadow: inset 0 1px 0 var(--lg-bevel);
}

.cta-ghost:hover {
  background: rgb(255 255 255 / 0.14);
  box-shadow:
    inset 0 1px 0 var(--lg-bevel-solid),
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
  box-shadow: inset 0 1px 0 var(--lg-bevel);
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

/* 窄屏：布局回退（单列、缩小留白），玻璃签名保留 */
@media (max-width: 640px) {
  .hero-body {
    max-width: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sheen,
  .scroll-hint {
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
