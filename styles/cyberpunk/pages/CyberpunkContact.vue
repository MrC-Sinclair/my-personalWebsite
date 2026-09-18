<!--
  CyberpunkContact - cyberpunk 风格的「联系」子页（/style/cyberpunk/contact）
  ------------------------------------------------------------
  壳由 CyberpunkSubPage 提供；主体是首页那块「通讯终端」面板
  （社交卡槽带 SLOT.0N 编号、号码可复制）。子页不做右移错位——
  那是首页面板流的错落节奏，单页单面板时居中最稳。
  社交链接是站点静态信息，无异步数据，因此本页不含 useAsyncData。
-->
<template>
  <CyberpunkSubPage>
    <CyberpunkPanel
      class="scroll-reveal scroll-reveal-up"
      :eyebrow="t('nav.contact')"
      :title="t('contact.socialLinks')"
      tone="violet"
    >
      <p class="contact-desc">{{ t('contact.description') }}</p>
      <CyberpunkContactDeck :socials="socialLinks"/>
    </CyberpunkPanel>
  </CyberpunkSubPage>
</template>

<script setup lang="ts">
import CyberpunkSubPage from '../components/CyberpunkSubPage.vue'
import CyberpunkPanel from '../components/CyberpunkPanel.vue'
import CyberpunkContactDeck from '../components/CyberpunkContactDeck.vue'

const { t } = useI18n()

// —— 共享层站点信息（社交链接） ——
const { socialLinks } = useAppInfo()
</script>

<style scoped>
.contact-desc {
  margin: 0 0 var(--space);
  color: var(--c-muted);
}
</style>
