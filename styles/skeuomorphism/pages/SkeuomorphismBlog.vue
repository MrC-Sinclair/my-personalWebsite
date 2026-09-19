<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismBlog - 拟物风格的「博客」子页（/style/skeuomorphism/blog）
  ------------------------------------------------------------
  壳由 SkeuomorphismSubPage 提供；主体是打孔索引卡行。
  子页相对首页的两点差异：取全量（首页取最新 4 条）且不再需要
  「查看全部」入口——已经站在整摞索引卡前面了。
-->
<template>
  <SkeuomorphismSubPage>
    <section id="posts" data-section="posts" class="section" aria-labelledby="posts-title">
      <SkeuomorphismSectionHead
        id="posts-title"
        :level="1"
        :badge="t('nav.blog')"
        :title="t('blog.title')"
      />

      <!-- 加载骨架：索引卡纸条 -->
      <div v-if="loading" class="rows" role="status" :aria-label="t('common.loading')">
        <span class="sr-only">{{ t('common.loading') }}</span>
        <div v-for="n in 4" :key="n" class="skel skel--row" aria-hidden="true" />
      </div>

      <!-- 空状态（含提示文案） -->
      <SkeuomorphismEmptyNote
        v-else-if="posts.length === 0"
        :message="t('blog.noResults')"
        :hint="t('blog.noResultsHint')"
      />

      <div v-else class="rows">
        <SkeuomorphismNoteRow
          v-for="(post, i) in posts"
          :key="post.path"
          :post="post"
          :index="i"
          :tilt="i % 2 === 0 ? -0.5 : 0.6"
          class="scroll-reveal"
        />
      </div>
    </section>
  </SkeuomorphismSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import SkeuomorphismSubPage from '../components/SkeuomorphismSubPage.vue'
import SkeuomorphismSectionHead from '../components/SkeuomorphismSectionHead.vue'
import SkeuomorphismNoteRow from '../components/SkeuomorphismNoteRow.vue'
import SkeuomorphismEmptyNote from '../components/SkeuomorphismEmptyNote.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('skeuomorphism-blog-page', async () => {
  const list = await getAllPosts()
  // 返回全量：博客子页不做截断（首页才有「最新 N 条」的概念）
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refresh()
})

const posts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))

/** 加载态：仅在尚无任何数据时显示骨架 */
const loading = computed(() => pending.value && !postsData.value)
</script>

<style scoped>
.section {
  scroll-margin-top: 6.5rem;
  min-width: 0;
}

/* —— 索引卡堆叠 —— */
.rows {
  display: grid;
  gap: 14px;
}

/* —— 加载骨架：索引卡纸条（脉冲） —— */
.skel {
  background: rgb(255 255 255 / 0.06);
  border-radius: var(--radius-sm);
  animation: skel-pulse 1.5s ease-in-out infinite;
}

.skel--row {
  height: 92px;
}

@keyframes skel-pulse {
  0%,
  100% {
    opacity: 0.45;
  }

  50% {
    opacity: 0.9;
  }
}

.sr-only {
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .skel {
    animation: none;
  }
}
</style>
