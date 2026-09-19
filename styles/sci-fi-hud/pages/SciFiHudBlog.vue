<!--
  SciFiHudBlog - sci-fi-hud 风格的「博客」子页（/style/sci-fi-hud/blog）
  ------------------------------------------------------------
  壳由 SciFiHudSubPage 提供；主体是单个 SEC-04 数据流面板。
  子页相对首页的唯一数据差异：首页取最新 6 条，本页取全量——
  数据流本来就是能往回滚的完整记录。
-->
<template>
  <SciFiHudSubPage>
    <SciFiHudPanel
      code="SEC-04"
      :level="1"
      :title="t('blog.title')"
      :meta="String(posts.length)"
      class="scroll-reveal scroll-reveal-up"
    >
      <SciFiHudLoader v-if="loading" />

      <SciFiHudPostStream v-else-if="posts.length" :posts="posts" />

      <SciFiHudEmpty
        v-else
        :message="t('blog.noResults')"
        :hint="t('blog.noResultsHint')"
      />
    </SciFiHudPanel>
  </SciFiHudSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import SciFiHudSubPage from '../components/SciFiHudSubPage.vue'
import SciFiHudPanel from '../components/SciFiHudPanel.vue'
import SciFiHudPostStream from '../components/SciFiHudPostStream.vue'
import SciFiHudLoader from '../components/SciFiHudLoader.vue'
import SciFiHudEmpty from '../components/SciFiHudEmpty.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('scifihud-blog-page', async () => {
  const list = await getAllPosts()
  // 返回全量：博客子页不做截断（首页才有「最新 N 条」的概念）
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refresh()
})

const posts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))

/** 加载态：仅在尚无任何数据时显示数据流占位 */
const loading = computed(() => pending.value && !postsData.value)
</script>
