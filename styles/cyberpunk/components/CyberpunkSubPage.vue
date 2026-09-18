<!--
  CyberpunkSubPage - cyberpunk 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「CRT 扫描线覆盖层 + HUD 导航 +
  面板流 + 霓虹页脚」，只有主体区块不同。抽成外壳后子页只写主体。

  与首页 .stream 的差别：首页左缘有一条 HUD 刻度轨（.rail，纯装饰，
  宽屏显示）——那是首页「控制台」的边框语言；子页内容单一，
  保留刻度轨会让页面左右不对称，因此去掉，改用居中单列面板流。

  用法：
    <CyberpunkSubPage>
      <CyberpunkPanel :title="…">…</CyberpunkPanel>
    </CyberpunkSubPage>

  这是 cyberpunk 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="page">
    <CyberpunkScanOverlay/>
    <CyberpunkSubNav/>

    <main class="main">
      <div class="stream">
        <slot/>
      </div>
    </main>

    <CyberpunkFooter/>
  </div>
</template>

<script setup lang="ts">
import CyberpunkScanOverlay from './CyberpunkScanOverlay.vue'
import CyberpunkSubNav from './CyberpunkSubNav.vue'
import CyberpunkFooter from './CyberpunkFooter.vue'

// 入场动画：共享层行为（观察 .scroll-reveal 元素）
useScrollReveal()
</script>

<style scoped>
/* —— 页面骨架：夜城底 + 面板流（与首页同源） —— */
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

/* 面板流：单列舞台，区块间大量呼吸 */
.stream {
  display: grid;
  gap: clamp(40px, 6vw, 80px);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: clamp(28px, 5vw, 56px) var(--gap) clamp(56px, 8vw, 96px);
}
</style>
