<!--
  SwissIndex - swiss 风格首页（/style/swiss/）
  ------------------------------------------------------------
  整页以「12 栏网格 + 细则线 + 超大标题」建立秩序：
  顶部网格条目式导航（SwissMasthead）→ 海报式英雄区
  （SwissHero，首屏撑满一屏）→ 四个编号区块（01 关于/技能/
  经历、02 精选项目、03 最新文章、04 联系方式，区块头统一
  用 SwissSectionHead）→ 黑底反白页脚（SwissFooter）。
  背景以极淡的 12 栏网格线（tokens 的 --deco）提示版面骨架。

  数据全部来自共享层 composables（useAsyncData 承载，SSG
  预渲染即含真实内容）；页内跳转用原生锚点；文案全部走 i18n。
-->
<template>
  <div class="page">
    <SwissMasthead />

    <main id="top" class="main">
      <div class="container">
        <!-- 极淡的 12 栏背景网格线：版面骨架的可见提示 -->
        <div class="grid-lines" aria-hidden="true"/>

        <SwissHero />

        <!-- 加载骨架（防御分支：正常情况下 await 后数据已就绪） -->
        <div v-if="loading" class="skeleton-zone" role="status" aria-live="polite">
          <p class="sr-only">{{ t('common.loading') }}</p>
          <div v-for="i in 3" :key="i" class="skeleton-row"/>
        </div>

        <template v-else>
          <!-- 01 关于：技能 + 经历（条目式细则线） -->
          <section
            id="about"
            data-section="about"
            class="section scroll-reveal scroll-reveal-up"
            aria-labelledby="about-head"
          >
            <SwissSectionHead
              :no="1"
              head-id="about-head"
              :title="t('about.title')"
              :meta="t('about.description')"
            />
            <div class="section-body">
              <p class="sub-label">
                <span class="sub-mark" aria-hidden="true"/>
                {{ t('about.skills') }}
              </p>
              <SwissSkillTable v-if="skillList.length" :groups="skillList" />
              <p v-else class="empty">{{ t('projects.noResults') }}</p>

              <p class="sub-label sub-label--gap">
                <span class="sub-mark" aria-hidden="true"/>
                {{ t('about.experience') }}
              </p>
              <SwissTimeline v-if="timelineList.length" :items="timelineList" />
              <p v-else class="empty">{{ t('projects.noResults') }}</p>
            </div>
          </section>

          <!-- 02 精选项目：编号 + 非对称网格 -->
          <section
            id="projects"
            data-section="projects"
            class="section scroll-reveal scroll-reveal-up"
            aria-labelledby="projects-head"
          >
            <SwissSectionHead
              :no="2"
              head-id="projects-head"
              :title="t('home.featuredProjects')"
              :meta="t('projects.description')"
            />
            <div class="section-body">
              <SwissProjectList v-if="featuredProjects.length" :projects="featuredProjects" />
              <p v-else class="empty">{{ t('projects.noResults') }}</p>
            </div>
          </section>

          <!-- 03 最新文章：编号行 + 细则线 -->
          <section
            id="posts"
            data-section="posts"
            class="section scroll-reveal scroll-reveal-up"
            aria-labelledby="posts-head"
          >
            <SwissSectionHead
              :no="3"
              head-id="posts-head"
              :title="t('home.latestPosts')"
              :meta="t('blog.description')"
            />
            <div class="section-body">
              <template v-if="latestPosts.length">
                <SwissPostList :posts="latestPosts" />
                <NuxtLink class="view-all" :to="localePath('/style/swiss/blog')">
                  {{ t('home.viewAll') }}
                  <span class="view-all-arrow" aria-hidden="true">↗</span>
                </NuxtLink>
              </template>
              <div v-else class="empty">
                <p class="empty-main">{{ t('blog.noResults') }}</p>
                <p class="empty-hint">{{ t('blog.noResultsHint') }}</p>
              </div>
            </div>
          </section>

          <!-- 04 联系方式：社交信息条目（不复用过渡层 ContactForm） -->
          <section
            id="contact"
            data-section="contact"
            class="section scroll-reveal scroll-reveal-up"
            aria-labelledby="contact-head"
          >
            <SwissSectionHead
              :no="4"
              head-id="contact-head"
              :title="t('contact.title')"
              :meta="t('contact.socialLinks')"
            />
            <div class="section-body">
              <SwissContact v-if="socialList.length" :socials="socialList" />
              <p v-else class="empty">{{ t('contact.description') }}</p>
            </div>
          </section>
        </template>
      </div>
    </main>

    <SwissFooter />
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import SwissMasthead from '../components/SwissMasthead.vue'
import SwissHero from '../components/SwissHero.vue'
import SwissSectionHead from '../components/SwissSectionHead.vue'
import SwissSkillTable from '../components/SwissSkillTable.vue'
import SwissTimeline from '../components/SwissTimeline.vue'
import SwissProjectList from '../components/SwissProjectList.vue'
import SwissPostList from '../components/SwissPostList.vue'
import SwissContact from '../components/SwissContact.vue'
import SwissFooter from '../components/SwissFooter.vue'

/** 首页展示的最新文章条数 */
const POST_LIMIT = 5
/** 首页展示的精选项目条数 */
const PROJECT_LIMIT = 3

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
} = await useAsyncData<BlogPost[]>('swiss-posts', async () => {
  const list = await getAllPosts()
  return Array.isArray(list) ? list.slice(0, POST_LIMIT) : []
})

// 精选项目（一次取齐）
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('swiss-projects', async () => {
  const featured = await getFeaturedProjects(PROJECT_LIMIT)
  return Array.isArray(featured) ? featured : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshPosts()
  refreshProjects()
})

// 滚动进入视口的区块动画（共享层行为，SSG 友好）
useScrollReveal()

// —— 数据防御与视图推导（同步计算，SSR 安全） ——
const latestPosts = computed<BlogPost[]>(() =>
  Array.isArray(postsData.value) ? postsData.value : [],
)

const featuredProjects = computed<Project[]>(() =>
  Array.isArray(projectsData.value) ? projectsData.value : [],
)

const skillList = computed(() => (Array.isArray(skillGroups.value) ? skillGroups.value : []))

const timelineList = computed(() => (Array.isArray(timeline.value) ? timeline.value : []))

const socialList = computed(() => (Array.isArray(socialLinks.value) ? socialLinks.value : []))

/** 加载态：仅在尚无任何数据时显示骨架 */
const loading = computed(
  () => (postsPending.value && !postsData.value) || (projectsPending.value && !projectsData.value),
)
</script>

<style scoped>
/* —— 页面骨架：纵向弹性布局，页脚沉底 —— */
.page {
  display: flex;
  flex: 1 0 auto;
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

/* 内容容器：网格线与内容对齐的前提是同一容器 */
.container {
  position: relative;
  z-index: 0;
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px);
}

/* 12 栏极淡背景网格线（--deco）：只在本容器内铺满 */
.grid-lines {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: var(--deco);
  pointer-events: none;
}

/* —— 区块节奏：大留白分隔编号区块 —— */
.section {
  margin-top: calc(var(--space) * 2.4);
}

.section-body {
  margin-top: var(--space);
}

/* 区块内子标签：红方块 + 小号宽字距（与英雄区 eyebrow 同构） */
.sub-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 12px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-text);
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.sub-label--gap {
  margin-top: calc(var(--space) * 1.4);
}

.sub-mark {
  flex: none;
  width: 10px;
  height: 10px;
  background: var(--c-accent);
}

/* 空状态：细则线框 + 提示文案（不留白） */
.empty {
  padding: var(--space) 0;
  margin: 0;
  border-top: var(--border-w) solid var(--c-border);
  border-bottom: var(--border-w) solid var(--c-border);
  color: var(--c-muted);
}

.empty-main {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--c-text);
}

.empty-hint {
  margin: 6px 0 0;
  font-size: 14px;
}

/* 查看全部：右对齐的文字链接，下划线生长反馈 */
.view-all {
  display: flex;
  width: fit-content;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-height: 44px;
  margin-top: 12px;
  margin-left: auto;
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 2px;
  transition: background-size var(--transition);
}

.view-all:hover,
.view-all:focus-visible {
  background-size: 100% 2px;
}

.view-all:active {
  color: var(--c-accent);
}

.view-all-arrow {
  color: var(--c-accent);
  transition: transform var(--transition);
}

.view-all:hover .view-all-arrow {
  transform: translate(2px, -2px);
}

/* —— 加载骨架：细则线行 + 脉冲 —— */
.skeleton-zone {
  margin-top: calc(var(--space) * 2.4);
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

/* —— 锚点定位补偿：桌面端吸顶导航更高 —— */
.section[data-section] {
  scroll-margin-top: 1.5rem;
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

/* —— 桌面端：区块头吸顶补偿 + 区块节奏放大 —— */
@media (min-width: 768px) {
  .section[data-section] {
    scroll-margin-top: 6rem;
  }

  .section {
    margin-top: calc(var(--space) * 2.8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-row {
    animation: none;
  }

  .view-all,
  .view-all-arrow {
    transition: none;
  }
}
</style>
