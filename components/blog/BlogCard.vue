<template>
  <article class="bg-surface-light dark:bg-surface-dark hover:shadow-lg group overflow-hidden rounded-xl shadow-md transition-shadow duration-250">
    <NuxtLink :to="localePath(blogPath)">
      <div v-if="post.image" class="overflow-hidden">
        <NuxtImg
          :src="post.image"
          :alt="post.title"
          class="h-48 w-full object-cover transition-transform duration-250 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div class="p-5">
        <div class="mb-2 flex flex-wrap gap-2">
          <UBadge
            v-for="tag in post.tags.slice(0, 3)"
            :key="tag"
            variant="subtle"
            size="xs"
          >
            {{ tag }}
          </UBadge>
        </div>

        <h3 class="text-text-primary-light dark:text-text-primary-dark mb-2 text-lg font-semibold group-hover:text-primary-500 transition-colors duration-150">
          {{ post.title }}
        </h3>

        <p v-if="post.description" class="text-text-secondary-light dark:text-text-secondary-dark mb-3 line-clamp-2 text-sm">
          {{ post.description }}
        </p>

        <div class="text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2 text-xs">
          <UIcon name="i-heroicons-calendar" class="h-3.5 w-3.5" />
          <time :datetime="post.date">{{ formattedDate }}</time>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'

const props = defineProps<{
  post: BlogPost
}>()

const { locale } = useI18n()
const localePath = useLocalePath()

const formattedDate = computed(() => formatDate(props.post.date, locale.value))

const blogPath = computed(() => {
  const path = props.post.path
  const slug = path.split('/').pop()?.replace(/\.md$/, '') || ''
  return `/blog/${slug}`
})
</script>
