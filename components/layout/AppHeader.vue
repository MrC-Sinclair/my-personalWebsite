<!--
  AppHeader - 全局顶部导航栏组件

  固定吸顶，滚动时添加毛玻璃背景效果。
  桌面端显示完整导航菜单，移动端显示汉堡菜单。

  功能：
  - Logo/站点名称（链接到首页）
  - 导航菜单（首页/博客/项目/关于/联系）
  - 语言切换按钮（LangSwitcher）
  - 主题切换按钮（ThemeToggle）
  - 移动端汉堡菜单（md 以下显示）

  依赖：
  - useAppInfo() 提供 navItems 和 siteConfig
  - useLocalePath() 处理国际化路由

  使用场景：layouts/default.vue 全局布局
-->
<template>
  <header
    class="bg-surface-light/80 dark:bg-surface-dark/80 sticky top-0 z-50 backdrop-blur-md transition-colors duration-250"
  >
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <NuxtLink
        :to="localePath('/')"
        class="text-primary-500 text-xl font-bold transition-opacity duration-150 hover:opacity-80"
      >
        {{ siteConfig.name }}
      </NuxtLink>

      <div class="hidden items-center gap-6 md:flex">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="localePath(item.to)"
          class="nav-link text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 relative transition-colors duration-150"
          active-class="!text-primary-500"
        >
          {{ item.label }}
        </NuxtLink>
      </div>

      <div class="flex items-center gap-2">
        <LangSwitcher />
        <ThemeToggle />

        <UTooltip :text="isMobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')">
          <button
            class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 ml-2 flex h-10 w-10 items-center justify-center md:hidden"
            aria-label="菜单"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <UIcon v-if="!isMobileMenuOpen" name="i-heroicons-bars-3" class="h-6 w-6" />
            <UIcon v-else name="i-heroicons-x-mark" class="h-6 w-6" />
          </button>
        </UTooltip>
      </div>
    </nav>

    <Transition
      enter-active-class="transition-all duration-250 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-80 opacity-100"
      leave-from-class="max-h-80 opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div
        v-if="isMobileMenuOpen"
        class="bg-surface-light dark:bg-surface-dark overflow-hidden border-t border-gray-200 md:hidden dark:border-gray-700"
      >
        <div class="space-y-1 px-4 py-3">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="localePath(item.to)"
            class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 block rounded-md px-3 py-2 text-base transition-colors duration-150"
            active-class="text-primary-500 bg-primary-50 dark:bg-primary-950"
            @click="isMobileMenuOpen = false"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const { navItems, siteConfig } = useAppInfo()
const localePath = useLocalePath()
const { t } = useI18n()

const isMobileMenuOpen = ref(false)

const route = useRoute()
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
  },
)
</script>

<style scoped>
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--color-primary-500);
  transition: width 250ms ease;
  border-radius: 1px;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}
</style>
