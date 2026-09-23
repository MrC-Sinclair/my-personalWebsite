<!--
  DashboardAbout - dashboard 风格的「关于」子页（/style/dashboard/about）
  ------------------------------------------------------------
  壳由 DashboardSubPage 提供（页头已是 eyebrow + h1 + 简介）。
  主体两块：KPI 行（个人数据概览）+ 技能分布环形图。
  这一页刻意不放经历时间线——dashboard 的表达单位是「指标」而非
  「叙述」，把经历压成表格会丢掉因果，不如让技能分布与数据概览说话。
-->
<template>
  <DashboardSubPage
    :eyebrow="t('nav.about')"
    :title="t('about.title')"
    :description="t('about.description')"
  >
    <section class="cell" aria-labelledby="about-kpi">
      <h2 id="about-kpi" class="sr-only">{{ t('nav.about') }}</h2>
      <div class="kpi-grid">
        <DashboardKpiCard :label="t('nav.blog')" :value="posts.length" :hint="kpiPostsHint" />
        <DashboardKpiCard :label="t('nav.projects')" :value="kpiProjects" :hint="kpiProjectsHint" />
        <DashboardKpiCard :label="t('blog.categories')" :value="kpiCategories" :hint="kpiCategoriesHint" />
        <DashboardKpiCard :label="t('blog.tags')" :value="kpiTags" :hint="kpiTagsHint" />
      </div>
    </section>

    <DashboardPanel
      id="skills"
      class="cell"
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
  </DashboardSubPage>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import DashboardSubPage from '../components/DashboardSubPage.vue'
import DashboardPanel from '../components/DashboardPanel.vue'
import DashboardKpiCard from '../components/DashboardKpiCard.vue'
import DashboardDonutChart from '../components/DashboardDonutChart.vue'
import DashboardEmptyState from '../components/DashboardEmptyState.vue'
import { useDashboardStats } from '../composables/useDashboardStats'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()
const { getAllProjects } = useProjects()

// 文章列表（图表口径与首页共用 useDashboardStats，只需同一份 posts）
const {
  data: postsData,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('dashboard-about-posts', async () => {
  const list = await getAllPosts()
  return Array.isArray(list) ? list : []
})

// 全部项目（KPI 用总数，不做 featured 过滤）
const { data: projectsData, refresh: refreshProjects } = await useAsyncData<Project[]>(
  'dashboard-about-projects',
  async () => {
    const list = await getAllProjects()
    return Array.isArray(list) ? list : []
  },
)

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshPosts()
  refreshProjects()
})

const posts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))

const { skillStats, categoryStats, tagStats, kpiCategories, kpiTags, kpiSkills } =
  useDashboardStats(posts)

const kpiProjects = computed(() => projectsData.value?.length ?? 0)

/** 最新一篇文章（列表按日期倒序，首篇即最新） */
const latestPost = computed(() => posts.value[0] ?? null)

const kpiPostsHint = computed(() =>
  latestPost.value
    ? `${t('blog.publishedAt')} ${formatDate(latestPost.value.date, locale.value)}`
    : t('blog.noResults'),
)
const kpiProjectsHint = computed(() => `${t('projects.title')} · ${kpiProjects.value}`)
const kpiCategoriesHint = computed(() => categoryStats.value[0]?.label ?? t('blog.allCategories'))
const kpiTagsHint = computed(() => tagStats.value[0]?.label ?? t('blog.tags'))
</script>

<style scoped>
/* —— 12 列密集网格：本页两块各占满 12 栏（同首页 .cell 语义） —— */
.cell {
  min-width: 0;
  grid-column: span 12;
}

/* —— KPI 行：自适应等宽卡片 —— */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--gap);
}

/* 视觉隐藏（读屏可用）：给 KPI 区一个标题，避免无标题区块 */
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
</style>
