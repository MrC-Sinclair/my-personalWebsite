<!--
  LiquidGlassContact - liquid-glass 风格的「联系」子页（/style/liquid-glass/contact）
  ------------------------------------------------------------
  壳由 LiquidGlassSubPage 提供；主体与首页联系区一致：一块玻璃展台
  内嵌无 backdrop-filter 的社交展格（避免面板内嵌套模糊）。
  社交链接是站点静态信息，无异步数据，因此本页不含 useAsyncData。
-->
<template>
  <LiquidGlassSubPage>
    <LiquidGlassPanel :eyebrow="t('nav.contact')" :title="t('contact.socialLinks')">
      <div class="contact-body scroll-reveal scroll-reveal-up">
        <p class="contact-desc">{{ t('contact.description') }}</p>
        <LiquidGlassContactGrid :socials="socialLinks"/>
      </div>
    </LiquidGlassPanel>
  </LiquidGlassSubPage>
</template>

<script setup lang="ts">
import LiquidGlassSubPage from '../components/LiquidGlassSubPage.vue'
import LiquidGlassPanel from '../components/LiquidGlassPanel.vue'
import LiquidGlassContactGrid from '../components/LiquidGlassContactGrid.vue'

const { t } = useI18n()

// —— 共享层站点信息（社交链接） ——
const { socialLinks } = useAppInfo()
</script>

<style scoped>
.contact-desc {
  margin: 0 0 18px;
  color: var(--c-muted);
}
</style>
