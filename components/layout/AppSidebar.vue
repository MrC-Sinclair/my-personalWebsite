<template>
  <aside
    class="bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 hidden lg:block"
  >
    <nav class="sticky top-20 p-4">
      <h3 v-if="title" class="text-text-secondary-light dark:text-text-secondary-dark mb-3 text-sm font-semibold uppercase">
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
