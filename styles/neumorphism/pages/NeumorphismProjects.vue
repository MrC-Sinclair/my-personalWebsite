<!--
  NeumorphismProjects - neumorphism 风格的「项目」子页（/style/neumorphism/projects）
  ------------------------------------------------------------
  壳由 NeumorphismSubPage 提供；主体是一块凸起面板里的大圆角项目卡。
  差异只有数据量：首页取精选若干，本页取 12 条。
-->
<template>
  <NeumorphismSubPage>
    <NeumorphismPanel
      id="projects"
      data-section="projects"
      :level="1"
      :title="t('projects.title')"
      :lead="t('projects.description')"
    >
      <div v-if="loading" class="panel-loading" role="status">
        <p class="sr-only">{{ t('common.loading') }}</p>
        <div class="skeleton skeleton-a" />
        <div class="skeleton skeleton-b" />
      </div>

      <div v-else-if="projects.length" class="project-list">
        <NeumorphismProjectCard
          v-for="(project, index) in projects"
          :key="project.path"
          :project="project"
          :index="index"
        />
      </div>

      <div v-else class="empty" role="status">
        <p class="empty-title">{{ t('projects.noResults') }}</p>
      </div>
    </NeumorphismPanel>
  </NeumorphismSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import NeumorphismSubPage from '../components/NeumorphismSubPage.vue'
import NeumorphismPanel from '../components/NeumorphismPanel.vue'
import NeumorphismProjectCard from '../components/NeumorphismProjectCard.vue'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('neumorphism-projects-page', async () => {
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
/* —— 列表容器 —— */
.project-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* —— 空状态：材料表面凹出的空槽 —— */
.empty {
  padding: var(--space);
  text-align: center;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-press);
}

.empty-title {
  margin: 0;
  font-weight: 600;
  color: var(--c-text);
}

/* —— 加载骨架：凸起面板呼吸 —— */
.panel-loading {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.skeleton {
  background: var(--c-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  animation: skeleton-pulse 1.6s ease-in-out infinite;
}

.skeleton-a {
  height: 140px;
}

.skeleton-b {
  height: 220px;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.5;
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
    opacity: 0.6;
  }
}
</style>
