<!--
  NeumorphismBlog - neumorphism 风格的「博客」子页（/style/neumorphism/blog）
  ------------------------------------------------------------
  壳由 NeumorphismSubPage 提供；主体是一块凸起面板里的凹槽文章行。
  子页相对首页的唯一数据差异：首页取最新 5 条，本页取全量。
-->
<template>
  <NeumorphismSubPage>
    <NeumorphismPanel
      id="posts"
      data-section="posts"
      :level="1"
      :title="t('blog.title')"
      :lead="t('blog.description')"
    >
      <div v-if="loading" class="panel-loading" role="status">
        <p class="sr-only">{{ t('common.loading') }}</p>
        <div class="skeleton skeleton-a" />
        <div class="skeleton skeleton-b" />
      </div>

      <div v-else-if="posts.length" class="post-list">
        <NeumorphismPostCard v-for="post in posts" :key="post.path" :post="post" />
      </div>

      <div v-else class="empty" role="status">
        <p class="empty-title">{{ t('blog.noResults') }}</p>
        <p class="empty-hint">{{ t('blog.noResultsHint') }}</p>
      </div>
    </NeumorphismPanel>
  </NeumorphismSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import NeumorphismSubPage from '../components/NeumorphismSubPage.vue'
import NeumorphismPanel from '../components/NeumorphismPanel.vue'
import NeumorphismPostCard from '../components/NeumorphismPostCard.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('neumorphism-blog-page', async () => {
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
/* —— 列表容器 —— */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* —— 空状态：材料表面凹出的空槽 —— */
.empty {
  padding: var(--space);
  text-align: center;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-press);
}

.empty-title {
  margin: 0;
  font-weight: 600;
  color: var(--c-text);
}

.empty-hint {
  margin: 6px 0 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* —— 加载骨架：凸起面板呼吸 —— */
.panel-loading {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.skeleton {
  background: var(--c-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  animation: skeleton-pulse 1.6s ease-in-out infinite;
}

.skeleton-a {
  height: 140px;
}

.skeleton-b {
  height: 220px;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

.sr-only {
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    opacity: 0.6;
  }
}
</style>
