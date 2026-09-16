<!--
  CyberpunkScanOverlay - cyberpunk 风格全页 CRT 扫描线覆盖层
  ------------------------------------------------------------
  纯装饰层：整页叠加极低透明度的横向扫描线纹理（--deco），
  并有一条缓慢下移的青色光带模拟老式显示器的刷新扫描。
  pointer-events: none 不拦截任何交互；扫描光带动画在
  prefers-reduced-motion 下关闭（静态纹理保留）。
-->
<template>
  <div class="scan-overlay" aria-hidden="true"/>
</template>

<style scoped>
.scan-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  pointer-events: none;
  background: var(--deco);
}

/* 下移的刷新光带：极低亮度，只提供「屏幕在刷新」的氛围 */
.scan-overlay::after {
  position: absolute;
  top: -120px;
  right: 0;
  left: 0;
  height: 120px;
  content: '';
  background: linear-gradient(180deg, transparent, rgb(34 211 238 / 0.045), transparent);
  animation: scan-drift 8s linear infinite;
}

@keyframes scan-drift {
  from {
    top: -120px;
  }

  to {
    top: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scan-overlay::after {
    display: none;
  }
}
</style>
