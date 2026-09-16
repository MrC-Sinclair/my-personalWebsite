<!--
  NeoBrutalismHero - neo-brutalism 风格首屏英雄区
  ------------------------------------------------------------
  海报式首屏：撑满一屏（min-height clamp），问候语做成歪斜的
  黑底反白标签，名字大到不合理（clamp 最大 140px）并垫一块
  海报黄硬影，下方动作按钮组全部为原生锚点跳页内区块。
  右侧挂一块 45° 斜纹装饰方块（纯 CSS，--deco 图案），
  右下角一枚上下蹦跳的 ↓ 符号（reduced-motion 下静止）。
-->
<template>
  <section class="hero">
    <p class="badge">{{ t('home.greeting') }}</p>
    <h1 class="name">{{ t('home.name') }}</h1>
    <p class="tagline">{{ t('home.tagline') }}</p>
    <p class="desc">{{ t('home.description') }}</p>

    <div class="actions">
      <a class="btn is-fill" href="#works">{{ t('home.viewProjects') }}</a>
      <a class="btn" href="#posts">{{ t('home.viewBlog') }}</a>
      <a class="btn is-blue" href="#contact">{{ t('nav.contact') }}</a>
    </div>

    <!-- 纯 CSS 几何装饰：斜纹方块 -->
    <span class="deco" aria-hidden="true"/>
    <span class="scroll-hint" aria-hidden="true">↓</span>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: var(--gap);
  min-height: clamp(560px, 82vh, 860px);
  padding: 48px 0 72px;
  border-bottom: calc(var(--border-w) * 2) solid var(--c-border);
  overflow: hidden;
}

/* —— 问候标签：歪斜的橡皮章 —— */
.badge {
  margin: 0;
  padding: 4px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--c-bg);
  background: var(--c-text);
  transform: rotate(-1.2deg);
}

/* —— 巨型名字：海报黄硬影垫底 —— */
.name {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(40px, 10vw, 140px);
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--c-text);
  text-shadow: 6px 6px 0 var(--c-accent);
  overflow-wrap: anywhere;
}

.tagline {
  margin: 0;
  max-width: 36ch;
  font-size: 19px;
  font-weight: 700;
  color: var(--c-text);
}

.desc {
  margin: 0;
  max-width: 58ch;
  color: var(--c-muted);
}

/* —— 动作按钮组 —— */
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 12px 22px;
  font-family: var(--font-head);
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  box-shadow: var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    background var(--transition);
}

.btn.is-fill {
  background: var(--c-accent);
  color: var(--c-on-accent);
}

.btn.is-blue {
  background: var(--c-accent-2);
  color: var(--c-surface);
}

.btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 8px 8px 0 var(--c-border);
}

.btn:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

.btn:focus-visible {
  outline: var(--border-w) solid var(--c-accent-2);
  outline-offset: 3px;
}

/* —— 装饰：45° 斜纹方块（--deco 图案） —— */
.deco {
  position: absolute;
  top: 50%;
  right: 24px;
  width: clamp(110px, 14vw, 180px);
  aspect-ratio: 1;
  background: var(--deco);
  border: 4px solid var(--c-border);
  transform: translateY(-50%) rotate(-8deg);
  pointer-events: none;
}

/* —— 装饰：蹦跳的下滑箭头 —— */
.scroll-hint {
  position: absolute;
  right: 10px;
  bottom: 20px;
  font-size: 30px;
  font-weight: 900;
  color: var(--c-text);
  animation: nb-bob 1.1s ease-in-out infinite;
}

@keyframes nb-bob {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(10px);
  }
}

/* —— 窄屏：只回退布局，粗边框 / 撞色 / 硬影全部保留 —— */
@media (max-width: 860px) {
  .hero {
    min-height: auto;
    padding: 40px 0 56px;
  }

  /* 装饰元素窄屏会挤压正文，收掉 */
  .deco {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn,
  .scroll-hint {
    animation: none;
    transition: none;
  }

  .btn:hover {
    transform: none;
  }

  .btn:active,
  .scroll-hint {
    transform: none;
  }
}
</style>
