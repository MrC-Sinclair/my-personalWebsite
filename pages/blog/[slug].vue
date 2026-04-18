<template>
  <div>
    <BlogDetail v-if="post && content" :post="post" :content="content" />

    <div v-else class="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <p class="text-text-secondary-light dark:text-text-secondary-dark text-lg">
        {{ t('blog.noResults') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'

const { t, locale } = useI18n()
const route = useRoute()
const { getPostBySlug } = useBlog()

const slug = route.params.slug as string

const post = ref<BlogPost | null>(null)
const content = ref<Record<string, unknown> | null>(null)

try {
  const collectionName = locale.value === 'zh' ? 'blogZh' : 'blogEn'
  const contentPath = locale.value === 'zh' ? `/blog/zh/${slug}` : `/blog/en/${slug}`

  const data = await queryCollection(collectionName).path(contentPath).first()

  if (data) {
    post.value = {
      title: (data.title as string) || '',
      description: data.description as string | undefined,
      date: (data.date as string) || '',
      updated: data.updated as string | undefined,
      image: data.image as string | undefined,
      tags: (data.tags as string[]) || [],
      category: data.category as string | undefined,
      draft: (data.draft as boolean) || false,
      path: (data.path as string) || '',
    }
    content.value = data as Record<string, unknown>
  }
} catch {
  post.value = null
}

useHead({
  title: post.value?.title || t('blog.title'),
})
</script>
