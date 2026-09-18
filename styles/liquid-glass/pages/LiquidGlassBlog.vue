<!--
  LiquidGlassBlog - liquid-glass 风格的「博客」子页（/style/liquid-glass/blog）
  ------------------------------------------------------------
  壳由 LiquidGlassSubPage 提供；主体是「悬浮标题 + 横躺玻璃长条」列表。
  子页相对首页的唯一数据差异：首页取最新 5 条，本页取全量。
-->
<template>
  <LiquidGlassSubPage>
    <div class="loose">
      <LiquidGlassSectionHead
        class="scroll-reveal scroll-reveal-up"
        :eyebrow="t('nav.blog')"
        :title="t('blog.title')"
        :meta="String(posts.length)"
      />

      <LiquidGlassEmpty v-if="loading" :message="t('common.loading')"/>

      <LiquidGlassEmpty
        v-else-if="!posts.length"
        :message="t('blog.noResults')"
        :hint="t('blog.noResultsHint')"
      />

      <div v-else class="post-list">
        <LiquidGlassPostCard v-for="post in posts" :key="post.path" :post="post"/>
      </div>
    </div>
  </LiquidGlassSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import LiquidGlassSubPage from '../components/LiquidGlassSubPage.vue'
import LiquidGlassSectionHead from '../components/LiquidGlassSectionHead.vue'
import LiquidGlassPostCard from '../components/LiquidGlassPostCard.vue'
import LiquidGlassEmpty from '../components/LiquidGlassEmpty.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('liquid-glass-blog-page', async () => {
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

<style scoped>
.loose {
  min-width: 0;
}

/* 文章长条列表 */
.post-list {
  display: grid;
  gap: var(--gap);
}
</style>
