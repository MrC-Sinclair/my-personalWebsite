<!--
  Web2GlossyProjects - web2-glossy 风格的「项目」子页（/style/web2-glossy/projects）
  ------------------------------------------------------------
  壳由 Web2GlossySubPage 提供；主体是「浅蓝色带 + 大卡双列」。
  差异只有数据量：首页取精选若干条，本页取 12 条。
-->
<template>
  <Web2GlossySubPage>
    <section class="section section--tint" aria-labelledby="projects-title">
      <div class="container">
        <Web2GlossySectionHead
          id="projects-title"
          :badge="t('projects.featured')"
          :title="t('projects.title')"
        />

        <div v-if="loading" class="projects-grid" role="status" :aria-label="t('common.loading')">
          <div v-for="n in 3" :key="n" class="skel skel--panel" aria-hidden="true"/>
        </div>

        <p v-else-if="!projects.length" class="empty">
          <span class="empty__dot" aria-hidden="true">!</span>
          {{ t('projects.noResults') }}
        </p>

        <div v-else class="projects-grid">
          <Web2GlossyProjectCard
            v-for="(project, index) in projects"
            :key="project.path"
            :project="project"
            :wide="index === 0"
            class="projects-grid__item scroll-reveal"
          />
        </div>
      </div>
    </section>
  </Web2GlossySubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import Web2GlossySubPage from '../components/Web2GlossySubPage.vue'
import Web2GlossySectionHead from '../components/Web2GlossySectionHead.vue'
import Web2GlossyProjectCard from '../components/Web2GlossyProjectCard.vue'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('web2-glossy-projects-page', async () => {
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
/* —— 区块容器 —— */
.container {
  max-width: var(--page-w);
  margin-inline: auto;
  padding-inline: clamp(16px, 4vw, 32px);
}

.section {
  padding-block: clamp(56px, 9vw, 96px);
}

/* 浅蓝色带（项目区）：大色块交替节奏 */
.section--tint {
  border-top: 1px solid rgb(255 255 255 / 0.65);
  border-bottom: 1px solid rgb(255 255 255 / 0.65);
  background: linear-gradient(180deg, #d7e9fc 0%, #bfd9f6 100%);
}

/* —— 项目网格：首卡跨两列，其余并排 —— */
.projects-grid {
  display: grid;
  gap: var(--gap);
}

@media (min-width: 760px) {
  .projects-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .projects-grid__item:first-child {
    grid-column: 1 / -1;
  }
}

/* —— 空态 / 加载骨架 —— */
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0;
  padding: clamp(24px, 5vw, 48px) 0;
  color: var(--c-muted);
  text-align: center;
}

.empty__dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-weight: 800;
  color: #ffffff;
  border-radius: 50%;
  background: linear-gradient(180deg, #d97a1c 0%, #a84a0c 100%);
}

.skel {
  border-radius: var(--radius);
  background: linear-gradient(180deg, #e6f1fb 0%, #d3e5f7 100%);
  animation: w2g-skeleton 1.3s ease-in-out infinite;
}

.skel--panel {
  height: 180px;
}

@keyframes w2g-skeleton {
  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skel {
    animation: none;
    opacity: 0.7;
  }
}
</style>
