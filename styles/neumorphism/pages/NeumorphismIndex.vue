<!--
  NeumorphismIndex - neumorphism 风格首页（/style/neumorphism/）
  ------------------------------------------------------------
  整页排版轴：居中单列——新拟态的美学建立在对称与居中上，
  强行分栏会破坏光影逻辑（style-lab 已验证的设计结论）。
  页面 = 凸起导航薄板 + 首屏英雄区 + 一列「从材料里凸出来」
  的面板（关于/技能/精选项目/最新文章/联系方式）+ 凹槽页脚。

  数据全部来自共享层 composables（useAsyncData 承载，SSG
  预渲染即含真实内容）；文案全部走 i18n；页内跳转用原生锚点；
  异步数据有 loading 骨架与空状态分支，数组字段做防御处理。
-->
<template>
  <div class="page">
    <NeumorphismTopBar :sections="sections" />

    <main id="top" class="column">
      <!-- 英雄区（无数据依赖，始终渲染） -->
      <NeumorphismHero />

      <!-- 加载骨架（防御分支：正常情况下 await 后数据已就绪） -->
      <div v-if="loading" class="panel-loading" role="status">
        <p class="sr-only">{{ t('common.loading') }}</p>
        <div class="skeleton skeleton-a"/>
        <div class="skeleton skeleton-b"/>
        <div class="skeleton skeleton-c"/>
      </div>

      <template v-else>
        <!-- ① 关于：工作 / 教育时间线 -->
        <NeumorphismPanel id="about" data-section="about" :title="t('about.title')">
          <NeumorphismAboutBlock/>
        </NeumorphismPanel>

        <!-- ② 技能：内凹轨道 + 凸起填充块 -->
        <NeumorphismPanel id="skills" data-section="skills" :title="t('about.skills')">
          <NeumorphismSkillBars :groups="skillGroups" />
        </NeumorphismPanel>

        <!-- ③ 精选项目：凸起大圆角卡片 -->
        <NeumorphismPanel id="projects" data-section="projects" :title="t('home.featuredProjects')">
          <div v-if="featuredProjects.length" class="project-list">
            <NeumorphismProjectCard
              v-for="(project, index) in featuredProjects"
              :key="project.path"
              :project="project"
              :index="index"
            />
          </div>
          <div v-else class="empty" role="status">
            <p class="empty-title">{{ t('projects.noResults') }}</p>
          </div>
        </NeumorphismPanel>

        <!-- ④ 最新文章：凹槽行 -->
        <NeumorphismPanel id="posts" data-section="posts" :title="t('home.latestPosts')">
          <div v-if="latestPosts.length" class="post-list">
            <NeumorphismPostCard v-for="post in latestPosts" :key="post.path" :post="post" />
          </div>
          <div v-else class="empty" role="status">
            <p class="empty-title">{{ t('blog.noResults') }}</p>
            <p class="empty-hint">{{ t('blog.noResultsHint') }}</p>
          </div>
        </NeumorphismPanel>

        <!-- ⑤ 联系方式：社交信息凹槽行（不复用过渡层 ContactForm） -->
        <NeumorphismPanel
          id="contact"
          data-section="contact"
          :title="t('contact.title')"
          :lead="t('contact.description')"
        >
          <h3 class="block-title">{{ t('contact.socialLinks') }}</h3>
          <NeumorphismContactList :socials="socialLinks" />
        </NeumorphismPanel>
      </template>
    </main>

    <NeumorphismFooter />
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import NeumorphismTopBar from '../components/NeumorphismTopBar.vue'
import NeumorphismHero from '../components/NeumorphismHero.vue'
import NeumorphismPanel from '../components/NeumorphismPanel.vue'
import NeumorphismAboutBlock from '../components/NeumorphismAboutBlock.vue'
import NeumorphismSkillBars from '../components/NeumorphismSkillBars.vue'
import NeumorphismProjectCard from '../components/NeumorphismProjectCard.vue'
import NeumorphismPostCard from '../components/NeumorphismPostCard.vue'
import NeumorphismContactList from '../components/NeumorphismContactList.vue'
import NeumorphismFooter from '../components/NeumorphismFooter.vue'

/** 最新文章展示条数 */
const LATEST_POST_COUNT = 5

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()
const { getFeaturedProjects } = useProjects()
// （timeline 已随 NeumorphismAboutBlock 抽出，本页不再直接消费）
const { skillGroups, socialLinks } = useAppInfo()

// 文章列表（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('neumorphism-posts', async () => {
  const list = await getAllPosts()
  return Array.isArray(list) ? list : []
})

// 精选项目
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('neumorphism-projects', async () => {
  const list = await getFeaturedProjects()
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshPosts()
  refreshProjects()
})

// —— 数据防御与视图推导（同步计算，SSR 安全） ——
const featuredProjects = computed<Project[]>(() =>
  Array.isArray(projectsData.value) ? projectsData.value : [],
)

/** 最新文章：列表已按日期倒序，取前 N 条 */
const latestPosts = computed<BlogPost[]>(() =>
  Array.isArray(postsData.value) ? postsData.value.slice(0, LATEST_POST_COUNT) : [],
)

/** 加载态：仅在尚无任何数据时显示骨架 */
const loading = computed(
  () => (postsPending.value && !postsData.value) || (projectsPending.value && !projectsData.value),
)

// —— 页内锚点区块（label 随语言更新） ——
const sections = computed(() => [
  { id: 'about', label: t('nav.about') },
  { id: 'skills', label: t('about.skills') },
  { id: 'projects', label: t('home.featuredProjects') },
  { id: 'posts', label: t('home.latestPosts') },
  { id: 'contact', label: t('nav.contact') },
])
</script>

<style scoped>
/* —— 页面骨架：同色材料底 + 居中单列（对称轴） —— */
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

.column {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 44px; /* 大间距：凸起面板的阴影需要呼吸空间 */
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 8px 20px 72px;
}

/* —— 区块标题（面板内的小节标题：联系面板的「社交链接」仍用） —— */
.block-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-muted);
}

/* —— 列表容器 —— */
.project-list,
.post-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* —— 空状态：材料表面凹出的空槽 —— */
.empty {
  padding: var(--space);
  text-align: center;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-press);
}

.empty-title {
  margin: 0;
  font-weight: 600;
  color: var(--c-text);
}

.empty-hint {
  margin: 6px 0 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* —— 加载骨架：凸起面板呼吸 —— */
.panel-loading {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.skeleton {
  background: var(--c-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  animation: skeleton-pulse 1.6s ease-in-out infinite;
}

.skeleton-a {
  height: 140px;
}

.skeleton-b {
  height: 220px;
}

.skeleton-c {
  height: 160px;
  animation-delay: 200ms;
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

/* —— 锚点定位补偿：吸顶导航（含锚点行）比全局 5rem 更高 —— */
.column > [data-section] {
  scroll-margin-top: 8rem;
}

@media (min-width: 900px) {
  .column > [data-section] {
    scroll-margin-top: 6.5rem;
  }
}

@media (max-width: 640px) {
  .column {
    gap: 36px;
    padding-inline: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    opacity: 0.6;
  }
}
</style>
