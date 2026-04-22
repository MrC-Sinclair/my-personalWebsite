<!--
  ProjectCard - 项目卡片组件

  在项目列表中展示单个项目的摘要信息。
  整张卡片可点击跳转到项目详情页。

  Props：
  - project: Project - 项目数据对象

  展示内容：
  - 封面图片（可选，懒加载，响应式 sizes）
  - 项目名称 + 精选标记（featured 时显示）
  - 项目描述（最多 2 行）
  - 技术栈标签（最多显示 5 个）
  - 操作按钮：在线演示 / GitHub（根据数据有无显示）

  交互：
  - hover 时卡片上浮 + 阴影增强 + 图片微缩放
  - 整张卡片 NuxtLink 包裹可点击跳转
  - 内部按钮使用 @click.stop 阻止冒泡，避免嵌套链接

  依赖：
  - useI18n() 提供国际化文案
  - useLocalePath() 处理国际化路由
-->
<template>
  <NuxtLink :to="localePath(projectPath)" class="block">
    <article
      class="bg-surface-light dark:bg-surface-dark scroll-reveal scroll-reveal-up-lg group duration-normal cursor-pointer overflow-hidden rounded-xl shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div v-if="project.image" class="overflow-hidden">
        <NuxtImg
          :src="project.image"
          :alt="project.title"
          sizes="sm:100vw md:50vw lg:33vw"
          class="duration-normal h-48 w-full object-cover transition-transform group-hover:scale-105"
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

        <p
          v-if="project.description"
          class="text-text-secondary-light dark:text-text-secondary-dark mb-3 line-clamp-2 text-sm"
        >
          {{ project.description }}
        </p>

        <div class="mb-4 flex flex-wrap gap-1.5">
          <UBadge v-for="tag in project.tags.slice(0, 5)" :key="tag" variant="outline" size="xs">
            {{ tag }}
          </UBadge>
        </div>

        <div class="flex gap-3">
          <UButton
            v-if="project.demoUrl"
            variant="solid"
            size="sm"
            trailing-icon="i-heroicons-arrow-top-right-on-square"
            @click.stop="openUrl(project.demoUrl)"
          >
            {{ t('projects.demo') }}
          </UButton>
          <UButton
            v-if="project.githubUrl"
            variant="outline"
            size="sm"
            icon="i-simple-icons-github"
            @click.stop="openUrl(project.githubUrl)"
          >
            {{ t('projects.github') }}
          </UButton>
        </div>
      </div>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'

const props = defineProps<{
  project: Project
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const projectPath = computed(() => {
  const path = props.project.path
  const slug = path.split('/').pop()?.replace(/\.md$/, '') || ''
  return `/projects/${slug}`
})

function openUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
