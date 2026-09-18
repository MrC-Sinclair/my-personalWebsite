<!--
  EditorialBlog - editorial 风格的「博客」子页（/style/editorial/blog）
  ------------------------------------------------------------
  壳由 EditorialSubPage 提供；主体是首页 03 栏的「索引目录」文章版式。
  子页相对首页的唯一数据差异：首页取最新 5 条，本页取全量。
-->
<template>
  <EditorialSubPage>
    <EditorialEmpty v-if="loading" :message="t('common.loading')"/>

    <EditorialPosts v-else-if="posts.length" :posts="posts"/>

    <EditorialEmpty
      v-else
      :message="t('blog.noResults')"
      :hint="t('blog.noResultsHint')"
    />
  </EditorialSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import EditorialSubPage from '../components/EditorialSubPage.vue'
import EditorialPosts from '../components/EditorialPosts.vue'
import EditorialEmpty from '../components/EditorialEmpty.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('editorial-blog-page', async () => {
  const list = await getAllPosts()
  // 返回全量：博客子页不做截断（首页才有「最新 N 条」的概念）
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refresh()
})

const posts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))

/** 加载态：仅在尚无任何数据时显示 */
const loading = computed(() => pending.value && !postsData.value)
</script>
