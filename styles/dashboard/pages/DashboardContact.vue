<!--
  DashboardContact - dashboard 风格的「联系」子页（/style/dashboard/contact）
  ------------------------------------------------------------
  壳由 DashboardSubPage 提供；主体是联系方式卡片网格面板。
  首页这块只占 4 栏（右侧留白给表格），子页单主题时占满 12 栏——
  卡片网格本来就是等宽自适应的，压窄反而浪费。
-->
<template>
  <DashboardSubPage
    :eyebrow="t('nav.contact')"
    :title="t('contact.title')"
    :description="t('contact.description')"
  >
    <DashboardPanel
      id="contact"
      class="cell"
      :eyebrow="t('nav.contact')"
      :title="t('contact.socialLinks')"
      :meta="String(socialLinks.length)"
    >
      <DashboardContactGrid :socials="socialLinks" />
    </DashboardPanel>
  </DashboardSubPage>
</template>

<script setup lang="ts">
import DashboardSubPage from '../components/DashboardSubPage.vue'
import DashboardPanel from '../components/DashboardPanel.vue'
import DashboardContactGrid from '../components/DashboardContactGrid.vue'

const { t } = useI18n()
const { socialLinks } = useAppInfo()
</script>

<style scoped>
.cell {
  min-width: 0;
  grid-column: span 12;
}
</style>
