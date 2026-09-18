<!--
  CyberpunkProjects - cyberpunk 风格的「项目」子页（/style/cyberpunk/projects）
  ------------------------------------------------------------
  壳由 CyberpunkSubPage 提供；主体仍是首页那块「悬赏数据板」面板。
  差异只有数据量：首页列精选 4 条，本页列 12 条。
-->
<template>
  <CyberpunkSubPage>
    <CyberpunkPanel
      class="scroll-reveal scroll-reveal-up"
      :eyebrow="t('nav.projects')"
      :title="t('projects.title')"
      :meta="String(projects.length)"
      tone="magenta"
    >
      <CyberpunkEmpty v-if="loading" :message="t('common.loading')"/>

      <CyberpunkEmpty v-else-if="!projects.length" :message="t('projects.noResults')"/>

      <div v-else class="project-grid">
        <CyberpunkProjectCard v-for="project in projects" :key="project.path" :project="project"/>
      </div>
    </CyberpunkPanel>
  </CyberpunkSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import CyberpunkSubPage from '../components/CyberpunkSubPage.vue'
import CyberpunkPanel from '../components/CyberpunkPanel.vue'
import CyberpunkProjectCard from '../components/CyberpunkProjectCard.vue'
import CyberpunkEmpty from '../components/CyberpunkEmpty.vue'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('cyberpunk-projects-page', async () => {
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

/** 加载态：仅在尚无任何数据时显示 */
const loading = computed(() => pending.value && !projectsData.value)
</script>

<style scoped>
/* 自适应数据板（与首页同款轨道上限，避免单卡拉伸变形） */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 460px));
  justify-content: center;
  gap: var(--gap);
}
</style>
