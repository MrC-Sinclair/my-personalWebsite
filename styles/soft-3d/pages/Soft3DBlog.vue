<!--
  Soft3DBlog - soft-3d 风格的「博客」子页（/style/soft-3d/blog）
  ------------------------------------------------------------
  壳由 Soft3DSubPage 提供（标题 mint 档）；主体是「双列错落漂浮刊物」。
  子页相对首页的唯一数据差异：首页取精选 6 条，本页取全量。
-->
<template>
  <Soft3DSubPage
    :eyebrow="t('nav.blog')"
    :title="t('blog.title')"
    :description="t('blog.description')"
    variant="mint"
  >
    <div class="post-grid">
      <Soft3DEmpty v-if="loading" class="post-item" loading :message="t('common.loading')"/>

      <template v-else>
        <div
          v-for="(post, i) in posts"
          :key="post.path"
          class="reveal-wrap scroll-reveal scroll-reveal-up"
          :class="revealClass(i)"
        >
          <div class="z-item z-post" :class="{ 'z-post-raised': i % 2 === 1 }">
            <Soft3DPostCard :post="post" :variant="postVariants[i % postVariants.length]"/>
          </div>
        </div>

        <Soft3DEmpty
          v-if="!posts.length"
          class="post-item"
          :message="t('blog.noResults')"
          :hint="t('blog.noResultsHint')"
        />
      </template>
    </div>
  </Soft3DSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import Soft3DSubPage from '../components/Soft3DSubPage.vue'
import Soft3DPostCard from '../components/Soft3DPostCard.vue'
import Soft3DEmpty from '../components/Soft3DEmpty.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('soft3d-blog-page', async () => {
  const list = await getAllPosts()
  // 返回全量：博客子页不做截断（首页才有「精选 N 条」的概念）
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refresh()
})

const posts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))

/** 加载态：仅在尚无任何数据时显示 */
const loading = computed(() => pending.value && !postsData.value)

// —— 配色轮换（纯装饰，索引取模，SSR 安全） ——
const postVariants = ['cyan', 'violet', 'mint', 'pink', 'sun'] as const

/** reveal 交错延迟类（滚动进入动画的全局类，确定性） */
function revealClass(index: number): string {
  const delays = ['', 'scroll-reveal-delay-1', 'scroll-reveal-delay-2']
  return delays[index % 3]!
}
</script>

<style scoped>
/* —— 文章网格：桌面端双列错落 —— */
.post-grid {
  display: grid;
  gap: calc(var(--gap) + 4px);
  margin-top: calc(var(--space) * 1.1);
  grid-template-columns: 1fr;
}

.reveal-wrap {
  min-width: 0;
}

.z-item {
  height: 100%;
}

.post-item {
  grid-column: 1 / -1;
}

@media (min-width: 768px) {
  .post-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* 偶数列上浮半层，形成漂浮交错 */
  .z-item.z-post-raised {
    transform: translateY(-14px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .z-item {
    transition: none;
  }
}
</style>
