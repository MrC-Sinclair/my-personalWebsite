<template>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <ProjectCard v-for="project in projects" :key="project.path" :project="project" />
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'

defineProps<{
  projects: Project[]
}>()
</script>
