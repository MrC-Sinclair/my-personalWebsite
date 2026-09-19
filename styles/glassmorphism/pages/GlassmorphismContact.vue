<!--
  GlassmorphismContact - glassmorphism 风格的「联系」子页（/style/glassmorphism/contact）
  ------------------------------------------------------------
  壳由 GlassmorphismSubPage 提供；主体是一块磨砂玻璃板里的联系方式
  玻璃板组（不复用过渡层 ContactForm）。
-->
<template>
  <GlassmorphismSubPage>
    <section id="contact" data-section="contact" class="sheet scroll-reveal scroll-reveal-up">
      <GlassmorphismGlassPanel>
        <GlassmorphismSectionHead
          :level="1"
          :eyebrow="t('nav.contact')"
          :title="t('contact.title')"
        />
        <GlassmorphismContactBoard :socials="socialLinks" />
      </GlassmorphismGlassPanel>
    </section>
  </GlassmorphismSubPage>
</template>

<script setup lang="ts">
import GlassmorphismSubPage from '../components/GlassmorphismSubPage.vue'
import GlassmorphismGlassPanel from '../components/GlassmorphismGlassPanel.vue'
import GlassmorphismSectionHead from '../components/GlassmorphismSectionHead.vue'
import GlassmorphismContactBoard from '../components/GlassmorphismContactBoard.vue'

const { t } = useI18n()
const { socialLinks } = useAppInfo()
</script>

<style scoped>
/* 玻璃板 */
.sheet {
  min-width: 0;
  margin-bottom: calc(var(--space) * 1.6);
}
</style>
