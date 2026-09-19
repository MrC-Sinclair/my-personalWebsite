<!--
  SciFiHudProjects - sci-fi-hud 风格的「项目」子页（/style/sci-fi-hud/projects）
  ------------------------------------------------------------
  壳由 SciFiHudSubPage 提供；主体是单个 SEC-03 载荷面板。
  差异只有数据量：首页取精选 6 件，本页取 12 件。
-->
<template>
  <SciFiHudSubPage>
    <SciFiHudPanel
      code="SEC-03"
      :level="1"
      :title="t('projects.title')"
      :meta="String(projects.length)"
      class="scroll-reveal scroll-reveal-up"
    >
      <SciFiHudLoader v-if="loading" />

      <div v-else-if="projects.length" class="payload-grid">
        <SciFiHudProjectCard
          v-for="(project, index) in projects"
          :key="project.path || index"
          :project="project"
          :index="index"
        />
      </div>

      <SciFiHudEmpty v-else :message="t('projects.noResults')" />
    </SciFiHudPanel>
  </SciFiHudSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import SciFiHudSubPage from '../components/SciFiHudSubPage.vue'
import SciFiHudPanel from '../components/SciFiHudPanel.vue'
import SciFiHudProjectCard from '../components/SciFiHudProjectCard.vue'
import SciFiHudLoader from '../components/SciFiHudLoader.vue'
import SciFiHudEmpty from '../components/SciFiHudEmpty.vue'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('scifihud-projects-page', async () => {
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

/** 加载态：仅在尚无任何数据时显示数据流占位 */
const loading = computed(() => pending.value && !projectsData.value)
</script>

<style scoped>
/* 载荷网格：项目卡自适应（与首页同款：
   auto-fit + 轨道上限 + 居中，避免单条载荷时留下一整排空轨道） */
.payload-grid {
  display: grid;
  gap: var(--gap);
  grid-template-columns: repeat(auto-fit, minmax(240px, 420px));
  justify-content: center;
}
</style>
