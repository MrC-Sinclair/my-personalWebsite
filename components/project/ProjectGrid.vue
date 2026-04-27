<!--
  ProjectGrid - 项目网格布局组件

  以响应式网格布局展示项目卡片列表。

  Props：
  - projects: Project[] - 项目列表

  布局：
  - 响应式网格（手机 1 列 / 平板 2 列 / 桌面 3 列）
  - 空列表时显示提示（图标 + 文案）
-->
<template>
  <div>
    <div v-if="projects.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ProjectCard v-for="project in projects" :key="project.path" :project="project" />
    </div>

    <div
      v-else
      class="text-text-secondary-light dark:text-text-secondary-dark py-12 text-center"
    >
      <UIcon name="i-heroicons-cube" class="mx-auto mb-3 h-10 w-10 opacity-40" />
      <p class="text-lg">{{ t('projects.noResults') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'

defineProps<{
  projects: Project[]
}>()

const { t } = useI18n()
</script>
