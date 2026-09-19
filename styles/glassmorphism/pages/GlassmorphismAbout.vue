<!--
  GlassmorphismAbout - glassmorphism 风格的「关于」子页（/style/glassmorphism/about）
  ------------------------------------------------------------
  壳由 GlassmorphismSubPage 提供；主体是一块磨砂玻璃板，内容与首页
  关于板块同一份（GlassmorphismAboutBlock：简介 + 左技能右经历）。
-->
<template>
  <GlassmorphismSubPage>
    <section id="about" data-section="about" class="sheet scroll-reveal scroll-reveal-up">
      <GlassmorphismGlassPanel>
        <GlassmorphismSectionHead :level="1" :eyebrow="t('nav.about')" :title="t('about.title')" />
        <GlassmorphismAboutBlock />
      </GlassmorphismGlassPanel>
    </section>
  </GlassmorphismSubPage>
</template>

<script setup lang="ts">
import GlassmorphismSubPage from '../components/GlassmorphismSubPage.vue'
import GlassmorphismGlassPanel from '../components/GlassmorphismGlassPanel.vue'
import GlassmorphismSectionHead from '../components/GlassmorphismSectionHead.vue'
import GlassmorphismAboutBlock from '../components/GlassmorphismAboutBlock.vue'

const { t } = useI18n()
</script>

<style scoped>
/* 玻璃板：子页单块满宽（首页的之字错位不适用于单块板） */
.sheet {
  min-width: 0;
  margin-bottom: calc(var(--space) * 1.6);
}
</style>
