<!--
  NeumorphismSubPage - neumorphism 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「同色材料底 + 凸起导航薄板 +
  居中单列 + 凹槽页脚」，只有主体区块不同。抽成外壳后子页只写主体。

  与首页的差别：去掉 NeumorphismHero。首屏英雄区是「进入这块材料」
  的第一印象；子页已经用凸起面板的标题标出自己是哪一栏，再放一屏
  英雄区会把真正的内容推出首屏。居中单列保留——新拟态的美学建立在
  对称与居中上（style-lab 已验证的结论），这一点不随页面层级改变。

  用法：
    <NeumorphismSubPage>
      <NeumorphismPanel :level="1" :title="…">…</NeumorphismPanel>
    </NeumorphismSubPage>

  这是 neumorphism 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="page">
    <NeumorphismSubNav />

    <main id="top" class="column">
      <slot />
    </main>

    <NeumorphismFooter />
  </div>
</template>

<script setup lang="ts">
import NeumorphismSubNav from './NeumorphismSubNav.vue'
import NeumorphismFooter from './NeumorphismFooter.vue'
</script>

<style scoped>
/* —— 页面骨架：同色材料底 + 居中单列（对称轴） —— */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

.column {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 44px; /* 大间距：凸起面板的阴影需要呼吸空间 */
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 8px 20px 72px;
}

@media (max-width: 640px) {
  .column {
    gap: 36px;
    padding-inline: 16px;
  }
}
</style>
