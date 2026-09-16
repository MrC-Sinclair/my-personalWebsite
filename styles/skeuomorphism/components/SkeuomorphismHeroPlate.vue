<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismHeroPlate - 拟物风格英雄区
  ------------------------------------------------------------
  一整块钉在木桌上的「皮革横幅」：四角黄铜铆钉 + 内圈缝线 +
  左上暖光（明确光源方向）；问候语与简介为烫印在皮革上的
  象牙字，站名为烫金压花大字。下方两颗实体按钮（木质/黄铜）
  按压有 inset 行程感，均为页内锚点（不写业务逻辑）。
-->
<template>
  <section class="hero-zone">
    <div class="hero">
      <!-- 四角黄铜铆钉 -->
      <span class="rivet rivet--tl" aria-hidden="true" />
      <span class="rivet rivet--tr" aria-hidden="true" />
      <span class="rivet rivet--bl" aria-hidden="true" />
      <span class="rivet rivet--br" aria-hidden="true" />
      <!-- 内圈缝线 -->
      <span class="stitch" aria-hidden="true" />

      <p class="hero-greeting">{{ t('home.greeting') }}</p>
      <h1 class="hero-name">{{ t('home.name') }}</h1>
      <p class="hero-tagline">{{ t('home.tagline') }}</p>
      <p class="hero-desc">{{ t('home.description') }}</p>

      <div class="hero-actions">
        <a class="btn btn--wood" href="#posts">{{ t('home.viewBlog') }}</a>
        <a class="btn btn--brass" href="#projects">{{ t('home.viewProjects') }}</a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * @file 拟物风格的英雄区组件
 * @description 皮革横幅：铆钉 + 缝线 + 烫印文字 + 实体按压按钮（页内锚点）。
 */
const { t } = useI18n()
</script>

<style scoped>
.hero-zone {
  width: min(100% - 2 * var(--space), var(--page-w));
  margin-inline: auto;
  padding-top: var(--space);
}

/* —— 皮革横幅 —— */
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: clamp(520px, 74vh, 780px);
  padding: calc(var(--space) * 2) var(--space);
  text-align: center;
  border: 1px solid rgb(0 0 0 / 0.6);
  border-radius: var(--radius);
  overflow: hidden;
  /* 皮革：深棕底 + 多层小噪点 + 斜向明暗 */
  background:
    radial-gradient(circle at 18% 28%, rgb(255 255 255 / 0.055) 1.2px, transparent 2px),
    radial-gradient(circle at 62% 66%, rgb(0 0 0 / 0.16) 1.4px, transparent 2.2px),
    radial-gradient(circle at 84% 18%, rgb(255 255 255 / 0.05) 1px, transparent 1.8px),
    radial-gradient(circle at 40% 82%, rgb(0 0 0 / 0.13) 1.2px, transparent 2px),
    linear-gradient(128deg, #6d4626 0%, #5d3819 42%, #4c2a12 100%);
  background-size: 9px 9px, 12px 12px, 15px 15px, 11px 11px, 100% 100%;
  box-shadow:
    inset 0 2px 0 rgb(255 240 210 / 0.16),
    inset 0 -18px 40px rgb(0 0 0 / 0.42),
    var(--shadow);
}

/* 光源：左上暖光（明确光方向的氛围层） */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(90% 90% at 12% 0%, rgb(255 236 200 / 0.1), transparent 55%);
  pointer-events: none;
}

/* —— 四角黄铜铆钉 —— */
.rivet {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f0dca6 0%, #c39a4c 52%, #6e4c1a 100%);
  box-shadow:
    inset 0 -2px 3px rgb(0 0 0 / 0.55),
    0 1px 2px rgb(255 240 200 / 0.3);
}

.rivet--tl { top: 16px; left: 16px; }
.rivet--tr { top: 16px; right: 16px; }
.rivet--bl { bottom: 16px; left: 16px; }
.rivet--br { bottom: 16px; right: 16px; }

/* —— 内圈缝线（dashed 边框模拟针脚） —— */
.stitch {
  position: absolute;
  inset: 12px;
  border: 2px dashed rgb(243 234 215 / 0.32);
  border-radius: calc(var(--radius) - 4px);
  pointer-events: none;
}

/* —— 烫印文字 —— */
.hero-greeting {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  letter-spacing: 0.34em;
  text-indent: 0.34em; /* 平衡字距造成的偏移 */
  color: rgb(243 231 201 / 0.95);
  /* 压花：上缘吃进阴影、下缘挑出高光 */
  text-shadow:
    0 -1px 0 rgb(0 0 0 / 0.7),
    0 1px 0 rgb(255 240 210 / 0.16);
}

.hero-name {
  margin: 6px 0 2px;
  font-family: var(--font-head);
  font-size: clamp(44px, 8vw, 88px);
  font-weight: 700;
  line-height: 1.08;
  overflow-wrap: anywhere;
  /* 烫金压花：金字渐变 + 落影 */
  background: linear-gradient(180deg, #fdf3d7 0%, #ecd39c 52%, #c9a45c 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  filter: drop-shadow(0 3px 3px rgb(0 0 0 / 0.5));
}

.hero-tagline {
  margin: 4px 0 0;
  max-width: 44ch;
  font-size: var(--fs-title);
  line-height: 1.5;
  color: #f3e7c9;
  text-shadow: 0 1px 0 rgb(0 0 0 / 0.55);
}

.hero-desc {
  margin: 0;
  max-width: 56ch;
  color: #e6d5b4;
  text-shadow: 0 1px 0 rgb(0 0 0 / 0.5);
}

/* —— 实体按钮：木质 / 黄铜（按压有行程感） —— */
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--gap);
  margin-top: var(--space);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 12px 30px;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-decoration: none;
  border: 1px solid rgb(0 0 0 / 0.6);
  border-radius: 8px;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.28),
    inset 0 -4px 7px rgb(0 0 0 / 0.35),
    0 5px 10px rgb(10 4 0 / 0.55);
  transition:
    filter var(--transition),
    transform var(--transition),
    box-shadow var(--transition);
}

.btn:hover {
  filter: brightness(1.1);
}

/* 按压：下沉 + 内凹行程（拟物签名交互） */
.btn:active {
  transform: var(--press-transform);
  box-shadow:
    inset 0 3px 7px rgb(0 0 0 / 0.55),
    inset 0 -1px 2px rgb(255 240 210 / 0.12);
}

.btn--wood {
  color: #f3e7c9;
  background:
    repeating-linear-gradient(
      90deg,
      rgb(0 0 0 / 0.1) 0 2px,
      transparent 2px 8px,
      rgb(0 0 0 / 0.05) 8px 11px,
      transparent 11px 18px
    ),
    linear-gradient(180deg, #7d5429 0%, #66421e 55%, #523418 100%);
}

.btn--brass {
  color: var(--c-on-accent);
  background:
    repeating-linear-gradient(105deg, rgb(255 255 255 / 0.07) 0 1px, transparent 1px 3px),
    linear-gradient(180deg, #e0bc72 0%, #bd9040 48%, #91632a 100%);
}

/* —— 窄屏：按钮撑满、留出触控余量 —— */
@media (max-width: 480px) {
  .hero {
    padding-inline: calc(var(--space) + 10px);
  }

  .hero-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }

  .btn:active {
    transform: none;
  }
}
</style>
