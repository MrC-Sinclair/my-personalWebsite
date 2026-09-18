<!--
  LiquidGlassProjects - liquid-glass 风格的「项目」子页（/style/liquid-glass/projects）
  ------------------------------------------------------------
  壳由 LiquidGlassSubPage 提供；主体是「悬浮标题 + 松散玻璃片」，
  与首页项目区同一套语言，差异只有数据量：首页列精选 4 条，本页列 12 条。
  数据来源仍是同一批共享层 composables。
-->
<template>
  <LiquidGlassSubPage>
    <div class="loose">
      <LiquidGlassSectionHead
        class="scroll-reveal scroll-reveal-up"
        :eyebrow="t('nav.projects')"
        :title="t('projects.title')"
        :meta="String(projects.length)"
      />

      <LiquidGlassEmpty v-if="loading" :message="t('common.loading')"/>

      <LiquidGlassEmpty v-else-if="!projects.length" :message="t('projects.noResults')"/>

      <div v-else class="project-grid">
        <LiquidGlassProjectCard
          v-for="project in projects"
          :key="project.path"
          :project="project"
          class="project-cell"
        />
      </div>
    </div>
  </LiquidGlassSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import LiquidGlassSubPage from '../components/LiquidGlassSubPage.vue'
import LiquidGlassSectionHead from '../components/LiquidGlassSectionHead.vue'
import LiquidGlassProjectCard from '../components/LiquidGlassProjectCard.vue'
import LiquidGlassEmpty from '../components/LiquidGlassEmpty.vue'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('liquid-glass-projects-page', async () => {
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
/* 松散玻璃片区：文字悬空、玻璃承载（与首页同宽同呼吸） */
.loose {
  min-width: 0;
}

/* 项目网格：12 列交错悬浮（7 / 5 错落，偶数卡下沉） */
.project-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--gap);
}

.project-cell {
  min-width: 0;
  grid-column: span 12;
}

@media (min-width: 760px) {
  .project-cell:nth-child(odd) {
    grid-column: span 7;
  }

  .project-cell:nth-child(even) {
    grid-column: span 5;
    margin-top: 44px;
  }
}
</style>
