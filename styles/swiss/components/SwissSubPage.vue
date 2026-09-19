<!--
  SwissSubPage - swiss 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「网格条目导航 + 12 栏背景网格线 +
  内容容器 + 黑底反白页脚」，只有主体区块不同。抽成外壳后子页只写主体。

  与首页的差别：去掉 SwissHero。海报式英雄区（首屏撑满一屏的超大标题）
  是「封面」级别的第一印象；子页已经用编号区块头标出自己是哪一栏，
  再放一屏海报会把正文推到首屏之外。背景网格线保留——它是版面骨架
  的提示，不是首页专属装饰。

  用法：
    <SwissSubPage>
      <section class="section">
        <SwissSectionHead :no="1" level="1" head-id="…" :title="…" />
        …
      </section>
    </SwissSubPage>

  这是 swiss 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="page">
    <SwissSubNav />

    <main id="top" class="main">
      <div class="container">
        <!-- 极淡的 12 栏背景网格线：版面骨架的可见提示 -->
        <div class="grid-lines" aria-hidden="true" />

        <slot />
      </div>
    </main>

    <SwissFooter />
  </div>
</template>

<script setup lang="ts">
import SwissSubNav from './SwissSubNav.vue'
import SwissFooter from './SwissFooter.vue'

// 滚动进入视口的区块动画（共享层行为，SSG 友好）
useScrollReveal()
</script>

<style scoped>
/* —— 页面骨架：纵向弹性布局，页脚沉底（与首页同源） —— */
.page {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

.main {
  flex: 1 0 auto;
}

/* 内容容器：网格线与内容对齐的前提是同一容器 */
.container {
  position: relative;
  z-index: 0;
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px);
}

/* 12 栏极淡背景网格线（--deco）：只在本容器内铺满 */
.grid-lines {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: var(--deco);
  pointer-events: none;
}
</style>
