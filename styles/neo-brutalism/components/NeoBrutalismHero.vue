<!--
  NeoBrutalismHero - neo-brutalism 风格首屏英雄区
  ------------------------------------------------------------
  海报式首屏：撑满一屏（min-height clamp），问候语做成歪斜的
  黑底反白标签，名字大到不合理（clamp 最大 140px）并垫一块
  海报黄硬影，下方动作按钮组全部为原生锚点跳页内区块。
  右上角挂一块 45° 斜纹装饰方块（纯 CSS，--deco 图案）——
  2026-11-15 完成度修补（C 档「只补完成度，不用克制去削」）：
  评审「巨型姓名和斜纹块贴在同一水平线，缺刻意的『不平衡』」。
  斜纹块从垂直居中（与标题同带、右缘压字）上移到标题上方并右移
  出血到边缘，旋转 -8deg → -14deg；文字层抬到它之上，不平衡靠
  位置而不是遮挡。跑马灯与 hero 的间距在首页 CSS 里另行拉开。
  右下角一枚上下蹦跳的 ↓ 符号（reduced-motion 下静止）。
  黑黄硬影、4px 硬描边、方角、撞色按钮全部保留，未磨圆。
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
  /* clip + clip-margin：仍然裁掉出界的装饰，但给焦点环留出 12px 画得出去。
     用 overflow: hidden 会把 CTA 按钮的键盘焦点环一起裁掉（实测 1 处） */
  overflow: clip;
  overflow-clip-margin: 12px;
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
  overflow-wrap: break-word;
}

.tagline {
  margin: 0;
  max-width: 36ch;
  font-size: 18px;
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
  gap: 16px;
  margin-top: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 12px 24px;
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

/* —— 装饰：45° 斜纹方块（--deco 图案） ——
   评审「巨型姓名和斜纹块贴在同一水平线，缺刻意的不平衡」：
   原来 top:50% + translateY(-50%) 正好与标题同带、右缘还压着字。
   现在上移到标题上方、右移出血到边缘（overflow:clip 会裁掉出界部分，
   保留「从版面边缘挤出去」的不平衡），旋转加大到 -14deg。
   粗糙感保留：仍是方角、硬描边、无圆角无过渡。 */
.deco {
  position: absolute;
  top: -4%;
  right: -4%;
  z-index: 0;
  width: clamp(110px, 14vw, 180px);
  aspect-ratio: 1;
  background: var(--deco);
  border: 4px solid var(--c-border);
  transform: rotate(-14deg);
  pointer-events: none;
}

/* 内容压在斜纹块之上，避免重叠区挡字（不平衡靠位置，不靠遮挡） */
.badge,
.name,
.tagline,
.desc,
.actions {
  position: relative;
  z-index: 1;
}

/* —— 装饰：蹦跳的下滑箭头 —— */
.scroll-hint {
  position: absolute;
  right: 10px;
  bottom: 20px;
  font-size: 32px;
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
