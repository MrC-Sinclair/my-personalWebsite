<!--
  FlatDesignSubPage - 扁平化风格子页的统一外壳
  ------------------------------------------------------------
  Flat Design 的排版轴是一张「图形化落地页」：全宽纯色色带纵向分节。
  子页保留这层基底（.fd + 路由导航 + 页脚），内容由各子页以自己的
  色带（band）注入（结构类来自风格级 layout.css，故插槽内容也能取到样式）。

  与首页的差别：去掉 Hero 区（子页已有自己的色带标题 h1），其余色带
  语言完全一致——子页就是「只开着一个主题色带」的落地页。

  用法：
    <FlatDesignSubPage>
      <section class="band band--gray">
        <div class="band__inner">…色带内容…</div>
      </section>
    </FlatDesignSubPage>
-->
<template>
  <div id="top" class="fd">
    <FlatDesignSubNav />

    <main class="fd-main">
      <slot />
    </main>

    <FlatDesignFooter />
  </div>
</template>

<script setup lang="ts">
import FlatDesignFooter from './FlatDesignFooter.vue'
import FlatDesignSubNav from './FlatDesignSubNav.vue'
</script>

<style scoped>
.fd-main {
  display: block;
}
</style>
