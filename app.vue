<!--
  Nuxt 应用入口组件

  顶层结构：
  - UApp: Nuxt UI 全局应用容器（提供 toast、modal 等全局功能）
  - NuxtLoadingIndicator: 页面切换顶部进度条
  - NuxtLayout: 布局容器（默认使用 layouts/default.vue）
  - NuxtPage: 页面路由容器（根据路由渲染对应 pages/ 下的页面）
-->
<template>
  <UApp>
    <NuxtLoadingIndicator color="#6366f1" :height="3" :duration="2000" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
