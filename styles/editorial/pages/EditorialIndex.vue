<!--
  EditorialIndex - editorial 风格首页（/style/editorial/）
  ------------------------------------------------------------
  把个人网站排成一本高级杂志的「创刊号」：
  刊头导航（站点标识 + 编号锚点 + 风格画廊入口）→ 封面
  （巨大衬线刊名 + 本期目录条）→ 01 关于/技能/履历 →
  02 精选项目（图文对开）→ 03 最新文章（索引目录）→
  04 联系（社交图版）→ 版权栏（colophon）。
  数据全部来自共享层 composables（useAsyncData 承载，SSG
  预渲染即含真实内容）；文案全部来自 i18n；异步数据有加载
  骨架与空状态两条防御分支。
-->
<template>
  <div class="sheet">
    <EditorialMasthead />

    <main class="sheet-body">
      <EditorialCover />

      <div class="flow">
        <EditorialProfile />

        <!-- 加载骨架：数据未就绪时以「补白页」占位 -->
        <div v-if="loading" class="loading" role="status">
          <p class="sr-only">{{ t('common.loading') }}</p>
          <EditorialSectionHead :no="'02'" :title="t('home.featuredProjects')" />
          <div v-for="i in 3" :key="i" class="loading-row"/>
        </div>

        <template v-else>
          <EditorialProjects :projects="featuredProjects" />
          <EditorialPosts :posts="latestPosts" />
        </template>

        <EditorialContact />
      </div>
    </main>

    <EditorialColophon />
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import EditorialMasthead from '../components/EditorialMasthead.vue'
import EditorialCover from '../components/EditorialCover.vue'
import EditorialProfile from '../components/EditorialProfile.vue'
import EditorialProjects from '../components/EditorialProjects.vue'
import EditorialPosts from '../components/EditorialPosts.vue'
import EditorialContact from '../components/EditorialContact.vue'
import EditorialColophon from '../components/EditorialColophon.vue'
import EditorialSectionHead from '../components/EditorialSectionHead.vue'

/** 首页展示的最新文章条数 */
const LATEST_POSTS_COUNT = 5
/** 精选项目数量 */
const FEATURED_PROJECTS_COUNT = 3

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()
const { getFeaturedProjects } = useProjects()

// 文章列表（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('editorial-posts', async () => {
  const list = await getAllPosts()
  return Array.isArray(list) ? list : []
})

// 精选项目
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('editorial-projects', async () => {
  const list = await getFeaturedProjects(FEATURED_PROJECTS_COUNT)
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshPosts()
  refreshProjects()
})

// —— 数据防御与视图推导（同步计算，SSR 安全） ——
const latestPosts = computed<BlogPost[]>(() =>
  (Array.isArray(postsData.value) ? postsData.value : []).slice(0, LATEST_POSTS_COUNT),
)

const featuredProjects = computed<Project[]>(() =>
  Array.isArray(projectsData.value) ? projectsData.value : [],
)

/** 加载态：仅在尚无任何数据时显示骨架 */
const loading = computed(
  () => (postsPending.value && !postsData.value) || (projectsPending.value && !projectsData.value),
)
</script>

<style scoped>
/* —— 纸面：整页米白纸底 + 油墨正文（风格底色） —— */
.sheet {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

.sheet-body {
  flex: 1 0 auto;
}

/* —— 对开页幅面：区块间的版式节奏（大间距而非卡片堆叠） —— */
.flow {
  display: grid;
  gap: clamp(56px, 9vw, 108px);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: clamp(40px, 7vw, 84px) var(--space) calc(var(--space) * 2);
}

/* —— 加载骨架：hairline 补白行 + 呼吸动画 —— */
.loading {
  min-width: 0;
}

.loading-row {
  height: 64px;
  margin-top: var(--gap);
  border-top: var(--border-w) solid var(--c-border);
  border-bottom: var(--border-w) solid var(--c-border);
  animation: loading-breathe 1.4s ease-in-out infinite;
}

@keyframes loading-breathe {
  0%,
  100% {
    opacity: 0.4;
  }

  50% {
    opacity: 1;
  }
}

/* 视觉隐藏（读屏可用） */
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
  .loading-row {
    animation: none;
    opacity: 0.6;
  }
}
</style>
