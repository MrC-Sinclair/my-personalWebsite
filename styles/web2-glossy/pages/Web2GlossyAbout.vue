<!--
  Web2GlossyAbout - web2-glossy 风格的「关于」子页（/style/web2-glossy/about）
  ------------------------------------------------------------
  壳由 Web2GlossySubPage 提供；主体与首页共用 Web2GlossyAboutBlock
  （白面板简介 + 凝胶时间线 / 右列凝胶技能面板），两处渲染完全一致。
-->
<template>
  <Web2GlossySubPage>
    <section class="section" aria-labelledby="about-title">
      <div class="container">
        <Web2GlossyAboutBlock :level="1"/>
      </div>
    </section>
  </Web2GlossySubPage>
</template>

<script setup lang="ts">
import Web2GlossySubPage from '../components/Web2GlossySubPage.vue'
import Web2GlossyAboutBlock from '../components/Web2GlossyAboutBlock.vue'
</script>

<style scoped>
/* —— 区块容器（与首页同源：同宽同纵向节奏） —— */
.container {
  max-width: var(--page-w);
  margin-inline: auto;
  padding-inline: clamp(16px, 4vw, 32px);
}

.section {
  padding-block: clamp(56px, 9vw, 96px);
}
</style>
