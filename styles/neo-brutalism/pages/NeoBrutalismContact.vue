<!--
  NeoBrutalismContact - neo-brutalism 风格的「联系」子页（/style/neo-brutalism/contact）
  ------------------------------------------------------------
  壳由 NeoBrutalismSubPage 提供；主体直接复用首页那块全宽黑幕
  联系看板（社交卡片带海报黄硬影、号码可复制）。
  社交链接是站点静态信息，无异步数据，因此本页不含 useAsyncData。
-->
<template>
  <NeoBrutalismSubPage>
    <NeoBrutalismSectionTitle :text="t('contact.title')" tone="ink" :level="1"/>
    <NeoBrutalismContactBoard class="contact-band scroll-reveal" :socials="socialLinks"/>
  </NeoBrutalismSubPage>
</template>

<script setup lang="ts">
import NeoBrutalismSubPage from '../components/NeoBrutalismSubPage.vue'
import NeoBrutalismContactBoard from '../components/NeoBrutalismContactBoard.vue'
import NeoBrutalismSectionTitle from '../components/NeoBrutalismSectionTitle.vue'

// 本页原本不直接用 i18n，补页头后需要取标题文案
const { t } = useI18n()

// —— 共享层站点信息（社交链接） ——
const { socialLinks } = useAppInfo()
</script>

<style scoped>
/* 看板落在内容带里，去掉首页的「溢出到 shell 之外」定位 */
.contact-band {
  scroll-margin-top: 6rem;
}
</style>
