<!--
  DashboardIndex - dashboard 风格首页（/style/dashboard/）
  ------------------------------------------------------------
  把个人网站压成一个可快速扫描的「个人数据控制中心」：
  左侧边栏（窄屏收起为顶部条）+ 主区 12 列密集网格：
  英雄区 + KPI 行（真实统计）→ 图表行（分类 / 标签条形图、
  技能环形图、发文趋势迷你线）→ 精选项目表格 → 最新文章
  表格（带分类筛选器）→ 联系方式卡片 → 页脚状态条。
  数据全部来自共享层 composables（useAsyncData 承载，SSG
  预渲染即含真实内容）；统计与筛选均为视图侧同步推导。
-->
<template>
  <div class="page">
    <DashboardSidebar :sections="sections" />

    <div class="main">
      <div class="main-inner">
        <!-- ① 总览：英雄区 + KPI 行 -->
        <section id="overview" data-section="overview" class="cell">
          <header class="hero">
            <p class="hero-eyebrow">{{ t('home.greeting') }}</p>
            <div class="hero-row">
              <h1 class="hero-name">{{ t('home.name') }}</h1>
              <p class="hero-ghost" aria-hidden="true">{{ kpiPosts }}</p>
            </div>
            <p class="hero-tagline">{{ t('home.tagline') }}</p>
            <p class="hero-desc">{{ t('home.description') }}</p>
          </header>

          <div class="kpi-grid">
            <DashboardKpiCard :label="t('nav.blog')" :value="kpiPosts" :hint="kpiPostsHint" />
            <DashboardKpiCard :label="t('nav.projects')" :value="kpiProjects" :hint="kpiProjectsHint" />
            <DashboardKpiCard :label="t('blog.categories')" :value="kpiCategories" :hint="kpiCategoriesHint" />
            <DashboardKpiCard :label="t('blog.tags')" :value="kpiTags" :hint="kpiTagsHint" />
          </div>
        </section>

        <!-- 加载骨架（防御分支：正常情况下 await 后数据已就绪） -->
        <div v-if="loading" class="cell skeleton-zone" role="status">
          <p class="sr-only">{{ t('common.loading') }}</p>
          <div v-for="i in 4" :key="i" class="skeleton"/>
        </div>

        <template v-else>
          <!-- ② 图表行：分类 / 标签 / 技能 -->
          <DashboardPanel
            id="categories"
            data-section="categories"
            class="cell cell-4"
            :eyebrow="t('blog.title')"
            :title="t('blog.categories')"
            :meta="String(kpiPosts)"
          >
            <DashboardBarChart v-if="categoryStats.length" :items="categoryStats" />
            <DashboardEmptyState v-else :message="t('blog.noResults')" :hint="t('blog.noResultsHint')" />
          </DashboardPanel>

          <DashboardPanel
            id="tags"
            data-section="tags"
            class="cell cell-4"
            :eyebrow="t('blog.title')"
            :title="t('blog.tags')"
            :meta="String(kpiTags)"
          >
            <DashboardBarChart v-if="tagStats.length" :items="tagStats" tone="accent2" />
            <DashboardEmptyState v-else :message="t('blog.noResults')" :hint="t('blog.noResultsHint')" />
          </DashboardPanel>

          <DashboardPanel
            id="skills"
            data-section="skills"
            class="cell cell-skills"
            :eyebrow="t('about.title')"
            :title="t('about.skills')"
            :meta="String(kpiSkills)"
          >
            <DashboardDonutChart
              v-if="skillStats.length"
              :items="skillStats"
              :caption="t('about.skills')"
            />
            <DashboardEmptyState v-else :message="t('projects.noResults')" />
          </DashboardPanel>

          <!-- ②' 发文趋势（12 个月迷你趋势线） -->
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
              :caption="t('blog.publishedAt')"
            />
            <DashboardEmptyState v-else :message="t('blog.noResults')" :hint="t('blog.noResultsHint')" />
          </DashboardPanel>

          <!-- ③ 精选项目表格 -->
          <DashboardPanel
            id="projects"
            data-section="projects"
            class="cell"
            :eyebrow="t('nav.projects')"
            :title="t('home.featuredProjects')"
            :meta="String(featuredProjects.length)"
          >
            <DashboardProjectsTable
              v-if="featuredProjects.length"
              :projects="featuredProjects"
              :caption="t('home.featuredProjects')"
            />
            <DashboardEmptyState v-else :message="t('projects.noResults')" />
          </DashboardPanel>

          <!-- ④ 最新文章表格（带分类筛选器） -->
          <DashboardPanel
            id="posts"
            data-section="posts"
            class="cell cell-8"
            :eyebrow="t('nav.blog')"
            :title="t('home.latestPosts')"
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
              :caption="t('home.latestPosts')"
            />
            <DashboardEmptyState
              v-else
              :message="t('blog.noResults')"
              :hint="t('blog.noResultsHint')"
            />
          </DashboardPanel>

          <!-- ⑤ 联系方式卡片（不复用过渡层 ContactForm） -->
          <DashboardPanel
            id="contact"
            data-section="contact"
            class="cell cell-contact"
            :eyebrow="t('nav.contact')"
            :title="t('contact.socialLinks')"
          >
            <DashboardContactGrid :socials="socialLinks" />
          </DashboardPanel>
        </template>
      </div>

      <!-- 页脚状态条 -->
      <DashboardStatusStrip />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import DashboardPanel from '../components/DashboardPanel.vue'
import DashboardKpiCard from '../components/DashboardKpiCard.vue'
import DashboardBarChart from '../components/DashboardBarChart.vue'
import DashboardDonutChart from '../components/DashboardDonutChart.vue'
import DashboardTrendLine from '../components/DashboardTrendLine.vue'
import DashboardProjectsTable from '../components/DashboardProjectsTable.vue'
import DashboardPostsTable from '../components/DashboardPostsTable.vue'
import DashboardContactGrid from '../components/DashboardContactGrid.vue'
import DashboardStatusStrip from '../components/DashboardStatusStrip.vue'
import DashboardEmptyState from '../components/DashboardEmptyState.vue'
import { useDashboardStats } from '../composables/useDashboardStats'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()
const { getAllProjects, getFeaturedProjects } = useProjects()
const { socialLinks } = useAppInfo()

// 文章列表（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('dashboard-posts', async () => {
  const list = await getAllPosts()
  return Array.isArray(list) ? list : []
})

// 项目列表 + 精选项目（一次取齐，减少重复查询）
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<{ all: Project[]; featured: Project[] }>(
  'dashboard-projects',
  async () => {
    const all = await getAllProjects()
    const featured = await getFeaturedProjects()
    return {
      all: Array.isArray(all) ? all : [],
      featured: Array.isArray(featured) ? featured : [],
    }
  },
)

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshPosts()
  refreshProjects()
})

// —— 数据防御与视图推导（同步计算，SSR 安全） ——
const posts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))
const featuredProjects = computed<Project[]>(() =>
  Array.isArray(projectsData.value?.featured) ? projectsData.value!.featured : [],
)

/** 加载态：仅在尚无任何数据时显示骨架 */
const loading = computed(
  () => (postsPending.value && !postsData.value) || (projectsPending.value && !projectsData.value),
)

// —— 图表数据推导（与 /about、/blog 子页共用同一口径） ——
const {
  categoryStats,
  tagStats,
  skillStats,
  trend,
  trendTotal,
  kpiCategories,
  kpiTags,
  kpiSkills,
} = useDashboardStats(posts)

// —— KPI（真实统计） ——
const kpiPosts = computed(() => posts.value.length)
const kpiProjects = computed(() => projectsData.value?.all.length ?? 0)

/** 最新一篇文章（列表按日期倒序，首篇即最新） */
const latestPost = computed(() => posts.value[0] ?? null)

const kpiPostsHint = computed(() =>
  latestPost.value
    ? `${t('blog.publishedAt')} ${formatDate(latestPost.value.date, locale.value)}`
    : t('blog.noResults'),
)
const kpiProjectsHint = computed(
  () => `${t('projects.featured')} · ${featuredProjects.value.length}`,
)
const kpiCategoriesHint = computed(
  () => categoryStats.value[0]?.label ?? t('blog.allCategories'),
)
const kpiTagsHint = computed(() => tagStats.value[0]?.label ?? t('blog.tags'))

// —— 分类筛选器（视图侧过滤已获取的列表） ——
/** 当前筛选的分类（空字符串 = 全部分类） */
const activeCategory = ref('')
const filteredPosts = computed(() =>
  activeCategory.value
    ? posts.value.filter((post) => post.category === activeCategory.value)
    : posts.value,
)

// —— 侧边栏锚点（label 随语言更新） ——
const sections = computed(() => [
  { id: 'overview', label: t('nav.home') },
  { id: 'categories', label: t('blog.categories') },
  { id: 'tags', label: t('blog.tags') },
  { id: 'skills', label: t('about.skills') },
  { id: 'projects', label: t('home.featuredProjects') },
  { id: 'posts', label: t('home.latestPosts') },
  { id: 'contact', label: t('contact.socialLinks') },
])
</script>

<style scoped>
/* —— 页面骨架：窄屏单列（侧边栏收起为顶部条），桌面双列 —— */
.page {
  display: block;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

@media (min-width: 1024px) {
  .page {
    display: grid;
    grid-template-columns: 248px minmax(0, 1fr);
  }
}

.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: var(--space);
}

.main-inner {
  display: grid;
  flex: 1 0 auto;
  align-content: start;
  gap: var(--gap);
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
}

/* —— 12 列密集网格（风格签名） —— */
.cell {
  min-width: 0;
  grid-column: span 12;
}

@media (min-width: 768px) {
  .cell-4 {
    grid-column: span 6;
  }
}

@media (min-width: 1024px) {
  .cell-4 {
    grid-column: span 4;
  }

  .cell-skills {
    grid-column: span 4;
  }

  .cell-8 {
    grid-column: span 8;
  }

  .cell-contact {
    grid-column: span 4;
  }
}

/* —— 英雄区：小 eyebrow + 大等宽名字 + 幽灵数字 —— */
.hero {
  padding: var(--space) 0 calc(var(--space) / 2);
}

.hero-eyebrow {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.16em;
  color: var(--c-accent);
}

.hero-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space);
}

.hero-name {
  margin: 4px 0 8px;
  font-family: var(--font-head);
  font-size: clamp(30px, 6vw, 56px);
  font-weight: 700;
  line-height: 1.12;
  color: var(--c-text);
  overflow-wrap: break-word;
}

/* 幽灵数字：文章总数的大号装饰重复（真实数据的装饰化表达） */
.hero-ghost {
  flex: none;
  margin: 0;
  font-family: var(--font-mono);
  font-size: clamp(48px, 9vw, 120px);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: color-mix(in srgb, var(--c-accent) 26%, transparent);
}

.hero-tagline {
  margin: 0 0 2px;
  color: var(--c-text);
}

.hero-desc {
  max-width: 64ch;
  margin: 0;
  color: var(--c-muted);
}

/* —— KPI 行：自适应等宽卡片 —— */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--gap);
}

/* —— 分类筛选器（面板头 actions 插槽） —— */
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

/* 视觉隐藏（读屏可用） */
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

/* —— 锚点定位补偿：窄屏吸顶条比全局 5rem 更高 —— */
.cell[data-section] {
  scroll-margin-top: 7rem;
}

@media (min-width: 1024px) {
  .cell[data-section] {
    scroll-margin-top: var(--space);
  }
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
