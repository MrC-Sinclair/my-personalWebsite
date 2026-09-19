<!--
  RetroComputerProjects - 复古电脑风格的「项目」子页（/style/retro-computer/projects）
  ------------------------------------------------------------
  桌面隐喻下这一页是唯一开着的「文件夹」窗口，状态条显示条目数。
  差异只有数据量：首页取精选 3 条，本页取 12 条。
  取数用 useAsyncData 而非首页的 onMounted：子页没有「首屏其他窗口
  已经在展示」的掩护，等客户端挂载完才填内容会看到一整个空窗口。
-->
<template>
  <RetroComputerSubPage
    window-id="win-projects"
    :title="t('projects.title')"
    icon="folder"
    :status-text="statusText"
  >
    <div v-if="loading" class="rc-loading" role="status">
      <span class="rc-loading__blocks" aria-hidden="true"><i /><i /><i /></span>
      <span>{{ t('common.loading') }}</span>
    </div>

    <p v-else-if="!projects.length" class="rc-empty">
      <RetroComputerPixelIcon variant="folder" />
      <span>{{ t('projects.noResults') }}</span>
    </p>

    <template v-else>
      <RetroComputerProjectItem
        v-for="project in projects"
        :key="project.path"
        :project="project"
      />
    </template>
  </RetroComputerSubPage>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import RetroComputerSubPage from '../components/RetroComputerSubPage.vue'
import RetroComputerPixelIcon from '../components/RetroComputerPixelIcon.vue'
import RetroComputerProjectItem from '../components/RetroComputerProjectItem.vue'

/** 项目子页展示条数（比首页精选数多：这一页专讲项目） */
const PROJECT_COUNT = 12

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedProjects } = useProjects()

const {
  data: projectsData,
  pending,
  refresh,
} = await useAsyncData<Project[]>('retro-projects-page', async () => {
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

/** 状态条：与首页同款的「n 个对象」计数（语言无关的数字 + i18n 量词位） */
const statusText = computed(() => `${projects.value.length} ${t('projects.title')}`)
</script>

<style scoped>
/* ============ 加载态 / 空状态（与首页同款）============ */
.rc-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  color: var(--c-muted);
}

.rc-loading__blocks {
  display: inline-flex;
  gap: 4px;
}

/* 三格闪烁的加载块（steps 硬切，符合无过渡的性格） */
.rc-loading__blocks i {
  width: 10px;
  height: 10px;
  background: var(--c-accent);
  animation: rc-blink 900ms steps(1, end) infinite;
}

.rc-loading__blocks i:nth-child(2) {
  animation-delay: 150ms;
}

.rc-loading__blocks i:nth-child(3) {
  animation-delay: 300ms;
}

@keyframes rc-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.15;
  }
}

.rc-empty {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 16px;
  background: #ffffff;
  border: var(--border-w) solid;
  border-color: var(--c-border) #ffffff #ffffff var(--c-border);
  box-shadow: inset 1px 1px 0 0 #0a0a0a;
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .rc-loading__blocks i {
    animation: none;
  }
}
</style>
