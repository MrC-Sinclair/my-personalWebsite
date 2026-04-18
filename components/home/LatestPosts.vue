<!--
  LatestPosts - 最新文章预览组件

  在首页展示最新的博客文章卡片列表，含"查看全部"链接跳转博客页。

  Props：
  - posts: BlogPost[] - 博客文章列表（通常为最新 3 篇）

  布局：
  - 标题 + "查看全部"按钮
  - 响应式卡片网格（手机 1 列 / 平板 2 列 / 桌面 3 列）

  依赖：
  - BlogCard 组件渲染单篇文章卡片
  - useI18n() 提供国际化文案
  - useLocalePath() 处理国际化路由

  使用场景：pages/index.vue 首页
-->
<template>
  <section class="px-4 py-16 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8 flex items-center justify-between">
        <h2
          class="text-text-primary-light dark:text-text-primary-dark text-2xl font-bold sm:text-3xl"
        >
          {{ t('home.latestPosts') }}
        </h2>
        <UButton :to="localePath('/blog')" variant="ghost" trailing-icon="i-heroicons-arrow-right">
          {{ t('home.viewAll') }}
        </UButton>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <BlogCard v-for="post in posts" :key="post.path" :post="post" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'

defineProps<{
  posts: BlogPost[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
