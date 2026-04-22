<!--
  BlogCard - 博客文章卡片组件

  在文章列表中展示单篇博客的摘要信息，点击跳转到文章详情页。

  Props：
  - post: BlogPost - 博客文章数据对象

  展示内容：
  - 封面图片（可选，懒加载，响应式 sizes）
  - 标签（最多显示 3 个）
  - 文章标题
  - 文章摘要（最多 2 行，line-clamp-2）
  - 发布日期（根据语言环境格式化）

  交互：
  - hover 时卡片上浮 + 阴影增强 + 标题变色 + 图片微缩放
  - 整张卡片可点击跳转到文章详情

  依赖：
  - useI18n() 提供语言环境（用于日期格式化）
  - useLocalePath() 处理国际化路由
  - formatDate() 工具函数格式化日期
-->
<template>
  <article
    class="bg-surface-light dark:bg-surface-dark scroll-reveal scroll-reveal-up-lg group duration-normal overflow-hidden rounded-xl shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
  >
    <NuxtLink :to="localePath(blogPath)">
      <div v-if="post.image" class="overflow-hidden">
        <NuxtImg
          :src="post.image"
          :alt="post.title"
          sizes="sm:100vw md:50vw lg:33vw"
          class="duration-normal h-48 w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div class="p-5">
        <div class="mb-2 flex flex-wrap gap-2">
          <UBadge v-for="tag in post.tags.slice(0, 3)" :key="tag" variant="subtle" size="xs">
            {{ tag }}
          </UBadge>
        </div>

        <h3
          class="text-text-primary-light dark:text-text-primary-dark group-hover:text-primary-500 duration-fast mb-2 text-lg font-semibold transition-colors"
        >
          {{ post.title }}
        </h3>

        <p
          v-if="post.description"
          class="text-text-secondary-light dark:text-text-secondary-dark mb-3 line-clamp-2 text-sm"
        >
          {{ post.description }}
        </p>

        <div
          class="text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2 text-xs"
        >
          <UIcon name="i-heroicons-calendar" class="h-3.5 w-3.5" />
          <time :datetime="post.date">{{ formattedDate }}</time>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'

const props = defineProps<{
  post: BlogPost
}>()

const { locale } = useI18n()
const localePath = useLocalePath()

const formattedDate = computed(() => formatDate(props.post.date, locale.value))

const blogPath = computed(() => {
  const path = props.post.path
  const slug = path.split('/').pop()?.replace(/\.md$/, '') || ''
  return `/blog/${slug}`
})
</script>
