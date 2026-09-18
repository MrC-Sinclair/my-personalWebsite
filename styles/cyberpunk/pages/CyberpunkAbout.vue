<!--
  CyberpunkAbout - cyberpunk 风格的「关于」子页（/style/cyberpunk/about）
  ------------------------------------------------------------
  壳由 CyberpunkSubPage 提供；主体与首页共用 CyberpunkAboutBlock
  （档案面板 + 下沉错位的技能面板），两处渲染完全一致，只有壳不同。
-->
<template>
  <CyberpunkSubPage>
    <CyberpunkAboutBlock/>
  </CyberpunkSubPage>
</template>

<script setup lang="ts">
import CyberpunkSubPage from '../components/CyberpunkSubPage.vue'
import CyberpunkAboutBlock from '../components/CyberpunkAboutBlock.vue'
</script>
