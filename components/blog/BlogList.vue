<template>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <BlogCard v-for="post in posts" :key="post.path" :post="post" />
  </div>

  <div v-if="posts.length === 0" class="text-text-secondary-light dark:text-text-secondary-dark py-12 text-center">
    {{ t('blog.noResults') }}
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'

defineProps<{
  posts: BlogPost[]
}>()

const { t } = useI18n()
</script>
