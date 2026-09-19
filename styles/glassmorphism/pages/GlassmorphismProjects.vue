<!--
  GlassmorphismProjects - glassmorphism 风格的「项目」子页（/style/glassmorphism/projects）
  ------------------------------------------------------------
  壳由 GlassmorphismSubPage 提供；主体是一块磨砂玻璃板里的项目卡网格。
  差异只有数据量：首页取精选 4 件，本页取 12 件。
-->
<template>
  <GlassmorphismSubPage>
    <section id="projects" data-section="projects" class="sheet scroll-reveal scroll-reveal-up">
      <GlassmorphismGlassPanel>
        <GlassmorphismSectionHead
          :level="1"
          :eyebrow="t('nav.projects')"
          :title="t('projects.title')"
        />

        <GlassmorphismPlaceholder
          v-if="loading"
          variant="loading"
          :message="t('common.loading')"
        />

        <div v-else-if="projects.length" class="project-grid">
          <GlassmorphismProjectCard
            v-for="project in projects"
            :key="project.path"
            :project="project"
          />
        </div>

        <GlassmorphismPlaceholder
          v-else
          variant="empty"
          :message="t('projects.noResults')"
          :hint="t('blog.noResultsHint')"
        />
      </GlassmorphismGlassPanel>
    </section>
  </GlassmorphismSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import GlassmorphismSubPage from '../components/GlassmorphismSubPage.vue'
import GlassmorphismGlassPanel from '../components/GlassmorphismGlassPanel.vue'
import GlassmorphismSectionHead from '../components/GlassmorphismSectionHead.vue'
import GlassmorphismProjectCard from '../components/GlassmorphismProjectCard.vue'
import GlassmorphismPlaceholder from '../components/GlassmorphismPlaceholder.vue'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('glassmorphism-projects-page', async () => {
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
/* 玻璃板 */
.sheet {
  min-width: 0;
  margin-bottom: calc(var(--space) * 1.6);
}

/* —— 项目网格（与首页同款） —— */
.project-grid {
  display: grid;
  gap: var(--gap);
}

@media (min-width: 640px) {
  .project-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
