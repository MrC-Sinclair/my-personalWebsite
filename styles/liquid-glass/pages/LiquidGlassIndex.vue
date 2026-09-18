<!--
  LiquidGlassIndex - liquid-glass 风格首页（/style/liquid-glass/）
  ------------------------------------------------------------
  「悬浮玻璃展台」排版轴：深空场景上漂浮的一层层玻璃——
  自带玻璃胶囊导航（页内锚点 + 画廊入口）→ 撑满首屏的巨型
  玻璃英雄板 → 关于/技能玻璃主板（内嵌托盘 + 经历玻璃轨）
  → 精选项目「松散玻璃片」（悬浮标题 + 12 列交错悬浮卡）
  → 最新文章「横躺玻璃长条」列表 → 联系玻璃展台 → 玻璃页脚。

  数据全部来自共享层 composables（useAsyncData 承载，SSG
  预渲染即含真实内容）；加载态用玻璃骨架条，空态用玻璃
  空态组件，数组字段一律 Array.isArray 防御。
  reveal 动画走共享层 useScrollReveal，且只加在「非玻璃」
  内容元素上（玻璃根元素做 opacity 过渡会导致 backdrop-filter
  采样在过渡期间失效而闪烁）。
-->
<template>
  <div class="page">
    <LiquidGlassBackground/>
    <LiquidGlassNav/>

    <main class="main">
      <!-- ① 英雄区：巨型玻璃主板 -->
      <LiquidGlassHero/>

      <div class="flow">
        <!-- ② 关于 / 技能：玻璃主板（左文案+经历轨，右技能架） -->
        <LiquidGlassPanel
          id="about"
          data-section="about"
          :eyebrow="t('nav.about')"
          :title="t('about.title')"
        >
          <!-- 关于内容抽成区块组件：「关于」子页复用同一块（见 LiquidGlassAboutBlock） -->
          <LiquidGlassAboutBlock/>
        </LiquidGlassPanel>

        <!-- ③ 精选项目：松散玻璃片（悬浮标题 + 交错悬浮卡） -->
        <div id="projects" data-section="projects" class="loose">
          <LiquidGlassSectionHead
            class="scroll-reveal scroll-reveal-up"
            :eyebrow="t('nav.projects')"
            :title="t('home.featuredProjects')"
            :meta="String(featuredProjects.length)"
          />

          <!-- 加载骨架：玻璃条微光脉冲 -->
          <div v-if="loading" class="skeletons" role="status">
            <p class="sr-only">{{ t('common.loading') }}</p>
            <div v-for="i in 3" :key="i" class="skeleton"/>
          </div>

          <LiquidGlassEmpty
            v-else-if="!featuredProjects.length"
            :message="t('projects.noResults')"
          />

          <div v-else class="project-grid">
            <LiquidGlassProjectCard
              v-for="project in featuredProjects"
              :key="project.path"
              :project="project"
              class="project-cell"
            />
          </div>
        </div>

        <!-- ④ 最新文章：横躺玻璃长条 -->
        <div id="posts" data-section="posts" class="loose">
          <LiquidGlassSectionHead
            class="scroll-reveal scroll-reveal-up"
            :eyebrow="t('nav.blog')"
            :title="t('home.latestPosts')"
            :meta="String(latestPosts.length)"
          />

          <div v-if="loading" class="skeletons" role="status">
            <p class="sr-only">{{ t('common.loading') }}</p>
            <div v-for="i in 3" :key="i" class="skeleton skeleton-bar"/>
          </div>

          <LiquidGlassEmpty
            v-else-if="!latestPosts.length"
            :message="t('blog.noResults')"
            :hint="t('blog.noResultsHint')"
          />

          <div v-else class="post-list">
            <LiquidGlassPostCard
              v-for="post in latestPosts"
              :key="post.path"
              :post="post"
            />
          </div>
        </div>

        <!-- ⑤ 联系方式：玻璃展台（不复用过渡层 ContactForm） -->
        <LiquidGlassPanel
          id="contact"
          data-section="contact"
          :eyebrow="t('nav.contact')"
          :title="t('contact.socialLinks')"
        >
          <div class="contact-body scroll-reveal scroll-reveal-up">
            <p class="contact-desc">{{ t('contact.description') }}</p>
            <LiquidGlassContactGrid :socials="socialLinks"/>
          </div>
        </LiquidGlassPanel>
      </div>
    </main>

    <LiquidGlassFooter/>
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import LiquidGlassBackground from '../components/LiquidGlassBackground.vue'
import LiquidGlassNav from '../components/LiquidGlassNav.vue'
import LiquidGlassHero from '../components/LiquidGlassHero.vue'
import LiquidGlassPanel from '../components/LiquidGlassPanel.vue'
import LiquidGlassSectionHead from '../components/LiquidGlassSectionHead.vue'
import LiquidGlassAboutBlock from '../components/LiquidGlassAboutBlock.vue'
import LiquidGlassProjectCard from '../components/LiquidGlassProjectCard.vue'
import LiquidGlassPostCard from '../components/LiquidGlassPostCard.vue'
import LiquidGlassEmpty from '../components/LiquidGlassEmpty.vue'
import LiquidGlassContactGrid from '../components/LiquidGlassContactGrid.vue'
import LiquidGlassFooter from '../components/LiquidGlassFooter.vue'

/** 首页展示的最新文章条数 */
const POST_COUNT = 5
/** 首页展示的精选项目数上限 */
const PROJECT_COUNT = 4

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()
const { getFeaturedProjects } = useProjects()
// 技能分组与经历时间线已随「关于」区块下沉到 LiquidGlassAboutBlock
const { socialLinks } = useAppInfo()

// 最新文章（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('liquid-glass-posts', async () => {
  const list = await getAllPosts()
  return Array.isArray(list) ? list : []
})

// 精选项目
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('liquid-glass-projects', async () => {
  const featured = await getFeaturedProjects(PROJECT_COUNT)
  return Array.isArray(featured) ? featured : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshPosts()
  refreshProjects()
})

// —— 数据防御与视图推导（同步计算，SSR 安全） ——
const latestPosts = computed<BlogPost[]>(() =>
  Array.isArray(postsData.value) ? postsData.value.slice(0, POST_COUNT) : [],
)
const featuredProjects = computed<Project[]>(() =>
  Array.isArray(projectsData.value) ? projectsData.value : [],
)

/** 加载态：仅在尚无任何数据时显示玻璃骨架 */
const loading = computed(
  () => (postsPending.value && !postsData.value) || (projectsPending.value && !projectsData.value),
)

// 滚动进入视口动画（共享层行为，SSG 友好）
useScrollReveal()
</script>

<style scoped>
/* —— 页面骨架：深空场景 + 悬浮玻璃流 —— */
.page {
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

.main {
  min-width: 0;
}

/* 内容流：单列舞台，区块间大量呼吸（漂浮感） */
.flow {
  display: grid;
  gap: clamp(48px, 8vw, 96px);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: clamp(28px, 5vw, 56px) var(--gap) clamp(56px, 8vw, 96px);
}

/* —— 松散玻璃片区（项目 / 文章）：文字悬空、玻璃承载 —— */
.loose {
  min-width: 0;
}

/* 项目网格：12 列交错悬浮（7 / 5 错落，偶数卡下沉） */
.project-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--gap);
}

.project-cell {
  min-width: 0;
  grid-column: span 12;
}

@media (min-width: 760px) {
  .project-cell:nth-child(odd) {
    grid-column: span 7;
  }

  .project-cell:nth-child(even) {
    grid-column: span 5;
    margin-top: 44px;
  }
}

/* 文章长条列表 */
.post-list {
  display: grid;
  gap: var(--gap);
}

/* —— 联系展台 —— */
.contact-desc {
  margin: 0 0 18px;
  color: var(--c-muted);
}

/* —— 加载骨架：玻璃条微光脉冲 —— */
.skeletons {
  display: grid;
  gap: var(--gap);
}

.skeleton {
  height: 180px;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.03));
  border: var(--border-w) solid rgb(255 255 255 / 0.14);
  border-radius: var(--radius);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.2);
  animation: skeleton-shimmer 1.6s ease-in-out infinite;
}

.skeleton-bar {
  height: 96px;
  border-radius: var(--radius-sm);
}

@keyframes skeleton-shimmer {
  0%,
  100% {
    opacity: 0.45;
  }

  50% {
    opacity: 0.9;
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
  .skeleton {
    animation: none;
    opacity: 0.6;
  }
}
</style>
