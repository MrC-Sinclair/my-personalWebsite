<!--
  FlatDesignHero - 扁平化风格英雄区
  ------------------------------------------------------------
  全宽强调蓝纯色带，首屏撑满一屏：问候语 / 特大名字 / 一句话
  身份 / 简介 + 两个扁平按钮（页内锚点）。装饰全部是纯 CSS
  几何图形（圆环 / 色点 / 三角 / 方框），无纹理无阴影。
-->
<template>
  <section class="hero">
    <div class="hero__inner">
      <span class="hero__bar" aria-hidden="true"/>
      <p class="hero__greeting">{{ t('home.greeting') }}</p>
      <h1 class="hero__name">{{ t('home.name') }}</h1>
      <p class="hero__tagline">{{ t('home.tagline') }}</p>
      <p class="hero__desc">{{ t('home.description') }}</p>
      <div class="hero__actions">
        <a href="#blog" class="hero__btn hero__btn--primary">{{ t('home.viewBlog') }}</a>
        <a href="#projects" class="hero__btn hero__btn--ghost">{{ t('home.viewProjects') }}</a>
      </div>
    </div>

    <!-- 几何装饰：纯 CSS 图形，屏幕阅读器不可见 -->
    <span class="geo geo--ring" aria-hidden="true"/>
    <span class="geo geo--square" aria-hidden="true"/>
    <span class="geo geo--dot" aria-hidden="true"/>
    <span class="geo geo--tri" aria-hidden="true"/>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  background: var(--c-accent);
  color: #ffffff;
}

.hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: clamp(520px, 78vh, 800px);
  max-width: var(--page-w);
  margin-inline: auto;
  padding: clamp(56px, 9vw, 88px) clamp(16px, 4vw, 40px);
}

/* 强调色条：本风格的「节」签名，开场第一笔 */
.hero__bar {
  width: 56px;
  height: 6px;
  margin-bottom: clamp(16px, 2.5vw, 24px);
  background: var(--deco);
  border-radius: var(--radius-sm);
}

.hero__greeting {
  margin: 0;
  font-size: clamp(15px, 2vw, 18px);
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 0.88);
}

/* 名字：标题大到不合理，扁平粗字重（与 metro 细字重区分） */
.hero__name {
  margin: 6px 0 0;
  font-family: var(--font-head);
  font-size: clamp(44px, 8.5vw, 92px);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.015em;
  overflow-wrap: break-word;
}

.hero__tagline {
  margin: clamp(12px, 2vw, 18px) 0 0;
  font-size: clamp(17px, 2.4vw, 22px);
  font-weight: 600;
  color: #ffffff;
}

.hero__desc {
  margin: 10px 0 0;
  max-width: 560px;
  font-size: var(--fs-base);
  line-height: 1.8;
  color: rgb(255 255 255 / 0.85);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: clamp(20px, 3vw, 30px);
}

/* 扁平按钮：反馈只有颜色变化（变深 / 变透），无位移无阴影 */
.hero__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 26px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  border-radius: var(--radius);
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition);
}

.hero__btn--primary {
  background: var(--deco);
  color: var(--c-text);
}

.hero__btn--primary:hover {
  background: #d9ac0b;
}

.hero__btn--primary:active {
  background: #c39c0a;
}

.hero__btn--ghost {
  border: 2px solid rgb(255 255 255 / 0.7);
  color: #ffffff;
}

.hero__btn--ghost:hover {
  background: rgb(255 255 255 / 0.16);
  border-color: #ffffff;
}

.hero__btn--ghost:active {
  background: rgb(255 255 255 / 0.26);
}

.hero__btn:focus-visible {
  outline: 3px solid #ffffff;
  outline-offset: 2px;
}

/* —— 纯 CSS 几何装饰 —— */
.geo {
  position: absolute;
  display: block;
}

/* 大圆环 */
.geo--ring {
  top: 10%;
  right: 5%;
  width: clamp(120px, 18vw, 220px);
  aspect-ratio: 1;
  border: clamp(12px, 2vw, 18px) solid rgb(255 255 255 / 0.16);
  border-radius: 50%;
}

/* 描边方框（静置旋转，无过渡） */
.geo--square {
  top: 18%;
  right: 30%;
  width: 84px;
  height: 84px;
  border: 10px solid rgb(255 255 255 / 0.22);
  transform: rotate(14deg);
}

/* 向日葵黄色点 */
.geo--dot {
  bottom: 22%;
  right: 27%;
  width: 44px;
  height: 44px;
  background: var(--deco);
  border-radius: 50%;
}

/* 半透明白三角 */
.geo--tri {
  bottom: 12%;
  right: 9%;
  width: 0;
  height: 0;
  border-left: 34px solid transparent;
  border-right: 34px solid transparent;
  border-bottom: 56px solid rgb(255 255 255 / 0.2);
}

/* 窄屏：收起大几何（回退布局不回退设计，色带与小色点保留） */
@media (max-width: 720px) {
  .geo--ring,
  .geo--square {
    display: none;
  }

  .geo--tri {
    border-left-width: 22px;
    border-right-width: 22px;
    border-bottom-width: 36px;
  }

  .geo--dot {
    width: 32px;
    height: 32px;
  }
}
</style>
