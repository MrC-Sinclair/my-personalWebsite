<!--
  LiquidGlassAbout - liquid-glass 风格的「关于」子页（/style/liquid-glass/about）
  ------------------------------------------------------------
  壳由 LiquidGlassSubPage 提供；主体与首页共用 LiquidGlassAboutBlock，
  外面仍是首页那块带眉标的玻璃主板——两处渲染完全一致，只有壳不同。
-->
<template>
  <LiquidGlassSubPage>
    <LiquidGlassPanel :eyebrow="t('nav.about')" :title="t('about.title')">
      <LiquidGlassAboutBlock/>
    </LiquidGlassPanel>
  </LiquidGlassSubPage>
</template>

<script setup lang="ts">
import LiquidGlassSubPage from '../components/LiquidGlassSubPage.vue'
import LiquidGlassPanel from '../components/LiquidGlassPanel.vue'
import LiquidGlassAboutBlock from '../components/LiquidGlassAboutBlock.vue'

const { t } = useI18n()
</script>
