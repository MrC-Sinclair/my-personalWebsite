<!--
  TerminalBlog - terminal 风格的「博客」子页（/style/terminal/blog）
  ------------------------------------------------------------
  壳由 TerminalSubPage 提供；主体复用 TerminalBlockBlog。
  首页只列「最新 N 条」，本页列出全部文章——子页相对首页的数据差异。
-->
<template>
  <TerminalSubPage :title="t('nav.blog')">
    <p v-if="loading" class="loading" role="status">{{ t('common.loading') }}</p>
    <template v-else>
      <TerminalTagFilter
        :tags="tags"
        :active-tag="activeTag"
        :total="posts.length"
        @select="select"
      />
      <!-- 关键词搜索：一行 shell 命令的样子（~/blog $ grep …） -->
      <TerminalSearch
        :query="query"
        :result-count="resultCount"
        :total="totalCount"
        @update="setQuery"
        @clear="clear"
      />
      <TerminalBlockBlog :posts="results" />
    </template>
  </TerminalSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import TerminalSubPage from '../components/TerminalSubPage.vue'
import TerminalBlockBlog from '../components/TerminalBlockBlog.vue'
import TerminalTagFilter from '../components/TerminalTagFilter.vue'
import TerminalSearch from '../components/TerminalSearch.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('terminal-blog-page', async () => {
  const list = await getAllPosts()
  // 返回全量：博客子页不做截断（首页才有「最新 N 条」的概念）
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refresh()
})

const posts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))

// —— 标签筛选（共享层：标签清单 + ?tag= 同步 + 过滤后的列表） ——
const { tags, activeTag, filteredPosts, select } = useBlogTagFilter(posts)

// —— 关键词搜索（共享层：?q= 同步 + 匹配 + 计数）——
// 数据源取标签筛选后的列表：两个维度正交，叠加即交集，互不感知
const { query, results, resultCount, totalCount, setQuery, clear } = useBlogSearch(filteredPosts)

const loading = computed(() => pending.value && !postsData.value)
</script>

<style scoped>
.loading {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}
</style>
