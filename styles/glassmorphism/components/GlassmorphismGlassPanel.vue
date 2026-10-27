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
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  backdrop-filter: blur(20px) saturate(180%);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  /* 投影 + 内暗环（玻璃厚度，均匀是它的本分，与有方向性的高光环不同） */
  box-shadow: var(--shadow), var(--gm-edge);
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

/* 镜面高光环：由原来的「上缘 1px 渐隐条」升级为整圈环。
   原来只有顶边有反光、两侧和底部完全没有转折，玻璃因此缺了立体感；
   改成整圈之后，亮度仍沿轮廓衰减（顶最亮），四面都有了转折。
   实现同 liquid-glass：渐变 + mask-composite 挖出环带。 */
.sheen {
  position: absolute;
  inset: 0;
  padding: var(--gm-spec-w);
  border-radius: inherit;
  pointer-events: none;
  background: var(--gm-spec);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
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
