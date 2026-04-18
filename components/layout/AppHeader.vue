<template>
  <header
    class="bg-surface-light/80 dark:bg-surface-dark/80 sticky top-0 z-50 backdrop-blur-md transition-colors duration-250"
  >
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <NuxtLink :to="localePath('/')" class="text-primary-500 text-xl font-bold">
        {{ siteConfig.name }}
      </NuxtLink>

      <div class="hidden items-center gap-6 md:flex">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="localePath(item.to)"
          class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 transition-colors duration-150"
          active-class="text-primary-500"
        >
          {{ item.label }}
        </NuxtLink>
      </div>

      <div class="flex items-center gap-2">
        <LangSwitcher />
        <ThemeToggle />

        <button
          class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 ml-2 md:hidden"
          aria-label="菜单"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <UIcon v-if="!isMobileMenuOpen" name="i-heroicons-bars-3" class="h-6 w-6" />
          <UIcon v-else name="i-heroicons-x-mark" class="h-6 w-6" />
        </button>
      </div>
    </nav>

    <div
      v-if="isMobileMenuOpen"
      class="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 md:hidden"
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
  </header>
</template>

<script setup lang="ts">
const { navItems, siteConfig } = useAppInfo()
const localePath = useLocalePath()

const isMobileMenuOpen = ref(false)

const route = useRoute()
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
  },
)
</script>
