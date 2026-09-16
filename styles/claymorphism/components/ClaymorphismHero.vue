<!--
  ClaymorphismHero - claymorphism 风格英雄区
  ------------------------------------------------------------
  撑满首屏的黏土舞台：漂浮黏土球装饰层 + 居中堆叠的
  「问候胶囊 → 巨型名字 → 职签 → 简介 → 双 CTA 胶囊」。
  标题大到不合理（clamp 到 88px），名字嵌在一颗巨大的
  近白黏土胶囊里；CTA 为紫 / 薄荷两颗厚胶囊，hover 浮起、
  按下压扁（本风格标志反馈）。
  页内跳转用原生锚点（#posts / #projects），SSR 安全。
-->
<template>
  <section id="top" class="hero">
    <!-- 漂浮黏土球装饰层（纯 CSS，aria-hidden） -->
    <ClaymorphismBlobField/>

    <div class="hero-inner">
      <p class="greeting-chip">{{ t('home.greeting') }}</p>

      <h1 class="name-pill">
        <span class="name-text">{{ t('home.name') }}</span>
      </h1>

      <p class="tagline">{{ t('home.tagline') }}</p>
      <p class="desc">{{ t('home.description') }}</p>

      <div class="cta-row">
        <NuxtLink class="cta cta-purple" :to="{ hash: '#posts' }">
          {{ t('home.viewBlog') }}
        </NuxtLink>
        <NuxtLink class="cta cta-mint" :to="{ hash: '#projects' }">
          {{ t('home.viewProjects') }}
        </NuxtLink>
      </div>
    </div>

    <!-- 底部黏土云：大圆角弧形收边（纯 CSS 装饰） -->
    <div class="cloud" aria-hidden="true"/>
  </section>
</template>

<script setup lang="ts">
// styles/ 下组件不走自动导入，风格内组件显式 import
import ClaymorphismBlobField from './ClaymorphismBlobField.vue'

const { t } = useI18n()
</script>

<style scoped>
/* 首屏撑满一屏：海报舞台，不是文档标题 */
.hero {
  position: relative;
  display: grid;
  place-items: center;
  min-height: clamp(540px, 86vh, 860px);
  padding: clamp(56px, 10vh, 96px) var(--gap) clamp(72px, 12vh, 120px);
  overflow: hidden;
}

.hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 820px;
  text-align: center;
}

/* 问候胶囊：小颗紫黏土 */
.greeting-chip {
  display: inline-block;
  margin: 0 0 18px;
  padding: 8px 22px;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-radius: 999px;
  box-shadow:
    0 10px 18px rgb(125 63 201 / 0.32),
    inset 0 5px 9px rgb(255 255 255 / 0.4),
    inset 0 -5px 8px rgb(90 40 150 / 0.25);
}

/* 名字：嵌进一颗巨大的近白黏土胶囊（标题大到不合理） */
.name-pill {
  display: inline-block;
  margin: 0 0 20px;
  padding: clamp(20px, 4vw, 40px) clamp(28px, 6vw, 72px);
  background: var(--c-surface);
  border-radius: clamp(40px, 8vw, 64px);
  box-shadow: var(--shadow);
  transition: transform var(--transition);
}

.name-pill:active {
  transform: var(--press-transform);
}

.name-text {
  display: block;
  font-size: clamp(44px, 9vw, 88px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: 0.01em;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

/* 职签：加粗正文色 + 黏土质感小胶囊两枚包夹 */
.tagline {
  margin: 0 0 10px;
  font-size: clamp(17px, 2.4vw, 21px);
  font-weight: 700;
  color: var(--c-text);
}

.desc {
  max-width: 56ch;
  margin: 0 0 30px;
  color: var(--c-muted);
}

/* —— CTA 双胶囊：紫（主）/ 薄荷（次） —— */
.cta-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--gap);
}

.cta {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding: 12px 30px;
  font-size: var(--fs-base);
  font-weight: 700;
  text-decoration: none;
  border-radius: 999px;
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.cta:active {
  transform: var(--press-transform);
}

/* 紫黏土胶囊（内高光 + 内底影 + 外双层影 = 厚重 3D） */
.cta-purple {
  color: var(--c-on-accent);
  background: var(--c-accent);
  box-shadow:
    0 16px 28px rgb(125 63 201 / 0.35),
    0 5px 10px rgb(125 63 201 / 0.2),
    inset 0 7px 12px rgb(255 255 255 / 0.4),
    inset 0 -7px 10px rgb(90 40 150 / 0.3);
}

.cta-purple:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    0 22px 36px rgb(125 63 201 / 0.4),
    0 8px 14px rgb(125 63 201 / 0.22),
    inset 0 7px 12px rgb(255 255 255 / 0.4),
    inset 0 -7px 10px rgb(90 40 150 / 0.3);
}

/* 薄荷黏土胶囊 */
.cta-mint {
  color: #1d6a45;
  background: #8fddb7;
  box-shadow:
    0 16px 28px rgb(90 175 135 / 0.35),
    0 5px 10px rgb(90 175 135 / 0.2),
    inset 0 7px 12px rgb(255 255 255 / 0.55),
    inset 0 -7px 10px rgb(70 145 105 / 0.3);
}

.cta-mint:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    0 22px 36px rgb(90 175 135 / 0.4),
    0 8px 14px rgb(90 175 135 / 0.22),
    inset 0 7px 12px rgb(255 255 255 / 0.55),
    inset 0 -7px 10px rgb(70 145 105 / 0.3);
}

/* 底部黏土云：超大圆角白弧 + 两侧凸圆（纯 CSS） */
.cloud {
  position: absolute;
  bottom: -46px;
  left: 50%;
  width: min(140vw, 1500px);
  height: 120px;
  background: var(--c-surface);
  border-radius: 50% 50% 0 0;
  box-shadow: 0 -14px 30px rgb(150 90 210 / 0.12);
  transform: translateX(-50%);
}

/* 云上的凸圆（纯 CSS，无图片） */
.cloud::before,
.cloud::after {
  position: absolute;
  top: -26px;
  width: 96px;
  height: 96px;
  content: '';
  background: var(--c-surface);
  border-radius: 50%;
}

.cloud::before {
  left: 16%;
}

.cloud::after {
  right: 18%;
}

@media (max-width: 640px) {
  /* 窄屏：布局回退为更紧凑的堆叠，黏土配方（厚重胶囊 + 内高光）保留 */
  .hero {
    min-height: clamp(480px, 78vh, 680px);
  }

  .name-pill {
    border-radius: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .name-pill,
  .cta {
    transition: none;
  }

  .name-pill:active,
  .cta:active,
  .cta-purple:hover,
  .cta-mint:hover {
    transform: none;
  }
}
</style>
