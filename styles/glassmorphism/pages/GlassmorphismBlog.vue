<!--
  GlassmorphismBlog - glassmorphism 风格的「博客」子页（/style/glassmorphism/blog）
  ------------------------------------------------------------
  壳由 GlassmorphismSubPage 提供；主体是一块磨砂玻璃板里的文章行。
  子页相对首页的两点差异：取全量（首页取最新 4 条），且不再需要
  「查看全部」入口——已经在这一页了。
-->
<template>
  <GlassmorphismSubPage>
    <section id="posts" data-section="posts" class="sheet scroll-reveal scroll-reveal-up">
      <GlassmorphismGlassPanel>
        <GlassmorphismSectionHead :level="1" :eyebrow="t('nav.blog')" :title="t('blog.title')" />

        <GlassmorphismPlaceholder
          v-if="loading"
          variant="loading"
          :message="t('common.loading')"
        />

        <div v-else-if="posts.length" class="post-list">
          <GlassmorphismPostRow v-for="post in posts" :key="post.path" :post="post" />
        </div>

        <GlassmorphismPlaceholder
          v-else
          variant="empty"
          :message="t('blog.noResults')"
          :hint="t('blog.noResultsHint')"
        />
      </GlassmorphismGlassPanel>
    </section>
  </GlassmorphismSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import GlassmorphismSubPage from '../components/GlassmorphismSubPage.vue'
import GlassmorphismGlassPanel from '../components/GlassmorphismGlassPanel.vue'
import GlassmorphismSectionHead from '../components/GlassmorphismSectionHead.vue'
import GlassmorphismPostRow from '../components/GlassmorphismPostRow.vue'
import GlassmorphismPlaceholder from '../components/GlassmorphismPlaceholder.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('glassmorphism-blog-page', async () => {
  const list = await getAllPosts()
  // 返回全量：博客子页不做截断（首页才有「最新 N 条」的概念）
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refresh()
})

const posts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))

/** 加载态：仅在尚无任何数据时显示骨架 */
const loading = computed(() => pending.value && !postsData.value)
</script>

<style scoped>
/* 玻璃板 */
.sheet {
  min-width: 0;
  margin-bottom: calc(var(--space) * 1.6);
}

/* —— 文章列表（与首页同款） —— */
.post-list {
  display: grid;
  gap: 12px;
}
</style>
