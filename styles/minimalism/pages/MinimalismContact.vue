<!--
  MinimalismContact - minimalism 风格的「联系」子页（/style/minimalism/contact）
  ------------------------------------------------------------
  壳由 MinimalismSubPage 提供；主体复用 MinimalismContact 区块组件。
  联系信息是静态站点信息，无异步数据，因此本页不含 useAsyncData。
-->
<template>
  <MinimalismSubPage :title="t('nav.contact')">
    <MinimalismContact />
  </MinimalismSubPage>
</template>

<script setup lang="ts">
import MinimalismSubPage from '../components/MinimalismSubPage.vue'
import MinimalismContact from '../components/MinimalismContact.vue'

const { t } = useI18n()
</script>
