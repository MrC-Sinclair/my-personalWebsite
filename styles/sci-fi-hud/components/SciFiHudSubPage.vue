<!--
  SciFiHudSubPage - sci-fi-hud 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「座舱底 + 全页扫描线 + 主控条 +
  主区 + 底部遥测状态条」，只有主体区块不同。抽成外壳后子页只写主体。

  与首页的差别：去掉主视屏（英雄区 + 右舷雷达模块）。那是「进入
  驾驶舱」的第一印象；子页已经知道自己是哪一栏，再放一屏主视屏
  会把真正的 HUD 面板推到首屏之外。扫描线与坐标网格保留——它们是
  座舱这个环境本身，不是首页专属装饰。

  用法：
    <SciFiHudSubPage>
      <SciFiHudPanel code="SEC-04" :level="1" :title="…">…</SciFiHudPanel>
    </SciFiHudSubPage>

  这是 sci-fi-hud 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="hud">
    <!-- 全页座舱扫描线（纯装饰，reduced-motion 隐藏） -->
    <div class="scanline" aria-hidden="true" />

    <SciFiHudSubNav />

    <main class="main">
      <slot />
    </main>

    <SciFiHudTelemetryBar />
  </div>
</template>

<script setup lang="ts">
import SciFiHudSubNav from './SciFiHudSubNav.vue'
import SciFiHudTelemetryBar from './SciFiHudTelemetryBar.vue'

// 滚动进入视口动画（共享层行为，SSG 友好）
useScrollReveal()
</script>

<style scoped>
/* —— 座舱底：深底 + 坐标网格（--deco） —— */
.hud {
  position: relative;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--deco), var(--c-bg);
}

/* —— 全页扫描线：固定视口内的横向亮线缓慢下扫（装饰） —— */
.scanline {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;
  height: 120px;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgb(74 240 198 / 0.04) 55%,
    rgb(74 240 198 / 0.1) 96%,
    transparent 100%
  );
  animation: scan-sweep 8s linear infinite;
}

@keyframes scan-sweep {
  from {
    transform: translateY(-140px);
  }

  to {
    transform: translateY(100vh);
  }
}

/* —— 主区 —— */
.main {
  max-width: var(--page-w);
  margin: 0 auto;
  padding: clamp(28px, 4vw, 56px) var(--gap) clamp(48px, 6vw, 88px);
}

@media (prefers-reduced-motion: reduce) {
  .scanline {
    display: none;
  }
}
</style>
