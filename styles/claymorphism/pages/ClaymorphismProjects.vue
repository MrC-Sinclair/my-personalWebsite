<!--
  ClaymorphismProjects - claymorphism 风格的「项目」子页（/style/claymorphism/projects）
  ------------------------------------------------------------
  壳由 ClaymorphismSubPage 提供；主体是黏土板网格。
  差异只有数据量：首页取精选 4 件，本页取 12 件；桌面端偶数卡
  交错下沉保留——那是「黏土块散落」的节奏，不是首页专属。
-->
<template>
  <ClaymorphismSubPage>
    <section class="zone">
      <ClaymorphismSectionHead
        eyebrow="03"
        :level="1"
        :title="t('projects.title')"
        :count="projects.length"
        tone="mint"
      />

      <!-- 加载骨架（防御分支） -->
      <div v-if="loading" class="skeleton-zone" role="status">
        <p class="sr-only">{{ t('common.loading') }}</p>
        <div v-for="i in 2" :key="i" class="skeleton skeleton-card" />
      </div>

      <div v-else-if="projects.length" class="project-grid">
        <div v-for="(project, index) in projects" :key="project.path" class="proj-slot">
          <ClaymorphismProjectCard :project="project" :tone="toneOf(index)" />
        </div>
      </div>

      <ClaymorphismEmptyState v-else :message="t('projects.noResults')" />
    </section>
  </ClaymorphismSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import ClaymorphismSubPage from '../components/ClaymorphismSubPage.vue'
import ClaymorphismSectionHead from '../components/ClaymorphismSectionHead.vue'
import ClaymorphismProjectCard from '../components/ClaymorphismProjectCard.vue'
import ClaymorphismEmptyState from '../components/ClaymorphismEmptyState.vue'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('claymorphism-projects-page', async () => {
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

// —— Pastel 色相轮换（与首页同款的对撞节奏） ——
const TONES = ['lilac', 'mint', 'pink', 'butter', 'blue'] as const

/** 按索引轮换色相 */
function toneOf(index: number): (typeof TONES)[number] {
  return TONES[index % TONES.length]!
}
</script>

<style scoped>
/* —— 项目网格：桌面双列，偶数卡交错下沉（黏土块散落感） —— */
.project-grid {
  display: grid;
  gap: var(--gap);
  align-items: start;
}

@media (min-width: 760px) {
  .project-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .proj-slot:nth-child(even) {
    margin-top: 36px;
  }
}

/* —— 加载骨架：黏土毛坯（脉冲） —— */
.skeleton-zone {
  display: grid;
  gap: var(--gap);
}

.skeleton {
  background: var(--c-surface);
  box-shadow: var(--shadow);
  animation: skeleton-pulse 1.6s ease-in-out infinite;
}

.skeleton-card {
  height: 150px;
  border-radius: var(--radius);
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.55;
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
  }
}
</style>
