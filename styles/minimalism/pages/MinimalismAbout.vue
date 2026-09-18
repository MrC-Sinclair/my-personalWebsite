<!--
  MinimalismAbout - minimalism 风格的「关于」子页（/style/minimalism/about）
  ------------------------------------------------------------
  壳（吸顶导航 / 子页标题 / 页脚）由 MinimalismSubPage 提供，
  本文件只负责主体区块。区块复用首页同款 MinimalismAbout——
  内容同源，改动一处两处同时生效，不会各写一套。
-->
<template>
  <MinimalismSubPage :title="t('nav.about')">
    <MinimalismAbout />
  </MinimalismSubPage>
</template>

<script setup lang="ts">
import MinimalismSubPage from '../components/MinimalismSubPage.vue'
import MinimalismAbout from '../components/MinimalismAbout.vue'

const { t } = useI18n()
</script>
