<!--
  GlassmorphismGlassPanel - glassmorphism 风格的磨砂玻璃面板基座
  ------------------------------------------------------------
  风格的核心材质组件：半透白填充 + backdrop-filter 磨砂 +
  1px 半透白描边 + 悬浮投影；hover 时上浮并叠加彩色 Glow。
  所有内容区块（关于/项目/文章/联系）都由它承载，
  通过默认插槽注入内容；透传 class 以接入布局与动效。
-->
<template>
  <div class="glass-panel">
    <!-- 上缘高光：玻璃顶部反光（风格签名装饰） -->
    <span class="sheen" aria-hidden="true"/>
    <div class="panel-body">
      <slot/>
    </div>
  </div>
</template>

<style scoped>
/* 磨砂玻璃本体：半透白 + 磨砂 blur + 半透白描边 + 悬浮投影 */
.glass-panel {
  position: relative;
  overflow: hidden;
  background: var(--c-surface);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  backdrop-filter: blur(20px) saturate(160%);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    border-color var(--transition);
}

/* 交互反馈：hover 上浮 + 边框提亮 + 彩色 Glow（签名） */
.glass-panel:hover {
  border-color: rgb(255 255 255 / 0.85);
  box-shadow:
    var(--shadow),
    0 0 44px rgb(139 92 246 / 0.18);
  transform: translateY(-4px);
}

/* 上缘高光条：中亮两端渐隐的 1px 反光 */
.sheen {
  position: absolute;
  top: 0;
  right: 12%;
  left: 12%;
  height: 1px;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgb(255 255 255 / 0.85) 22%,
    rgb(255 255 255 / 0.2) 60%,
    transparent 100%
  );
}

.panel-body {
  position: relative;
  padding: clamp(20px, 3.4vw, 36px);
}

@media (prefers-reduced-motion: reduce) {
  .glass-panel {
    transition: none;
  }

  .glass-panel:hover {
    transform: none;
  }
}
</style>
