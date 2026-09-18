<!--
  MinimalismHero - minimalism 风格的英雄区（/style/minimalism/ 首屏）
  ------------------------------------------------------------
  留白即设计的首屏：小字问候 → 大而轻的名字（font-weight 300
  的巨型字号，排版即视觉）→ 一句话身份 → 一段介绍 → 两个安静
  的下划线链接（页内锚点，通向文章 / 项目区块）。右侧一枚
  hairline 大圆 + 圆上一粒强调色小点，是全页唯一的几何装饰；
  底部一条细线的「落点」循环动画提示可向下滚动。
  reduced-motion 下动画全部静止。
-->
<template>
  <section id="top" data-section="top" class="hero">
    <div class="hero-orb" aria-hidden="true"/>
    <div class="hero-inner">
      <p class="hero-greeting scroll-reveal">{{ t('home.greeting') }}</p>
      <h1 class="hero-name scroll-reveal scroll-reveal-delay-1">{{ t('home.name') }}</h1>
      <p class="hero-tagline scroll-reveal scroll-reveal-delay-2">{{ t('home.tagline') }}</p>
      <p class="hero-desc scroll-reveal scroll-reveal-delay-3">{{ t('home.description') }}</p>
      <div class="hero-links scroll-reveal scroll-reveal-delay-4">
        <a class="hero-link" href="#posts">{{ t('home.viewBlog') }}</a>
        <a class="hero-link" href="#projects">{{ t('home.viewProjects') }}</a>
      </div>
    </div>
    <div class="hero-cue" aria-hidden="true"/>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
/* —— 首屏：撑满一屏，内容垂直居中（海报的视占领地） —— */
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: clamp(540px, 82vh, 840px);
  overflow: hidden;
}

.hero-inner {
  max-width: var(--page-w);
  margin: 0 auto;
  padding: var(--space);
}

/* —— 唯一的几何装饰：hairline 大圆 + 圆顶一粒鼠尾草色小点 —— */
.hero-orb {
  position: absolute;
  top: 50%;
  right: max(-9vw, -200px);
  width: clamp(240px, 36vw, 440px);
  aspect-ratio: 1;
  border: var(--border-w) solid var(--c-border);
  border-radius: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.hero-orb::after {
  content: '';
  position: absolute;
  top: calc(var(--border-w) * -4);
  left: 50%;
  width: 10px;
  height: 10px;
  background: var(--c-accent-2);
  border-radius: 50%;
}

/* —— 排版层级：小问候 → 巨大的轻 → 舒朗的说明 —— */
.hero-greeting {
  margin: 0;
  font-size: var(--fs-small);
  letter-spacing: 0.24em;
  color: var(--c-muted);
}

.hero-name {
  margin: 18px 0 0;
  font-family: var(--font-head);
  font-size: clamp(56px, 11vw, 120px);
  font-weight: 300;
  line-height: 1.04;
  letter-spacing: -0.02em;
  color: var(--c-text);
  overflow-wrap: break-word;
}

.hero-tagline {
  margin: 26px 0 0;
  font-size: clamp(17px, 2.2vw, 22px);
  font-weight: 400;
  color: var(--c-text);
}

.hero-desc {
  max-width: 52ch;
  margin: 10px 0 0;
  color: var(--c-muted);
}

/* —— 两个安静的链接：下划线渐显 + 强调色 —— */
.hero-links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 28px;
  margin-top: clamp(28px, 4vw, 44px);
}

.hero-link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 2px;
  font-weight: 500;
  color: var(--c-text);
  text-decoration: underline;
  text-decoration-color: var(--c-border);
  text-decoration-thickness: 1px;
  text-underline-offset: 8px;
  transition:
    color var(--transition),
    text-decoration-color var(--transition);
}

.hero-link:hover {
  color: var(--c-accent);
  text-decoration-color: var(--c-accent);
}

.hero-link:active {
  transform: var(--press-transform);
}

/* —— 底部落点提示：一条 hairline 细线上有一粒下落的强调点 —— */
.hero-cue {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: var(--border-w);
  height: 64px;
  overflow: hidden;
  background: var(--c-border);
}

.hero-cue::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--c-accent);
  transform: translateY(-100%);
  animation: hero-cue-drop 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes hero-cue-drop {
  0% {
    transform: translateY(-100%);
  }

  62%,
  100% {
    transform: translateY(100%);
  }
}

/* —— 窄屏：圆退到画面外只留一角，落点提示隐藏 —— */
@media (max-width: 640px) {
  .hero {
    min-height: clamp(500px, 78vh, 720px);
  }

  .hero-orb {
    right: -46vw;
  }

  .hero-cue {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-link {
    transition: none;
  }

  .hero-link:active {
    transform: none;
  }

  .hero-cue::after {
    animation: none;
    transform: translateY(0);
  }
}
</style>
