<!--
  ClaymorphismBlog - claymorphism 风格的「博客」子页（/style/claymorphism/blog）
  ------------------------------------------------------------
  壳由 ClaymorphismSubPage 提供；主体是厚胶囊行堆叠。
  子页相对首页的唯一数据差异：首页取最新 4 条，本页取全量。
-->
<template>
  <ClaymorphismSubPage>
    <section class="zone">
      <ClaymorphismSectionHead
        eyebrow="04"
        :level="1"
        :title="t('blog.title')"
        :count="posts.length"
        tone="lilac"
      />

      <!-- 加载骨架（防御分支） -->
      <div v-if="loading" class="skeleton-zone" role="status">
        <p class="sr-only">{{ t('common.loading') }}</p>
        <div v-for="i in 3" :key="i" class="skeleton skeleton-row" />
      </div>

      <div v-else-if="posts.length" class="post-stack">
        <ClaymorphismPostCard
          v-for="(post, index) in posts"
          :key="post.path"
          :post="post"
          :tone="toneOf(index + 2)"
        />
      </div>

      <ClaymorphismEmptyState
        v-else
        :message="t('blog.noResults')"
        :hint="t('blog.noResultsHint')"
      />
    </section>
  </ClaymorphismSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import ClaymorphismSubPage from '../components/ClaymorphismSubPage.vue'
import ClaymorphismSectionHead from '../components/ClaymorphismSectionHead.vue'
import ClaymorphismPostCard from '../components/ClaymorphismPostCard.vue'
import ClaymorphismEmptyState from '../components/ClaymorphismEmptyState.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('claymorphism-blog-page', async () => {
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

// —— Pastel 色相轮换（与首页同款的对撞节奏） ——
const TONES = ['lilac', 'mint', 'pink', 'butter', 'blue'] as const

/** 按索引轮换色相（+2 起始：与项目页错开，两页不会撞同一串色序） */
function toneOf(index: number): (typeof TONES)[number] {
  return TONES[index % TONES.length]!
}
</script>

<style scoped>
/* —— 文章胶囊行堆叠 —— */
.post-stack {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

/* —— 加载骨架：黏土毛坯（脉冲） —— */
.skeleton-zone {
  display: grid;
  gap: var(--gap);
}

.skeleton {
  background: var(--c-surface);
  box-shadow: var(--shadow);
  animation: skeleton-pulse 1.6s ease-in-out infinite;
}

.skeleton-row {
  height: 84px;
  border-radius: 999px;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.55;
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
  }
}
</style>
