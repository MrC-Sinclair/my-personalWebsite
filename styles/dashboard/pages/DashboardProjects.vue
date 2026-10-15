<!--
  DashboardProjects - dashboard 风格的「项目」子页（/style/dashboard/projects）
  ------------------------------------------------------------
  壳由 DashboardSubPage 提供；主体是「全量项目表 + 右侧技术栈侧栏」
  的 8/4 双栏：左 8 栏放表格，右 4 栏放技术栈分布条形图与概览 KPI。
  差异只有数据量：首页取精选若干，本页取 12 条——表格本来就是
  为长列表准备的，首页那点行数用卡片才划算。

  为什么必须有侧栏：这一页只有一张 6 行表格时，表格下方到页脚会是
  一整屏空白，读起来像没做完的页面而不是控制台。右侧两栏是同一份
  项目数据换一个切面（不看明细，看分布），既信息增量又补满版面。
-->
<template>
  <DashboardSubPage
    :eyebrow="t('nav.projects')"
    :title="t('projects.title')"
    :description="t('projects.description')"
  >
    <div v-if="loading" class="cell skeleton-zone" role="status">
      <p class="sr-only">{{ t('common.loading') }}</p>
      <div v-for="i in 3" :key="i" class="skeleton" />
    </div>

    <template v-else>
      <!-- 主表：全量项目（左侧 8 栏） -->
      <DashboardPanel
        id="projects"
        class="cell cell--main"
        :title="t('projects.allProjects')"
        :meta="String(projects.length)"
      >
        <DashboardProjectsTable
          v-if="projects.length"
          :projects="projects"
          :caption="t('projects.allProjects')"
        />

        <DashboardEmptyState v-else :message="t('projects.noResults')" />
      </DashboardPanel>

      <!-- 侧栏：同一份数据换切面——技术栈分布 + 概览指标（右侧 4 栏） -->
      <div class="cell cell--side">
        <DashboardPanel :title="t('projects.techStack')" :meta="String(kpiProjectTags)">
          <DashboardBarChart v-if="projectTagStats.length" :items="projectTagStats" />
          <DashboardEmptyState v-else :message="t('projects.noResults')" />
        </DashboardPanel>

        <DashboardPanel :eyebrow="t('projects.title')">
          <div class="kpi-row">
            <DashboardKpiCard :label="t('projects.allProjects')" :value="projects.length" />
            <DashboardKpiCard :label="t('projects.featured')" :value="featuredCount" />
          </div>
        </DashboardPanel>
      </div>
    </template>
  </DashboardSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import DashboardSubPage from '../components/DashboardSubPage.vue'
import DashboardPanel from '../components/DashboardPanel.vue'
import DashboardProjectsTable from '../components/DashboardProjectsTable.vue'
import DashboardEmptyState from '../components/DashboardEmptyState.vue'
import DashboardBarChart from '../components/DashboardBarChart.vue'
import DashboardKpiCard from '../components/DashboardKpiCard.vue'
import { useDashboardStats } from '../composables/useDashboardStats'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('dashboard-projects-page', async () => {
  const list = await getFeaturedProjects(PROJECT_COUNT)
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refresh()
})

const projects = computed<Project[]>(() =>
  Array.isArray(projectsData.value) ? projectsData.value : [],
)

// —— 侧栏统计：同一份项目数据换切面（不传文章列表，这一页没有文章） ——
const { projectTagStats, kpiProjectTags } = useDashboardStats(undefined, projects)

/** 精选项目数（与全量并列，给概览面板一个「精选/全量」的对照） */
const featuredCount = computed<number>(
  () => projects.value.filter((project) => project.featured).length,
)

/** 加载态：仅在尚无任何数据时显示骨架 */
const loading = computed(() => pending.value && !projectsData.value)
</script>

<style scoped>
.cell {
  min-width: 0;
  grid-column: span 12;
}

/* —— 桌面端 8/4 双栏：主表 + 技术栈侧栏 ——
   窄屏仍是表格优先（表格要在第一个读完的位置），侧栏跟在后面 */
@media (min-width: 1024px) {
  .cell--main {
    grid-column: span 8;
  }

  .cell--side {
    display: grid;
    grid-column: span 4;
    gap: var(--gap);
    align-content: start;
  }
}

/* 概览面板内的两张 KPI 卡：两张并排，窄屏自动换行不挤成一列细条 */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--gap);
}

/* —— 加载骨架（与首页同款） —— */
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
}
</style>
