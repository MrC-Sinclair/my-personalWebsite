<!--
  ClaymorphismIndex - claymorphism 风格首页（/style/claymorphism/）
  ------------------------------------------------------------
  「黏土岛」布局轴：整页铺在 Pastel 渐变天空上，内容组织成
  一座座错落的厚黏土岛——首屏满屏黏土舞台（漂浮黏土球装饰）
  → 关于岛 + 技能岛（7/5 错落双栏）→ 精选项目（双色相轮换
  黏土板，桌面端交错下沉）→ 最新文章（圆滚滚厚胶囊行）→
  联系方式（奶油色岛 + 鹅卵石卡）→ 黏土页脚。
  数据全部来自共享层 composables（useAsyncData 承载，SSG
  预渲染即含真实内容）；异步数据带 loading 骨架与空状态，
  数组字段一律 Array.isArray 防御。文案全部走 i18n。
-->
<template>
  <div class="page">
    <ClaymorphismTopNav :sections="sections"/>

    <main class="page-main">
      <ClaymorphismHero/>

      <div class="content">
        <!-- ① 关于岛 + ② 技能岛：7/5 错落双栏（窄屏单列堆叠） -->
        <div class="duo">
          <section id="about" data-section="about" class="island island-lilac">
            <ClaymorphismSectionHead
              eyebrow="01"
              :title="t('about.title')"
              tone="pink"
            />
            <p class="intro">{{ t('about.description') }}</p>
            <ClaymorphismTimeline :items="timeline"/>
          </section>

          <section id="skills" data-section="skills" class="island island-mint island-offset">
            <ClaymorphismSectionHead
              eyebrow="02"
              :title="t('about.skills')"
              :count="skillTotal"
              tone="blue"
            />
            <ClaymorphismSkillClump :groups="skillGroups"/>
          </section>
        </div>

        <!-- ③ 精选项目：双色相黏土板交错下沉 -->
        <section id="projects" data-section="projects" class="zone">
          <ClaymorphismSectionHead
            eyebrow="03"
            :title="t('home.featuredProjects')"
            :count="projects.length"
            tone="mint"
          />

          <!-- 加载骨架（防御分支） -->
          <div v-if="projectsLoading" class="skeleton-zone" role="status">
            <p class="sr-only">{{ t('common.loading') }}</p>
            <div v-for="i in 2" :key="i" class="skeleton skeleton-card"/>
          </div>

          <div v-else-if="projects.length" class="project-grid">
            <div v-for="(project, index) in projects" :key="project.path" class="proj-slot">
              <ClaymorphismProjectCard :project="project" :tone="toneOf(index)"/>
            </div>
          </div>

          <ClaymorphismEmptyState v-else :message="t('projects.noResults')"/>
        </section>

        <!-- ④ 最新文章：圆滚滚厚胶囊行 -->
        <section id="posts" data-section="posts" class="zone">
          <ClaymorphismSectionHead
            eyebrow="04"
            :title="t('home.latestPosts')"
            :count="posts.length"
            tone="lilac"
          />

          <!-- 加载骨架（防御分支） -->
          <div v-if="postsLoading" class="skeleton-zone" role="status">
            <p class="sr-only">{{ t('common.loading') }}</p>
            <div v-for="i in 3" :key="i" class="skeleton skeleton-row"/>
          </div>

          <div v-else-if="posts.length" class="post-stack">
            <ClaymorphismPostCard
              v-for="(post, index) in posts"
              :key="post.path"
              :post="post"
              :tone="toneOf(index + 2)"
            />
          </div>

          <ClaymorphismEmptyState
            v-else
            :message="t('blog.noResults')"
            :hint="t('blog.noResultsHint')"
          />
        </section>

        <!-- ⑤ 联系方式：奶油色岛 + 鹅卵石卡 -->
        <section id="contact" data-section="contact" class="island island-butter">
          <ClaymorphismSectionHead
            eyebrow="05"
            :title="t('contact.title')"
            tone="pink"
          />
          <p class="intro">{{ t('contact.description') }}</p>
          <ClaymorphismContactClump :socials="socialLinks"/>
        </section>
      </div>
    </main>

    <ClaymorphismFooter/>
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import ClaymorphismTopNav from '../components/ClaymorphismTopNav.vue'
import ClaymorphismHero from '../components/ClaymorphismHero.vue'
import ClaymorphismSectionHead from '../components/ClaymorphismSectionHead.vue'
import ClaymorphismTimeline from '../components/ClaymorphismTimeline.vue'
import ClaymorphismSkillClump from '../components/ClaymorphismSkillClump.vue'
import ClaymorphismProjectCard from '../components/ClaymorphismProjectCard.vue'
import ClaymorphismPostCard from '../components/ClaymorphismPostCard.vue'
import ClaymorphismContactClump from '../components/ClaymorphismContactClump.vue'
import ClaymorphismEmptyState from '../components/ClaymorphismEmptyState.vue'
import ClaymorphismFooter from '../components/ClaymorphismFooter.vue'

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedPosts } = useBlog()
const { getFeaturedProjects } = useProjects()
const { socialLinks, skillGroups, timeline } = useAppInfo()

// 最新文章（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('claymorphism-posts', async () => {
  const list = await getFeaturedPosts(4)
  return Array.isArray(list) ? list : []
})

// 精选项目
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('claymorphism-projects', async () => {
  const list = await getFeaturedProjects(4)
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshPosts()
  refreshProjects()
})

// —— 数据防御（同步计算，SSR 安全） ——
const posts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))
const projects = computed<Project[]>(() =>
  Array.isArray(projectsData.value) ? projectsData.value : [],
)

/** 加载态：仅在尚无任何数据时显示骨架 */
const postsLoading = computed(() => postsPending.value && !postsData.value)
const projectsLoading = computed(() => projectsPending.value && !projectsData.value)

/** 技能总数（技能岛计数徽章，真实统计） */
const skillTotal = computed(() =>
  skillGroups.value.reduce(
    (sum, group) => sum + (Array.isArray(group.skills) ? group.skills.length : 0),
    0,
  ),
)

// —— Pastel 色相轮换（卡片 / 胶囊行的对撞节奏） ——
const TONES = ['lilac', 'mint', 'pink', 'butter', 'blue'] as const

/** 按索引轮换色相 */
function toneOf(index: number): (typeof TONES)[number] {
  return TONES[index % TONES.length]!
}

// —— 顶部导航锚点（label 随语言更新） ——
const sections = computed(() => [
  { id: 'about', label: t('about.title') },
  { id: 'skills', label: t('about.skills') },
  { id: 'projects', label: t('home.featuredProjects') },
  { id: 'posts', label: t('home.latestPosts') },
  { id: 'contact', label: t('nav.contact') },
])
</script>

<style scoped>
/* —— 页面基底：Pastel 渐变天空（风格签名装饰） —— */
.page {
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background:
    radial-gradient(1100px 560px at 88% -6%, rgb(255 215 232 / 0.6), transparent 62%),
    radial-gradient(950px 520px at -12% 24%, rgb(212 230 255 / 0.55), transparent 58%),
    radial-gradient(900px 520px at 108% 62%, rgb(226 212 255 / 0.5), transparent 60%),
    linear-gradient(180deg, #f6ecfb 0%, #fdf0f5 48%, #ecf3fd 100%);
}

.page-main {
  display: flex;
  flex-direction: column;
}

/* 内容舞台：居中聚拢的黏土岛 */
.content {
  display: flex;
  flex-direction: column;
  gap: clamp(56px, 9vw, 96px);
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: clamp(40px, 7vw, 72px) var(--gap) clamp(56px, 9vw, 96px);
}

/* —— 黏土岛：厚板 + 超大圆角 —— */
.island {
  padding: clamp(24px, 4vw, 40px);
  border-radius: clamp(32px, 5vw, 44px);
  box-shadow: var(--shadow);
}

/* 岛屿的 Pastel 底色（大色块对撞；文字用 --c-text 深色保证对比度） */
.island-lilac {
  background: #ece2fb;
}

.island-mint {
  background: #dff3e8;
}

.island-butter {
  background: #fff3cd;
}

/* 岛内简介文本 */
.intro {
  margin: 0 0 var(--space);
  color: var(--c-text);
}

/* —— 双岛 7/5 错落：窄屏单列，桌面端技能岛下沉 —— */
.duo {
  display: grid;
  gap: var(--gap);
  align-items: start;
}

@media (min-width: 900px) {
  .duo {
    grid-template-columns: 7fr 5fr;
  }

  .island-offset {
    margin-top: 44px;
  }
}

/* —— 项目网格：桌面双列，偶数卡交错下沉（黏土块散落感） —— */
.project-grid {
  display: grid;
  gap: var(--gap);
  align-items: start;
}

@media (min-width: 760px) {
  .project-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .proj-slot:nth-child(even) {
    margin-top: 36px;
  }
}

/* —— 文章胶囊行堆叠 —— */
.post-stack {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

/* —— 加载骨架：黏土毛坯（脉冲） —— */
.skeleton-zone {
  display: grid;
  gap: var(--gap);
}

.skeleton {
  background: var(--c-surface);
  box-shadow: var(--shadow);
  animation: skeleton-pulse 1.6s ease-in-out infinite;
}

.skeleton-card {
  height: 150px;
  border-radius: var(--radius);
}

.skeleton-row {
  height: 84px;
  border-radius: 999px;
}

@keyframes skeleton-pulse {
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

/* —— 锚点定位补偿：吸顶胶囊比全局 5rem 更高 —— */
section[data-section] {
  scroll-margin-top: 7.5rem;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}
</style>
