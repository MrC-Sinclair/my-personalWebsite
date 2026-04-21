<!--
  FeaturedProjects - 精选项目展示组件

  在首页展示精选项目卡片列表，含"查看全部"链接跳转项目页。

  Props：
  - projects: Project[] - 项目列表（通常为精选 3 个）

  布局：
  - 标题 + "查看全部"按钮
  - 响应式卡片网格（手机 1 列 / 平板 2 列 / 桌面 3 列）
  - 交替背景色区分区域

  依赖：
  - ProjectCard 组件渲染单个项目卡片
  - useI18n() 提供国际化文案
  - useLocalePath() 处理国际化路由
  - useScrollReveal() 滚动进入动画

  使用场景：pages/index.vue 首页
-->
<template>
  <section class="bg-surface-light-alt dark:bg-surface-dark-alt px-4 py-16 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="scroll-reveal scroll-reveal-up mb-8 flex items-center justify-between">
        <h2
          class="text-text-primary-light dark:text-text-primary-dark text-2xl font-bold sm:text-3xl"
        >
          {{ t('home.featuredProjects') }}
        </h2>
        <UButton
          :to="localePath('/projects')"
          variant="ghost"
          trailing-icon="i-heroicons-arrow-right"
        >
          {{ t('home.viewAll') }}
        </UButton>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProjectCard v-for="project in projects" :key="project.path" :project="project" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'

defineProps<{
  projects: Project[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()
useScrollReveal()
</script>
