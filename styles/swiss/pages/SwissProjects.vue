<!--
  SwissProjects - swiss 风格的「项目」子页（/style/swiss/projects）
  ------------------------------------------------------------
  壳由 SwissSubPage 提供；主体是编号区块头 + 非对称项目网格。
  差异只有数据量：首页取精选 3 条，本页取 12 条。
-->
<template>
  <SwissSubPage>
    <section class="section scroll-reveal scroll-reveal-up" aria-labelledby="projects-head">
      <SwissSectionHead
        :no="1"
        :level="1"
        head-id="projects-head"
        :title="t('projects.title')"
        :meta="t('projects.description')"
      />
      <div class="section-body">
        <div v-if="loading" class="skeleton-zone" role="status" aria-live="polite">
          <p class="sr-only">{{ t('common.loading') }}</p>
          <div v-for="i in 3" :key="i" class="skeleton-row" />
        </div>

        <SwissProjectList v-else-if="projects.length" :projects="projects" />

        <p v-else class="empty">{{ t('projects.noResults') }}</p>
      </div>
    </section>
  </SwissSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import SwissSubPage from '../components/SwissSubPage.vue'
import SwissSectionHead from '../components/SwissSectionHead.vue'
import SwissProjectList from '../components/SwissProjectList.vue'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('swiss-projects-page', async () => {
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
.section {
  margin-top: calc(var(--space) * 2.4);
}

.section-body {
  margin-top: var(--space);
}

/* 空状态：细则线框 + 提示文案（不留白） */
.empty {
  padding: var(--space) 0;
  margin: 0;
  border-top: var(--border-w) solid var(--c-border);
  border-bottom: var(--border-w) solid var(--c-border);
  color: var(--c-muted);
}

/* —— 加载骨架：细则线行 + 脉冲 —— */
.skeleton-zone {
  display: grid;
}

.skeleton-row {
  height: 96px;
  border-top: var(--border-w) solid var(--c-border);
  background: var(--c-surface);
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.5;
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

@media (min-width: 768px) {
  .section {
    margin-top: calc(var(--space) * 2.8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-row {
    animation: none;
  }
}
</style>
