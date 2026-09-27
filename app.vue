<!--
  Nuxt 应用入口组件

  顶层结构：
  - NuxtLoadingIndicator: 页面切换顶部进度条
  - NuxtLayout: 布局容器（风格路由用 layouts/style.vue；画廊用 layout: false 自带页头页脚）
  - NuxtPage: 页面路由容器（根据路由渲染对应 pages/ 下的页面）

  阶段 3 说明：原外层 <UApp>（Nuxt UI 全局容器）已随过渡层移除。
-->
<script setup lang="ts">
// RSS 自动发现（feed 由 nuxt.config.ts 在构建期生成：feed.xml 与 en/feed.xml）
// 放在应用壳里而不是 nuxt.config 的 app.head，是因为后者是静态的，无法按语言
// 切换 href；这里用 useHead 的函数形式跟随 locale 变化。
const { locale } = useI18n()
const baseURL = useRuntimeConfig().app.baseURL

useHead(() => ({
  link: [
    {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: locale.value === 'zh' ? 'RSS · 技术博客（中文）' : 'RSS · Tech Blog (English)',
      href: `${baseURL}${locale.value === 'zh' ? '' : 'en/'}feed.xml`,
    },
  ],
}))
</script>

<template>
  <NuxtLoadingIndicator color="#6366f1" :height="3" :duration="2000" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
