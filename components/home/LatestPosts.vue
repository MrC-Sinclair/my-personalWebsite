<template>
  <section class="px-4 py-16 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8 flex items-center justify-between">
        <h2 class="text-text-primary-light dark:text-text-primary-dark text-2xl font-bold sm:text-3xl">
          {{ t('home.latestPosts') }}
        </h2>
        <UButton
          :to="localePath('/blog')"
          variant="ghost"
          trailing-icon="i-heroicons-arrow-right"
        >
          {{ t('home.viewAll') }}
        </UButton>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <BlogCard v-for="post in posts" :key="post.path" :post="post" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'

defineProps<{
  posts: BlogPost[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
