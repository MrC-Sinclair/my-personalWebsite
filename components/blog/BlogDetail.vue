<template>
  <article class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-8">
      <div class="mb-4 flex flex-wrap gap-2">
        <UBadge v-if="post.category" variant="subtle" size="sm">
          {{ post.category }}
        </UBadge>
        <UBadge
          v-for="tag in post.tags"
          :key="tag"
          variant="outline"
          size="xs"
        >
          {{ tag }}
        </UBadge>
      </div>

      <h1 class="text-text-primary-light dark:text-text-primary-dark mb-4 text-3xl font-bold sm:text-4xl">
        {{ post.title }}
      </h1>

      <div class="text-text-secondary-light dark:text-text-secondary-dark flex flex-wrap items-center gap-4 text-sm">
        <span class="flex items-center gap-1">
          <UIcon name="i-heroicons-calendar" class="h-4 w-4" />
          <time :datetime="post.date">{{ formattedDate }}</time>
        </span>
        <span v-if="post.updated" class="flex items-center gap-1">
          <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          {{ t('blog.updatedAt') }} {{ formattedUpdated }}
        </span>
      </div>
    </header>

    <div class="flex gap-8">
      <div class="min-w-0 flex-1">
        <div class="prose prose-lg dark:prose-invert max-w-none">
          <ContentRenderer :value="content" />
        </div>
      </div>

      <BlogToc v-if="toc && toc.links.length > 0" :toc="toc" class="hidden lg:block" />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'

const props = defineProps<{
  post: BlogPost
  content: Record<string, unknown>
}>()

const { t, locale } = useI18n()

const formattedDate = computed(() => formatDate(props.post.date, locale.value))
const formattedUpdated = computed(() =>
  props.post.updated ? formatDate(props.post.updated, locale.value) : '',
)

const toc = computed(() => {
  const body = props.content?.body as Record<string, unknown> | undefined
  return body?.toc as { links: Array<{ id: string; text: string; depth: number }> } | undefined
})
</script>
