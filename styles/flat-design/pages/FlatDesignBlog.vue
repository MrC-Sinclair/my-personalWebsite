<!--
  FlatDesignBlog - 扁平化风格「博客」子页
  ------------------------------------------------------------
  首页只亮最新 4 篇；子页展示全量文章（blog 子页约定全量）。取数用
  useAsyncData；色带用深蓝灰（白卡反衬，与首页博客带一致），
  标题 level=1 成为本页唯一 h1；去掉「查看全部」入口（子页本身就是全部）。
-->
<template>
  <FlatDesignSubPage>
    <section class="band band--dark">
      <div class="band__inner">
        <div class="band__head-row">
          <FlatDesignSectionHead
            :title="t('blog.title')"
            :subtitle="t('blog.description')"
            tone="dark"
            bar-color="#f1c40f"
            :level="1"
          />
        </div>

        <div v-if="pending" class="band__loading">
          <FlatDesignSkeleton />
        </div>
        <!-- 筛选/搜索控件常驻：结果为空时也要留着，否则用户改不了条件 -->
        <template v-else>
          <FlatDesignTagFilter
            :tags="tags"
            :active-tag="activeTag"
            :total="posts.length"
            @select="select"
          />
          <FlatDesignSearch
            :query="query"
            :result-count="resultCount"
            :total="totalCount"
            @update="setQuery"
            @clear="clear"
          />
          <div v-if="results.length" class="post-grid">
            <FlatDesignPostCard
              v-for="(post, i) in results"
              :key="post.path"
              :post="post"
              :tone-index="i"
            />
          </div>
          <FlatDesignEmpty v-else :message="t('blog.noResults')" :hint="t('blog.noResultsHint')" />
        </template>
      </div>
    </section>
  </FlatDesignSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import FlatDesignEmpty from '../components/FlatDesignEmpty.vue'
import FlatDesignPostCard from '../components/FlatDesignPostCard.vue'
import FlatDesignSectionHead from '../components/FlatDesignSectionHead.vue'
import FlatDesignSkeleton from '../components/FlatDesignSkeleton.vue'
import FlatDesignSubPage from '../components/FlatDesignSubPage.vue'
import FlatDesignTagFilter from '../components/FlatDesignTagFilter.vue'
import FlatDesignSearch from '../components/FlatDesignSearch.vue'

const { t, locale } = useI18n()
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('flat-design-blog-page', async () => {
  const all = await getAllPosts()
  return Array.isArray(all) ? all : []
})

watch(locale, () => refresh())

const posts = computed(() => (Array.isArray(postsData.value) ? postsData.value : []))

// —— 标签筛选（共享层：标签清单 + ?tag= 同步 + 过滤后的列表） ——
const { tags, activeTag, filteredPosts, select } = useBlogTagFilter(posts)

// —— 关键词搜索（共享层：?q= 同步 + 匹配 + 计数）——
// 数据源取标签筛选后的列表：两个维度正交，叠加即交集，互不感知
const { query, results, resultCount, totalCount, setQuery, clear } = useBlogSearch(filteredPosts)
</script>
