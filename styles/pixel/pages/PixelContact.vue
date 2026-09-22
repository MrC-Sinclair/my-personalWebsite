<!--
  PixelContact - pixel 风格的「联系」子页（/style/pixel/contact）
  ------------------------------------------------------------
  壳由 PixelSubPage 提供；主体是 CONTACT 存档情报对话框
  （自述段落 + PixelContactList 键值行）。首页这块偏左收窄（右侧留白
  呼吸），子页单主题时独占整屏——留白已经在页面两侧，不必再让面板
  自己缩一半。
-->
<template>
  <PixelSubPage>
    <PixelPanel
      id="contact"
      data-section="contact"
      head="CONTACT"
      :title="t('contact.title')"
      :level="1"
    >
      <p class="prose prose--muted">{{ t('contact.description') }}</p>
      <PixelContactList :socials="socialLinks" />
    </PixelPanel>
  </PixelSubPage>
</template>

<script setup lang="ts">
import PixelSubPage from '../components/PixelSubPage.vue'
import PixelPanel from '../components/PixelPanel.vue'
import PixelContactList from '../components/PixelContactList.vue'

const { t } = useI18n()
const { socialLinks } = useAppInfo()
</script>

<style scoped>
.prose {
  margin: 0;
  max-width: 70ch;
}

.prose--muted {
  color: var(--c-muted);
}
</style>
