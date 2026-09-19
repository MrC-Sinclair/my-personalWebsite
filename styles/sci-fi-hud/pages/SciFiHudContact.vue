<!--
  SciFiHudContact - sci-fi-hud 风格的「联系」子页（/style/sci-fi-hud/contact）
  ------------------------------------------------------------
  壳由 SciFiHudSubPage 提供；主体是单个 SEC-05 通讯频道面板。
  首页这块只占 5 栏（与 7 栏的数据流并排），子页单主题时占满整幅——
  频道卡本来就是等宽自适应的，压窄反而浪费读数面积。
-->
<template>
  <SciFiHudSubPage>
    <SciFiHudPanel
      code="SEC-05"
      :level="1"
      :title="t('contact.title')"
      :meta="t('contact.socialLinks')"
      class="scroll-reveal scroll-reveal-up"
    >
      <p class="contact-desc">{{ t('contact.description') }}</p>
      <SciFiHudContactDeck :socials="socialLinks" />
    </SciFiHudPanel>
  </SciFiHudSubPage>
</template>

<script setup lang="ts">
import SciFiHudSubPage from '../components/SciFiHudSubPage.vue'
import SciFiHudPanel from '../components/SciFiHudPanel.vue'
import SciFiHudContactDeck from '../components/SciFiHudContactDeck.vue'

const { t } = useI18n()
const { socialLinks } = useAppInfo()
</script>

<style scoped>
/* —— 通讯面板引导语 —— */
.contact-desc {
  margin: 0 0 var(--space);
  font-size: var(--fs-small);
  color: var(--c-muted);
}
</style>
