<template>
  <article class="bg-surface-light dark:bg-surface-dark hover:shadow-lg group overflow-hidden rounded-xl shadow-md transition-shadow duration-250">
    <div v-if="project.image" class="overflow-hidden">
      <NuxtImg
        :src="project.image"
        :alt="project.title"
        class="h-48 w-full object-cover transition-transform duration-250 group-hover:scale-105"
        loading="lazy"
      />
    </div>

    <div class="p-5">
      <div class="mb-2 flex items-center gap-2">
        <h3 class="text-text-primary-light dark:text-text-primary-dark text-lg font-semibold">
          {{ project.title }}
        </h3>
        <UBadge v-if="project.featured" variant="subtle" size="xs" color="primary">
          {{ t('projects.featured') }}
        </UBadge>
      </div>

      <p v-if="project.description" class="text-text-secondary-light dark:text-text-secondary-dark mb-3 line-clamp-2 text-sm">
        {{ project.description }}
      </p>

      <div class="mb-4 flex flex-wrap gap-1.5">
        <UBadge
          v-for="tag in project.tags.slice(0, 5)"
          :key="tag"
          variant="outline"
          size="xs"
        >
          {{ tag }}
        </UBadge>
      </div>

      <div class="flex gap-3">
        <UButton
          v-if="project.demoUrl"
          :to="project.demoUrl"
          target="_blank"
          variant="solid"
          size="sm"
          trailing-icon="i-heroicons-arrow-top-right-on-square"
        >
          {{ t('projects.demo') }}
        </UButton>
        <UButton
          v-if="project.githubUrl"
          :to="project.githubUrl"
          target="_blank"
          variant="outline"
          size="sm"
          icon="i-simple-icons-github"
        >
          {{ t('projects.github') }}
        </UButton>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'

defineProps<{
  project: Project
}>()

const { t } = useI18n()
</script>
