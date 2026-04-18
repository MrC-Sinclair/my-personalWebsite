<!--
  ProjectGrid - 项目网格布局组件

  以响应式网格布局展示项目卡片列表。

  Props：
  - projects: Project[] - 项目列表

  布局：
  - 响应式网格（手机 1 列 / 平板 2 列 / 桌面 3 列）
-->
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
