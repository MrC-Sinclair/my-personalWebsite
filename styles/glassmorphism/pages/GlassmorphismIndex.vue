<!-- cspell:ignore gpage -->
<!--
  GlassmorphismIndex - glassmorphism 风格首页（/style/glassmorphism/）
  ------------------------------------------------------------
  「磨砂玻璃叠在彩色渐变上」的完整首页。布局轴：垂直玻璃
  板错落堆叠流——英雄区开放排版直接暴露在 mesh 渐变上，
  其后各区块是一块块错位（左右交替）的磨砂玻璃板，桌面端
  板宽收窄 92% 左右交替，形成之字形节奏；窄屏回退为单列
  （回退的是布局，玻璃材质与 Glow 签名保留）。
  数据全部来自共享层 composables（useAsyncData 承载，SSG
  预渲染即含真实内容）；滚动入场动画走共享层 useScrollReveal。
-->
<template>
  <div id="top" class="gpage">
    <GlassmorphismBackdrop/>
    <GlassmorphismNav :sections="navSections"/>

    <main class="flow">
      <!-- ① 英雄区（开放排版 + 漂浮统计片） -->
      <GlassmorphismHero class="sheet" :chips="heroChips"/>

      <!-- 全局加载骨架（防御分支：正常 await 后数据已就绪） -->
      <GlassmorphismGlassPanel v-if="loading" class="sheet">
        <GlassmorphismPlaceholder variant="loading" :message="t('common.loading')"/>
      </GlassmorphismGlassPanel>

      <template v-else>
        <!-- ② 关于 + 技能 + 经历（左文右历，之字左侧） -->
        <section id="about" data-section="about" class="sheet sheet--a scroll-reveal scroll-reveal-up">
          <GlassmorphismGlassPanel>
            <GlassmorphismSectionHead :eyebrow="t('nav.about')" :title="t('about.title')"/>
            <GlassmorphismAboutBlock/>
          </GlassmorphismGlassPanel>
        </section>

        <!-- ③ 精选项目（之字右侧） -->
        <section
          id="projects"
          data-section="projects"
          class="sheet sheet--b scroll-reveal scroll-reveal-up"
        >
          <GlassmorphismGlassPanel>
            <GlassmorphismSectionHead :eyebrow="t('nav.projects')" :title="t('home.featuredProjects')"/>
            <div v-if="featuredProjects.length" class="project-grid">
              <GlassmorphismProjectCard
                v-for="project in featuredProjects"
                :key="project.path"
                :project="project"
              />
            </div>
            <GlassmorphismPlaceholder
              v-else
              variant="empty"
              :message="t('projects.noResults')"
              :hint="t('blog.noResultsHint')"
            />
          </GlassmorphismGlassPanel>
        </section>

        <!-- ④ 最新文章（之字左侧） -->
        <section
          id="posts"
          data-section="posts"
          class="sheet sheet--a scroll-reveal scroll-reveal-up"
        >
          <GlassmorphismGlassPanel>
            <GlassmorphismSectionHead :eyebrow="t('nav.blog')" :title="t('home.latestPosts')"/>
            <div v-if="latestPosts.length" class="post-list">
              <GlassmorphismPostRow
                v-for="post in latestPosts"
                :key="post.path"
                :post="post"
              />
            </div>
            <GlassmorphismPlaceholder
              v-else
              variant="empty"
              :message="t('blog.noResults')"
              :hint="t('blog.noResultsHint')"
            />
            <div class="view-all-wrap">
              <NuxtLink class="view-all" :to="localePath('/style/glassmorphism/blog')">
                {{ t('home.viewAll') }}<span class="all-arrow" aria-hidden="true">→</span>
              </NuxtLink>
            </div>
          </GlassmorphismGlassPanel>
        </section>

        <!-- ⑤ 联系方式（之字右侧） -->
        <section
          id="contact"
          data-section="contact"
          class="sheet sheet--b scroll-reveal scroll-reveal-up"
        >
          <GlassmorphismGlassPanel>
            <GlassmorphismSectionHead :eyebrow="t('nav.contact')" :title="t('contact.title')"/>
            <GlassmorphismContactBoard :socials="socialLinks"/>
          </GlassmorphismGlassPanel>
        </section>
      </template>
    </main>

    <GlassmorphismFooter/>
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import GlassmorphismBackdrop from '../components/GlassmorphismBackdrop.vue'
import GlassmorphismNav from '../components/GlassmorphismNav.vue'
import GlassmorphismHero from '../components/GlassmorphismHero.vue'
import GlassmorphismGlassPanel from '../components/GlassmorphismGlassPanel.vue'
import GlassmorphismSectionHead from '../components/GlassmorphismSectionHead.vue'
import GlassmorphismAboutBlock from '../components/GlassmorphismAboutBlock.vue'
import GlassmorphismProjectCard from '../components/GlassmorphismProjectCard.vue'
import GlassmorphismPostRow from '../components/GlassmorphismPostRow.vue'
import GlassmorphismContactBoard from '../components/GlassmorphismContactBoard.vue'
import GlassmorphismPlaceholder from '../components/GlassmorphismPlaceholder.vue'
import GlassmorphismFooter from '../components/GlassmorphismFooter.vue'

/** 首页展示的最新文章条数 */
const LATEST_POST_COUNT = 4
/** 首页展示的精选项目条数 */
const FEATURED_PROJECT_COUNT = 4

const { t, locale } = useI18n()
const localePath = useLocalePath()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()
const { getAllProjects, getFeaturedProjects } = useProjects()
// （skillGroups / timeline 已随 GlassmorphismAboutBlock 抽出，
//   本页只剩 heroChips 用到 skillGroups）
const { socialLinks, skillGroups } = useAppInfo()

// 滚动入场动画（共享层 composable，内部自带 mount/unmount 成对清理）
useScrollReveal()

// 文章与项目一次取齐（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: board,
  pending: boardPending,
  refresh: refreshBoard,
} = await useAsyncData<{ allPosts: BlogPost[]; allProjects: Project[]; featured: Project[] }>(
  'glassmorphism-index',
  async () => {
    const [allPosts, allProjects, featured] = await Promise.all([
      getAllPosts(),
      getAllProjects(),
      getFeaturedProjects(FEATURED_PROJECT_COUNT),
    ])
    return {
      allPosts: Array.isArray(allPosts) ? allPosts : [],
      allProjects: Array.isArray(allProjects) ? allProjects : [],
      featured: Array.isArray(featured) ? featured : [],
    }
  },
)

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshBoard()
})

// —— 数据防御与视图推导（同步计算，SSR 安全） ——
const allPosts = computed<BlogPost[]>(() =>
  Array.isArray(board.value?.allPosts) ? board.value!.allPosts : [],
)
const allProjects = computed<Project[]>(() =>
  Array.isArray(board.value?.allProjects) ? board.value!.allProjects : [],
)
const featuredProjects = computed<Project[]>(() =>
  Array.isArray(board.value?.featured) ? board.value!.featured : [],
)

/** 最新文章：列表查询已按日期倒序，取前 N 条 */
const latestPosts = computed<BlogPost[]>(() => allPosts.value.slice(0, LATEST_POST_COUNT))

/** 加载态：仅在尚无任何数据时显示骨架 */
const loading = computed(() => boardPending.value && !board.value)

/** 首屏统计片：真实数据计数（文章 / 项目 / 技能） */
const heroChips = computed(() => [
  { label: t('nav.blog'), value: allPosts.value.length },
  { label: t('nav.projects'), value: allProjects.value.length },
  {
    label: t('about.skills'),
    value: skillGroups.value.reduce(
      (sum, group) => sum + (Array.isArray(group.skills) ? group.skills.length : 0),
      0,
    ),
  },
])

/** 导航锚点清单（label 随语言更新） */
const navSections = computed(() => [
  { id: 'about', label: t('nav.about') },
  { id: 'projects', label: t('nav.projects') },
  { id: 'posts', label: t('nav.blog') },
  { id: 'contact', label: t('nav.contact') },
])
</script>

<style scoped>
/* —— 页面骨架：渐变背景之上是玻璃内容流 —— */
.gpage {
  position: relative;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
}

/* 内容层抬到渐变背景之上 */
.flow {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 0 clamp(16px, 4vw, 40px) calc(var(--space) * 2);
}

/* 玻璃板流：垂直堆叠 + 之字错位（签名节奏） */
.sheet {
  min-width: 0;
  margin-bottom: calc(var(--space) * 1.6);
}

@media (min-width: 900px) {
  .flow {
    align-items: stretch;
  }

  /* 之字形：奇偶板左右交替、收窄宽度，露出背后渐变 */
  .sheet--a {
    width: 92%;
    align-self: flex-start;
  }

  .sheet--b {
    width: 92%;
    align-self: flex-end;
  }
}

/* —— 项目网格 —— */
.project-grid {
  display: grid;
  gap: var(--gap);
}

@media (min-width: 640px) {
  .project-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* —— 文章列表 + 查看全部 —— */
.post-list {
  display: grid;
  gap: 12px;
}

.view-all-wrap {
  display: flex;
  justify-content: center;
  margin-top: var(--space);
}

.view-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 26px;
  font-size: var(--fs-base);
  font-weight: 700;
  text-decoration: none;
  color: var(--c-accent);
  background: rgb(255 255 255 / 0.5);
  border: var(--border-w) solid rgb(255 255 255 / 0.7);
  border-radius: 999px;
  box-shadow: var(--shadow);
  transition:
    transform var(--transition),
    background var(--transition),
    box-shadow var(--transition);
}

.view-all:hover {
  transform: translateY(-3px);
  background: rgb(255 255 255 / 0.75);
  box-shadow: 0 12px 28px rgb(31 38 135 / 0.2), 0 0 24px rgb(139 92 246 / 0.2);
}

.view-all:active {
  transform: var(--press-transform);
}

.all-arrow {
  font-family: var(--font-mono);
}

/* —— 锚点定位补偿：固定胶囊导航高度 + 顶部间距 —— */
.sheet[data-section] {
  scroll-margin-top: 96px;
}

@media (prefers-reduced-motion: reduce) {
  .view-all {
    transition: none;
  }

  .view-all:hover,
  .view-all:active {
    transform: none;
  }
}
</style>
