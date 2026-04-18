<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="p-4">
        <UInput
          v-model="searchQuery"
          :placeholder="t('blog.search')"
          icon="i-heroicons-magnifying-glass"
          size="lg"
          autofocus
        />
        <div v-if="searchQuery" class="mt-4 space-y-2">
          <NuxtLink
            v-for="result in searchResults"
            :key="result.path"
            :to="localePath(result.path)"
            class="hover:bg-primary-50 dark:hover:bg-primary-950 block rounded-md p-3 transition-colors duration-150"
            @click="isOpen = false"
          >
            <div class="text-text-primary-light dark:text-text-primary-dark font-medium">
              {{ result.title }}
            </div>
            <div v-if="result.description" class="text-text-secondary-light dark:text-text-secondary-dark mt-1 text-sm">
              {{ result.description }}
            </div>
          </NuxtLink>
          <div v-if="searchResults.length === 0" class="text-text-secondary-light dark:text-text-secondary-dark py-4 text-center text-sm">
            {{ t('blog.noResults') }}
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const isOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref<Array<{ title: string; description?: string; path: string }>>([])

function openSearch() {
  isOpen.value = true
  searchQuery.value = ''
}

defineExpose({ openSearch })

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      openSearch()
    }
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>
