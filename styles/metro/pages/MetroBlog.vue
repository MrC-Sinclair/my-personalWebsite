<!--
  MetroBlog - Metro 风格「博客」子页
  ------------------------------------------------------------
  首页只亮最新 3 篇；子页展示全量文章（blog 子页约定全量）。
  useAsyncData 取数；中间一篇 wide、其余 sm，与首页同款排布节奏；
  去掉首页「查看全部」入口（子页本身就是全部）。
-->
<template>
  <MetroSubPage>
    <section class="block" aria-labelledby="blog-h1">
      <div class="wrap">
        <h1 id="blog-h1" class="page-h1">{{ t('blog.title') }}</h1>

        <!-- 加载中：扁平骨架 Tile -->
        <div v-if="pending" class="mosaic" role="status" :aria-label="t('common.loading')">
          <div class="skel" aria-hidden="true" />
          <div class="skel skel--wide" aria-hidden="true" />
          <div class="skel" aria-hidden="true" />
        </div>

        <!-- 空状态 -->
        <p v-else-if="safePosts.length === 0" class="empty">
          <span class="empty__mark" aria-hidden="true">!</span>
          <span>
            {{ t('blog.noResults') }}
            <br>
            {{ t('blog.noResultsHint') }}
          </span>
        </p>

        <div v-else class="mosaic">
          <MetroPostTile
            v-for="(post, index) in safePosts"
            :key="post.path"
            :post="post"
            :span="index === 1 ? 'wide' : 'sm'"
            :variant="pickVariant(postVariants, index)"
          />
        </div>
      </div>
    </section>
  </MetroSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import MetroPostTile from '../components/MetroPostTile.vue'
import MetroSubPage from '../components/MetroSubPage.vue'
import type { MetroTileVariant } from '../components/MetroTile.vue'

const { t, locale } = useI18n()
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('metro-blog-page', async () => {
  const all = await getAllPosts()
  return Array.isArray(all) ? all : []
})

watch(locale, () => refresh())

const safePosts = computed(() => (Array.isArray(postsData.value) ? postsData.value : []))

const postVariants: MetroTileVariant[] = ['green', 'cobalt', 'red']

/** 按索引取配色，越界回退 cobalt */
function pickVariant(list: MetroTileVariant[], index: number): MetroTileVariant {
  return list[index % list.length] ?? 'cobalt'
}
</script>
