<!--
  ProjectDetail - 项目详情组件

  展示项目的完整介绍内容，包含面包屑导航、项目头部元信息和正文渲染区域。

  Props：
  - project: Project - 项目元数据
  - content: Record<string, unknown> - @nuxt/content 返回的完整内容对象
  - prevProject: Project | null - 上一个项目（可选）
  - nextProject: Project | null - 下一个项目（可选）

  布局：
  - 面包屑导航：首页 > 项目 > 项目名称
  - 项目头部：技术栈标签 + 标题 + 描述 + 操作按钮（在线演示/GitHub）
  - 正文区域：Markdown 渲染内容，使用 prose 排版样式
  - 上下篇导航：上一个项目 / 下一个项目

  依赖：
  - ContentRenderer 渲染 Markdown 内容
  - useI18n() 提供国际化文案
-->
<template>
  <article class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <nav class="scroll-reveal scroll-reveal-up mb-6" :aria-label="t('common.breadcrumb')">
      <ol
        class="text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2 text-sm"
      >
        <li>
          <NuxtLink
            :to="localePath('/')"
            class="hover:text-primary-500 duration-fast transition-colors"
          >
            {{ t('common.home') }}
          </NuxtLink>
        </li>
        <li>/</li>
        <li>
          <NuxtLink
            :to="localePath('/projects')"
            class="hover:text-primary-500 duration-fast transition-colors"
          >
            {{ t('projects.breadcrumb') }}
          </NuxtLink>
        </li>
        <li>/</li>
        <li class="text-text-primary-light dark:text-text-primary-dark truncate">
          {{ project.title }}
        </li>
      </ol>
    </nav>

    <header class="scroll-reveal scroll-reveal-up mb-8">
      <div class="mb-4 flex flex-wrap gap-2">
        <UBadge v-for="tag in (Array.isArray(project.tags) ? project.tags : [])" :key="tag" variant="outline" size="sm">
          {{ tag }}
        </UBadge>
      </div>

      <h1
        class="text-text-primary-light dark:text-text-primary-dark mb-4 text-3xl font-bold sm:text-4xl"
      >
        {{ project.title }}
      </h1>

      <p
        v-if="project.description"
        class="text-text-secondary-light dark:text-text-secondary-dark text-lg"
      >
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

    <div
      class="scroll-reveal scroll-reveal-up scroll-reveal-delay-1 prose prose-lg dark:prose-invert max-w-none"
    >
      <ContentRenderer :value="content" />
    </div>

    <nav
      v-if="prevProject || nextProject"
      class="border-border-light dark:border-border-dark mt-12 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:justify-between"
      :aria-label="t('common.postNav')"
    >
      <NuxtLink
        v-if="prevProject"
        :to="localePath(projectPath(prevProject))"
        class="bg-surface-light dark:bg-surface-dark hover:border-primary-500 duration-normal flex items-center gap-3 rounded-xl border border-border-light p-4 transition-all hover:shadow-md dark:border-border-dark"
      >
        <UIcon name="i-heroicons-arrow-left" class="text-primary-500 h-5 w-5 shrink-0" />
        <div class="min-w-0">
          <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">{{
            t('projects.prevProject')
          }}</span>
          <p
            class="text-text-primary-light dark:text-text-primary-dark truncate text-sm font-medium"
          >
            {{ prevProject.title }}
          </p>
        </div>
      </NuxtLink>
      <div v-else />

      <NuxtLink
        v-if="nextProject"
        :to="localePath(projectPath(nextProject))"
        class="bg-surface-light dark:bg-surface-dark hover:border-primary-500 duration-normal flex items-center gap-3 rounded-xl border border-border-light p-4 text-right transition-all hover:shadow-md dark:border-border-dark"
      >
        <div class="min-w-0">
          <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">{{
            t('projects.nextProject')
          }}</span>
          <p
            class="text-text-primary-light dark:text-text-primary-dark truncate text-sm font-medium"
          >
            {{ nextProject.title }}
          </p>
        </div>
        <UIcon name="i-heroicons-arrow-right" class="text-primary-500 h-5 w-5 shrink-0" />
      </NuxtLink>
      <div v-else />
    </nav>
  </article>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'

defineProps<{
  project: Project
  content: Record<string, unknown>
  prevProject?: Project | null
  nextProject?: Project | null
}>()

const { t } = useI18n()
const localePath = useLocalePath()
useScrollReveal()

function projectPath(project: Project) {
  const slug = project.path.split('/').pop()?.replace(/\.md$/, '') || ''
  return `/projects/${slug}`
}
</script>
