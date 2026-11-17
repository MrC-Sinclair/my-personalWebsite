<!--
  LiquidGlassHero - liquid-glass 风格的英雄区
  ------------------------------------------------------------
  首屏撑满一屏的巨型玻璃主板（min-height 随视口缩放）：
  卡内拆成「左主内容 + 右真实文章侧栏」——左侧是问候 /
  纯色巨型名字 / 职业胶囊 / 简介 / 两颗玻璃 CTA，右侧是
  最新三篇真实文章（标题 / 日期 / 分类 / 详情链接）。
  评审点名的两处廉价感已修：巨型名字从四段蓝紫渐变填充改纯色，
  实心主按钮从高饱和青紫渐变降为单色。玻璃签名（半透填充、
  板下光源、透镜环、镜面高光、折射光带）保留，且背景光斑
  现在有真实内容可透。数据来自共享层 useBlog（首页 props 传入）。
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

      <!-- 卡内拆成主内容 + 真实文章侧栏：原来整块卡只装六段序列，
           视觉重心散且玻璃后面没有内容可透。侧栏用最新三篇真实文章。 -->
      <div class="hero-body">
        <div class="hero-main">
          <p class="greeting">{{ t('home.greeting') }}</p>
          <h1 class="name">{{ t('home.name') }}</h1>
          <p class="tagline">{{ t('home.tagline') }}</p>
          <p class="desc">{{ t('home.description') }}</p>

          <div class="cta-row">
            <a class="cta cta-primary" href="#projects">{{ t('home.viewProjects') }}</a>
            <a class="cta cta-ghost" href="#posts">{{ t('home.viewBlog') }}</a>
          </div>
        </div>

        <aside class="hero-side" :aria-label="t('home.latestPosts')">
          <p class="side-kicker">{{ t('home.latestPosts') }}</p>

          <div v-if="pending" class="side-loading" role="status">
            <p class="sr-only">{{ t('common.loading') }}</p>
            <span v-for="i in SIDE_COUNT" :key="i" class="side-loading-line" aria-hidden="true"/>
          </div>

          <ol v-else-if="sideItems.length" class="side-list">
            <li v-for="item in sideItems" :key="item.to">
              <NuxtLink class="liquid-hero-item" :to="item.to">
                <span class="side-main">
                  <span class="side-title">{{ item.title }}</span>
                  <span class="side-meta">
                    <time :datetime="item.date">{{ item.dateText }}</time>
                    <span v-if="item.category">{{ item.category }}</span>
                  </span>
                </span>
                <span class="side-arrow" aria-hidden="true">→</span>
              </NuxtLink>
            </li>
          </ol>
          <p v-else class="side-empty">{{ t('blog.noResults') }}</p>
        </aside>
      </div>

      <!-- 向下探索提示（纯装饰箭头，随呼吸浮动） -->
      <a class="scroll-hint" href="#about" :aria-label="t('nav.about')">
        <span class="hint-chevron" aria-hidden="true">▾</span>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import { contentSlug } from '~/utils/content'
import { formatDate } from '~/utils/format'

const props = defineProps<{
  /** 最新文章列表（来自共享层 useBlog，由首页传入） */
  posts: BlogPost[]
  /** 数据是否仍在加载（加载时显示补白行，不误报空状态） */
  pending?: boolean
}>()

/** 侧栏展示的文章条数 */
const SIDE_COUNT = 3

const { t, locale } = useI18n()
// 详情链接走共享层，风格层不重写路由拼接
const { postPath } = useStyleContentPath()

const dateLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))

/** 侧栏条目：把共享层数据映射成真实内容（标题 / 日期 / 分类 / 链接） */
const sideItems = computed(() =>
  props.posts.slice(0, SIDE_COUNT).map((post) => ({
    title: post.title,
    date: post.date,
    dateText: formatDate(post.date, dateLocale.value),
    category: post.category ?? '',
    to: postPath(contentSlug(post.path)),
  })),
)
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
  padding: 20px;
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
  padding: 8px;
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

/* 卡内两栏：左主内容 / 右真实文章侧栏，玻璃后面有内容可透 */
.hero-body {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(24px, 4vw, 56px);
  align-items: start;
}

@media (min-width: 900px) {
  .hero-body {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  }
}

.hero-main {
  min-width: 0;
}

/* 问候 eyebrow：强调色小字 + 发光字距 */
.greeting {
  margin: 0 0 8px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.22em;
  color: var(--c-accent);
}

/* 巨型名字：去掉四段渐变填充改纯色。评审点名「标题文字用蓝紫渐变
   填充显廉价」——纯色 + 一层极淡的字距光晕，层级靠字号与字重，
   不靠染色。玻璃的冷调由背景与边缘光学承担。 */
.name {
  margin: 0 0 20px;
  font-family: var(--font-head);
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.02em;
  color: var(--c-text);
  overflow-wrap: anywhere;
  text-shadow: 0 6px 30px rgb(94 227 255 / 0.14);
}

/* 职业标签：玻璃内胶囊（半透白 + 半透描边） */
.tagline {
  display: inline-block;
  margin: 0 0 16px;
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
  margin-top: 32px;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 12px 28px;
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

/* 主按钮：从高饱和青紫双色渐变降为单色强调 + 淡顶边。
   评审「降饱和」——彩色渐变实心块在玻璃上是最抢眼的塑料感来源。 */
.cta-primary {
  color: var(--c-on-accent);
  background: color-mix(in srgb, var(--c-accent) 78%, var(--c-surface));
  border: var(--border-w) solid rgb(255 255 255 / 0.16);
  box-shadow:
    inset 0 1px 0 var(--lg-bevel-solid),
    0 10px 26px rgb(94 227 255 / 0.22);
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

/* —— 真实文章侧栏：玻璃卡里的内容主体 —— */
.hero-side {
  min-width: 0;
  padding: clamp(16px, 2vw, 24px);
  background: rgb(255 255 255 / 0.05);
  border: var(--border-w) solid rgb(255 255 255 / 0.14);
  border-radius: var(--radius-sm);
  box-shadow: inset 0 1px 0 var(--lg-bevel);
}

.side-kicker {
  margin: 0 0 8px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.2em;
  color: var(--c-accent);
}

.side-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.liquid-hero-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: var(--scale-hit);
  padding: 12px 4px;
  color: var(--c-text);
  text-decoration: none;
  border-top: var(--border-w) solid rgb(255 255 255 / 0.12);
  transition:
    background var(--transition),
    transform var(--transition);
}

.side-list li:last-child .liquid-hero-item {
  border-bottom: var(--border-w) solid rgb(255 255 255 / 0.12);
}

.liquid-hero-item:hover {
  background: rgb(255 255 255 / 0.07);
  transform: translateX(3px);
}

.side-main {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.side-title {
  font-size: var(--scale-body);
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.side-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.side-arrow {
  flex: none;
  margin-left: auto;
  color: var(--c-accent);
  opacity: 0.75;
  transition: transform var(--transition);
}

.liquid-hero-item:hover .side-arrow {
  transform: translateX(4px);
}

.side-empty {
  margin: 0;
  padding: 12px 0;
  font-size: var(--fs-base);
  color: var(--c-muted);
}

.side-loading {
  display: grid;
  gap: var(--gap);
}

.side-loading-line {
  height: var(--scale-space-5);
  background: rgb(255 255 255 / 0.08);
  border-radius: var(--radius-sm);
  animation: side-breathe 1.4s ease-in-out infinite;
}

@keyframes side-breathe {
  0%,
  100% {
    opacity: 0.4;
  }

  50% {
    opacity: 1;
  }
}

.sr-only {
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  white-space: nowrap;
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

/* 窄屏：两栏回退单列，玻璃签名与真实内容侧栏都保留 */
@media (max-width: 640px) {
  .hero-body {
    gap: var(--gap);
  }

  .hero-side {
    padding: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sheen,
  .scroll-hint,
  .side-loading-line {
    animation: none;
  }

  .cta-primary,
  .cta-ghost,
  .liquid-hero-item,
  .side-arrow {
    transition: none;
  }

  .liquid-hero-item:hover,
  .liquid-hero-item:hover .side-arrow {
    transform: none;
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
