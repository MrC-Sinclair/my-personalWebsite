<!--
  NeoBrutalismSubPage - neo-brutalism 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「吸顶黑条导航 + 内容带 + 页脚」，
  只有主体区块不同。抽成外壳后子页只写主体，避免这层壳写 4 遍。

  与首页 .shell 的差别：首页是 12 栏海报拼贴（栏位错落是首页的
  排版签名），子页改回单列内容带——子页只有一个主题，再分栏
  就失去了「一页讲一件事」的意义，但粗边框 / 撞色 / 硬影全部保留。

  用法：
    <NeoBrutalismSubPage>
      <NeoBrutalismAboutBlock />
    </NeoBrutalismSubPage>

  这是 neo-brutalism 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="nb-page">
    <NeoBrutalismSubNav/>

    <main class="shell">
      <slot/>
    </main>

    <NeoBrutalismSiteFooter/>
  </div>
</template>

<script setup lang="ts">
import NeoBrutalismSubNav from './NeoBrutalismSubNav.vue'
import NeoBrutalismSiteFooter from './NeoBrutalismSiteFooter.vue'

// 入场「盖戳」动画：共享层行为（reduced-motion 下立即完整呈现）
useScrollReveal()
</script>

<style scoped>
/* —— 页面骨架：纸面底（与首页同源） —— */
.nb-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: clip;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

/* 子页内容带：单列，页脚之上留出压边余量 */
.shell {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 32px var(--space) 88px;
}

/* —— 入场「盖戳」：覆盖全局 scroll-reveal 的缓慢淡入，
      硬快节奏才符合粗野主义（进入视口前仅微移不闪烁） —— */
.nb-page .scroll-reveal {
  transition:
    opacity 90ms steps(2, end),
    transform 170ms cubic-bezier(0.2, 0.8, 0.3, 1);
}

@media (max-width: 860px) {
  .shell {
    gap: 28px;
    padding: 24px 16px 56px;
  }
}

@media (prefers-reduced-motion: reduce) {
  /* 进入视口前不得隐藏内容：立即完整呈现 */
  .nb-page .scroll-reveal {
    opacity: 1 !important;
    transform: none !important;
    transition: none;
  }
}
</style>
