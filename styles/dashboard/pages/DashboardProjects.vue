<!--
  DashboardProjects - dashboard 风格的「项目」子页（/style/dashboard/projects）
  ------------------------------------------------------------
  壳由 DashboardSubPage 提供；主体是一张项目表格面板。
  差异只有数据量：首页取精选若干，本页取 12 条——表格本来就是
  为长列表准备的，首页那点行数用卡片才划算。
-->
<template>
  <DashboardSubPage
    :eyebrow="t('nav.projects')"
    :title="t('projects.title')"
    :description="t('projects.description')"
  >
    <DashboardPanel
      id="projects"
      class="cell"
      :eyebrow="t('projects.featured')"
      :title="t('projects.title')"
      :meta="String(projects.length)"
    >
      <div v-if="loading" class="skeleton-zone" role="status">
        <p class="sr-only">{{ t('common.loading') }}</p>
        <div v-for="i in 3" :key="i" class="skeleton" />
      </div>

      <DashboardProjectsTable
        v-else-if="projects.length"
        :projects="projects"
        :caption="t('projects.title')"
      />

      <DashboardEmptyState v-else :message="t('projects.noResults')" />
    </DashboardPanel>
  </DashboardSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import DashboardSubPage from '../components/DashboardSubPage.vue'
import DashboardPanel from '../components/DashboardPanel.vue'
import DashboardProjectsTable from '../components/DashboardProjectsTable.vue'
import DashboardEmptyState from '../components/DashboardEmptyState.vue'

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

/** 加载态：仅在尚无任何数据时显示骨架 */
const loading = computed(() => pending.value && !projectsData.value)
</script>

<style scoped>
.cell {
  min-width: 0;
  grid-column: span 12;
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
