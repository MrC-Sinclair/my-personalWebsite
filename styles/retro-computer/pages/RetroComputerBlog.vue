<!--
  RetroComputerBlog - 复古电脑风格的「博客」子页（/style/retro-computer/blog）
  ------------------------------------------------------------
  桌面隐喻下这一页是唯一开着的「文档」窗口，状态条显示条目数。
  子页相对首页的唯一数据差异：首页取最新 3 条，本页取全量。
  取数用 useAsyncData 而非首页的 onMounted：子页没有别的窗口掩护，
  等客户端挂载完才填内容会看到一整个空窗口。
-->
<template>
  <RetroComputerSubPage
    window-id="win-blog"
    :title="t('blog.title')"
    icon="doc"
    :status-text="statusText"
  >
    <div v-if="loading" class="rc-loading" role="status">
      <span class="rc-loading__blocks" aria-hidden="true"><i /><i /><i /></span>
      <span>{{ t('common.loading') }}</span>
    </div>

    <p v-else-if="!posts.length" class="rc-empty">
      <RetroComputerPixelIcon variant="doc" />
      <span>{{ t('blog.noResults') }}</span>
    </p>

    <template v-else>
      <RetroComputerPostItem v-for="post in posts" :key="post.path" :post="post" />
    </template>
  </RetroComputerSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import RetroComputerSubPage from '../components/RetroComputerSubPage.vue'
import RetroComputerPixelIcon from '../components/RetroComputerPixelIcon.vue'
import RetroComputerPostItem from '../components/RetroComputerPostItem.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('retro-blog-page', async () => {
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

const statusText = computed(() => `${posts.value.length} ${t('blog.title')}`)
</script>

<style scoped>
/* ============ 加载态 / 空状态（与首页同款）============ */
.rc-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  color: var(--c-muted);
}

.rc-loading__blocks {
  display: inline-flex;
  gap: 4px;
}

/* 三格闪烁的加载块（steps 硬切，符合无过渡的性格） */
.rc-loading__blocks i {
  width: 10px;
  height: 10px;
  background: var(--c-accent);
  animation: rc-blink 900ms steps(1, end) infinite;
}

.rc-loading__blocks i:nth-child(2) {
  animation-delay: 150ms;
}

.rc-loading__blocks i:nth-child(3) {
  animation-delay: 300ms;
}

@keyframes rc-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.15;
  }
}

.rc-empty {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 16px;
  background: #ffffff;
  border: var(--border-w) solid;
  border-color: var(--c-border) #ffffff #ffffff var(--c-border);
  box-shadow: inset 1px 1px 0 0 #0a0a0a;
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .rc-loading__blocks i {
    animation: none;
  }
}
</style>
