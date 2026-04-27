<!--
  项目详情页 - 展示单个项目的完整介绍

  通过 URL 中的 slug 参数获取对应项目，使用 ProjectDetail 组件渲染。

  数据获取：
  - useProjects().getProjectBySlug() 通过 composable 获取项目数据（含 content 对象）
  - useProjects().getAllProjects() 获取所有项目用于计算上下篇
  - 数据不存在时抛出 404 错误

  路由：/projects/:slug
-->
<template>
  <div>
    <ProjectDetail
      v-if="project && content"
      :project="project"
      :content="content"
      :prev-project="prevProject"
      :next-project="nextProject"
    />
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'

const { t } = useI18n()
const { getProjectBySlug, getAllProjects } = useProjects()
const route = useRoute()

const slug = route.params.slug as string

const project = ref<Project | null>(null)
const content = ref<Record<string, unknown> | null>(null)
const prevProject = ref<Project | null>(null)
const nextProject = ref<Project | null>(null)

const result = await getProjectBySlug(slug)

if (!result.project) {
  throw createError({ statusCode: 404, statusMessage: t('common.notFound') })
}

project.value = result.project
content.value = result.content

const allProjects = await getAllProjects()
const currentIndex = allProjects.findIndex((p) => p.path === project.value?.path)
if (currentIndex > 0) {
  prevProject.value = allProjects[currentIndex - 1]
}
if (currentIndex < allProjects.length - 1) {
  nextProject.value = allProjects[currentIndex + 1]
}

useHead({
  title: project.value?.title || t('projects.title'),
  meta: [
    { name: 'description', content: project.value?.description || '' },
    { property: 'og:title', content: project.value?.title || '' },
    { property: 'og:description', content: project.value?.description || '' },
  ],
})
</script>
