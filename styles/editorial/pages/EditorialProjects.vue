<!--
  EditorialProjects - editorial 风格的「项目」子页（/style/editorial/projects）
  ------------------------------------------------------------
  壳由 EditorialSubPage 提供；主体是首页 02 栏的「图文对开」项目版式。
  差异只有数据量：首页取精选 3 条，本页取 12 条。
-->
<template>
  <EditorialSubPage>
    <EditorialEmpty v-if="loading" :message="t('common.loading')"/>

    <EditorialProjects v-else-if="projects.length" :projects="projects"/>

    <EditorialEmpty v-else :message="t('projects.noResults')"/>
  </EditorialSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import EditorialSubPage from '../components/EditorialSubPage.vue'
import EditorialProjects from '../components/EditorialProjects.vue'
import EditorialEmpty from '../components/EditorialEmpty.vue'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('editorial-projects-page', async () => {
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
