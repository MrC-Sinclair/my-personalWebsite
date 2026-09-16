<!--
  MinimalismIndex - minimalism 风格首页（/style/minimalism/）
  ------------------------------------------------------------
  「内容优先」的竖排长页：吸顶极简导航 → 留白撑满的首屏
  （大而轻的排版 + 唯一的几何装饰）→ 一条 960px 窄测量主轴，
  以「定义式分栏」（左列区块头 / 右列内容）依次展开关于与
  技能、精选项目、最新文章、联系方式 → hairline 页脚。
  区块间以大留白与 hairline 分隔，无卡片堆叠、无重装饰。
  数据全部来自共享层 composables（useAsyncData 承载，SSG
  预渲染即含真实内容）；文案全部走 i18n；异步数据有加载
  骨架与空状态两条防御分支；滚动进入动画复用共享层
  useScrollReveal。
-->
<template>
  <div class="page">
    <MinimalismHeader />

    <main class="main">
      <MinimalismHero />

      <div class="flow">
        <!-- 关于 / 技能（同步数据，无需等待异步取数） -->
        <MinimalismAbout class="scroll-reveal" />

        <!-- 异步数据加载骨架（防御分支：正常情况下 await 后数据已就绪） -->
        <div v-if="loading" class="skeleton" role="status">
          <p class="sr-only">{{ t('common.loading') }}</p>
          <div v-for="i in 3" :key="i" class="skeleton-row"/>
        </div>

        <template v-else>
          <MinimalismProjects :projects="featuredProjects" class="scroll-reveal" />
          <MinimalismPosts :posts="latestPosts" class="scroll-reveal" />
        </template>

        <MinimalismContact class="scroll-reveal" />
      </div>
    </main>

    <MinimalismFooter />
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import MinimalismHeader from '../components/MinimalismHeader.vue'
import MinimalismHero from '../components/MinimalismHero.vue'
import MinimalismAbout from '../components/MinimalismAbout.vue'
import MinimalismProjects from '../components/MinimalismProjects.vue'
import MinimalismPosts from '../components/MinimalismPosts.vue'
import MinimalismContact from '../components/MinimalismContact.vue'
import MinimalismFooter from '../components/MinimalismFooter.vue'

/** 首页展示的最新文章条数 */
const LATEST_POSTS_COUNT = 6
/** 精选项目数量 */
const FEATURED_PROJECTS_COUNT = 3

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()
const { getFeaturedProjects } = useProjects()

// 滚动进入动画（共享层：IntersectionObserver + MutationObserver，自动清理）
useScrollReveal()

// 文章列表（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('minimalism-posts', async () => {
  const list = await getAllPosts()
  return Array.isArray(list) ? list : []
})

// 精选项目
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('minimalism-projects', async () => {
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
/* —— 纸面：整页近白底 + 墨灰正文（风格底色） —— */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

.main {
  flex: 1 0 auto;
}

/* —— 主轴：窄测量单列，区块之间是大留白（留白即设计） —— */
.flow {
  display: grid;
  gap: clamp(72px, 12vw, 144px);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: clamp(56px, 9vw, 112px) var(--space) clamp(88px, 12vw, 152px);
}

/* —— 加载骨架：白色浮起行 + 呼吸动画 —— */
.skeleton {
  display: grid;
  gap: var(--gap);
}

.skeleton-row {
  height: 76px;
  background: var(--c-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  animation: skeleton-breathe 1.4s ease-in-out infinite;
}

@keyframes skeleton-breathe {
  0%,
  100% {
    opacity: 0.55;
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
  .skeleton-row {
    animation: none;
    opacity: 0.7;
  }
}
</style>
