<!--
  MinimalismBlog - minimalism 风格的「博客」子页（/style/minimalism/blog）
  ------------------------------------------------------------
  壳由 MinimalismSubPage 提供；主体复用 MinimalismPosts。
  首页只列「最新 N 条」，本页列出全部文章——子页相对首页的唯一数据差异。
-->
<template>
  <MinimalismSubPage :title="t('nav.blog')">
    <p v-if="loading" class="loading" role="status">{{ t('common.loading') }}</p>
    <MinimalismPosts v-else :posts="posts" />
  </MinimalismSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import MinimalismSubPage from '../components/MinimalismSubPage.vue'
import MinimalismPosts from '../components/MinimalismPosts.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('minimalism-blog-page', async () => {
  const list = await getAllPosts()
  // 返回全量：博客子页不做截断（首页才有「最新 N 条」的概念）
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refresh()
})

const posts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))

const loading = computed(() => pending.value && !postsData.value)
</script>

<style scoped>
.loading {
  margin: 0;
  color: var(--c-muted);
}
</style>
