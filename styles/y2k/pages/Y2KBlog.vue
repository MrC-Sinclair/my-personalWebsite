<!--
  Y2KBlog - y2k 风格的「博客」子页（/style/y2k/blog）
  ------------------------------------------------------------
  壳由 Y2KSubPage 提供；主体是「序号铬球行条」列表。
  子页相对首页的唯一数据差异：首页取最新 4 条，本页取全量。
-->
<template>
  <Y2KSubPage>
    <section class="section" aria-labelledby="posts-title">
      <Y2KSectionHead id="posts-title" :badge="t('nav.blog')" :title="t('blog.title')"/>

      <p v-if="loading" class="empty" role="status">
        <span class="empty-orb" aria-hidden="true">✦</span>
        {{ t('common.loading') }}
      </p>

      <p v-else-if="!posts.length" class="empty empty--stack" role="status">
        <span class="empty-orb" aria-hidden="true">✦</span>
        <span class="empty-text">
          {{ t('blog.noResults') }}
          <span class="empty-hint">{{ t('blog.noResultsHint') }}</span>
        </span>
      </p>

      <div v-else class="rows">
        <Y2KPostRow
          v-for="(post, i) in posts"
          :key="post.path"
          :post="post"
          :index="i"
          class="scroll-reveal"
        />
      </div>
    </section>
  </Y2KSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import Y2KSubPage from '../components/Y2KSubPage.vue'
import Y2KSectionHead from '../components/Y2KSectionHead.vue'
import Y2KPostRow from '../components/Y2KPostRow.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('y2k-blog-page', async () => {
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
.section {
  min-width: 0;
}

/* 空态 / 加载态：与首页同款的星形提示 */
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

.empty--stack {
  flex-direction: column;
}

.empty-orb {
  color: var(--c-accent-2);
}

.empty-text {
  display: grid;
  gap: 6px;
}

.empty-hint {
  font-size: var(--fs-small);
  opacity: 0.8;
}

/* 行条列表 */
.rows {
  display: grid;
  gap: 12px;
}
</style>
