<!--
  项目列表页 - 展示所有项目

  功能：
  - 页面标题和描述
  - 项目卡片网格列表

  数据获取：
  - useProjects().getAllProjects() 获取所有项目

  路由：/projects
-->
<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-8">
      <h1
        class="text-text-primary-light dark:text-text-primary-dark mb-2 text-3xl font-bold sm:text-4xl"
      >
        {{ t('projects.title') }}
      </h1>
      <p class="text-text-secondary-light dark:text-text-secondary-dark text-lg">
        {{ t('projects.description') }}
      </p>
    </header>

    <ProjectGrid :projects="projects" />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { getAllProjects } = useProjects()

const projects = await getAllProjects()

useHead({
  title: t('projects.title'),
})
</script>
