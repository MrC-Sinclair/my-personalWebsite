<!--
  Y2KPlasticPanel - y2k 风格透明塑料浮岛面板
  ------------------------------------------------------------
  风格的核心容器签名：半透明「塑料」面板（白色顶部 inset 高光
  渐变 + 大圆角 + backdrop 模糊）+ 铬银描边 + 彩虹顶棱高光 +
  蓝紫辉光投影，角落带小气泡装饰。variant 切换辉光色调
  （violet / pink / cyan）。内容通过默认插槽注入。
-->
<template>
  <div class="panel" :class="`panel--${variant}`">
    <span class="panel-gloss" aria-hidden="true" />
    <span class="panel-edge" aria-hidden="true" />
    <span class="panel-bubble panel-bubble--a" aria-hidden="true" />
    <span class="panel-bubble panel-bubble--b" aria-hidden="true" />
    <div class="panel-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file Y2K 风格的透明塑料面板容器组件
 * @description 全风格通用的「浮岛」容器：塑料高光 + 铬边 + 辉光。
 */
withDefaults(
  defineProps<{
    /** 辉光色调变体 */
    variant?: 'violet' | 'pink' | 'cyan'
  }>(),
  {
    variant: 'violet',
  },
)
</script>

<style scoped>
.panel {
  position: relative;
  overflow: hidden;
  border: var(--border-w) solid rgb(190 200 255 / 0.38);
  border-radius: var(--radius);
  background: linear-gradient(
    165deg,
    rgb(255 255 255 / 0.14) 0%,
    rgb(255 255 255 / 0.05) 36%,
    rgb(139 123 255 / 0.1) 100%
  );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.55),
    inset 0 -22px 44px rgb(139 123 255 / 0.08),
    var(--shadow);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

/* hover：浮岛微微上浮 + 辉光增强 */
.panel:hover {
  transform: translateY(-3px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.7),
    inset 0 -22px 44px rgb(139 123 255 / 0.12),
    0 24px 56px rgb(5 0 42 / 0.6),
    0 0 44px rgb(var(--glow-rgb, 139 123 255) / 0.28);
}

/* 顶部塑料高光弧（inset 白渐变） */
.panel-gloss {
  position: absolute;
  inset: 0 0 auto 0;
  height: 44%;
  border-radius: var(--radius) var(--radius) 50% 50% / var(--radius) var(--radius) 24% 24%;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.28) 0%, rgb(255 255 255 / 0) 100%);
  pointer-events: none;
}

/* 顶部彩虹棱线（塑料注塑高光） */
.panel-edge {
  position: absolute;
  top: 0;
  right: 10%;
  left: 10%;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgb(255 92 225 / 0.7), rgb(139 123 255 / 0.9), rgb(69 227 255 / 0.7), transparent);
  opacity: 0.75;
  pointer-events: none;
}

/* —— 角落小气泡装饰 —— */
.panel-bubble {
  position: absolute;
  border: 1px solid rgb(255 255 255 / 0.35);
  border-radius: 50%;
  background: radial-gradient(
    120% 120% at 30% 24%,
    rgb(255 255 255 / 0.5) 0%,
    rgb(255 255 255 / 0.06) 34%,
    transparent 60%
  );
  pointer-events: none;
}

.panel-bubble--a {
  right: 26px;
  bottom: 18px;
  width: 30px;
  height: 30px;
}

.panel-bubble--b {
  right: 62px;
  bottom: 40px;
  width: 14px;
  height: 14px;
  background: radial-gradient(120% 120% at 30% 24%, rgb(190 235 255 / 0.6) 0%, transparent 62%);
}

/* —— 辉光色调变体（rgb 三元组供 box-shadow 引用） —— */
.panel--violet {
  --glow-rgb: 139 123 255;
}

.panel--pink {
  --glow-rgb: 255 92 225;
}

.panel--cyan {
  --glow-rgb: 69 227 255;
}

.panel--pink {
  border-color: rgb(255 150 235 / 0.4);
}

.panel--cyan {
  border-color: rgb(150 235 255 / 0.4);
}

.panel-body {
  position: relative;
  z-index: 1;
  padding: var(--space);
}

@media (prefers-reduced-motion: reduce) {
  .panel {
    transition: none;
  }

  .panel:hover {
    transform: none;
  }
}
</style>
