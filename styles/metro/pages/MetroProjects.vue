<!--
  MetroProjects - Metro 风格「项目」子页
  ------------------------------------------------------------
  首页只亮精选 3 件；子页按约定展示前 12 件（PROJECT_COUNT = 12）。
  取数改用 useAsyncData 而非首页的 onMounted：子页没有别的 Tile 掩护，
  等客户端挂载完才填内容会看到一整屏空 mosaic。首卡 wide、其余 sm，
  与首页同款排布节奏。
-->
<template>
  <MetroSubPage>
    <section class="block" aria-labelledby="projects-h1">
      <div class="wrap">
        <h1 id="projects-h1" class="page-h1">{{ t('projects.title') }}</h1>

        <!-- 加载中：扁平骨架 Tile -->
        <div v-if="pending" class="mosaic" role="status" :aria-label="t('common.loading')">
          <div class="skel skel--wide" aria-hidden="true" />
          <div class="skel" aria-hidden="true" />
          <div class="skel" aria-hidden="true" />
        </div>

        <!-- 空状态 -->
        <p v-else-if="safeProjects.length === 0" class="empty">
          <span class="empty__mark" aria-hidden="true">!</span>
          {{ t('projects.noResults') }}
        </p>

        <div v-else class="mosaic">
          <MetroProjectTile
            v-for="(project, index) in safeProjects"
            :key="project.path"
            :project="project"
            :span="index === 0 ? 'wide' : 'sm'"
            :variant="pickVariant(projectVariants, index)"
          />
        </div>
      </div>
    </section>
  </MetroSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import MetroProjectTile from '../components/MetroProjectTile.vue'
import MetroSubPage from '../components/MetroSubPage.vue'
import type { MetroTileVariant } from '../components/MetroTile.vue'

const { t, locale } = useI18n()
const { getAllProjects } = useProjects()

/** 子页展示前 12 件（与全站约定 PROJECT_COUNT = 12 一致） */
const PROJECT_COUNT = 12

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('metro-projects-page', async () => {
  const all = await getAllProjects()
  return Array.isArray(all) ? all.slice(0, PROJECT_COUNT) : []
})

watch(locale, () => refresh())

const safeProjects = computed(() => (Array.isArray(projectsData.value) ? projectsData.value : []))

const projectVariants: MetroTileVariant[] = ['magenta', 'cobalt', 'purple']

/** 按索引取配色，越界回退 cobalt */
function pickVariant(list: MetroTileVariant[], index: number): MetroTileVariant {
  return list[index % list.length] ?? 'cobalt'
}
</script>
