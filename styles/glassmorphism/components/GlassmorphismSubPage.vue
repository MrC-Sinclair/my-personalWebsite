<!--
  GlassmorphismSubPage - glassmorphism 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「mesh 渐变背景 + 磨砂玻璃导航胶囊 +
  玻璃板内容流 + 玻璃页脚」，只有主体区块不同。抽成外壳后子页只写主体。

  与首页的差别两处：
  · 去掉 GlassmorphismHero（开放排版 + 漂浮统计片）。首屏那块是
    「先看见整片彩色渐变」的开场；子页已经用玻璃板标题标出自己是
    哪一栏，再放一屏开放排版会把玻璃板推出首屏。
  · 之字错位（sheet--a / sheet--b 左右交替收窄 92%）改为单列满宽。
    首页那套错位是「一屏里叠很多块玻璃」的节奏；子页只有一块板，
    再左右偏移就成了无来由的装饰。

  用法：
    <GlassmorphismSubPage>
      <section class="sheet">
        <GlassmorphismGlassPanel>
          <GlassmorphismSectionHead :level="1" :eyebrow="…" :title="…" />
          …
        </GlassmorphismGlassPanel>
      </section>
    </GlassmorphismSubPage>

  这是 glassmorphism 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div id="top" class="gpage">
    <GlassmorphismBackdrop />
    <GlassmorphismSubNav />

    <main class="flow">
      <slot />
    </main>

    <GlassmorphismFooter />
  </div>
</template>

<script setup lang="ts">
import GlassmorphismBackdrop from './GlassmorphismBackdrop.vue'
import GlassmorphismSubNav from './GlassmorphismSubNav.vue'
import GlassmorphismFooter from './GlassmorphismFooter.vue'

// 滚动入场动画（共享层 composable，内部自带 mount/unmount 成对清理）
useScrollReveal()
</script>

<style scoped>
/* —— 页面骨架：渐变背景之上是玻璃内容流 —— */
.gpage {
  position: relative;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
}

/* 内容层抬到渐变背景之上；顶部留出固定玻璃胶囊的高度 */
.flow {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 96px clamp(16px, 4vw, 40px) calc(var(--space) * 2);
}

/*
 * 说明：玻璃板（.sheet）的样式写在各子页自己的 <style scoped> 里。
 * 插槽内容编译在**父组件**（子页）作用域，带的是父组件的 scope id，
 * 外壳的 scoped 规则选不中它——所以这里不写 .sheet，避免留死样式。
 */
</style>
