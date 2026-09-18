<!--
  EditorialContact - editorial 风格的「联系」子页（/style/editorial/contact）
  ------------------------------------------------------------
  壳由 EditorialSubPage 提供；主体直接复用首页 04 栏的 EditorialContact
  （社交图版）。社交链接是站点静态信息，无异步数据，
  因此本页不含 useAsyncData。
-->
<template>
  <EditorialSubPage>
    <EditorialContact/>
  </EditorialSubPage>
</template>

<script setup lang="ts">
import EditorialSubPage from '../components/EditorialSubPage.vue'
import EditorialContact from '../components/EditorialContact.vue'
</script>
