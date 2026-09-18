<!--
  Y2KAbout - y2k 风格的「关于」子页（/style/y2k/about）
  ------------------------------------------------------------
  壳由 Y2KSubPage 提供；主体与首页共用 Y2KAboutBlock（violet 简介板
  + cyan 技能板下沉错位），首页与子页渲染完全一致，只有壳不同。
-->
<template>
  <Y2KSubPage>
    <section class="section" :aria-labelledby="'about-title'">
      <Y2KSectionHead id="about-title" :badge="t('nav.about')" :title="t('about.title')"/>
      <Y2KAboutBlock/>
    </section>
  </Y2KSubPage>
</template>

<script setup lang="ts">
import Y2KSubPage from '../components/Y2KSubPage.vue'
import Y2KSectionHead from '../components/Y2KSectionHead.vue'
import Y2KAboutBlock from '../components/Y2KAboutBlock.vue'

const { t } = useI18n()
</script>

<style scoped>
.section {
  min-width: 0;
}
</style>
