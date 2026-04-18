<!--
  AppSidebar - 侧边栏导航组件

  仅在桌面端（lg 断点以上）显示，提供辅助导航功能。
  可用于博客分类导航、文档目录等场景。

  Props：
  - title: 侧边栏标题（可选）
  - items: 导航项列表，每项包含 label（显示文本）和 to（路由路径）

  使用场景：博客详情页、文档页等需要辅助导航的页面
-->
<template>
  <aside
    class="bg-surface-light dark:bg-surface-dark hidden border-r border-gray-200 lg:block dark:border-gray-700"
  >
    <nav class="sticky top-20 p-4">
      <h3
        v-if="title"
        class="text-text-secondary-light dark:text-text-secondary-dark mb-3 text-sm font-semibold uppercase"
      >
        {{ title }}
      </h3>
      <ul class="space-y-1">
        <li v-for="item in items" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 block rounded-md px-3 py-1.5 text-sm transition-colors duration-150"
            active-class="text-primary-500 bg-primary-50 dark:bg-primary-950"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
interface SidebarItem {
  label: string
  to: string
}

defineProps<{
  title?: string
  items: SidebarItem[]
}>()
</script>
