<!--
  FlatDesignAbout - 扁平化风格「关于」子页
  ------------------------------------------------------------
  首页关于色带的内容已抽成 FlatDesignAboutBlock，这里直接复用，子页与
  首页一致。level=1 让色带标题成为本页唯一的 h1。
-->
<template>
  <FlatDesignSubPage>
    <FlatDesignAboutBlock :level="1" />
  </FlatDesignSubPage>
</template>

<script setup lang="ts">
import FlatDesignAboutBlock from '../components/FlatDesignAboutBlock.vue'
import FlatDesignSubPage from '../components/FlatDesignSubPage.vue'
</script>
