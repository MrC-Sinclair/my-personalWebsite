<!--
  Nuxt 应用入口组件

  顶层结构：
  - NuxtLoadingIndicator: 页面切换顶部进度条
  - NuxtLayout: 布局容器（风格路由用 layouts/style.vue；画廊用 layout: false 自带页头页脚）
  - NuxtPage: 页面路由容器（根据路由渲染对应 pages/ 下的页面）

  阶段 3 说明：原外层 <UApp>（Nuxt UI 全局容器）已随过渡层移除。
-->
<template>
  <NuxtLoadingIndicator color="#6366f1" :height="3" :duration="2000" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
