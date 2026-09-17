<!--
  FlatDesignIndex - 扁平化风格首页（/style/flat-design/）
  ------------------------------------------------------------
  把个人网站排成一张「图形化落地页」：全宽纯色色带纵向分节
  （强调蓝 → 白 → 浅灰 → 深蓝灰 → 白），每条色带以强调色条
  开场，几何图形代替图标与插图；无阴影无纹理，交互反馈只有
  颜色变化。数据全部来自共享层 composables（useAsyncData 承载，
  SSG 预渲染即含真实内容）；文案全部来自 i18n。
-->
<template>
  <div id="top" class="fd">
    <FlatDesignHeader />

    <!-- ① 英雄区：强调蓝纯色带 + 纯 CSS 几何装饰 -->
    <FlatDesignHero />

    <!-- ② 关于 / 技能：白色带，左经历圆点时间线，右纯色进度条 -->
    <section id="about" data-section="about" class="band band--white">
      <div class="band__inner">
        <FlatDesignSectionHead
          :title="t('about.title')"
          :subtitle="t('about.description')"
          bar-color="#117a65"
        />
        <div class="about-grid">
          <div class="about-grid__story">
            <h3 class="minor-head">{{ t('about.experience') }}</h3>
            <FlatDesignTimeline :items="timeline" />
          </div>
          <div class="about-grid__skills">
            <h3 class="minor-head">{{ t('about.skills') }}</h3>
            <FlatDesignSkillBars v-if="skillBars.length" :bars="skillBars" />
            <FlatDesignEmpty v-else :message="t('projects.noResults')" />
          </div>
        </div>
      </div>
    </section>

    <!-- ③ 精选项目：浅灰色带（几何图形头卡片） -->
    <section id="projects" data-section="projects" class="band band--gray">
      <div class="band__inner">
        <div class="band__head-row">
          <FlatDesignSectionHead
            :title="t('home.featuredProjects')"
            :subtitle="t('projects.description')"
            bar-color="#d35400"
          />
          <NuxtLink :to="localePath('/projects')" class="band__more">
            {{ t('home.viewAll') }}
            <span aria-hidden="true">→</span>
          </NuxtLink>
        </div>

        <!-- 加载骨架（防御分支：正常情况下 await 后数据已就绪） -->
        <div v-if="loading" class="band__loading">
          <FlatDesignSkeleton />
        </div>
        <div v-else-if="featuredProjects.length" class="proj-grid">
          <FlatDesignProjectCard
            v-for="(project, i) in featuredProjects"
            :key="project.path"
            :project="project"
            :tone-index="i"
          />
        </div>
        <FlatDesignEmpty v-else :message="t('projects.noResults')" />
      </div>
    </section>

    <!-- ④ 最新文章：深蓝灰色带（白卡反衬，色彩对撞的强对比节） -->
    <section id="blog" data-section="blog" class="band band--dark">
      <div class="band__inner">
        <div class="band__head-row">
          <FlatDesignSectionHead
            :title="t('home.latestPosts')"
            :subtitle="t('blog.description')"
            tone="dark"
            bar-color="#f1c40f"
          />
          <NuxtLink :to="localePath('/blog')" class="band__more band__more--dark">
            {{ t('home.viewAll') }}
            <span aria-hidden="true">→</span>
          </NuxtLink>
        </div>

        <div v-if="loading" class="band__loading">
          <FlatDesignSkeleton />
        </div>
        <div v-else-if="latestPosts.length" class="post-grid">
          <FlatDesignPostCard
            v-for="(post, i) in latestPosts"
            :key="post.path"
            :post="post"
            :tone-index="i"
          />
        </div>
        <FlatDesignEmpty
          v-else
          :message="t('blog.noResults')"
          :hint="t('blog.noResultsHint')"
        />
      </div>
    </section>

    <!-- ⑤ 联系方式：白色带，社交信息色圈卡片（不用过渡层 ContactForm） -->
    <section id="contact" data-section="contact" class="band band--white">
      <div class="band__inner">
        <FlatDesignSectionHead
          :title="t('contact.title')"
          :subtitle="t('contact.description')"
          bar-color="#7d3c98"
        />
        <div class="social-grid">
          <FlatDesignSocialCard
            v-for="(social, i) in socialLinks"
            :key="social.name"
            :link="social"
            :tone-index="i"
          />
        </div>
      </div>
    </section>

    <FlatDesignFooter />
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import FlatDesignHeader from '../components/FlatDesignHeader.vue'
import FlatDesignHero from '../components/FlatDesignHero.vue'
import FlatDesignSectionHead from '../components/FlatDesignSectionHead.vue'
import FlatDesignTimeline from '../components/FlatDesignTimeline.vue'
import FlatDesignSkillBars from '../components/FlatDesignSkillBars.vue'
import FlatDesignProjectCard from '../components/FlatDesignProjectCard.vue'
import FlatDesignPostCard from '../components/FlatDesignPostCard.vue'
import FlatDesignSocialCard from '../components/FlatDesignSocialCard.vue'
import FlatDesignEmpty from '../components/FlatDesignEmpty.vue'
import FlatDesignSkeleton from '../components/FlatDesignSkeleton.vue'
import FlatDesignFooter from '../components/FlatDesignFooter.vue'
import type { SkillBar } from '../components/FlatDesignSkillBars.vue'

/** 首页展示的最新文章数量 */
const POSTS_LIMIT = 4

const { t, locale } = useI18n()
const localePath = useLocalePath()

// —— 共享层数据（组件不直接调用 content API） ——
const { socialLinks, skillGroups, timeline } = useAppInfo()
const { getAllPosts } = useBlog()
const { getFeaturedProjects } = useProjects()

// 文章列表（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('flat-design-posts', async () => {
  const list = await getAllPosts()
  return Array.isArray(list) ? list : []
})

// 精选项目
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('flat-design-projects', async () => {
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

const latestPosts = computed<BlogPost[]>(() =>
  Array.isArray(postsData.value) ? postsData.value.slice(0, POSTS_LIMIT) : [],
)

/** 加载态：仅在尚无任何数据时显示骨架 */
const loading = computed(
  () => (postsPending.value && !postsData.value) || (projectsPending.value && !projectsData.value),
)

/**
 * 技能进度条：宽度 = 分类技能数 / 最大分类技能数（真实数据占比，
 * 不虚构熟练度）；数量标注由文字直接承载。
 */
const skillBars = computed<SkillBar[]>(() => {
  const groups = skillGroups.value
  const counts = groups.map((group) => (Array.isArray(group.skills) ? group.skills.length : 0))
  const max = Math.max(1, ...counts)
  return groups.map((group, i) => ({
    category: group.category,
    skills: Array.isArray(group.skills) ? group.skills : [],
    count: counts[i],
    percent: Math.round((counts[i] / max) * 100),
  }))
})
</script>

<style scoped>
/* —— 页面骨架：浅底 + 系统无衬线，全部取自契约变量 —— */
.fd {
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

/* —— 全宽纯色色带（本风格的布局轴：纵向色带分节） —— */
.band {
  padding: clamp(48px, 9vw, 96px) clamp(16px, 4vw, 40px);
}

.band--white {
  background: var(--c-surface);
}

.band--gray {
  background: var(--c-bg);
}

.band--dark {
  background: var(--c-text);
  color: #ffffff;
}

.band__inner {
  max-width: var(--page-w);
  margin-inline: auto;
}

/* 色带标题行：标题在左，「查看全部」在右（窄屏换行） */
.band__head-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px clamp(16px, 4vw, 40px);
}

/* 查看全部：强调色文字链接，hover 加深（纯颜色反馈） */
.band__more {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-accent);
  text-decoration: none;
  transition: color var(--transition);
}

.band__more:hover {
  color: #1b5a86;
}

/* 深色带语境：浅白文字 hover 提亮为向日葵黄 */
.band__more--dark {
  color: rgb(255 255 255 / 0.85);
}

.band__more--dark:hover {
  color: var(--deco);
}

.band__more:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}

.band__loading {
  padding: 8px 0;
}

/* —— 关于区：经历与技能非对称两栏（窄屏单列回退） —— */
.about-grid {
  display: grid;
  gap: clamp(32px, 5vw, 56px);
}

@media (min-width: 900px) {
  .about-grid {
    grid-template-columns: 1.1fr 0.9fr;
  }
}

/* 小节标题：向日葵黄几何方块 + 大写字距 */
.minor-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 clamp(16px, 2.5vw, 24px);
  font-family: var(--font-head);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-muted);
}

.minor-head::before {
  content: '';
  width: 10px;
  height: 10px;
  background: var(--deco);
  border-radius: var(--radius-sm);
}

/* —— 精选项目网格 ——
   原为 1 → 2 → 3 列固定递进，但精选项目只有 1 条时，大屏下卡片仅占
   1/3 而右侧空置 2/3。改为自动适配并居中：轨道宽度有上限，卡片不会
   被拉伸变形；min(100%, 280px) 保证窄屏不溢出 */
.proj-grid {
  display: grid;
  gap: var(--gap);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 420px));
  justify-content: center;
}

/* —— 最新文章网格：1 → 2 列 —— */
.post-grid {
  display: grid;
  gap: var(--gap);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .post-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* —— 社交卡片网格：1 → 2 列 —— */
.social-grid {
  display: grid;
  gap: var(--gap);
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .social-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
