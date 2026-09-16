<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismWoodPanel - 拟物风格木质面板
  ------------------------------------------------------------
  一块「橡木镶板」容器：多段木色波动条纹 + 竖向木纹 + 四角
  黄铜铆钉 + 顶部烙印标题，内嵌缝线。通过插槽承载内容
  （关于板块的工作经历时间线等）。
-->
<template>
  <div class="panel">
    <span class="rivet rivet--tl" aria-hidden="true" />
    <span class="rivet rivet--tr" aria-hidden="true" />
    <span class="rivet rivet--bl" aria-hidden="true" />
    <span class="rivet rivet--br" aria-hidden="true" />

    <h3 class="panel-title">{{ title }}</h3>
    <div class="panel-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file 拟物风格的木质面板组件
 * @description 橡木镶板容器：木纹 + 铆钉 + 烙印标题 + 插槽内容。
 */
defineProps<{
  /** 面板标题（烙印在木板上的象牙字） */
  title: string
}>()
</script>

<style scoped>
.panel {
  position: relative;
  padding: calc(var(--space) * 1.3) calc(var(--space) * 1.4);
  border: 1px solid rgb(0 0 0 / 0.6);
  border-radius: var(--radius);
  /* 橡木：横向木色波动条纹 + 竖向木纹细线 */
  background:
    repeating-linear-gradient(
      90deg,
      rgb(0 0 0 / 0.1) 0 2px,
      transparent 2px 8px,
      rgb(0 0 0 / 0.05) 8px 11px,
      transparent 11px 19px
    ),
    repeating-linear-gradient(
      88deg,
      #63411f 0 16px,
      #6d4823 16px 26px,
      #5a391b 26px 44px,
      #714c26 44px 58px
    ),
    linear-gradient(180deg, #66441f 0%, #5a391b 100%);
  background-size: auto, auto, 100% 100%;
  box-shadow:
    inset 0 2px 0 rgb(255 240 210 / 0.15),
    inset 0 -14px 30px rgb(0 0 0 / 0.38),
    var(--shadow);
}

/* 面板四角黄铜铆钉 */
.rivet {
  position: absolute;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f0dca6 0%, #c39a4c 52%, #6e4c1a 100%);
  box-shadow:
    inset 0 -1px 2px rgb(0 0 0 / 0.55),
    0 1px 1px rgb(255 240 200 / 0.3);
}

.rivet--tl { top: 10px; left: 10px; }
.rivet--tr { top: 10px; right: 10px; }
.rivet--bl { bottom: 10px; left: 10px; }
.rivet--br { bottom: 10px; right: 10px; }

/* —— 烙印标题 + 下方黄铜刻度线 —— */
.panel-title {
  margin: 0 0 var(--gap);
  padding-bottom: 10px;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #f3e7c9;
  border-bottom: 1px dashed rgb(243 234 215 / 0.3);
  text-shadow:
    0 -1px 0 rgb(0 0 0 / 0.7),
    0 1px 0 rgb(255 240 210 / 0.14);
}

.panel-body {
  color: #f3e7c9;
}

/* —— 窄屏：收紧内边距 —— */
@media (max-width: 640px) {
  .panel {
    padding: var(--space);
  }
}
</style>
