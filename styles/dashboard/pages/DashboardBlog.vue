<!--
  DashboardBlog - dashboard 风格的「博客」子页（/style/dashboard/blog）
  ------------------------------------------------------------
  壳由 DashboardSubPage 提供；主体两块面板：发文趋势迷你线 +
  文章表格（带分类筛选器）。首页的表格只放最新几条且带同样的筛选器，
  本页是全量——筛选器在这里才真正有用（分类一多，全量表才需要切）。
-->
<template>
  <DashboardSubPage
    :eyebrow="t('nav.blog')"
    :title="t('blog.title')"
    :description="t('blog.description')"
  >
    <div v-if="loading" class="cell skeleton-zone" role="status">
      <p class="sr-only">{{ t('common.loading') }}</p>
      <div v-for="i in 3" :key="i" class="skeleton" />
    </div>

    <template v-else>
      <DashboardPanel
        class="cell"
        :eyebrow="t('blog.publishedAt')"
        :title="t('blog.title')"
        :meta="String(trendTotal)"
      >
        <DashboardTrendLine
          v-if="trend.values.length"
          :values="trend.values"
          :labels="trend.labels"
          :aria-label="t('blog.publishedAt')"
        />
        <DashboardEmptyState v-else :message="t('blog.noResults')" :hint="t('blog.noResultsHint')" />
      </DashboardPanel>

      <DashboardPanel
        id="posts"
        class="cell"
        :eyebrow="t('nav.blog')"
        :title="t('blog.title')"
        :meta="String(filteredPosts.length)"
      >
        <template #actions>
          <div class="filter" role="group" :aria-label="t('blog.categories')">
            <button
              type="button"
              class="filter-chip"
              :class="{ 'is-active': activeCategory === '' }"
              :aria-pressed="activeCategory === ''"
              @click="activeCategory = ''"
            >
              {{ t('blog.allCategories') }}
            </button>
            <button
              v-for="stat in categoryStats"
              :key="stat.label"
              type="button"
              class="filter-chip"
              :class="{ 'is-active': activeCategory === stat.label }"
              :aria-pressed="activeCategory === stat.label"
              @click="activeCategory = stat.label"
            >
              {{ stat.label }}
            </button>
          </div>
        </template>

        <DashboardPostsTable
          v-if="filteredPosts.length"
          :posts="filteredPosts"
          :caption="t('blog.title')"
        />
        <DashboardEmptyState
          v-else
          :message="t('blog.noResults')"
          :hint="t('blog.noResultsHint')"
        />
      </DashboardPanel>
    </template>
  </DashboardSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import DashboardSubPage from '../components/DashboardSubPage.vue'
import DashboardPanel from '../components/DashboardPanel.vue'
import DashboardTrendLine from '../components/DashboardTrendLine.vue'
import DashboardPostsTable from '../components/DashboardPostsTable.vue'
import DashboardEmptyState from '../components/DashboardEmptyState.vue'
import { useDashboardStats } from '../composables/useDashboardStats'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()

const {
  data: postsData,
  pending,
  refresh,
} = await useAsyncData<BlogPost[]>('dashboard-blog-page', async () => {
  const list = await getAllPosts()
  // 返回全量：博客子页不做截断（首页才有「最新 N 条」的概念）
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refresh()
})

const posts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))

const { categoryStats, trend, trendTotal } = useDashboardStats(posts)

/** 加载态：仅在尚无任何数据时显示骨架 */
const loading = computed(() => pending.value && !postsData.value)

// —— 分类筛选器（视图侧过滤已获取的列表） ——
/** 当前筛选的分类（空字符串 = 全部分类） */
const activeCategory = ref('')
const filteredPosts = computed(() =>
  activeCategory.value
    ? posts.value.filter((post) => post.category === activeCategory.value)
    : posts.value,
)
</script>

<style scoped>
.cell {
  min-width: 0;
  grid-column: span 12;
}

/* —— 分类筛选器（面板头 actions 插槽，与首页同款） —— */
.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
  cursor: pointer;
  background: transparent;
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  transition:
    color var(--transition),
    border-color var(--transition),
    background var(--transition);
}

.filter-chip:hover {
  color: var(--c-text);
  border-color: color-mix(in srgb, var(--c-accent) 55%, var(--c-border));
}

.filter-chip:active {
  transform: var(--press-transform);
}

.filter-chip.is-active {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

/* —— 加载骨架 —— */
.skeleton-zone {
  display: grid;
  gap: var(--gap);
}

.skeleton {
  height: 72px;
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.45;
  }

  50% {
    opacity: 1;
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
  .skeleton {
    animation: none;
  }

  .filter-chip {
    transition: none;
  }

  .filter-chip:active {
    transform: none;
  }
}
</style>
