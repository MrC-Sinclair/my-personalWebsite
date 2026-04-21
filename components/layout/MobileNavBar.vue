<!--
  MobileNavBar - 移动端底部导航栏组件

  在移动端（md 断点以下）固定在底部的导航栏，
  提供主要页面的快速切换入口，替代汉堡菜单的导航功能。

  内容：
  - 首页（i-heroicons-home）
  - 博客（i-heroicons-document-text）
  - 项目（i-heroicons-cube）
  - 关于（i-heroicons-user）
  - 联系（i-heroicons-envelope）

  交互：
  - 当前页面高亮显示，带缩放动画
  - 适配安全区域（safe-bottom）
  - 仅在 md 以下断点显示

  依赖：
  - useAppInfo() 提供 navItems
  - useLocalePath() 处理国际化路由
  - useRoute() 判断当前路由高亮

  使用场景：layouts/default.vue 全局布局
-->
<template>
  <nav
    class="bg-surface-light/95 dark:bg-surface-dark/95 safe-bottom fixed right-0 bottom-0 left-0 z-40 border-t border-gray-200 backdrop-blur-md md:hidden dark:border-gray-700"
    aria-label="移动端导航"
  >
    <div class="flex items-center justify-around py-1">
      <NuxtLink
        v-for="item in mobileNavItems"
        :key="item.to"
        :to="localePath(item.to)"
        class="mobile-nav-item flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2"
        :class="
          isActive(item.to)
            ? 'text-primary-500'
            : 'text-text-secondary-light dark:text-text-secondary-dark'
        "
      >
        <UIcon :name="item.icon" class="h-5 w-5" />
        <span class="text-[10px] leading-tight">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { navItems } = useAppInfo()
const localePath = useLocalePath()
const route = useRoute()

const iconMap: Record<string, string> = {
  '/': 'i-heroicons-home',
  '/blog': 'i-heroicons-document-text',
  '/projects': 'i-heroicons-cube',
  '/about': 'i-heroicons-user',
  '/contact': 'i-heroicons-envelope',
}

const mobileNavItems = computed(() =>
  navItems.value.map((item) => ({
    ...item,
    icon: iconMap[item.to] || 'i-heroicons-link',
  })),
)

function isActive(path: string) {
  if (path === '/') return route.path === '/' || route.path === '/my-personalWebsite/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.mobile-nav-item {
  transition: transform 150ms ease, color 150ms ease;
}

.mobile-nav-item:active {
  transform: scale(0.9);
}
</style>
