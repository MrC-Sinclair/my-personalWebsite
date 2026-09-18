<!--
  Soft3DAbout - soft-3d 风格的「关于」子页（/style/soft-3d/about）
  ------------------------------------------------------------
  壳由 Soft3DSubPage 提供（标题 cyan 档）；主体与首页共用
  Soft3DAboutBlock，首页与子页渲染完全一致，只有壳不同。
-->
<template>
  <Soft3DSubPage
    :eyebrow="t('nav.about')"
    :title="t('about.title')"
    :description="t('about.description')"
    variant="cyan"
  >
    <Soft3DAboutBlock/>
  </Soft3DSubPage>
</template>

<script setup lang="ts">
import Soft3DSubPage from '../components/Soft3DSubPage.vue'
import Soft3DAboutBlock from '../components/Soft3DAboutBlock.vue'

const { t } = useI18n()
</script>
