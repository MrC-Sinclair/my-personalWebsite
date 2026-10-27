<!--
  LiquidGlassFooter - liquid-glass 风格的页脚玻璃架
  ------------------------------------------------------------
  场景底部的横向玻璃架：版权 + 作者 / 构建信息 / 风格画廊
  入口（localePath 包裹，不写死路径）。附 safe-bottom 适配
  刘海屏安全区域。
-->
<template>
  <footer class="foot glass safe-bottom">
    <p class="item">
      <span class="dot" aria-hidden="true"/>
      {{ t('footer.copyright') }} © {{ t('footer.author') }}
    </p>
    <div class="right">
      <p class="item muted">{{ t('footer.builtWith') }}</p>
      <NuxtLink class="gallery" :to="localePath('/styles')">
        {{ t('styles.gallery.title') }}
      </NuxtLink>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* —— 玻璃配方（页脚横架，整宽、上圆角） ——
   与导航同源：去掉彩虹渐变填充，边缘质感交给镜面环。
   注意底边是敞开的（border-bottom: none），所以镜面环在底部会画出
   一条本不该有的亮线——用 mask 把底部 4% 抹掉，保持「从页面底部
   升起来的一块玻璃」的形态。 */
.glass {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap);
  max-width: calc(var(--page-w) + 2 * var(--space));
  margin: 0 auto;
  padding: 18px var(--space);
  background: var(--lg-depth), var(--lg-fill);
  border: var(--border-w) solid var(--c-border);
  border-bottom: none;
  border-radius: var(--radius) var(--radius) 0 0;
  box-shadow: var(--shadow);
  backdrop-filter: blur(var(--lg-blur)) saturate(1.3) brightness(1.04) contrast(1.14);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(1.3) brightness(1.04) contrast(1.14);
}

/* 镜面高光环：底部敞开，环只画到 96% 高度 */
.glass::after {
  position: absolute;
  inset: 0;
  padding: var(--lg-spec-w);
  border-radius: inherit;
  pointer-events: none;
  content: '';
  background: var(--lg-spec);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(180deg, #000 0 96%, transparent 96%);
  mask-composite: exclude;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(180deg, #000 0 96%, transparent 96%);
  -webkit-mask-composite: xor;
}

/* 顶部泛光 */
.glass::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: var(--lg-luster);
}

@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: rgb(22 16 56 / 0.94);
  }
}

.item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.muted {
  font-size: var(--fs-small);
}

/* 呼吸光点装饰 */
.dot {
  flex: none;
  width: 8px;
  height: 8px;
  background: linear-gradient(140deg, var(--c-accent), var(--c-accent-2));
  border-radius: 50%;
  box-shadow: 0 0 10px rgb(94 227 255 / 0.6);
  animation: foot-pulse 3s ease-in-out infinite;
}

@keyframes foot-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

.right {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--gap);
}

/* 画廊入口：透明玻璃胶囊（≥40px 触控目标） */
.gallery {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 16px;
  font-size: var(--fs-small);
  color: var(--c-accent);
  text-decoration: none;
  background: rgb(94 227 255 / 0.08);
  border: var(--border-w) solid rgb(94 227 255 / 0.35);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 var(--lg-bevel);
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.gallery:hover {
  color: var(--c-on-accent);
  background: linear-gradient(140deg, var(--c-accent), var(--c-accent-2));
  box-shadow:
    inset 0 1px 0 var(--lg-bevel-solid),
    0 0 18px rgb(94 227 255 / 0.35);
}

.gallery:active {
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .dot {
    animation: none;
  }

  .gallery {
    transition: none;
  }

  .gallery:active {
    transform: none;
  }
}
</style>
