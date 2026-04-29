<!--
  AppHeader - 全局顶部导航栏组件

  固定吸顶，滚动时添加毛玻璃背景效果。
  桌面端显示完整导航菜单，移动端显示汉堡菜单。

  功能：
  - Logo/站点名称（链接到首页）
  - 导航菜单（首页/博客/项目/关于/联系）
  - 搜索按钮（触发 SearchModal）
  - 语言切换按钮（LangSwitcher）
  - 主题切换按钮（ThemeToggle）
  - 移动端汉堡菜单（md 以下显示，含外部点击关闭 + body scroll lock）

  依赖：
  - useAppInfo() 提供 navItems 和 siteConfig
  - useLocalePath() 处理国际化路由

  使用场景：layouts/default.vue 全局布局
-->
<template>
  <header
    ref="headerRef"
    class="bg-surface-light/95 dark:bg-surface-dark/95 z-modal border-border-light duration-normal dark:border-border-dark sticky top-0 border-b backdrop-blur-md transition-colors"
  >
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <NuxtLink
        :to="localePath('/')"
        class="text-primary-500 duration-fast text-xl font-bold transition-opacity hover:opacity-80"
      >
        {{ siteConfig.name }}
      </NuxtLink>

      <div class="hidden items-center gap-6 md:flex">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="localePath(item.to)"
          class="nav-link text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 duration-fast relative transition-colors"
          active-class="!text-primary-500"
        >
          {{ item.label }}
        </NuxtLink>
      </div>

      <div class="flex items-center gap-2">
        <UTooltip :text="t('common.search')">
          <button
            class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 duration-fast flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
            :aria-label="t('common.search')"
            @click="searchModal?.openSearch()"
          >
            <UIcon name="i-heroicons-magnifying-glass" class="h-5 w-5" />
          </button>
        </UTooltip>
        <LangSwitcher />
        <ThemeToggle />

        <UTooltip :text="isMobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')">
          <button
            class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 ml-2 flex h-10 w-10 items-center justify-center md:hidden"
            :aria-label="isMobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')"
            @click.stop="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <UIcon v-if="!isMobileMenuOpen" name="i-heroicons-bars-3" class="h-6 w-6" />
            <UIcon v-else name="i-heroicons-x-mark" class="h-6 w-6" />
          </button>
        </UTooltip>
      </div>
    </nav>

    <Transition
      enter-active-class="transition-all duration-normal ease-out"
      leave-active-class="transition-all duration-normal ease-in"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-80 opacity-100"
      leave-from-class="max-h-80 opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div
        v-if="isMobileMenuOpen"
        class="bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark overflow-hidden border-t md:hidden"
      >
        <div class="space-y-1 px-4 py-3">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="localePath(item.to)"
            class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 duration-fast block rounded-md px-3 py-2 text-base transition-colors"
            active-class="text-primary-500 bg-primary-50 dark:bg-primary-950"
            @click="isMobileMenuOpen = false"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>
    </Transition>

    <SearchModal ref="searchModal" />
  </header>
</template>

<script setup lang="ts">
const { navItems, siteConfig } = useAppInfo()
const localePath = useLocalePath()
const { t } = useI18n()

const isMobileMenuOpen = ref(false)
const headerRef = ref<HTMLElement | null>(null)
const searchModal = ref<{ openSearch: () => void } | null>(null)

const route = useRoute()
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
  },
)

watch(isMobileMenuOpen, (open) => {
  if (import.meta.client) {
    document.body.style.overflow = open ? 'hidden' : ''
  }
})

onMounted(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      isMobileMenuOpen.value &&
      headerRef.value &&
      !headerRef.value.contains(event.target as Node)
    ) {
      isMobileMenuOpen.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.body.style.overflow = ''
  })
})
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
  transition: width var(--duration-normal) ease;
  border-radius: 1px;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}
</style>
