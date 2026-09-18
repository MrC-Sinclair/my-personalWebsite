<!--
  Y2KIndex - y2k 风格完整首页（/style/y2k/）
  ------------------------------------------------------------
  「一站多风格」架构中 y2k 风格的唯一交付页面：
  - 自带导航头部（铬球站点标识 + 页内锚点 + 风格画廊入口）与页脚
  - 排版轴「深空浮岛」：整页漂浮在星空之上，区块是错位排布的
    透明塑料浮岛面板——关于/技能 7:5 分栏且右列下沉，精选项目
    大卡跨列 + 第三卡下沉，区块间以彩虹能量线分隔，与其它风格
    的居中/网格/分栏轴完全不同
  - 区块：英雄区（铬金属 3D 标题 + 行星球）→ 关于/技能
    （时间线 + 气泡芯片）→ 精选项目（镭射光盘卡）→ 最新文章
    （序号铬球行条）→ 联系方式（星际通讯台，不复用 ContactForm）
  - 数据全部来自共享层 composables（useAsyncData 承载，SSG 预
    渲染即含真实内容；loading 骨架 + 空状态 + Array.isArray 防御）
  - 文案全部走 i18n；滚动进入动画复用共享层 useScrollReveal
  - 窄屏只回退布局：金属铬/塑料高光/气泡星星等风格签名全部保留
-->
<template>
  <div id="top" class="page">
    <!-- 星空氛围层（纯 CSS 装饰，aria-hidden） -->
    <Y2KStarfield />

    <Y2KSiteHeader />

    <main class="page-main">
      <Y2KHero />

      <div class="page-inner">
        <!-- ============ 关于 + 技能：7:5 错位浮岛 ============ -->
        <section id="about" data-section="about" class="section" aria-labelledby="about-title">
          <Y2KSectionHead id="about-title" :badge="t('nav.about')" :title="t('about.title')" />
          <!-- 关于内容抽成区块组件：「关于」子页复用同一块（见 Y2KAboutBlock） -->
          <Y2KAboutBlock/>
        </section>

        <!-- 能量分隔线（纯 CSS 装饰） -->
        <span class="divider" aria-hidden="true" />

        <!-- ============ 精选项目：镭射光盘卡 ============ -->
        <section
          id="projects"
          data-section="projects"
          class="section"
          aria-labelledby="projects-title"
        >
          <Y2KSectionHead
            id="projects-title"
            class="head--right"
            :badge="t('projects.featured')"
            :title="t('home.featuredProjects')"
          />

          <!-- 加载骨架：铬面 shimmer -->
          <div
            v-if="projectsLoading"
            class="cards"
            role="status"
            :aria-label="t('common.loading')"
          >
            <span class="sr-only">{{ t('common.loading') }}</span>
            <div v-for="n in 3" :key="n" class="skel skel--card" aria-hidden="true" />
          </div>

          <!-- 空状态 -->
          <p v-else-if="safeProjects.length === 0" class="empty" role="status">
            <span class="empty-orb" aria-hidden="true">✦</span>
            {{ t('projects.noResults') }}
          </p>

          <!-- 首卡跨两列（大卡 + 精选徽章），第三卡下沉制造错位 -->
          <div v-else class="cards">
            <Y2KProjectCard
              v-for="(project, i) in safeProjects"
              :key="project.path"
              :project="project"
              :wide="i === 0"
              class="scroll-reveal"
              :class="{ 'cards-stagger': i === 2 }"
            />
          </div>
        </section>

        <span class="divider" aria-hidden="true" />

        <!-- ============ 最新文章：序号铬球行条 ============ -->
        <section id="posts" data-section="posts" class="section" aria-labelledby="posts-title">
          <Y2KSectionHead id="posts-title" :badge="t('nav.blog')" :title="t('home.latestPosts')" />

          <!-- 加载骨架 -->
          <div v-if="postsLoading" class="rows" role="status" :aria-label="t('common.loading')">
            <span class="sr-only">{{ t('common.loading') }}</span>
            <div v-for="n in 4" :key="n" class="skel skel--row" aria-hidden="true" />
          </div>

          <!-- 空状态（含提示文案） -->
          <p v-else-if="safePosts.length === 0" class="empty empty--stack" role="status">
            <span class="empty-orb" aria-hidden="true">✦</span>
            <span class="empty-text">
              {{ t('blog.noResults') }}
              <span class="empty-hint">{{ t('blog.noResultsHint') }}</span>
            </span>
          </p>

          <div v-else class="rows">
            <Y2KPostRow
              v-for="(post, i) in safePosts"
              :key="post.path"
              :post="post"
              :index="i"
              class="scroll-reveal"
            />
          </div>
        </section>

        <span class="divider" aria-hidden="true" />

        <!-- ============ 联系方式：星际通讯台 ============ -->
        <section id="contact" data-section="contact" class="section" aria-labelledby="contact-title">
          <Y2KSectionHead id="contact-title" :badge="t('nav.contact')" :title="t('contact.title')" />
          <Y2KPlasticPanel variant="pink" class="contact-panel scroll-reveal">
            <p class="contact-intro">{{ t('contact.description') }}</p>
            <Y2KContactDeck v-if="safeSocials.length" :socials="safeSocials" />
          </Y2KPlasticPanel>
        </section>
      </div>
    </main>

    <Y2KSiteFooter />
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import Y2KSiteHeader from '../components/Y2KSiteHeader.vue'
import Y2KStarfield from '../components/Y2KStarfield.vue'
import Y2KHero from '../components/Y2KHero.vue'
import Y2KSectionHead from '../components/Y2KSectionHead.vue'
import Y2KPlasticPanel from '../components/Y2KPlasticPanel.vue'
import Y2KAboutBlock from '../components/Y2KAboutBlock.vue'
import Y2KProjectCard from '../components/Y2KProjectCard.vue'
import Y2KPostRow from '../components/Y2KPostRow.vue'
import Y2KContactDeck from '../components/Y2KContactDeck.vue'
import Y2KSiteFooter from '../components/Y2KSiteFooter.vue'

/** 首页展示的最新文章条数 */
const LATEST_POST_COUNT = 4
/** 首页展示的精选项目数 */
const FEATURED_PROJECT_COUNT = 3

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedPosts } = useBlog()
const { getFeaturedProjects } = useProjects()
// 技能分组与经历时间线已随「关于」区块下沉到 Y2KAboutBlock
const { socialLinks } = useAppInfo()

// 精选项目（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('y2k-projects', async () => {
  const list = await getFeaturedProjects(FEATURED_PROJECT_COUNT)
  return Array.isArray(list) ? list : []
})

// 最新文章（getFeaturedPosts 按日期倒序取前 N 条）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('y2k-posts', async () => {
  const list = await getFeaturedPosts(LATEST_POST_COUNT)
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshProjects()
  refreshPosts()
})

// —— 数据防御（数组字段统一 Array.isArray 校验） ——
const safeProjects = computed<Project[]>(() =>
  Array.isArray(projectsData.value) ? projectsData.value : [],
)
const safePosts = computed<BlogPost[]>(() =>
  Array.isArray(postsData.value) ? postsData.value : [],
)
const safeSocials = computed(() => (Array.isArray(socialLinks.value) ? socialLinks.value : []))

/** 加载态：仅在尚无任何数据时显示骨架 */
const projectsLoading = computed(() => projectsPending.value && !projectsData.value)
const postsLoading = computed(() => postsPending.value && !postsData.value)

// 滚动进入动画（共享层 composable，observer 在其内部成对清理）
useScrollReveal()
</script>

<style scoped>
/* —— 页面骨架：深空底色 + 浮岛内容层 —— */
.page {
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

.page-main {
  position: relative;
  z-index: 1;
}

.page-inner {
  display: grid;
  gap: clamp(56px, 9vh, 96px);
  width: min(100% - 2 * var(--space), var(--page-w));
  margin-inline: auto;
  padding-bottom: calc(var(--space) * 2);
}

/* —— 精选项目：错位卡片网格 —— */
.cards {
  display: grid;
  gap: var(--gap);
}

.rows {
  display: grid;
  gap: 12px;
}

/* 桌面端：首卡跨两列、第三卡下沉（错位签名） */
@media (min-width: 768px) {
  .cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cards > :first-child {
    grid-column: 1 / -1;
  }

  .cards-stagger {
    margin-top: 32px;
  }
}

/* —— 联系方式 —— */
.contact-intro {
  margin: 0 0 var(--gap);
  color: var(--c-muted);
}

/* —— 能量分隔线：彩虹细线 + 中心星芒 —— */
.divider {
  position: relative;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgb(255 92 225 / 0.45) 22%,
    rgb(139 123 255 / 0.6) 50%,
    rgb(69 227 255 / 0.45) 78%,
    transparent 100%
  );
}

.divider::after {
  content: '✦';
  position: absolute;
  top: 50%;
  left: 50%;
  padding: 0 12px;
  font-size: 13px;
  line-height: 1;
  color: rgb(240 244 255 / 0.95);
  background: var(--c-bg);
  transform: translate(-50%, -50%);
  text-shadow: 0 0 12px rgb(139 123 255 / 1);
}

/* —— 加载骨架：铬面 shimmer —— */
.skel {
  border: var(--border-w) solid rgb(190 200 255 / 0.22);
  border-radius: var(--radius-sm);
  background: linear-gradient(
    100deg,
    rgb(255 255 255 / 0.06) 30%,
    rgb(255 255 255 / 0.22) 50%,
    rgb(255 255 255 / 0.06) 70%
  );
  background-size: 200% 100%;
  animation: skel-shimmer 1.4s linear infinite;
}

.skel--card {
  min-height: 220px;
}

.skel--row {
  min-height: 76px;
}

@keyframes skel-shimmer {
  to {
    background-position: -200% 0;
  }
}

/* —— 空状态：气泡星球 + 提示 —— */
.empty {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0;
  padding: var(--space);
  font-weight: 700;
  color: var(--c-muted);
  border: 1px dashed rgb(190 200 255 / 0.45);
  border-radius: var(--radius);
  background: rgb(255 255 255 / 0.04);
}

.empty--stack {
  align-items: flex-start;
}

.empty-text {
  display: grid;
  gap: 4px;
}

.empty-hint {
  font-size: var(--fs-small);
  font-weight: 400;
}

/* 空状态小星球 */
.empty-orb {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid rgb(255 255 255 / 0.55);
  border-radius: 50%;
  background: radial-gradient(120% 120% at 32% 26%, #ffffff 0%, #c3cdf2 34%, #7d89c9 66%, #3a4484 100%);
  box-shadow: 0 0 14px rgb(139 123 255 / 0.5);
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
  .skel {
    animation: none;
  }
}
</style>
