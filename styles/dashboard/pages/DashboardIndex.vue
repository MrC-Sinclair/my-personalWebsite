<!--
  DashboardIndex - dashboard 风格首页（/style/dashboard/）
  ------------------------------------------------------------
  把个人网站压成一个可快速扫描的「个人数据控制中心」：
  左侧边栏（窄屏收起为顶部条）+ 主区 12 列密集网格：
  首屏主块（最新一篇真实文章）+ 从属指标带（真实统计，低一级字号）
  → 图表行（文章分类 / 项目技术栈条形图、技能环形图、发文趋势迷你线）
  → 精选项目表格 → 最新文章表格（带分类筛选器）→ 联系方式卡片 → 页脚状态条。
  首屏按数据型原型组织：真实内容占主块、数字降为从属，删掉原大号
  幽灵数字与 4 张等权 KPI 卡，让统计不再与内容抢视觉重心。
  数据全部来自共享层 composables（useAsyncData 承载，SSG
  预渲染即含真实内容）；统计与筛选均为视图侧同步推导。
-->
<template>
  <div class="page">
    <DashboardSidebar :sections="sections" />

    <div class="main">
      <div class="main-inner">
        <!-- ① 总览：主内容块（最新一篇真实文章）+ 从属指标带
             数据型原型：主块占视觉重心，统计数字降为从属注记；
             删掉原来与文章总数重复的大号幽灵数字和 4 张等权 KPI 卡。 -->
        <section id="overview" data-section="overview" class="cell">
          <header class="hero">
            <p class="hero-eyebrow">{{ t('home.greeting') }}</p>
            <div class="hero-row">
              <h1 class="hero-name">{{ t('home.name') }}</h1>
              <!-- 原装饰性幽灵数字改为最新内容的真实发布日期 -->
              <p v-if="latestPost" class="hero-date">
                <span class="hero-date-label">{{ t('blog.publishedAt') }}</span>
                <time :datetime="latestPost.date">
                  {{ formatDate(latestPost.date, locale) }}
                </time>
              </p>
            </div>
            <p class="hero-tagline">{{ t('home.tagline') }}</p>
            <p class="hero-desc">{{ t('home.description') }}</p>
          </header>

          <div class="overview-grid">
            <!-- 主块：真实文章承担视觉重量（标题 / 摘要 / 日期 / 分类 / 标签 / 详情入口） -->
            <article class="lead-panel" :aria-label="t('home.latestPosts')">
              <div class="lead-head">
                <p class="lead-caption">{{ t('home.latestPosts') }}</p>
                <span v-if="leadPost?.category" class="lead-category">{{ leadPost.category }}</span>
              </div>

              <div v-if="loading" class="lead-loading" role="status">
                <p class="sr-only">{{ t('common.loading') }}</p>
                <span class="lead-loading-line" aria-hidden="true" />
                <span class="lead-loading-line lead-loading-line--short" aria-hidden="true" />
              </div>

              <template v-else-if="leadPost">
                <h2 class="lead-title">{{ leadPost.title }}</h2>
                <p v-if="leadPost.description" class="lead-desc">{{ leadPost.description }}</p>
                <p class="lead-meta">
                  <time :datetime="leadPost.date">{{ leadPost.dateText }}</time>
                  <span v-for="tag in leadPost.tags" :key="tag">{{ tag }}</span>
                </p>
                <NuxtLink class="lead-link" :to="leadPost.to">
                  {{ t('blog.readMore') }}<span class="lead-arrow" aria-hidden="true">→</span>
                </NuxtLink>
              </template>

              <p v-else class="lead-empty">{{ t('blog.noResults') }}</p>
            </article>

            <!-- 从属指标：4 个真实统计紧凑成带，字号比主块低一级 -->
            <div class="metric-strip">
              <div v-for="metric in metrics" :key="metric.label" class="metric">
                <p class="metric-label">{{ metric.label }}</p>
                <p class="metric-value">{{ metric.value }}</p>
                <p class="metric-hint">{{ metric.hint }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 加载骨架（防御分支：正常情况下 await 后数据已就绪） -->
        <div v-if="loading" class="cell skeleton-zone" role="status">
          <p class="sr-only">{{ t('common.loading') }}</p>
          <div v-for="i in 4" :key="i" class="skeleton" />
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
            <DashboardEmptyState
              v-else
              :message="t('blog.noResults')"
              :hint="t('blog.noResultsHint')"
            />
          </DashboardPanel>

          <DashboardPanel
            id="tech"
            data-section="tech"
            class="cell cell-4"
            :eyebrow="t('nav.projects')"
            :title="t('projects.techStack')"
            :meta="String(kpiProjectTags)"
          >
            <DashboardBarChart
              v-if="projectTagStats.length"
              :items="projectTagStats"
              tone="accent2"
            />
            <DashboardEmptyState v-else :message="t('projects.noResults')" />
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
            <DashboardEmptyState
              v-else
              :message="t('blog.noResults')"
              :hint="t('blog.noResultsHint')"
            />
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

            <!-- 搜索入口：提交后到博客子页执行全量搜索（共享层 URL 同步） -->
            <form class="post-search" role="search" @submit.prevent="submitSearch">
              <input
                v-model="searchKeyword"
                type="search"
                :placeholder="t('blog.search')"
                :aria-label="t('blog.search')"
                autocomplete="off"
              >
            </form>

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
import { contentSlug } from '~/utils/content'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import DashboardPanel from '../components/DashboardPanel.vue'
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

// 对外路由链接的本地化路径（搜索入口跳转博客子页用）
const localePath = useLocalePath()
// 首屏主块的文章详情链接走共享层，风格层不重写路由拼接
const { postPath } = useStyleContentPath()

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
} = await useAsyncData<{ all: Project[]; featured: Project[] }>('dashboard-projects', async () => {
  const all = await getAllProjects()
  const featured = await getFeaturedProjects()
  return {
    all: Array.isArray(all) ? all : [],
    featured: Array.isArray(featured) ? featured : [],
  }
})

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

/** 全部项目（技术栈分布面板的数据源；KPI 亦用总数） */
const allProjects = computed<Project[]>(() =>
  Array.isArray(projectsData.value?.all) ? projectsData.value!.all : [],
)

/** 加载态：仅在尚无任何数据时显示骨架 */
const loading = computed(
  () => (postsPending.value && !postsData.value) || (projectsPending.value && !projectsData.value),
)

// —— 图表数据推导（与 /about、/blog 子页共用同一口径） ——
// 第二入参传全部项目：技术栈分布面板的数据源是 projects.tags，
// 与文章分类/标签不同源（同一份文章切四刀只会信息重复）
const {
  categoryStats,
  fullTagStats,
  projectTagStats,
  skillStats,
  trend,
  trendTotal,
  kpiCategories,
  kpiTags,
  kpiProjectTags,
  kpiSkills,
} = useDashboardStats(posts, allProjects)

// —— KPI（真实统计） ——
const kpiPosts = computed(() => posts.value.length)
const kpiProjects = computed(() => projectsData.value?.all.length ?? 0)

/** 主块展示的标签数（真实标签，按内容顺序） */
const LEAD_TAGS_SHOWN = 2

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
/** KPI：分类数（全量，不受图表 Top N 截断影响） */
const kpiCategoriesHint = computed(() => categoryStats.value[0]?.label ?? t('blog.allCategories'))
const kpiTagsHint = computed(() => fullTagStats.value[0]?.label ?? t('blog.tags'))

/** 首屏主块：把共享层数据映射成真实内容条目（标题 / 摘要 / 日期 / 分类 / 标签 / 链接） */
const leadPost = computed(() => {
  const post = latestPost.value
  if (!post) return null
  return {
    title: post.title,
    description: post.description ?? '',
    date: post.date,
    dateText: formatDate(post.date, locale.value),
    category: post.category ?? '',
    tags: (Array.isArray(post.tags) ? post.tags : []).slice(0, LEAD_TAGS_SHOWN),
    to: postPath(contentSlug(post.path)),
  }
})

/** 从属指标带：4 个真实统计，配原本就有的说明文案，不新增任何数字 */
const metrics = computed(() => [
  { label: t('nav.blog'), value: kpiPosts.value, hint: kpiPostsHint.value },
  { label: t('nav.projects'), value: kpiProjects.value, hint: kpiProjectsHint.value },
  { label: t('blog.categories'), value: kpiCategories.value, hint: kpiCategoriesHint.value },
  { label: t('blog.tags'), value: kpiTags.value, hint: kpiTagsHint.value },
])

// —— 分类筛选器（视图侧过滤已获取的列表） ——
/** 当前筛选的分类（空字符串 = 全部分类） */
const activeCategory = ref('')

// —— 搜索入口（首页只做入口：提交后到博客子页对全量文章执行搜索） ——
const searchKeyword = ref('')

function submitSearch(): void {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return
  navigateTo(`${localePath('/style/dashboard/blog')}?q=${encodeURIComponent(keyword)}`)
}
const filteredPosts = computed(() =>
  activeCategory.value
    ? posts.value.filter((post) => post.category === activeCategory.value)
    : posts.value,
)

// —— 侧边栏锚点（label 随语言更新） ——
const sections = computed(() => [
  { id: 'overview', label: t('nav.home') },
  { id: 'categories', label: t('blog.categories') },
  { id: 'tech', label: t('projects.techStack') },
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

/* —— 英雄区：小 eyebrow + 等宽名字 + 真实发布日期 —— */
.hero {
  padding: var(--space) 0 var(--scale-space-3);
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
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px var(--space);
}

.hero-name {
  margin: 4px 0 8px;
  font-family: var(--font-head);
  font-size: clamp(32px, 6vw, 60px);
  font-weight: 700;
  line-height: 1.12;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

/* 原本的大号幽灵数字是文章总数的装饰化重复，换成真实发布日期 */
.hero-date {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.hero-date-label {
  letter-spacing: 0.12em;
  text-transform: uppercase;
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

/* —— 主次网格：主块占 8 栏，从属指标带占 4 栏 —— */
.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--gap);
  align-items: stretch;
}

@media (min-width: 1024px) {
  .overview-grid {
    grid-template-columns: minmax(0, 8fr) minmax(0, 4fr);
    gap: var(--scale-space-3);
  }
}

/* —— 主块：真实内容承担视觉重量（顶部数据高光条是风格签名） —— */
.lead-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: var(--scale-space-3);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  border-top: 3px solid var(--c-accent);
}

.lead-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px var(--gap);
  margin-bottom: var(--scale-space-2);
}

.lead-caption {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.lead-category {
  padding: 2px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
}

/* 主块标题用 Subtitle 级：仍是从属指标的两倍，但不会在 1440/390
   折成四行把首屏变成单篇海报——数据型的本体是密集信息。 */
.lead-title {
  margin: 0;
  font-size: var(--scale-subtitle-fluid);
  font-weight: 700;
  line-height: 1.25;
  color: var(--c-text);
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.lead-desc {
  margin: var(--scale-space-2) 0 0;
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-muted);
}

.lead-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px var(--scale-space-2);
  margin: var(--scale-space-2) 0 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.lead-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  align-self: flex-start;
  min-height: var(--scale-hit);
  margin-top: auto;
  padding: 8px 18px;
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-accent);
  text-decoration: none;
  background: transparent;
  border: var(--border-w) solid var(--c-accent);
  border-radius: var(--radius-sm);
  transition:
    background var(--transition),
    color var(--transition);
}

.lead-link:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
}

.lead-link:active {
  transform: var(--press-transform);
}

.lead-arrow {
  transition: transform var(--transition);
}

.lead-link:hover .lead-arrow {
  transform: translateX(4px);
}

.lead-empty {
  margin: 0;
  color: var(--c-muted);
}

/* 加载补白：不误报空状态 */
.lead-loading {
  display: grid;
  gap: var(--gap);
}

.lead-loading-line {
  height: var(--scale-space-3);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--c-border) 40%, transparent);
  animation: lead-breathe 1.4s ease-in-out infinite;
}

.lead-loading-line--short {
  width: 60%;
}

@keyframes lead-breathe {
  0%,
  100% {
    opacity: 0.45;
  }

  50% {
    opacity: 1;
  }
}

/* —— 从属指标带：2×2 紧凑网格，字号比主块低一级（原 4 张等权卡降级） —— */
.metric-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--gap);
  align-content: start;
}

.metric {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: var(--scale-space-2);
  background: var(--c-bg);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
}

.metric-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: var(--c-muted);
}

.metric-label::before {
  content: '';
  flex: none;
  width: 6px;
  height: 6px;
  background: var(--c-border);
}

.metric-value {
  margin: 6px 0 2px;
  font-family: var(--font-head);
  font-size: var(--scale-lead-fluid);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  color: var(--c-text);
}

.metric-hint {
  overflow: hidden;
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* —— 分类筛选器（面板头 actions 插槽） —— */
.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  min-height: var(--scale-hit);
  /* 两个汉字在回退等宽字体下只有 39px 宽（CI 实测），命中区下限不该由字形决定 */
  min-width: var(--scale-hit);
  padding: 8px 12px;
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

/* —— 文章面板搜索入口：metric 输入位（与筛选 chips 同语言） —— */
.post-search {
  display: flex;
  margin-bottom: var(--gap);
}

.post-search input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: var(--scale-hit);
  padding: 8px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  outline: none;
  transition:
    border-color var(--transition),
    background var(--transition);
}

.post-search input::placeholder {
  color: var(--c-muted);
}

.post-search input:hover {
  border-color: color-mix(in srgb, var(--c-accent) 55%, var(--c-border));
}

.post-search input:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
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

  .lead-loading-line {
    animation: none;
    opacity: 0.6;
  }

  .filter-chip,
  .lead-link,
  .lead-arrow {
    transition: none;
  }

  .filter-chip:active,
  .lead-link:active,
  .lead-link:hover .lead-arrow {
    transform: none;
  }
}
</style>
