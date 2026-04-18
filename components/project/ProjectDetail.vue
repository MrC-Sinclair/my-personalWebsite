<template>
  <article class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-8">
      <div class="mb-4 flex flex-wrap gap-2">
        <UBadge
          v-for="tag in project.tags"
          :key="tag"
          variant="outline"
          size="sm"
        >
          {{ tag }}
        </UBadge>
      </div>

      <h1 class="text-text-primary-light dark:text-text-primary-dark mb-4 text-3xl font-bold sm:text-4xl">
        {{ project.title }}
      </h1>

      <p v-if="project.description" class="text-text-secondary-light dark:text-text-secondary-dark text-lg">
        {{ project.description }}
      </p>

      <div class="mt-4 flex gap-3">
        <UButton
          v-if="project.demoUrl"
          :to="project.demoUrl"
          target="_blank"
          variant="solid"
          size="lg"
          trailing-icon="i-heroicons-arrow-top-right-on-square"
        >
          {{ t('projects.demo') }}
        </UButton>
        <UButton
          v-if="project.githubUrl"
          :to="project.githubUrl"
          target="_blank"
          variant="outline"
          size="lg"
          icon="i-simple-icons-github"
        >
          {{ t('projects.github') }}
        </UButton>
      </div>
    </header>

    <div class="prose prose-lg dark:prose-invert max-w-none">
      <ContentRenderer :value="content" />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'

defineProps<{
  project: Project
  content: Record<string, unknown>
}>()

const { t } = useI18n()
</script>
