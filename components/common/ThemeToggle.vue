<template>
  <ClientOnly>
    <button
      class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 transition-colors duration-150"
      :aria-label="isDark ? t('common.lightMode') : t('common.darkMode')"
      @click="toggleColorMode"
    >
      <UIcon v-if="isDark" name="i-heroicons-sun" class="h-5 w-5" />
      <UIcon v-else name="i-heroicons-moon" class="h-5 w-5" />
    </button>
    <template #fallback>
      <button
        class="text-text-secondary-light dark:text-text-secondary-dark transition-colors duration-150"
        :aria-label="t('common.darkMode')"
      >
        <UIcon name="i-heroicons-moon" class="h-5 w-5" />
      </button>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const { t } = useI18n()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (value: boolean) => {
    colorMode.preference = value ? 'dark' : 'light'
  },
})

function toggleColorMode() {
  isDark.value = !isDark.value
}
</script>
