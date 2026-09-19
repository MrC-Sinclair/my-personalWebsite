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
    <FlatDesignAboutBlock id="about" />

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
    <FlatDesignContactBlock id="contact" />

    <FlatDesignFooter />
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import FlatDesignHeader from '../components/FlatDesignHeader.vue'
import FlatDesignHero from '../components/FlatDesignHero.vue'
import FlatDesignSectionHead from '../components/FlatDesignSectionHead.vue'
import FlatDesignAboutBlock from '../components/FlatDesignAboutBlock.vue'
import FlatDesignContactBlock from '../components/FlatDesignContactBlock.vue'
import FlatDesignProjectCard from '../components/FlatDesignProjectCard.vue'
import FlatDesignPostCard from '../components/FlatDesignPostCard.vue'
import FlatDesignEmpty from '../components/FlatDesignEmpty.vue'
import FlatDesignSkeleton from '../components/FlatDesignSkeleton.vue'
import FlatDesignFooter from '../components/FlatDesignFooter.vue'

/** 首页展示的最新文章数量 */
const POSTS_LIMIT = 4

const { t, locale } = useI18n()
const localePath = useLocalePath()

// —— 共享层数据（组件不直接调用 content API） ——
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
</script>
