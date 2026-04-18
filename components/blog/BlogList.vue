<!--
  BlogList - 博客文章列表组件

  以响应式网格布局展示博客文章卡片列表，空结果时显示提示文案。

  Props：
  - posts: BlogPost[] - 博客文章列表

  布局：
  - 响应式网格（手机 1 列 / 平板 2 列 / 桌面 3 列）
  - 无结果时显示 "暂无文章" 提示

  依赖：
  - BlogCard 组件渲染单篇文章卡片
  - useI18n() 提供国际化文案
-->
<template>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <BlogCard v-for="post in posts" :key="post.path" :post="post" />
  </div>

  <div
    v-if="posts.length === 0"
    class="text-text-secondary-light dark:text-text-secondary-dark py-12 text-center"
  >
    {{ t('blog.noResults') }}
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'

defineProps<{
  posts: BlogPost[]
}>()

const { t } = useI18n()
</script>
