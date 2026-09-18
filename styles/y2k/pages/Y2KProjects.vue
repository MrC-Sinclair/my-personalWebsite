<!--
  Y2KProjects - y2k 风格的「项目」子页（/style/y2k/projects）
  ------------------------------------------------------------
  壳由 Y2KSubPage 提供；主体是「镭射光盘卡」错位网格。
  差异只有数据量：首页取精选 3 条，本页取 12 条；首卡跨两列的
  大卡处理保留（它是卡片的节奏，不是首页专属）。
-->
<template>
  <Y2KSubPage>
    <section class="section" aria-labelledby="projects-title">
      <Y2KSectionHead id="projects-title" :badge="t('projects.featured')" :title="t('projects.title')"/>

      <p v-if="loading" class="empty" role="status">
        <span class="empty-orb" aria-hidden="true">✦</span>
        {{ t('common.loading') }}
      </p>

      <p v-else-if="!projects.length" class="empty" role="status">
        <span class="empty-orb" aria-hidden="true">✦</span>
        {{ t('projects.noResults') }}
      </p>

      <div v-else class="cards">
        <Y2KProjectCard
          v-for="(project, i) in projects"
          :key="project.path"
          :project="project"
          :wide="i === 0"
          class="scroll-reveal"
          :class="{ 'cards-stagger': i === 2 }"
        />
      </div>
    </section>
  </Y2KSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import Y2KSubPage from '../components/Y2KSubPage.vue'
import Y2KSectionHead from '../components/Y2KSectionHead.vue'
import Y2KProjectCard from '../components/Y2KProjectCard.vue'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('y2k-projects-page', async () => {
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
.section {
  min-width: 0;
}

/* 空态 / 加载态：与首页同款的星形提示 */
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

.empty-orb {
  color: var(--c-accent-2);
}

/* 卡片网格：桌面端两列，首卡跨两列、第三卡下沉 */
.cards {
  display: grid;
  gap: var(--gap);
}

@media (min-width: 768px) {
  .cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cards > :first-child {
    grid-column: 1 / -1;
  }

  .cards-stagger {
    margin-top: 40px;
  }
}
</style>
