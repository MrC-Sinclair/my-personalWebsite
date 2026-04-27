<!--
  BlogDetail - 博客文章详情组件

  展示博客文章的完整内容，包含面包屑导航、文章头部元信息和正文渲染区域。

  Props：
  - post: BlogPost - 博客文章元数据
  - content: Record<string, unknown> - @nuxt/content 返回的完整内容对象（含 body 和 toc）
  - prevPost: BlogPost | null - 上一篇文章（可选）
  - nextPost: BlogPost | null - 下一篇文章（可选）

  布局：
  - 面包屑导航：首页 > 博客 > 文章标题
  - 文章头部：分类标签 + 标签组 + 标题 + 发布日期/更新日期
  - 正文区域：左侧 Markdown 渲染内容 + 右侧目录导航（桌面端显示）
  - 移动端：底部浮动 TOC 按钮（MobileToc）
  - 上下篇导航：上一篇 / 下一篇
  - 使用 prose 排版样式渲染 Markdown

  依赖：
  - BlogToc 组件渲染桌面端文章目录
  - MobileToc 组件渲染移动端文章目录
  - ContentRenderer 渲染 Markdown 内容
  - useI18n() 提供语言环境和国际化文案
  - formatDate() 工具函数格式化日期
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
            :to="localePath('/blog')"
            class="hover:text-primary-500 duration-fast transition-colors"
          >
            {{ t('blog.breadcrumb') }}
          </NuxtLink>
        </li>
        <li>/</li>
        <li class="text-text-primary-light dark:text-text-primary-dark truncate">
          {{ post.title }}
        </li>
      </ol>
    </nav>

    <header class="scroll-reveal scroll-reveal-up mb-8">
      <div class="mb-4 flex flex-wrap gap-2">
        <UBadge v-if="post.category" variant="subtle" size="sm">
          {{ post.category }}
        </UBadge>
        <UBadge v-for="tag in post.tags" :key="tag" variant="outline" size="xs">
          {{ tag }}
        </UBadge>
      </div>

      <h1
        class="text-text-primary-light dark:text-text-primary-dark mb-4 text-3xl font-bold sm:text-4xl"
      >
        {{ post.title }}
      </h1>

      <div
        class="text-text-secondary-light dark:text-text-secondary-dark flex flex-wrap items-center gap-4 text-sm"
      >
        <span class="flex items-center gap-1">
          <UIcon name="i-heroicons-calendar" class="h-4 w-4" />
          <time :datetime="post.date">{{ formattedDate }}</time>
        </span>
        <span v-if="post.updated" class="flex items-center gap-1">
          <UIcon name="i-heroicons-arrow-path" class="h-4 w-4" />
          {{ t('blog.updatedAt') }} {{ formattedUpdated }}
        </span>
      </div>
    </header>

    <div class="scroll-reveal scroll-reveal-up scroll-reveal-delay-1 flex gap-8">
      <div class="min-w-0 flex-1">
        <div class="prose prose-lg dark:prose-invert max-w-none">
          <ContentRenderer :value="content" />
        </div>
      </div>

      <BlogToc v-if="toc && toc.links.length > 0" :toc="toc" class="hidden lg:block" />
    </div>

    <MobileToc v-if="toc && toc.links.length > 0" :toc="toc" />

    <nav
      v-if="prevPost || nextPost"
      class="border-border-light dark:border-border-dark mt-12 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:justify-between"
      :aria-label="t('common.postNav')"
    >
      <NuxtLink
        v-if="prevPost"
        :to="localePath(blogPath(prevPost))"
        class="bg-surface-light dark:bg-surface-dark hover:border-primary-500 duration-normal flex items-center gap-3 rounded-xl border border-border-light p-4 transition-all hover:shadow-md dark:border-border-dark"
      >
        <UIcon name="i-heroicons-arrow-left" class="text-primary-500 h-5 w-5 shrink-0" />
        <div class="min-w-0">
          <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">{{
            t('blog.prevPost')
          }}</span>
          <p
            class="text-text-primary-light dark:text-text-primary-dark truncate text-sm font-medium"
          >
            {{ prevPost.title }}
          </p>
        </div>
      </NuxtLink>
      <div v-else />

      <NuxtLink
        v-if="nextPost"
        :to="localePath(blogPath(nextPost))"
        class="bg-surface-light dark:bg-surface-dark hover:border-primary-500 duration-normal flex items-center gap-3 rounded-xl border border-border-light p-4 text-right transition-all hover:shadow-md dark:border-border-dark"
      >
        <div class="min-w-0">
          <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">{{
            t('blog.nextPost')
          }}</span>
          <p
            class="text-text-primary-light dark:text-text-primary-dark truncate text-sm font-medium"
          >
            {{ nextPost.title }}
          </p>
        </div>
        <UIcon name="i-heroicons-arrow-right" class="text-primary-500 h-5 w-5 shrink-0" />
      </NuxtLink>
      <div v-else />
    </nav>
  </article>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'

const props = defineProps<{
  post: BlogPost
  content: Record<string, unknown>
  prevPost?: BlogPost | null
  nextPost?: BlogPost | null
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
useScrollReveal()

const formattedDate = computed(() => formatDate(props.post.date, locale.value))
const formattedUpdated = computed(() =>
  props.post.updated ? formatDate(props.post.updated, locale.value) : '',
)

const toc = computed(() => {
  const body = props.content?.body as Record<string, unknown> | undefined
  return body?.toc as { links: Array<{ id: string; text: string; depth: number }> } | undefined
})

function blogPath(post: BlogPost) {
  const slug = post.path.split('/').pop()?.replace(/\.md$/, '') || ''
  return `/blog/${slug}`
}
</script>
