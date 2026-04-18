<!--
  默认布局 - 全站共享页面结构

  结构：
  - AppHeader: 固定顶部导航栏
  - main: 页面内容区域（flex-1 确保页脚始终在底部）
  - AppFooter: 页脚

  使用场景：所有页面默认使用此布局
-->
<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
