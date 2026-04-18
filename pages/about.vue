<template>
  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-12 text-center">
      <h1 class="text-text-primary-light dark:text-text-primary-dark mb-4 text-3xl font-bold sm:text-4xl">
        {{ t('about.title') }}
      </h1>
      <p class="text-text-secondary-light dark:text-text-secondary-dark text-lg">
        {{ t('about.description') }}
      </p>
    </header>

    <section class="mb-12">
      <div class="flex flex-col items-center gap-8 md:flex-row md:items-start">
        <div class="bg-primary-100 dark:bg-primary-900 flex h-32 w-32 shrink-0 items-center justify-center rounded-full">
          <UIcon name="i-heroicons-user" class="text-primary-500 h-16 w-16" />
        </div>
        <div>
          <h2 class="text-text-primary-light dark:text-text-primary-dark mb-2 text-2xl font-bold">
            {{ siteConfig.author }}
          </h2>
          <p class="text-text-secondary-light dark:text-text-secondary-dark text-lg">
            {{ t('home.tagline') }}
          </p>
          <p class="text-text-secondary-light dark:text-text-secondary-dark mt-4">
            {{ t('home.description') }}
          </p>
        </div>
      </div>
    </section>

    <section class="mb-12">
      <h2 class="text-text-primary-light dark:text-text-primary-dark mb-6 text-2xl font-bold">
        {{ t('about.skills') }}
      </h2>
      <div class="grid gap-6 sm:grid-cols-2">
        <div
          v-for="group in skillGroups"
          :key="group.category"
          class="bg-surface-light dark:bg-surface-dark rounded-xl p-5 shadow-sm"
        >
          <h3 class="text-primary-500 mb-3 font-semibold">
            {{ group.category }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="skill in group.skills"
              :key="skill"
              variant="subtle"
              size="sm"
            >
              {{ skill }}
            </UBadge>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-text-primary-light dark:text-text-primary-dark mb-6 text-2xl font-bold">
        {{ t('about.experience') }}
      </h2>
      <div class="relative space-y-8 border-l-2 border-primary-200 pl-6 dark:border-primary-800">
        <div
          v-for="(item, index) in timeline"
          :key="index"
          class="relative"
        >
          <div class="bg-primary-500 absolute -left-[1.85rem] top-1 h-4 w-4 rounded-full" />
          <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-5 shadow-sm">
            <span class="text-primary-500 text-sm font-medium">{{ item.period }}</span>
            <h3 class="text-text-primary-light dark:text-text-primary-dark mt-1 text-lg font-semibold">
              {{ item.title }}
            </h3>
            <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              {{ item.organization }}
            </p>
            <p class="text-text-secondary-light dark:text-text-secondary-dark mt-2 text-sm">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { siteConfig, skillGroups, timeline } = useAppInfo()

useHead({
  title: t('about.title'),
})
</script>
