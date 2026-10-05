<!--
  CyberpunkAbout - cyberpunk 风格的「关于」子页（/style/cyberpunk/about）
  ------------------------------------------------------------
  壳由 CyberpunkSubPage 提供；主体与首页共用 CyberpunkAboutBlock
  （档案面板 + 下沉错位的技能面板），两处渲染完全一致，只有壳不同。
-->
<template>
  <CyberpunkSubPage>
    <!-- 子页页头：AboutBlock 内只有 h3 小标题，整页缺 h1，用面板壳补一级标题 -->
    <CyberpunkPanel :title="t('about.title')" tone="cyan" :level="1">
      <CyberpunkAboutBlock/>
    </CyberpunkPanel>
  </CyberpunkSubPage>
</template>

<script setup lang="ts">
import CyberpunkSubPage from '../components/CyberpunkSubPage.vue'
import CyberpunkAboutBlock from '../components/CyberpunkAboutBlock.vue'
import CyberpunkPanel from '../components/CyberpunkPanel.vue'

// 本页原本不直接用 i18n，补页头后需要取标题文案
const { t } = useI18n()
</script>
