<!--
  RetroComputerContact - 复古电脑风格的「联系」子页（/style/retro-computer/contact）
  ------------------------------------------------------------
  桌面隐喻下这一页是唯一开着的「通讯录」窗口，内容与首页联系窗口
  同一份（RetroComputerContactBlock），只有壳不同。
  不复用过渡层 ContactForm：本风格不提交表单，只陈列信息。
-->
<template>
  <RetroComputerSubPage window-id="win-contact" :title="t('contact.title')" icon="mail">
    <RetroComputerContactBlock />
  </RetroComputerSubPage>
</template>

<script setup lang="ts">
import RetroComputerSubPage from '../components/RetroComputerSubPage.vue'
import RetroComputerContactBlock from '../components/RetroComputerContactBlock.vue'

const { t } = useI18n()
</script>
