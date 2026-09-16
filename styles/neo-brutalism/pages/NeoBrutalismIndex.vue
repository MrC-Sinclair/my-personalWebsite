<!--
  NeoBrutalismIndex - neo-brutalism 风格首页（/style/neo-brutalism/）
  ------------------------------------------------------------
  把个人网站排成一张贴满海报的设计工作台（12 栏拼贴轴）：
  吸顶黑条导航 → 撑满一屏的巨型标题英雄区（海报黄硬影）→
  歪斜滚动胶带 → 黄块「关于我」与黑块「技能栈」并排对撞 →
  错落下沉的经历时间线 → 大编号榜单式精选项目（黄/粉/蓝
  循环撞色）→ 号外报纸式最新文章（hover 整行反白）→
  全宽黑幕联系看板（海报黄硬影卡片）→ 描边大字页脚。
  数据全部来自共享层 composables（useAsyncData 承载，SSG
  预渲染即含真实内容）；入场「盖戳」动画走共享层
  useScrollReveal，reduced-motion 下立即完整呈现。
-->
<template>
  <div class="nb-page">
    <NeoBrutalismTopBar />

    <main class="shell">
      <!-- ① 英雄区：撑满一屏的海报 -->
      <NeoBrutalismHero id="hero" class="span-full" />

      <!-- ② 滚动胶带（纯装饰） -->
      <NeoBrutalismMarquee class="span-full tape-row" />

      <!-- ③ 黄块「关于我」 × 黑块「技能栈」并排对撞 -->
      <NeoBrutalismAboutBlock id="about" data-section="about" class="span-7 scroll-reveal" />
      <NeoBrutalismSkillsBlock
        id="skills"
        data-section="skills"
        class="span-5 sink scroll-reveal"
        :groups="skillGroups"
      />

      <!-- ④ 错落经历时间线 -->
      <NeoBrutalismTimeline
        id="experience"
        data-section="experience"
        class="span-full scroll-reveal"
        :items="timeline"
      />

      <!-- ⑤ 精选项目：大编号榜单 -->
      <section id="works" data-section="works" class="band span-full scroll-reveal">
        <header class="band-head">
          <NeoBrutalismSectionTitle :text="t('home.featuredProjects')" tone="ink" />
          <NuxtLink class="view-all" :to="localePath('/projects')">
            {{ t('home.viewAll') }}<span class="view-arrow" aria-hidden="true">→</span>
          </NuxtLink>
        </header>

        <!-- 加载骨架（防御分支：正常情况下 await 后数据已就绪） -->
        <div v-if="loading" class="skeleton-zone" role="status">
          <p class="sr-only">{{ t('common.loading') }}</p>
          <div v-for="i in 3" :key="i" class="skeleton"/>
        </div>

        <ol v-else-if="featuredProjects.length" class="work-list">
          <li v-for="(project, i) in featuredProjects" :key="project.path" class="work-item">
            <NeoBrutalismWorkCard :project="project" :index="i" />
          </li>
        </ol>

        <NeoBrutalismEmpty v-else :message="t('projects.noResults')" />
      </section>

      <!-- ⑥ 最新文章：号外报纸行 -->
      <section id="posts" data-section="posts" class="band span-full scroll-reveal">
        <header class="band-head">
          <NeoBrutalismSectionTitle :text="t('home.latestPosts')" tone="ink" />
          <NuxtLink class="view-all" :to="localePath('/blog')">
            {{ t('home.viewAll') }}<span class="view-arrow" aria-hidden="true">→</span>
          </NuxtLink>
        </header>

        <div v-if="loading" class="skeleton-zone" role="status">
          <p class="sr-only">{{ t('common.loading') }}</p>
          <div v-for="i in 4" :key="i" class="skeleton"/>
        </div>

        <ol v-else-if="latestPosts.length" class="post-list">
          <li v-for="post in latestPosts" :key="post.path">
            <NeoBrutalismPostRow :post="post" />
          </li>
        </ol>

        <NeoBrutalismEmpty
          v-else
          :message="t('blog.noResults')"
          :hint="t('blog.noResultsHint')"
        />
      </section>
    </main>

    <!-- ⑦ 全宽黑幕联系看板 -->
    <NeoBrutalismContactBoard
      id="contact"
      data-section="contact"
      class="contact-band scroll-reveal"
      :socials="socialLinks"
    />

    <!-- ⑧ 页脚 -->
    <NeoBrutalismSiteFooter />
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import NeoBrutalismTopBar from '../components/NeoBrutalismTopBar.vue'
import NeoBrutalismHero from '../components/NeoBrutalismHero.vue'
import NeoBrutalismMarquee from '../components/NeoBrutalismMarquee.vue'
import NeoBrutalismAboutBlock from '../components/NeoBrutalismAboutBlock.vue'
import NeoBrutalismSkillsBlock from '../components/NeoBrutalismSkillsBlock.vue'
import NeoBrutalismTimeline from '../components/NeoBrutalismTimeline.vue'
import NeoBrutalismWorkCard from '../components/NeoBrutalismWorkCard.vue'
import NeoBrutalismPostRow from '../components/NeoBrutalismPostRow.vue'
import NeoBrutalismContactBoard from '../components/NeoBrutalismContactBoard.vue'
import NeoBrutalismSiteFooter from '../components/NeoBrutalismSiteFooter.vue'
import NeoBrutalismSectionTitle from '../components/NeoBrutalismSectionTitle.vue'
import NeoBrutalismEmpty from '../components/NeoBrutalismEmpty.vue'

/** 首页展示的最新文章条数 */
const LATEST_POST_COUNT = 5

const { t, locale } = useI18n()
const localePath = useLocalePath()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()
const { getFeaturedProjects } = useProjects()
const { socialLinks, skillGroups, timeline } = useAppInfo()

// 文章列表（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('neo-brutalism-posts', async () => {
  const list = await getAllPosts()
  return Array.isArray(list) ? list : []
})

// 精选项目列表
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('neo-brutalism-projects', async () => {
  const list = await getFeaturedProjects()
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshPosts()
  refreshProjects()
})

// —— 数据防御与视图推导（同步计算，SSR 安全） ——
const latestPosts = computed<BlogPost[]>(() =>
  (Array.isArray(postsData.value) ? postsData.value : []).slice(0, LATEST_POST_COUNT),
)

const featuredProjects = computed<Project[]>(() =>
  Array.isArray(projectsData.value) ? projectsData.value : [],
)

/** 加载态：仅在尚无任何数据时显示骨架 */
const loading = computed(
  () => (postsPending.value && !postsData.value) || (projectsPending.value && !projectsData.value),
)

// 入场动画：滚动进入视口时「盖戳」显现（共享层行为，reduced-motion 立即可见）
useScrollReveal()
</script>

<style scoped>
/* —— 页面骨架：纸面底 + 12 栏海报拼贴 —— */
.nb-page {
  min-height: 100vh;
  overflow-x: clip;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

.shell {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 36px 20px;
  align-items: start;
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 0 var(--space) 88px;
}

/* —— 栏位占位（海报式错落） —— */
.span-full {
  grid-column: 1 / -1;
}

.span-7 {
  grid-column: 1 / 7;
}

.span-5 {
  grid-column: 7 / -1;
}

/* 黑块技能栈下沉，与黄块形成对撞落差 */
.sink {
  margin-top: 48px;
}

/* 胶带两侧留出歪斜余量 */
.tape-row {
  margin-top: 4px;
}

/* —— 区块带（项目 / 文章） —— */
.band {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 32px;
  border-top: calc(var(--border-w) * 2) solid var(--c-border);
}

.band-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* 「查看全部」：粗描边按钮，hover 反白 */
.view-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 16px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  box-shadow: var(--shadow);
  transition:
    color var(--transition),
    background var(--transition),
    transform var(--transition),
    box-shadow var(--transition);
}

.view-all:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
}

.view-all:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

.view-all:focus-visible {
  outline: var(--border-w) solid var(--c-accent-2);
  outline-offset: 3px;
}

.view-arrow {
  font-family: var(--font-mono);
}

/* —— 项目榜单：12 栏内错落下沉 —— */
.work-list {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 22px 20px;
  align-items: start;
  margin: 0;
  padding: 0;
  list-style: none;
}

.work-item:nth-child(1) {
  grid-column: 1 / 8;
}

.work-item:nth-child(2) {
  grid-column: 8 / -1;
  margin-top: 44px;
}

.work-item:nth-child(3) {
  grid-column: 3 / 11;
}

.work-item:nth-child(n + 4) {
  grid-column: 1 / -1;
}

/* —— 文章号外列表 —— */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* —— 加载骨架：斜纹待盖章块 —— */
.skeleton-zone {
  display: grid;
  gap: var(--gap);
}

.skeleton {
  height: 96px;
  border: var(--border-w) solid var(--c-border);
  background: var(--deco);
  box-shadow: var(--shadow);
  animation: nb-skeleton-pulse 1.2s ease-in-out infinite;
}

@keyframes nb-skeleton-pulse {
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

/* —— 入场「盖戳」：覆盖全局 scroll-reveal 的缓慢淡入，
      硬快节奏才符合粗野主义（进入视口前仅微移不闪烁） —— */
.nb-page .scroll-reveal {
  transition:
    opacity 90ms steps(2, end),
    transform 170ms cubic-bezier(0.2, 0.8, 0.3, 1);
}

/* —— 锚点定位补偿：吸顶黑条高度内（联系看板在 shell 之外，单独声明） —— */
.shell [id],
.contact-band {
  scroll-margin-top: 6rem;
}

/* —— 窄屏：回退布局，粗边框 / 撞色 / 硬影全部保留 —— */
@media (max-width: 860px) {
  .shell {
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding: 0 16px 56px;
  }

  .sink {
    margin-top: 0;
  }

  .work-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .work-item:nth-child(2) {
    margin-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  /* 进入视口前不得隐藏内容：立即完整呈现 */
  .nb-page .scroll-reveal {
    opacity: 1 !important;
    transform: none !important;
    transition: none;
  }

  .skeleton {
    animation: none;
  }

  .view-all {
    transition: none;
  }

  .view-all:active {
    transform: none;
  }
}
</style>
