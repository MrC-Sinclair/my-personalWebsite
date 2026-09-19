<!--
  FlatDesignProjects - 扁平化风格「项目」子页
  ------------------------------------------------------------
  首页只亮精选；子页展示前 12 件（PROJECT_COUNT = 12 约定）。取数用
  useAsyncData（SSG 预渲染即含真实内容）。色带用浅灰（与首页项目带一致），
  标题 level=1 成为本页唯一 h1；去掉「查看全部」入口（子页本身就是全部）。
-->
<template>
  <FlatDesignSubPage>
    <section class="band band--gray">
      <div class="band__inner">
        <div class="band__head-row">
          <FlatDesignSectionHead
            :title="t('projects.title')"
            :subtitle="t('projects.description')"
            bar-color="#d35400"
            :level="1"
          />
        </div>

        <div v-if="pending" class="band__loading">
          <FlatDesignSkeleton />
        </div>
        <div v-else-if="projects.length" class="proj-grid">
          <FlatDesignProjectCard
            v-for="(project, i) in projects"
            :key="project.path"
            :project="project"
            :tone-index="i"
          />
        </div>
        <FlatDesignEmpty v-else :message="t('projects.noResults')" />
      </div>
    </section>
  </FlatDesignSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import FlatDesignEmpty from '../components/FlatDesignEmpty.vue'
import FlatDesignProjectCard from '../components/FlatDesignProjectCard.vue'
import FlatDesignSectionHead from '../components/FlatDesignSectionHead.vue'
import FlatDesignSkeleton from '../components/FlatDesignSkeleton.vue'
import FlatDesignSubPage from '../components/FlatDesignSubPage.vue'

const { t, locale } = useI18n()
const { getAllProjects } = useProjects()

/** 子页展示前 12 件（与全站约定 PROJECT_COUNT = 12 一致） */
const PROJECT_COUNT = 12

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('flat-design-projects-page', async () => {
  const all = await getAllProjects()
  return Array.isArray(all) ? all.slice(0, PROJECT_COUNT) : []
})

watch(locale, () => refresh())

const projects = computed(() => (Array.isArray(projectsData.value) ? projectsData.value : []))
</script>
