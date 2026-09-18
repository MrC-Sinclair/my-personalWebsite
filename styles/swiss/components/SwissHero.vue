<!--
  SwissHero - swiss 风格英雄区
  ------------------------------------------------------------
  海报式首屏：问候语小标签（红方块 + 宽字距）→ 超大左对齐
  姓名（clamp 到 11.5vw，海报传统）→ 底部非对称两栏：左下
  是两条页内锚点链接，右下是标语与简介（向右推进，构成对
  角线构图）。首屏撑满一屏，大留白参与构图。
-->
<template>
  <section class="hero" aria-labelledby="hero-title">
    <p class="hero-eyebrow">
      <span class="hero-mark" aria-hidden="true"/>
      {{ t('home.greeting') }}
    </p>

    <h1 id="hero-title" class="hero-name">{{ t('home.name') }}</h1>

    <div class="hero-foot">
      <div class="hero-cta">
        <a class="hero-link" href="#posts">
          {{ t('home.viewBlog') }}
          <span class="hero-arrow" aria-hidden="true">↓</span>
        </a>
        <a class="hero-link" href="#projects">
          {{ t('home.viewProjects') }}
          <span class="hero-arrow" aria-hidden="true">↓</span>
        </a>
      </div>

      <div class="hero-body">
        <p class="hero-tagline">{{ t('home.tagline') }}</p>
        <p class="hero-desc">{{ t('home.description') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  align-content: end;
  gap: var(--gap) 0;
  min-height: clamp(520px, 78vh, 860px);
  padding-top: clamp(64px, 12vh, 140px);
  padding-bottom: var(--space);
}

/* 问候标签：红方块 + 小号宽字距 */
.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  grid-column: 1 / -1;
  margin: 0;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-text);
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

/* 唯一的几何色块：瑞士红正方形 */
.hero-mark {
  flex: none;
  width: 14px;
  height: 14px;
  background: var(--c-accent);
}

/* 姓名：超大、左对齐、紧凑行高与字距，占满 12 栏 */
.hero-name {
  grid-column: 1 / -1;
  margin: 0;
  margin-left: -0.05em; /* 光学对齐：抵消字形左侧留白 */
  font-family: var(--font-head);
  font-size: clamp(44px, 11.5vw, 168px);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--c-text);
  overflow-wrap: break-word;
}

/* 底部非对称两栏：移动端上下堆叠，桌面端左链接右文案 */
.hero-foot {
  display: grid;
  grid-column: 1 / -1;
  gap: var(--gap);
  margin-top: var(--space);
  padding-top: 20px;
  border-top: var(--border-w) solid var(--c-border);
}

/* 锚点链接：大号文字 + 强调色下划线生长反馈 */
.hero-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  font-size: 17px;
  font-weight: 700;
  color: var(--c-text);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 3px;
  transition: background-size var(--transition);
}

.hero-link:hover,
.hero-link:focus-visible {
  background-size: 100% 3px;
}

.hero-link:active {
  color: var(--c-accent);
}

.hero-arrow {
  color: var(--c-accent);
  transition: transform var(--transition);
}

.hero-link:hover .hero-arrow {
  transform: translateY(3px);
}

/* 标语与简介：向右推进（移动端即全宽，桌面端偏置到 6-12 栏） */
.hero-body {
  display: grid;
  gap: 10px;
}

.hero-tagline {
  margin: 0;
  font-size: clamp(19px, 2.2vw, 26px);
  font-weight: 500;
  line-height: 1.4;
  color: var(--c-text);
}

.hero-desc {
  max-width: 56ch;
  margin: 0;
  color: var(--c-muted);
}

/* —— 桌面端：链接占左 4 栏，文案偏置到右 7 栏 —— */
@media (min-width: 768px) {
  .hero-foot {
    grid-template-columns: repeat(12, 1fr);
    align-items: end;
  }

  .hero-cta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    grid-column: 1 / 5;
  }

  .hero-body {
    grid-column: 6 / -1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-link,
  .hero-arrow {
    transition: none;
  }
}
</style>
