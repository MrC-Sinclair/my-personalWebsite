<!--
  EditorialAbout - editorial 风格的「关于」子页（/style/editorial/about）
  ------------------------------------------------------------
  壳由 EditorialSubPage 提供；主体直接复用首页 01 栏的 EditorialProfile
  （关于 / 技能 / 履历三栏），首页与子页渲染完全一致，只有壳不同。
-->
<template>
  <EditorialSubPage>
    <EditorialProfile/>
  </EditorialSubPage>
</template>

<script setup lang="ts">
import EditorialSubPage from '../components/EditorialSubPage.vue'
import EditorialProfile from '../components/EditorialProfile.vue'
</script>
