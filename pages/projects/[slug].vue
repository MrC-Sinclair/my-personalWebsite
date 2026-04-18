<template>
  <div>
    <ProjectDetail v-if="project && content" :project="project" :content="content" />

    <div v-else class="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <p class="text-text-secondary-light dark:text-text-secondary-dark text-lg">
        {{ t('common.notFound') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'

const { t, locale } = useI18n()
const route = useRoute()

const slug = route.params.slug as string

const project = ref<Project | null>(null)
const content = ref<Record<string, unknown> | null>(null)

try {
  const collectionName = locale.value === 'zh' ? 'projectsZh' : 'projectsEn'
  const contentPath = locale.value === 'zh' ? `/projects/zh/${slug}` : `/projects/en/${slug}`

  const data = await queryCollection(collectionName).path(contentPath).first()

  if (data) {
    project.value = {
      title: (data.title as string) || '',
      description: data.description as string | undefined,
      date: (data.date as string) || '',
      image: data.image as string | undefined,
      tags: (data.tags as string[]) || [],
      demoUrl: data.demoUrl as string | undefined,
      githubUrl: data.githubUrl as string | undefined,
      featured: (data.featured as boolean) || false,
      path: (data.path as string) || '',
    }
    content.value = data as Record<string, unknown>
  }
} catch {
  project.value = null
}

useHead({
  title: project.value?.title || t('projects.title'),
})
</script>
