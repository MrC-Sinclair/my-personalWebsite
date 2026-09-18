<!--
  Web2GlossySubPage - web2-glossy 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「光泽顶栏 + 区块容器 + 页脚」，
  只有主体区块不同。抽成外壳后子页只写主体。

  与首页的差别：首页第一屏是天空渐变英雄区（云朵 + 星芒徽章 +
  倒影标题）——那是 Web 2.0 的「首页招牌」；子页已经知道自己
  是哪一栏，再放英雄区会抢走标题，因此去掉。首页的色带交替
  （section--tint / section--band）是区块之间的节奏，子页由
  页面自己决定要不要用色带。

  用法：
    <Web2GlossySubPage>
      <Web2GlossyAboutBlock />
    </Web2GlossySubPage>

  这是 web2-glossy 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div id="top" class="w2g-page">
    <Web2GlossySubNav/>

    <main>
      <slot/>
    </main>

    <Web2GlossySiteFooter/>
  </div>
</template>

<script setup lang="ts">
import Web2GlossySubNav from './Web2GlossySubNav.vue'
import Web2GlossySiteFooter from './Web2GlossySiteFooter.vue'

// 滚动进入动画（共享层行为，SSG 友好）
useScrollReveal()
</script>

<style scoped>
/* ================= 页面基座（与首页同源） ================= */
.w2g-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

main {
  flex: 1 0 auto;
}
</style>
