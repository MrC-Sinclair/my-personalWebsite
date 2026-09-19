<!--
  MetroSubPage - Metro 风格子页的统一外壳
  ------------------------------------------------------------
  Metro 的排版轴是一张连续的深色「开始屏幕」，色彩全部由 Tile 色块
  承载。子页保留这层基底（深色表面 + Tile 网格节奏），但去掉首页的
  超大标题 Hero 区——子页已经有了自己的 h1 区块标题，再放一屏
  start 会把内容推出首屏，也和「子页单主题」的信息架构冲突。

  外壳只负责：固定路由导航（MetroSubNav）+ 居中内容列（用 metro
  自己的 .wrap 节奏）+ 页脚（MetroSiteFooter）。子页内容由插槽注入。

  用法：
    <MetroSubPage>
      <section class="block">
        <div class="wrap">
          <h1 class="page-h1">…</h1>
          <div class="mosaic">…tiles…</div>
        </div>
      </section>
    </MetroSubPage>
-->
<template>
  <div class="metro-page">
    <MetroSubNav />

    <main class="metro-main">
      <slot />
    </main>

    <MetroSiteFooter />
  </div>
</template>

<script setup lang="ts">
import MetroSiteFooter from './MetroSiteFooter.vue'
import MetroSubNav from './MetroSubNav.vue'
</script>

<style scoped>
/* ================= 页面基座：连续的深色开始屏幕 ================= */
.metro-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: clip;
  color: var(--c-text);
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  background: var(--c-bg);
}

.metro-main {
  flex: 1 0 auto;
  /* 底部留出信息版面呼吸（导航为 sticky 入流，不占额外顶部内边距） */
  padding-bottom: clamp(24px, 4vw, 56px);
}
</style>
