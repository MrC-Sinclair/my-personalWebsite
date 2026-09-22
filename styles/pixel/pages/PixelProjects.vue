<!--
  PixelProjects - pixel 风格的「项目」子页（/style/pixel/projects）
  ------------------------------------------------------------
  壳由 PixelSubPage 提供；主体是 INVENTORY 物品栏对话框。
  差异只有数据量：首页取精选 4 件，本页取 12 件——物品栏序号
  （01/02/…）本来就是给长列表用的，首页截短才需要「精选」语义。
-->
<template>
  <PixelSubPage>
    <PixelPanel
      id="projects"
      data-section="projects"
      head="INVENTORY"
      :title="t('projects.title')"
      :meta="String(projects.length)"
      :level="1"
    >
      <p v-if="loading" class="loading-art" role="status">
        [ ▓▓▓▓▓▓░░░░ ]<span class="blink">▉</span>
      </p>

      <ul v-else-if="projects.length" class="stack">
        <PixelInventoryItem
          v-for="(project, i) in projects"
          :key="project.path"
          :project="project"
          :index="i"
        />
      </ul>

      <PixelEmpty v-else :message="t('projects.noResults')" />
    </PixelPanel>
  </PixelSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import PixelSubPage from '../components/PixelSubPage.vue'
import PixelPanel from '../components/PixelPanel.vue'
import PixelInventoryItem from '../components/PixelInventoryItem.vue'
import PixelEmpty from '../components/PixelEmpty.vue'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('pixel-projects-page', async () => {
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
/* —— 物品栏容器（与首页同款） —— */
.stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* —— 加载占位：方块进度 + 步进闪烁光标（首页同款，唯一保留的动画） —— */
.loading-art {
  margin: 0;
  font-size: var(--fs-small);
  letter-spacing: 0.2em;
  color: var(--c-muted);
}

.blink {
  animation: pixel-blink 0.8s steps(1) infinite;
}

@keyframes pixel-blink {
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .blink {
    animation: none;
  }
}
</style>
