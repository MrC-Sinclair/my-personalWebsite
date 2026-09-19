<!--
  SwissBlog - swiss 风格的「博客」子页（/style/swiss/blog）
  ------------------------------------------------------------
  壳由 SwissSubPage 提供；主体是编号区块头 + 文章行列表。
  子页相对首页的唯一数据差异：首页取最新 5 条并给「查看全部」，
  本页取全量——已经在列表页了，不需要再看全部的入口。
-->
<template>
  <SwissSubPage>
    <section class="section scroll-reveal scroll-reveal-up" aria-labelledby="posts-head">
      <SwissSectionHead
        :no="1"
        :level="1"
        head-id="posts-head"
        :title="t('blog.title')"
        :meta="t('blog.description')"
      />
      <div class="section-body">
        <div v-if="loading" class="skeleton-zone" role="status" aria-live="polite">
          <p class="sr-only">{{ t('common.loading') }}</p>
          <div v-for="i in 3" :key="i" class="skeleton-row" />
        </div>

        <SwissPostList v-else-if="posts.length" :posts="posts" />

        <div v-else class="empty">
          <p class="empty-main">{{ t('blog.noResults') }}</p>
          <p class="empty-hint">{{ t('blog.noResultsHint') }}</p>
        </div>
      </div>
    </section>
  </SwissSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import SwissSubPage from '../components/SwissSubPage.vue'
import SwissSectionHead from '../components/SwissSectionHead.vue'
import SwissPostList from '../components/SwissPostList.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('swiss-blog-page', async () => {
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
.section {
  margin-top: calc(var(--space) * 2.4);
}

.section-body {
  margin-top: var(--space);
}

/* 空状态：细则线框 + 提示文案（不留白） */
.empty {
  padding: var(--space) 0;
  margin: 0;
  border-top: var(--border-w) solid var(--c-border);
  border-bottom: var(--border-w) solid var(--c-border);
  color: var(--c-muted);
}

.empty-main {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--c-text);
}

.empty-hint {
  margin: 6px 0 0;
  font-size: 14px;
}

/* —— 加载骨架：细则线行 + 脉冲 —— */
.skeleton-zone {
  display: grid;
}

.skeleton-row {
  height: 72px;
  border-top: var(--border-w) solid var(--c-border);
  background: var(--c-surface);
  animation: skeleton-pulse 1.4s ease-in-out infinite;
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

@media (min-width: 768px) {
  .section {
    margin-top: calc(var(--space) * 2.8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-row {
    animation: none;
  }
}
</style>
