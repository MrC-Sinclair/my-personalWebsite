<!--
  风格布局 - 多风格架构专用裸布局

  只由风格路由壳（pages/style/[style]/[...slug].vue）使用。
  刻意不注入过渡层的 AppHeader / AppFooter / MobileNavBar：
  风格页面的导航、页脚、移动端方案由各风格自己实现（UI 不跨风格复用）。
-->
<template>
  <div class="flex min-h-screen flex-col">
    <slot />
  </div>
</template>
