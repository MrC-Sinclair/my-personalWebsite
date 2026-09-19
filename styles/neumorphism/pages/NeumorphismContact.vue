<!--
  NeumorphismContact - neumorphism 风格的「联系」子页（/style/neumorphism/contact）
  ------------------------------------------------------------
  壳由 NeumorphismSubPage 提供；主体是一块凸起面板：引导语 + 小节
  标题 + 社交信息凹槽行（不复用过渡层 ContactForm）。
-->
<template>
  <NeumorphismSubPage>
    <NeumorphismPanel
      id="contact"
      data-section="contact"
      :level="1"
      :title="t('contact.title')"
      :lead="t('contact.description')"
    >
      <h3 class="block-title">{{ t('contact.socialLinks') }}</h3>
      <NeumorphismContactList :socials="socialLinks" />
    </NeumorphismPanel>
  </NeumorphismSubPage>
</template>

<script setup lang="ts">
import NeumorphismSubPage from '../components/NeumorphismSubPage.vue'
import NeumorphismPanel from '../components/NeumorphismPanel.vue'
import NeumorphismContactList from '../components/NeumorphismContactList.vue'

const { t } = useI18n()
const { socialLinks } = useAppInfo()
</script>

<style scoped>
/* —— 区块标题（面板内的小节标题） —— */
.block-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-muted);
}
</style>
