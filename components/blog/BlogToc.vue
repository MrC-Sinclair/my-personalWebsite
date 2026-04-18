<template>
  <nav class="sticky top-20 w-56 shrink-0">
    <h4 class="text-text-secondary-light dark:text-text-secondary-dark mb-3 text-sm font-semibold uppercase">
      {{ t('blog.toc') }}
    </h4>
    <ul class="space-y-1">
      <li v-for="link in toc.links" :key="link.id">
        <a
          :href="`#${link.id}`"
          class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 block text-sm transition-colors duration-150"
          :class="{ 'pl-4': link.depth === 3 }"
        >
          {{ link.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
interface TocLink {
  id: string
  text: string
  depth: number
}

defineProps<{
  toc: { links: TocLink[] }
}>()

const { t } = useI18n()
</script>
