<!--
  TerminalProjects - terminal 风格的「项目」子页（/style/terminal/projects）
  ------------------------------------------------------------
  壳由 TerminalSubPage 提供；主体复用 TerminalBlockWorks。
  本条子页展示的项目数比首页多（首页是「精选」，这里是完整列表），
  这是子页相对首页唯一的数据差异，其余同源。
-->
<template>
  <TerminalSubPage :title="t('nav.projects')">
    <p v-if="loading" class="loading" role="status">{{ t('common.loading') }}</p>
    <TerminalBlockWorks v-else :projects="projects" />
  </TerminalSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import TerminalSubPage from '../components/TerminalSubPage.vue'
import TerminalBlockWorks from '../components/TerminalBlockWorks.vue'

/** 项目子页展示条数（比首页的精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('terminal-projects-page', async () => {
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

const loading = computed(() => pending.value && !projectsData.value)
</script>

<style scoped>
.loading {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}
</style>
