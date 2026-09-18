<!--
  NeoBrutalismBlog - neo-brutalism 风格的「博客」子页（/style/neo-brutalism/blog）
  ------------------------------------------------------------
  壳由 NeoBrutalismSubPage 提供；主体是「号外报纸行」列表（hover 整行反白）。
  子页相对首页的唯一数据差异：首页取最新 5 条，本页取全量。
-->
<template>
  <NeoBrutalismSubPage>
    <section class="band scroll-reveal">
      <header class="band-head">
        <NeoBrutalismSectionTitle :text="t('blog.title')" tone="ink"/>
        <p class="count">{{ posts.length }}</p>
      </header>

      <NeoBrutalismEmpty v-if="loading" :message="t('common.loading')"/>

      <ol v-else-if="posts.length" class="post-list">
        <li v-for="post in posts" :key="post.path">
          <NeoBrutalismPostRow :post="post"/>
        </li>
      </ol>

      <NeoBrutalismEmpty
        v-else
        :message="t('blog.noResults')"
        :hint="t('blog.noResultsHint')"
      />
    </section>
  </NeoBrutalismSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import NeoBrutalismSubPage from '../components/NeoBrutalismSubPage.vue'
import NeoBrutalismSectionTitle from '../components/NeoBrutalismSectionTitle.vue'
import NeoBrutalismPostRow from '../components/NeoBrutalismPostRow.vue'
import NeoBrutalismEmpty from '../components/NeoBrutalismEmpty.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('neo-brutalism-blog-page', async () => {
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
.band {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 32px;
  border-top: calc(var(--border-w) * 2) solid var(--c-border);
}

.band-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* 计数：黑色斜纹块 */
.count {
  margin: 0;
  padding: 6px 14px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-bg);
  background: var(--c-text);
}

/* 号外报纸行列表 */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
