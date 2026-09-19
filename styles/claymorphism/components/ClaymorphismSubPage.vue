<!--
  ClaymorphismSubPage - claymorphism 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「Pastel 渐变天空 + 黏土胶囊导航 +
  内容舞台 + 黏土页脚」，只有主体区块不同。抽成外壳后子页只写主体。

  与首页的差别：去掉 ClaymorphismHero（首屏满屏黏土舞台 + 漂浮黏土球）。
  那是「登场舞台」级别的第一印象；子页已经用区块头标出自己是哪一座
  岛，再放一屏舞台会把黏土岛本身推到首屏之外。渐变天空保留——它是
  这些岛所浮在其中的环境，不是首页专属装饰。

  用法：
    <ClaymorphismSubPage>
      <section class="island island-lilac">
        <ClaymorphismSectionHead eyebrow="01" :level="1" :title="…" />
        …
      </section>
    </ClaymorphismSubPage>

  这是 claymorphism 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="page">
    <ClaymorphismSubNav />

    <main class="page-main">
      <div class="content">
        <slot />
      </div>
    </main>

    <ClaymorphismFooter />
  </div>
</template>

<script setup lang="ts">
import ClaymorphismSubNav from './ClaymorphismSubNav.vue'
import ClaymorphismFooter from './ClaymorphismFooter.vue'
</script>

<style scoped>
/* —— 页面基底：Pastel 渐变天空（与首页同源） —— */
.page {
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background:
    radial-gradient(1100px 560px at 88% -6%, rgb(255 215 232 / 0.6), transparent 62%),
    radial-gradient(950px 520px at -12% 24%, rgb(212 230 255 / 0.55), transparent 58%),
    radial-gradient(900px 520px at 108% 62%, rgb(226 212 255 / 0.5), transparent 60%),
    linear-gradient(180deg, #f6ecfb 0%, #fdf0f5 48%, #ecf3fd 100%);
}

.page-main {
  display: flex;
  flex-direction: column;
}

/* 内容舞台：居中聚拢的黏土岛 */
.content {
  display: flex;
  flex-direction: column;
  gap: clamp(56px, 9vw, 96px);
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: clamp(40px, 7vw, 72px) var(--gap) clamp(56px, 9vw, 96px);
}
</style>
