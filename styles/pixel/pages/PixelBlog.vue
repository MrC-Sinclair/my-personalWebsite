<!--
  PixelBlog - pixel 风格的「博客」子页（/style/pixel/blog）
  ------------------------------------------------------------
  壳由 PixelSubPage 提供；主体是 QUEST LOG 任务日志对话框。
  子页相对首页的唯一数据差异：首页取最新 4 条，本页取全量——
  任务日志本来就是能往回滚的完整流水账。
-->
<template>
  <PixelSubPage>
    <PixelPanel
      id="posts"
      data-section="posts"
      head="QUEST LOG"
      :title="t('blog.title')"
      :meta="String(posts.length)"
      :level="1"
    >
      <p v-if="loading" class="loading-art" role="status">
        [ ▓▓▓▓▓▓░░░░ ]<span class="blink">▉</span>
      </p>

      <ol v-else-if="posts.length" class="stack">
        <PixelPostRow v-for="post in posts" :key="post.path" :post="post" />
      </ol>

      <PixelEmpty v-else :message="t('blog.noResults')" :hint="t('blog.noResultsHint')" />
    </PixelPanel>
  </PixelSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import PixelSubPage from '../components/PixelSubPage.vue'
import PixelPanel from '../components/PixelPanel.vue'
import PixelPostRow from '../components/PixelPostRow.vue'
import PixelEmpty from '../components/PixelEmpty.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('pixel-blog-page', async () => {
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
/* —— 日志行容器（与首页同款） —— */
.stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* —— 加载占位：方块进度 + 步进闪烁光标（首页同款，唯一保留的动画） —— */
.loading-art {
  margin: 0;
  font-size: var(--fs-small);
  letter-spacing: 0.2em;
  color: var(--c-muted);
}

.blink {
  animation: pixel-blink 0.8s steps(1) infinite;
}

@keyframes pixel-blink {
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .blink {
    animation: none;
  }
}
</style>
