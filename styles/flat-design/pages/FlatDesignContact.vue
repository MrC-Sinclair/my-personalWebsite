<!--
  FlatDesignContact - 扁平化风格「联系」子页
  ------------------------------------------------------------
  首页联系色带的内容已抽成 FlatDesignContactBlock，这里直接复用，子页与
  首页一致。level=1 让色带标题成为本页唯一的 h1。
-->
<template>
  <FlatDesignSubPage>
    <FlatDesignContactBlock :level="1" />
  </FlatDesignSubPage>
</template>

<script setup lang="ts">
import FlatDesignContactBlock from '../components/FlatDesignContactBlock.vue'
import FlatDesignSubPage from '../components/FlatDesignSubPage.vue'
</script>
