<!--
  CyberpunkIndex - cyberpunk 风格首页（/style/cyberpunk/）
  ------------------------------------------------------------
  「霓虹夜城控制台」排版轴：全屏透视网格地平线英雄区
  （glitch 巨标题 + HUD 角标 + 切角 CTA）→ 错落切角面板流
  ——关于档案（7 栏）+ 技能芯片墙（5 栏下沉错位）→ 精选
  项目「悬赏数据板」网格 → 最新文章「数据流行」列表（十六
  进制索引）→ 联系「通讯终端」面板（右移错位）→ 霓虹页脚。
  面板切角方向（flip）与强调色（青/紫/粉）交替轮换，拼出
  城市霓虹招牌的错落轮廓；整页叠加 CRT 扫描线覆盖层。

  数据全部来自共享层 composables（useAsyncData 承载，SSG
  预渲染即含真实内容）；加载态用霓虹骨架条，空态用警示板，
  数组字段一律 Array.isArray 防御。reveal 动画走共享层
  useScrollReveal；页内跳转全部为原生锚点 <a href="#...">。
-->
<template>
  <div class="page">
    <CyberpunkScanOverlay/>
    <CyberpunkHudNav/>

    <main class="main">
      <!-- ① 全屏英雄区 -->
      <CyberpunkHero/>

      <!-- ② 内容面板流 -->
      <div class="stream">
        <!-- 左缘 HUD 刻度轨（纯装饰，宽屏显示） -->
        <div class="rail" aria-hidden="true"/>

        <!-- ②-1 关于 + 技能：7/5 非对称分栏，技能面板下沉错位 -->
        <div class="duo">
          <CyberpunkPanel
            id="about"
            data-section="about"
            class="duo-a scroll-reveal scroll-reveal-up"
            :eyebrow="t('nav.about')"
            :title="t('about.title')"
            tone="cyan"
          >
            <p class="about-lead">{{ t('about.description') }}</p>

            <h3 class="sub-title">{{ t('about.experience') }}</h3>
            <CyberpunkTimeline :items="timeline"/>
          </CyberpunkPanel>

          <CyberpunkPanel
            id="skills"
            data-section="skills"
            class="duo-b scroll-reveal scroll-reveal-up scroll-reveal-delay-2"
            :eyebrow="t('nav.about')"
            :title="t('about.skills')"
            tone="violet"
            flip
          >
            <CyberpunkSkillGrid :groups="skillGroups"/>
          </CyberpunkPanel>
        </div>

        <!-- ②-2 精选项目：悬赏数据板网格 -->
        <CyberpunkPanel
          id="projects"
          data-section="projects"
          class="scroll-reveal scroll-reveal-up"
          :eyebrow="t('nav.projects')"
          :title="t('home.featuredProjects')"
          :meta="String(featuredProjects.length)"
          tone="magenta"
        >
          <!-- 加载骨架：霓虹脉冲条 -->
          <div v-if="loading" class="loading-zone" role="status">
            <p class="sr-only">{{ t('common.loading') }}</p>
            <div v-for="i in 3" :key="`p-${i}`" class="skeleton skeleton-card"/>
          </div>

          <CyberpunkEmpty v-else-if="!featuredProjects.length" :message="t('projects.noResults')"/>

          <div v-else class="project-grid">
            <CyberpunkProjectCard
              v-for="project in featuredProjects"
              :key="project.path"
              :project="project"
            />
          </div>
        </CyberpunkPanel>

        <!-- ②-3 最新文章：数据流行列表 -->
        <CyberpunkPanel
          id="posts"
          data-section="posts"
          class="scroll-reveal scroll-reveal-up"
          :eyebrow="t('nav.blog')"
          :title="t('home.latestPosts')"
          :meta="String(latestPosts.length)"
          tone="cyan"
          flip
        >
          <div v-if="loading" class="loading-zone" role="status">
            <p class="sr-only">{{ t('common.loading') }}</p>
            <div v-for="i in 3" :key="`b-${i}`" class="skeleton skeleton-row"/>
          </div>

          <CyberpunkEmpty
            v-else-if="!latestPosts.length"
            :message="t('blog.noResults')"
            :hint="t('blog.noResultsHint')"
          />

          <div v-else class="post-list">
            <CyberpunkPostRow
              v-for="(post, index) in latestPosts"
              :key="post.path"
              :post="post"
              :index="index"
            />
          </div>
        </CyberpunkPanel>

        <!-- ②-4 联系方式：通讯终端面板（宽屏右移错位，不复用过渡层 ContactForm） -->
        <CyberpunkPanel
          id="contact"
          data-section="contact"
          class="contact-panel scroll-reveal scroll-reveal-up"
          :eyebrow="t('nav.contact')"
          :title="t('contact.socialLinks')"
          tone="violet"
        >
          <p class="contact-desc">{{ t('contact.description') }}</p>
          <CyberpunkContactDeck :socials="socialLinks"/>
        </CyberpunkPanel>
      </div>
    </main>

    <CyberpunkFooter/>
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import CyberpunkScanOverlay from '../components/CyberpunkScanOverlay.vue'
import CyberpunkHudNav from '../components/CyberpunkHudNav.vue'
import CyberpunkHero from '../components/CyberpunkHero.vue'
import CyberpunkPanel from '../components/CyberpunkPanel.vue'
import CyberpunkTimeline from '../components/CyberpunkTimeline.vue'
import CyberpunkSkillGrid from '../components/CyberpunkSkillGrid.vue'
import CyberpunkProjectCard from '../components/CyberpunkProjectCard.vue'
import CyberpunkPostRow from '../components/CyberpunkPostRow.vue'
import CyberpunkContactDeck from '../components/CyberpunkContactDeck.vue'
import CyberpunkEmpty from '../components/CyberpunkEmpty.vue'
import CyberpunkFooter from '../components/CyberpunkFooter.vue'

/** 首页展示的最新文章条数 */
const POST_COUNT = 5
/** 首页展示的精选项目数上限 */
const PROJECT_COUNT = 4

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()
const { getFeaturedProjects } = useProjects()
const { socialLinks, skillGroups, timeline } = useAppInfo()

// 最新文章（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('cyberpunk-posts', async () => {
  const list = await getAllPosts()
  return Array.isArray(list) ? list : []
})

// 精选项目
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('cyberpunk-projects', async () => {
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

/** 加载态：仅在尚无任何数据时显示霓虹骨架 */
const loading = computed(
  () => (postsPending.value && !postsData.value) || (projectsPending.value && !projectsData.value),
)

// 滚动进入视口动画（共享层行为，SSG 友好）
useScrollReveal()
</script>

<style scoped>
/* —— 页面骨架：夜城底色 + 面板流 —— */
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

/* 内容面板流：单列错落节奏 */
.stream {
  position: relative;
  display: grid;
  gap: clamp(36px, 5vw, 64px);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: clamp(36px, 5vw, 64px) var(--gap) clamp(48px, 6vw, 88px);
}

/* —— 左缘 HUD 刻度轨（纯装饰，宽屏显示） —— */
.rail {
  display: none;
}

@media (min-width: 1240px) {
  .rail {
    display: block;
    position: absolute;
    top: 72px;
    bottom: 72px;
    left: 0;
    width: 10px;
    background: repeating-linear-gradient(
      180deg,
      rgb(34 211 238 / 0.45) 0 2px,
      transparent 2px 22px
    );
    opacity: 0.55;
  }
}

/* —— 关于 + 技能：7/5 非对称分栏，技能面板下沉 —— */
.duo {
  display: grid;
  gap: clamp(36px, 5vw, 64px);
}

@media (min-width: 960px) {
  .duo {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    align-items: start;
    gap: var(--space);
  }

  .duo-b {
    margin-top: 44px;
  }
}

.about-lead {
  margin: 0 0 var(--space);
  font-size: clamp(16px, 1.6vw, 18px);
  line-height: var(--lh-body);
  color: var(--c-muted);
}

/* 小节标题：等宽粉字 + 发光下划线 */
.sub-title {
  margin: 0 0 var(--gap);
  padding-bottom: 8px;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  letter-spacing: 0.18em;
  color: var(--c-accent-2);
  border-bottom: 1px solid rgb(255 45 149 / 0.35);
  text-shadow: 0 0 10px rgb(255 45 149 / 0.35);
}

/* —— 项目网格：自适应数据板 —— */
.project-grid {
  display: grid;
  /* 精选项目当前只有 1 条：auto-fill 会按容器宽度铺出多个空轨道，
     结果是「单卡居左 + 右侧大片空置」。改用 auto-fit 并给轨道设上限
     （卡片是纵向布局，拉伸到整行会变形），再整体居中让留白对称 */
  grid-template-columns: repeat(auto-fit, minmax(280px, 460px));
  justify-content: center;
  gap: var(--gap);
}

/* —— 文章数据流行列表 —— */
.post-list {
  display: grid;
  gap: 12px;
}

/* —— 联系面板：宽屏右移错位（城市招牌错落感） —— */
@media (min-width: 960px) {
  .contact-panel {
    width: min(100%, 92%);
    margin-left: auto;
  }
}

.contact-desc {
  max-width: 62ch;
  margin: 0 0 var(--space);
  color: var(--c-muted);
}

/* —— 加载骨架：霓虹脉冲条 —— */
.loading-zone {
  display: grid;
  gap: var(--gap);
}

.skeleton {
  background: rgb(34 211 238 / 0.05);
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
  box-shadow: inset 0 0 0 var(--border-w) rgb(34 211 238 / 0.25);
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

.skeleton-card {
  height: 200px;
}

.skeleton-row {
  height: 76px;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.45;
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

/* 窄屏：错位与下沉全部落回单列（霓虹签名保留） */
@media (max-width: 959px) {
  .duo-b {
    margin-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    opacity: 0.6;
  }
}
</style>
