<!--
  MinimalismProjects - minimalism 风格的「项目」子页（/style/minimalism/projects）
  ------------------------------------------------------------
  壳由 MinimalismSubPage 提供；主体复用 MinimalismProjects。
  子页相对首页的差异只有数据量：首页列「精选 N 条」，
  本页列出全部项目。数据来源仍是同一批共享层 composables。
-->
<template>
  <MinimalismSubPage :title="t('nav.projects')">
    <p v-if="loading" class="loading" role="status">{{ t('common.loading') }}</p>
    <MinimalismProjects v-else :projects="projects" />
  </MinimalismSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import MinimalismSubPage from '../components/MinimalismSubPage.vue'
import MinimalismProjects from '../components/MinimalismProjects.vue'

/** 项目子页展示条数（比首页的精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('minimalism-projects-page', async () => {
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
  color: var(--c-muted);
}
</style>
