<template>
  <section class="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
    <div class="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/5" />

    <div class="relative mx-auto max-w-4xl text-center">
      <p class="text-primary-500 mb-4 text-lg font-medium">
        {{ t('home.greeting') }}
      </p>
      <h1 class="text-text-primary-light dark:text-text-primary-dark mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl">
        {{ t('home.name') }}
      </h1>
      <p class="text-primary-400 mb-4 text-xl font-semibold sm:text-2xl">
        {{ t('home.tagline') }}
      </p>
      <p class="text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-10 max-w-2xl text-lg">
        {{ t('home.description') }}
      </p>

      <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <UButton
          :to="localePath('/blog')"
          variant="solid"
          size="xl"
        >
          {{ t('home.viewBlog') }}
        </UButton>
        <UButton
          :to="localePath('/projects')"
          variant="outline"
          size="xl"
        >
          {{ t('home.viewProjects') }}
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>
