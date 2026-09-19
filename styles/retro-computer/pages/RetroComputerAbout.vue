<!--
  RetroComputerAbout - 复古电脑风格的「关于」子页（/style/retro-computer/about）
  ------------------------------------------------------------
  桌面隐喻下这一页是桌面上唯一开着的「记事本」窗口，内容与首页
  关于窗口同一份（RetroComputerAboutBlock），只有壳不同。
-->
<template>
  <RetroComputerSubPage window-id="win-about" :title="t('about.title')" icon="user">
    <RetroComputerAboutBlock />
  </RetroComputerSubPage>
</template>

<script setup lang="ts">
import RetroComputerSubPage from '../components/RetroComputerSubPage.vue'
import RetroComputerAboutBlock from '../components/RetroComputerAboutBlock.vue'

const { t } = useI18n()
</script>
