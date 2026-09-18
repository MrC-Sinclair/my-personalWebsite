<!--
  PixelSubPage - pixel 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「像素网格底 + CRT 扫描线 + HUD 导航条
  + 游戏屏幕内容区 + 页脚」，只有主体区块不同。抽成外壳后子页只写主体。

  与首页的差别两处：
  · 去掉角色栏英雄区（.hero 的 8-bit 外星人头像）——那是「开机画面」
    级别的第一印象；子页已经知道自己是哪一栏，再放头像会抢走面板标题。
  · 内容区改为**单列纵排**（首页桌面端是 STATUS 左 5 栏 / INVENTORY
    右 7 栏的悬殊分栏）。首页那套分栏是「一屏里塞多个状态窗口」的
    游戏 HUD 节奏；子页只有一个主题，再切左右栏会把单个面板压窄。
  · 不调用 useScrollReveal：pixel 的动效签名是「换帧」与光标闪烁，
    首页也只有 .blink 一处动画，淡入位移会破坏这台老游戏机的瞬时感。

  用法：
    <PixelSubPage>
      <PixelPanel head="QUEST LOG" :title="…">…</PixelPanel>
    </PixelSubPage>

  这是 pixel 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div id="top" class="page">
    <PixelSubNav />

    <main class="screen">
      <slot />
    </main>

    <PixelSiteFooter />
  </div>
</template>

<script setup lang="ts">
import PixelSubNav from './PixelSubNav.vue'
import PixelSiteFooter from './PixelSiteFooter.vue'
</script>

<style scoped>
/* —— 页面根：像素网格底纹 + 关闭字体抗锯齿 + 扫描线覆盖层（与首页同源） —— */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background-color: var(--c-bg);
  background-image:
    linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px);
  background-size: 16px 16px;
  -webkit-font-smoothing: var(--font-smooth);
}

/* CRT 扫描线覆盖层（--deco，纯装饰不可交互） */
.page::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 60;
  pointer-events: none;
  background: var(--deco);
}

/* —— 游戏屏幕：单列纵排（首页的 12 栏分栏不套用到子页） —— */
.screen {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space);
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: var(--space);
}
</style>
