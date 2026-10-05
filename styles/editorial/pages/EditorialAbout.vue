<!--
  EditorialAbout - editorial 风格的「关于」子页（/style/editorial/about）
  ------------------------------------------------------------
  壳由 EditorialSubPage 提供；主体直接复用首页 01 栏的 EditorialProfile
  （关于 / 技能 / 履历三栏），首页与子页渲染完全一致，只有壳不同。
-->
<template>
  <EditorialSubPage>
    <!-- 页头在 EditorialProfile 内部（它自带一个刊头），这里把层级传成 1：
         子页需要 h1，首页则是并列分区用 h2 -->
    <EditorialProfile :level="1"/>
  </EditorialSubPage>
</template>

<script setup lang="ts">
import EditorialSubPage from '../components/EditorialSubPage.vue'
import EditorialProfile from '../components/EditorialProfile.vue'
</script>
