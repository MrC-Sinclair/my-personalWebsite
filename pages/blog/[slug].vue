<!--
  博客详情页 - 展示单篇博客文章的完整内容

  通过 URL 中的 slug 参数获取对应文章，使用 BlogDetail 组件渲染。

  数据获取：
  - useBlog().getPostBySlug() 通过 composable 获取文章数据（含 content 对象）
  - 数据不存在时抛出 404 错误

  路由：/blog/:slug
-->
<template>
  <div>
    <BlogDetail
      v-if="post && content"
      :post="post"
      :content="content"
      :prev-post="prevPost"
      :next-post="nextPost"
    />

    <div v-else class="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <p class="text-text-secondary-light dark:text-text-secondary-dark text-lg">
        {{ t('common.notFound') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'

const { t } = useI18n()
const { getPostBySlug, getAllPosts } = useBlog()
const route = useRoute()

const slug = route.params.slug as string

const post = ref<BlogPost | null>(null)
const content = ref<Record<string, unknown> | null>(null)
const prevPost = ref<BlogPost | null>(null)
const nextPost = ref<BlogPost | null>(null)

const result = await getPostBySlug(slug)

if (!result.post) {
  throw createError({ statusCode: 404, statusMessage: t('common.notFound') })
}

post.value = result.post
content.value = result.content

const allPosts = await getAllPosts()
const currentIndex = allPosts.findIndex((p) => p.path === post.value?.path)
if (currentIndex > 0) {
  prevPost.value = allPosts[currentIndex - 1]
}
if (currentIndex < allPosts.length - 1) {
  nextPost.value = allPosts[currentIndex + 1]
}

useHead({
  title: post.value?.title || t('blog.title'),
  meta: [
    { name: 'description', content: post.value?.description || '' },
    { property: 'og:title', content: post.value?.title || '' },
    { property: 'og:description', content: post.value?.description || '' },
    { property: 'og:type', content: 'article' },
  ],
})
</script>
