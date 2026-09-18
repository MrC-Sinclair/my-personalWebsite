<!--
  Soft3DProjects - soft-3d 风格的「项目」子页（/style/soft-3d/projects）
  ------------------------------------------------------------
  壳由 Soft3DSubPage 提供（标题 pink 档）；主体是「三列 Z 层错落」的
  漂浮项目卡，与首页项目区同一套语言。差异只有数据量：首页取 6 条，
  本页取 12 条；首页尾部有「查看全部」外跳，子页不需要。
-->
<template>
  <Soft3DSubPage
    :eyebrow="t('nav.projects')"
    :title="t('projects.title')"
    :description="t('projects.description')"
    variant="pink"
  >
    <div class="proj-grid">
      <Soft3DEmpty v-if="loading" class="proj-item" loading :message="t('common.loading')"/>

      <template v-else>
        <div
          v-for="(project, i) in projects"
          :key="project.path"
          class="reveal-wrap scroll-reveal scroll-reveal-up"
          :class="revealClass(i)"
        >
          <div class="z-item" :class="zOf(i)">
            <Soft3DProjectCard
              :project="project"
              :variant="coverVariants[i % coverVariants.length]"
            />
          </div>
        </div>

        <Soft3DEmpty v-if="!projects.length" class="proj-item" :message="t('projects.noResults')"/>
      </template>
    </div>
  </Soft3DSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import Soft3DSubPage from '../components/Soft3DSubPage.vue'
import Soft3DProjectCard from '../components/Soft3DProjectCard.vue'
import Soft3DEmpty from '../components/Soft3DEmpty.vue'

/** 项目子页展示条数（比首页的多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('soft3d-projects-page', async () => {
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

// —— 配色轮换与 Z 层（纯装饰，索引取模，SSR 安全） ——
const coverVariants = ['violet', 'cyan', 'warm', 'mint', 'sun', 'grape'] as const

/** Z 层轮换：远 / 近 / 中循环，形成「物体错落摆放」的纵深 */
function zOf(index: number): 'z-near' | 'z-mid' | 'z-far' {
  const order: Array<'z-near' | 'z-mid' | 'z-far'> = ['z-far', 'z-near', 'z-mid']
  return order[index % 3]!
}

/** reveal 交错延迟类（滚动进入动画的全局类，确定性） */
function revealClass(index: number): string {
  const delays = ['', 'scroll-reveal-delay-1', 'scroll-reveal-delay-2']
  return delays[index % 3]!
}
</script>

<style scoped>
/* —— 项目网格：桌面端三列 Z 层 —— */
.proj-grid {
  display: grid;
  gap: calc(var(--gap) + 8px);
  margin-top: calc(var(--space) * 1.1);
  grid-template-columns: 1fr;
}

/* Z 层包裹：reveal 在外层，层级变换在内层，transform 互不覆盖 */
.reveal-wrap {
  min-width: 0;
}

.z-item {
  height: 100%;
}

.proj-item {
  grid-column: 1 / -1;
}

@media (min-width: 900px) {
  .proj-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  /* 近 / 中 / 远三档层级——近层上浮放大 + 影更沉 */
  .z-item.z-near {
    transform: translateY(-18px) scale(1.02);
  }

  .z-item.z-mid {
    transform: translateY(0);
  }

  .z-item.z-far {
    transform: translateY(16px) scale(0.97);
  }
}

@media (prefers-reduced-motion: reduce) {
  .z-item {
    transition: none;
  }
}
</style>
