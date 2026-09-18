<!--
  Web2GlossyBlog - web2-glossy 风格的「博客」子页（/style/web2-glossy/blog）
  ------------------------------------------------------------
  壳由 Web2GlossySubPage 提供；主体是「光泽行条目」列表。
  子页相对首页的唯一数据差异：首页取最新 N 条，本页取全量。
-->
<template>
  <Web2GlossySubPage>
    <section class="section" aria-labelledby="blog-title">
      <div class="container">
        <Web2GlossySectionHead id="blog-title" :badge="t('nav.blog')" :title="t('blog.title')"/>

        <div v-if="loading" class="posts-list" role="status" :aria-label="t('common.loading')">
          <div v-for="n in 3" :key="n" class="skel skel--row" aria-hidden="true"/>
        </div>

        <div v-else-if="!posts.length" class="empty">
          <span class="empty__dot" aria-hidden="true">!</span>
          <span>
            {{ t('blog.noResults') }}
            <br >
            {{ t('blog.noResultsHint') }}
          </span>
        </div>

        <div v-else class="posts-list">
          <Web2GlossyPostRow
            v-for="post in posts"
            :key="post.path"
            :post="post"
            class="scroll-reveal"
          />
        </div>
      </div>
    </section>
  </Web2GlossySubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import Web2GlossySubPage from '../components/Web2GlossySubPage.vue'
import Web2GlossySectionHead from '../components/Web2GlossySectionHead.vue'
import Web2GlossyPostRow from '../components/Web2GlossyPostRow.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('web2-glossy-blog-page', async () => {
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
/* —— 区块容器 —— */
.container {
  max-width: var(--page-w);
  margin-inline: auto;
  padding-inline: clamp(16px, 4vw, 32px);
}

.section {
  padding-block: clamp(56px, 9vw, 96px);
}

/* —— 文章行列表 —— */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* —— 空态 / 加载骨架 —— */
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0;
  padding: clamp(24px, 5vw, 48px) 0;
  color: var(--c-muted);
  text-align: center;
}

.empty__dot {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-weight: 800;
  color: #ffffff;
  border-radius: 50%;
  background: linear-gradient(180deg, #d97a1c 0%, #a84a0c 100%);
}

.skel {
  border-radius: var(--radius);
  background: linear-gradient(180deg, #e6f1fb 0%, #d3e5f7 100%);
  animation: w2g-skeleton 1.3s ease-in-out infinite;
}

.skel--row {
  height: 84px;
}

@keyframes w2g-skeleton {
  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skel {
    animation: none;
    opacity: 0.7;
  }
}
</style>
