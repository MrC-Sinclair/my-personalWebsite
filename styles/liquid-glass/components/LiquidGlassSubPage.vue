<!--
  LiquidGlassSubPage - liquid-glass 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「深空背景 + 玻璃胶囊导航 + 内容流
  + 玻璃页脚」，只有主体区块不同。抽成外壳后子页只写主体，
  避免这层壳写 4 遍。

  刻意**不给主体套玻璃主板**：项目卡 / 文章长条自身带
  backdrop-filter，再套一层 Panel 会形成嵌套模糊（这也是首页
  ContactGrid 特意做成无 backdrop-filter 内嵌展台的原因）。
  需要玻璃承载的页面（关于 / 联系）自己在 slot 里套 LiquidGlassPanel。

  用法：
    <LiquidGlassSubPage>
      <LiquidGlassPanel :eyebrow="..." :title="...">…</LiquidGlassPanel>
    </LiquidGlassSubPage>

  这是 liquid-glass 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="page">
    <LiquidGlassBackground/>
    <LiquidGlassSubNav/>

    <main class="main">
      <div class="flow">
        <slot/>
      </div>
    </main>

    <LiquidGlassFooter/>
  </div>
</template>

<script setup lang="ts">
import LiquidGlassBackground from './LiquidGlassBackground.vue'
import LiquidGlassSubNav from './LiquidGlassSubNav.vue'
import LiquidGlassFooter from './LiquidGlassFooter.vue'

// 滚动进入动画（共享层行为，SSG 友好）
useScrollReveal()
</script>

<style scoped>
/* —— 页面骨架：深空场景 + 悬浮内容流（与首页同源） —— */
.page {
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

.main {
  min-width: 0;
}

/* 内容流：单列舞台，区块间大量呼吸（漂浮感） */
.flow {
  display: grid;
  gap: clamp(48px, 8vw, 96px);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: clamp(28px, 5vw, 56px) var(--gap) clamp(56px, 8vw, 96px);
}
</style>
