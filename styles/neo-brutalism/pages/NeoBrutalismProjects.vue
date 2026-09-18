<!--
  NeoBrutalismProjects - neo-brutalism 风格的「项目」子页（/style/neo-brutalism/projects）
  ------------------------------------------------------------
  壳由 NeoBrutalismSubPage 提供；主体仍是首页那套「大编号榜单」。
  差异只有数据量与排版：首页列精选若干条并按 12 栏错落下沉，
  本页列 12 条并铺满整宽——单页单主题不需要错落。
-->
<template>
  <NeoBrutalismSubPage>
    <section class="band scroll-reveal">
      <header class="band-head">
        <NeoBrutalismSectionTitle :text="t('projects.title')" tone="ink"/>
        <p class="count">{{ projects.length }}</p>
      </header>

      <NeoBrutalismEmpty v-if="loading" :message="t('common.loading')"/>

      <ol v-else-if="projects.length" class="work-list">
        <li v-for="(project, i) in projects" :key="project.path" class="work-item">
          <NeoBrutalismWorkCard :project="project" :index="i"/>
        </li>
      </ol>

      <NeoBrutalismEmpty v-else :message="t('projects.noResults')"/>
    </section>
  </NeoBrutalismSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import NeoBrutalismSubPage from '../components/NeoBrutalismSubPage.vue'
import NeoBrutalismSectionTitle from '../components/NeoBrutalismSectionTitle.vue'
import NeoBrutalismWorkCard from '../components/NeoBrutalismWorkCard.vue'
import NeoBrutalismEmpty from '../components/NeoBrutalismEmpty.vue'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('neo-brutalism-projects-page', async () => {
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
/* 区块带：上缘加粗分隔线（首页项目区同款处理） */
.band {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 32px;
  border-top: calc(var(--border-w) * 2) solid var(--c-border);
}

.band-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* 计数：黑色斜纹块（替代首页的「查看全部」按钮） */
.count {
  margin: 0;
  padding: 6px 14px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-bg);
  background: var(--c-text);
}

/* 榜单：单列铺满（首页是 12 栏错落） */
.work-list {
  display: grid;
  gap: 22px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.work-item {
  min-width: 0;
}
</style>
