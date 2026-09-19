<!--
  SwissContact - swiss 风格的「联系」子页（/style/swiss/contact）
  ------------------------------------------------------------
  壳由 SwissSubPage 提供；主体是编号区块头 + 社交信息条目
  （不复用过渡层 ContactForm）。
-->
<template>
  <SwissSubPage>
    <section class="section scroll-reveal scroll-reveal-up" aria-labelledby="contact-head">
      <SwissSectionHead
        :no="1"
        :level="1"
        head-id="contact-head"
        :title="t('contact.title')"
        :meta="t('contact.socialLinks')"
      />
      <div class="section-body">
        <SwissContact v-if="socialList.length" :socials="socialList" />
        <p v-else class="empty">{{ t('contact.description') }}</p>
      </div>
    </section>
  </SwissSubPage>
</template>

<script setup lang="ts">
import SwissSubPage from '../components/SwissSubPage.vue'
import SwissSectionHead from '../components/SwissSectionHead.vue'
import SwissContact from '../components/SwissContact.vue'

const { t } = useI18n()
const { socialLinks } = useAppInfo()

const socialList = computed(() => (Array.isArray(socialLinks.value) ? socialLinks.value : []))
</script>

<style scoped>
.section {
  margin-top: calc(var(--space) * 2.4);
}

.section-body {
  margin-top: var(--space);
}

/* 空状态：细则线框 + 提示文案（不留白） */
.empty {
  padding: var(--space) 0;
  margin: 0;
  border-top: var(--border-w) solid var(--c-border);
  border-bottom: var(--border-w) solid var(--c-border);
  color: var(--c-muted);
}

@media (min-width: 768px) {
  .section {
    margin-top: calc(var(--space) * 2.8);
  }
}
</style>
