<!--
  TerminalContact - terminal 风格的「联系」子页（/style/terminal/contact）
  ------------------------------------------------------------
  壳由 TerminalSubPage 提供；主体复用 TerminalBlockContact
  （联系方式区块的数据全部来自共享层 useAppInfo，本页无需取数）。
-->
<template>
  <TerminalSubPage :title="t('nav.contact')">
    <TerminalBlockContact />
  </TerminalSubPage>
</template>

<script setup lang="ts">
import TerminalSubPage from '../components/TerminalSubPage.vue'
import TerminalBlockContact from '../components/TerminalBlockContact.vue'

const { t } = useI18n()
</script>
