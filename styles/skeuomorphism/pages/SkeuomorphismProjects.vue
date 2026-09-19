<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismProjects - 拟物风格的「项目」子页（/style/skeuomorphism/projects）
  ------------------------------------------------------------
  壳由 SkeuomorphismSubPage 提供；主体是钉在桌上的横线纸卡。
  差异只有数据量：首页取精选 3 张，本页取 12 张；首卡跨两列的
  大卡处理保留（附「精选」火漆徽章），交替倾角是纸卡散落的签名。
-->
<template>
  <SkeuomorphismSubPage>
    <section id="projects" data-section="projects" class="section" aria-labelledby="projects-title">
      <SkeuomorphismSectionHead
        id="projects-title"
        :level="1"
        :badge="t('nav.projects')"
        :title="t('projects.title')"
      />

      <!-- 加载骨架：空白纸卡 -->
      <div v-if="loading" class="cards" role="status" :aria-label="t('common.loading')">
        <span class="sr-only">{{ t('common.loading') }}</span>
        <div v-for="n in 3" :key="n" class="skel skel--card" aria-hidden="true" />
      </div>

      <!-- 空状态 -->
      <SkeuomorphismEmptyNote v-else-if="projects.length === 0" :message="t('projects.noResults')" />

      <div v-else class="cards">
        <SkeuomorphismPaperCard
          v-for="(project, i) in projects"
          :key="project.path"
          :project="project"
          :wide="i === 0"
          :tilt="projectTilts[i % projectTilts.length]"
          class="scroll-reveal"
        />
      </div>
    </section>
  </SkeuomorphismSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import SkeuomorphismSubPage from '../components/SkeuomorphismSubPage.vue'
import SkeuomorphismSectionHead from '../components/SkeuomorphismSectionHead.vue'
import SkeuomorphismPaperCard from '../components/SkeuomorphismPaperCard.vue'
import SkeuomorphismEmptyNote from '../components/SkeuomorphismEmptyNote.vue'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('skeuomorphism-projects-page', async () => {
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

/** 纸卡的交替倾角（确定性数值，SSR 安全；首卡为宽卡用小倾角） */
const projectTilts = [-0.8, 1.1, -0.6]
</script>

<style scoped>
.section {
  scroll-margin-top: 6.5rem;
  min-width: 0;
}

/* —— 纸卡：首卡横向跨列，其余错位 —— */
.cards {
  display: grid;
  gap: var(--gap);
}

@media (min-width: 768px) {
  .cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* 首卡（wide 大卡）横跨两列 */
  .cards > :first-child {
    grid-column: 1 / -1;
  }
}

/* —— 加载骨架：空白纸卡（脉冲） —— */
.skel {
  background: rgb(255 255 255 / 0.06);
  border-radius: var(--radius-sm);
  animation: skel-pulse 1.5s ease-in-out infinite;
}

.skel--card {
  height: 170px;
}

@keyframes skel-pulse {
  0%,
  100% {
    opacity: 0.45;
  }

  50% {
    opacity: 0.9;
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
  .skel {
    animation: none;
  }
}
</style>
