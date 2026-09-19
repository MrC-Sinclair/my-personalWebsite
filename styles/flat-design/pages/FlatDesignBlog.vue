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
        <div v-else-if="posts.length" class="post-grid">
          <FlatDesignPostCard
            v-for="(post, i) in posts"
            :key="post.path"
            :post="post"
            :tone-index="i"
          />
        </div>
        <FlatDesignEmpty
          v-else
          :message="t('blog.noResults')"
          :hint="t('blog.noResultsHint')"
        />
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
</script>
