<!--
  Y2KSubPage - y2k 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「星空氛围层 + 塑料导航条 + 浮岛内容
  带 + 页脚」，只有主体区块不同。抽成外壳后子页只写主体。

  与首页的差别：首页第一屏是 Y2KHero（铬金属 3D 标题 + 行星球）——
  那是「创刊封面」级别的第一印象；子页已经知道自己是哪一栏，
  再放英雄区会抢走标题的注意力，因此去掉，直接从浮岛正文开始。
  彩虹能量分隔线（.divider）也去掉：那是首页区块之间的节奏，
  单页单区块时它是孤儿。

  用法：
    <Y2KSubPage>
      <Y2KSectionHead :badge="…" :title="…" />
      …
    </Y2KSubPage>

  这是 y2k 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div id="top" class="page">
    <!-- 星空氛围层（纯 CSS 装饰，aria-hidden） -->
    <Y2KStarfield/>

    <Y2KSubNav/>

    <main class="page-main">
      <div class="page-inner">
        <slot/>
      </div>
    </main>

    <Y2KSiteFooter/>
  </div>
</template>

<script setup lang="ts">
import Y2KStarfield from './Y2KStarfield.vue'
import Y2KSubNav from './Y2KSubNav.vue'
import Y2KSiteFooter from './Y2KSiteFooter.vue'

// 滚动进入动画（共享层行为，SSG 友好）
useScrollReveal()
</script>

<style scoped>
/* —— 页面骨架：深空底 + 浮岛内容带（与首页同源） —— */
.page {
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

.page-main {
  position: relative;
  z-index: 1;
}

.page-inner {
  display: grid;
  gap: clamp(48px, 8vh, 88px);
  width: min(100% - 2 * var(--space), var(--page-w));
  margin-inline: auto;
  padding: clamp(32px, 6vh, 64px) 0 calc(var(--space) * 2);
}
</style>
