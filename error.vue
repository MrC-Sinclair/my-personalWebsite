<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
    <h1 class="text-primary-500 mb-4 text-8xl font-bold">
      {{ error?.statusCode || 404 }}
    </h1>
    <p class="text-text-secondary-light dark:text-text-secondary-dark mb-8 text-xl">
      {{ error?.statusMessage || t('common.notFound') }}
    </p>
    <UButton
      :to="localePath('/')"
      variant="solid"
      size="lg"
    >
      {{ t('common.goHome') }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()
const localePath = useLocalePath()

useHead({
  title: `${props.error?.statusCode || 404} - ${props.error?.statusMessage || ''}`,
})
</script>
