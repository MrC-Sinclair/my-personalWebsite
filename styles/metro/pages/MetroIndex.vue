<!--
  MetroIndex - 现代信息界面（Metro）风格的完整首页
  ------------------------------------------------------------
  「一站多风格」架构中 metro 风格的交付页面，开始屏幕布局：
  - 顶部标题区：站点标识 + t('home.*') 超大左对齐字
  - 首屏 Tile 网格：1 大 2 小不对称磁贴（真实精选项目 / 最新文章 /
    第二个项目，均直达详情）+ 一个方向指引；删掉原四块等权的
    重复导航磁贴与纯装饰时钟磁贴（页头已提供画廊、语言切换、区块锚点）
  - Tile 网格：关于 Tile（2x2）+ 技能 Tiles → 精选项目 Tiles →
    最新文章 Tiles → 联系 Tile（整行色带）+ 社交 Tiles
  - 底部信息条（页脚）

  排版轴：整页是一张连续的深色「开始屏幕」，色彩全部由 Tile
  色块承载（与其它风格的分区条带/分栏完全不同轴）；标题超大
  左对齐、Segoe UI Light 细字重是排版签名。

  数据全部来自共享层 composables（useAppInfo / useProjects /
  useBlog），异步数据有 loading 骨架与空状态并做 Array.isArray
  防御；文案全部走 i18n；滚动进入动画复用共享层 useScrollReveal。
-->
<template>
  <div id="top" class="metro-page">
    <MetroSiteHeader />

    <main class="metro-main">
      <!-- ============ 开始屏幕：超大标题区 + 快捷 Tiles ============ -->
      <section class="start" data-section="hero">
        <div class="wrap">
          <p class="start__kicker scroll-reveal">
            <span class="start__mark" aria-hidden="true" />
            {{ t('home.greeting') }}
          </p>
          <h1 class="start__name scroll-reveal scroll-reveal-delay-1">{{ t('home.name') }}</h1>
          <p class="start__tagline scroll-reveal scroll-reveal-delay-2">{{ t('home.tagline') }}</p>
          <p class="start__desc scroll-reveal scroll-reveal-delay-3">{{ t('home.description') }}</p>

          <!-- 不对称磁贴：1 大（真实精选项目）+ 2 小（真实文章 / 第二个项目）
               + 一个方向指引。删掉原四块等权的重复导航与纯装饰时钟磁贴，
               页头已提供画廊入口、语言切换和四个区块锚点。 -->
          <div class="mosaic start__mosaic">
            <MetroTile
              v-if="leadProject"
              :to="leadProject.to"
              span="large"
              variant="cobalt"
              :aria-label="leadProject.title"
              class="hero-tile-item scroll-reveal"
            >
              <span class="hero-tile-kicker">{{ t('home.featuredProjects') }}</span>
              <span class="hero-tile-main">
                <span class="hero-tile-title">{{ leadProject.title }}</span>
                <span v-if="leadProject.tags.length" class="hero-tile-tags">
                  <span v-for="tag in leadProject.tags" :key="tag" class="hero-tile-tag">
                    {{ tag }}
                  </span>
                </span>
              </span>
              <span class="hero-tile-foot">
                <time :datetime="leadProject.date">{{ leadProject.dateText }}</time>
                <span class="hero-tile-arrow" aria-hidden="true">→</span>
              </span>
            </MetroTile>
            <div v-else class="skel hero-tile-skel" aria-hidden="true" />

            <MetroTile
              v-if="leadPost"
              :to="leadPost.to"
              variant="magenta"
              :aria-label="leadPost.title"
              class="hero-tile-item scroll-reveal"
            >
              <span class="hero-tile-kicker">{{ t('home.latestPosts') }}</span>
              <span class="hero-tile-title hero-tile-title--sm">{{ leadPost.title }}</span>
              <span class="hero-tile-foot">
                <time :datetime="leadPost.date">{{ leadPost.dateText }}</time>
                <span class="hero-tile-arrow" aria-hidden="true">→</span>
              </span>
            </MetroTile>
            <div v-else class="skel" aria-hidden="true" />

            <MetroTile
              v-if="secondProject"
              :to="secondProject.to"
              variant="green"
              :aria-label="secondProject.title"
              class="hero-tile-item scroll-reveal"
            >
              <span class="hero-tile-kicker">{{ t('nav.projects') }}</span>
              <span class="hero-tile-title hero-tile-title--sm">{{ secondProject.title }}</span>
              <span class="hero-tile-foot">
                <time :datetime="secondProject.date">{{ secondProject.dateText }}</time>
                <span class="hero-tile-arrow" aria-hidden="true">→</span>
              </span>
            </MetroTile>
            <div v-else class="skel" aria-hidden="true" />

            <!-- 方向指引：四个重复箭头收敛为一个 -->
            <MetroTile href="#projects" span="wide" variant="neutral" class="scroll-reveal">
              <span class="start__tile-glyph" aria-hidden="true">↗</span>
              <span class="start__tile-big">{{ t('home.viewProjects') }}</span>
            </MetroTile>
          </div>
        </div>
      </section>

      <!-- ============ 关于：2x2 大 Tile + 技能 Tiles ============ -->
      <section id="about" class="block" data-section="about" aria-labelledby="about-label">
        <div class="wrap">
          <MetroSectionLabel id="about-label" :title="t('about.title')" class="scroll-reveal" />

          <div class="mosaic">
            <MetroAboutBlock class="scroll-reveal" />

            <MetroSkillTile
              v-for="(group, index) in safeSkillGroups"
              :key="group.category"
              :group="group"
              :variant="pickVariant(skillVariants, index)"
              class="scroll-reveal"
            />
          </div>
        </div>
      </section>

      <!-- ============ 精选项目：宽 Tile 领衔 + 小 Tiles ============ -->
      <section id="projects" class="block" data-section="projects" aria-labelledby="projects-label">
        <div class="wrap">
          <MetroSectionLabel
            id="projects-label"
            :title="t('home.featuredProjects')"
            :count="safeProjects.length"
            class="scroll-reveal"
          />

          <!-- 加载中：扁平骨架 Tile -->
          <div
            v-if="projectsLoading"
            class="mosaic"
            role="status"
            :aria-label="t('common.loading')"
          >
            <div class="skel skel--wide" aria-hidden="true" />
            <div class="skel" aria-hidden="true" />
            <div class="skel" aria-hidden="true" />
          </div>

          <!-- 空状态 -->
          <p v-else-if="safeProjects.length === 0" class="empty">
            <span class="empty__mark" aria-hidden="true">!</span>
            {{ t('projects.noResults') }}
          </p>

          <div v-else class="mosaic">
            <MetroProjectTile
              v-for="(project, index) in safeProjects"
              :key="project.path"
              :project="project"
              :span="index === 0 ? 'wide' : 'sm'"
              :variant="pickVariant(projectVariants, index)"
              class="scroll-reveal"
            />
          </div>
        </div>
      </section>

      <!-- ============ 最新文章：宽 Tile 居中 + 小 Tiles ============ -->
      <section id="blog" class="block" data-section="blog" aria-labelledby="blog-label">
        <div class="wrap">
          <MetroSectionLabel
            id="blog-label"
            :title="t('home.latestPosts')"
            :count="safePosts.length"
            class="scroll-reveal"
          />

          <!-- 搜索入口：提交后到博客子页执行全量搜索（共享层 URL 同步） -->
          <form class="post-search" role="search" @submit.prevent="submitSearch">
            <input
              v-model="searchKeyword"
              type="search"
              :placeholder="t('blog.search')"
              :aria-label="t('blog.search')"
              autocomplete="off"
            >
          </form>

          <!-- 加载中：扁平骨架 Tile -->
          <div v-if="postsLoading" class="mosaic" role="status" :aria-label="t('common.loading')">
            <div class="skel" aria-hidden="true" />
            <div class="skel skel--wide" aria-hidden="true" />
            <div class="skel" aria-hidden="true" />
          </div>

          <!-- 空状态 -->
          <p v-else-if="safePosts.length === 0" class="empty">
            <span class="empty__mark" aria-hidden="true">!</span>
            <span>
              {{ t('blog.noResults') }}
              <br >
              {{ t('blog.noResultsHint') }}
            </span>
          </p>

          <div v-else class="mosaic">
            <MetroPostTile
              v-for="(post, index) in safePosts"
              :key="post.path"
              :post="post"
              :span="index === 1 ? 'wide' : 'sm'"
              :variant="pickVariant(postVariants, index)"
              class="scroll-reveal"
            />
          </div>
        </div>
      </section>

      <!-- ============ 联系方式：整行色带 + 社交 Tiles ============ -->
      <section id="contact" class="block" data-section="contact" aria-labelledby="contact-label">
        <div class="wrap">
          <MetroSectionLabel id="contact-label" :title="t('contact.title')" class="scroll-reveal" />

          <MetroContactBlock />
        </div>
      </section>
    </main>

    <MetroSiteFooter />
  </div>
</template>

<script setup lang="ts">
/**
 * @file 现代信息界面（Metro）风格首页
 * @description 页面结构完全由本风格自定义；数据/i18n/滚动动画全部走共享层。
 *              异步数据在 onMounted 中获取（SSG 安全：服务端与客户端首帧
 *              一致渲染骨架屏），并用 Array.isArray 防御数组字段。
 */
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import { contentSlug } from '~/utils/content'
import { formatDate } from '~/utils/format'
import MetroPostTile from '../components/MetroPostTile.vue'
import MetroProjectTile from '../components/MetroProjectTile.vue'
import MetroSectionLabel from '../components/MetroSectionLabel.vue'
import MetroSiteFooter from '../components/MetroSiteFooter.vue'
import MetroSiteHeader from '../components/MetroSiteHeader.vue'
import MetroSkillTile from '../components/MetroSkillTile.vue'
import MetroAboutBlock from '../components/MetroAboutBlock.vue'
import MetroContactBlock from '../components/MetroContactBlock.vue'
import MetroTile from '../components/MetroTile.vue'
import type { MetroTileVariant } from '../components/MetroTile.vue'

/** 首页展示的精选项目 / 最新文章条数 */
const FEATURED_COUNT = 3
/** 主磁贴展示的技术栈标签数 */
const HERO_TAGS = 3

const { t, locale } = useI18n()
const localePath = useLocalePath()
// 首屏磁贴详情链接走共享层，风格层不重写路由拼接
const { postPath, projectPath } = useStyleContentPath()

// —— 共享业务层：站点信息 / 项目 / 博客 / 滚动动画 ——
const { skillGroups } = useAppInfo()
const { getFeaturedProjects } = useProjects()
const { getFeaturedPosts } = useBlog()
useScrollReveal()

// —— 数据取用：改用 useAsyncData，与其它 19 个风格一致 ——
// 原先 onMounted 取数使 SSG 首帧只有骨架屏，首屏磁贴无法承载真实内容。
// 改后预渲染即含真实内容，payload 下发避免水合不一致；异常仍返回空数组。
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('metro-projects', async () => {
  try {
    const list = await getFeaturedProjects(FEATURED_COUNT)
    return Array.isArray(list) ? list : []
  } catch (error) {
    console.error('Metro：获取精选项目失败', error)
    return []
  }
})

const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('metro-posts', async () => {
  try {
    const list = await getFeaturedPosts(FEATURED_COUNT)
    return Array.isArray(list) ? list : []
  } catch (error) {
    console.error('Metro：获取最新文章失败', error)
    return []
  }
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshProjects()
  refreshPosts()
})

// —— 防御：数组字段非数组时回退为空列表 ——
const safeProjects = computed<Project[]>(() =>
  Array.isArray(projectsData.value) ? projectsData.value : [],
)
const safePosts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))
const safeSkillGroups = computed(() => (Array.isArray(skillGroups.value) ? skillGroups.value : []))
const projectsLoading = computed(() => projectsPending.value && !projectsData.value)
const postsLoading = computed(() => postsPending.value && !postsData.value)

/** 首屏大磁贴：真实精选项目（标题 / 技术栈 / 日期 / 详情链接） */
const leadProject = computed(() => {
  const project = safeProjects.value[0]
  if (!project) return null
  return {
    title: project.title,
    date: project.date,
    dateText: formatDate(project.date, locale.value),
    tags: (Array.isArray(project.tags) ? project.tags : []).slice(0, HERO_TAGS),
    to: projectPath(contentSlug(project.path)),
  }
})

/** 首屏小磁贴：真实最新文章 */
const leadPost = computed(() => {
  const post = safePosts.value[0]
  if (!post) return null
  return {
    title: post.title,
    date: post.date,
    dateText: formatDate(post.date, locale.value),
    to: postPath(contentSlug(post.path)),
  }
})

/** 首屏小磁贴：第二个精选项目（与下方项目区同源，不新增取数） */
const secondProject = computed(() => {
  const project = safeProjects.value[1]
  if (!project) return null
  return {
    title: project.title,
    date: project.date,
    dateText: formatDate(project.date, locale.value),
    to: projectPath(contentSlug(project.path)),
  }
})

// —— Tile 配色循环（Metro 经典色块的排布节奏） ——
const skillVariants: MetroTileVariant[] = ['cobalt', 'green', 'purple', 'orange']
const projectVariants: MetroTileVariant[] = ['magenta', 'cobalt', 'purple']
const postVariants: MetroTileVariant[] = ['green', 'cobalt', 'red']

/** 按索引取配色，越界回退 cobalt */
function pickVariant(list: MetroTileVariant[], index: number): MetroTileVariant {
  return list[index] ?? 'cobalt'
}

// —— 搜索入口（首页只做入口：提交后到博客子页对全量文章执行搜索） ——
const searchKeyword = ref('')

function submitSearch(): void {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return
  navigateTo(`${localePath('/style/metro/blog')}?q=${encodeURIComponent(keyword)}`)
}
</script>

<style scoped>
/* ================= 页面基座：连续的深色开始屏幕 ================= */
.metro-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: clip;
  color: var(--c-text);
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  background: var(--c-bg);
}

.metro-main {
  flex: 1 0 auto;
  /* 底部为页脚前的信息版面留出呼吸 */
  padding-bottom: clamp(24px, 4vw, 56px);
}

/* ================= 开始屏幕：超大标题区 ================= */
.start {
  display: flex;
  align-items: center;
  min-height: min(86vh, 880px);
  min-height: min(86svh, 880px);
  padding-block: clamp(40px, 7vh, 92px) clamp(24px, 4vw, 48px);
}

.start > .wrap {
  width: 100%;
}

/* 引导语：强调色方块 + 中字 */
.start__kicker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: var(--fs-title);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-accent);
}

.start__mark {
  flex: none;
  width: 16px;
  height: 16px;
  background: var(--c-accent);
}

/* 站名：超大细字重（Segoe UI Light 的 Metro 排版签名） */
.start__name {
  margin: clamp(8px, 1.5vw, 16px) 0 0;
  font-family: var(--font-head);
  font-size: clamp(48px, 11.5vw, 150px);
  font-weight: 300;
  line-height: 0.98;
  letter-spacing: -0.015em;
  color: var(--c-text);
}

.start__tagline {
  max-width: 32em;
  margin: clamp(16px, 2vw, 24px) 0 0;
  font-size: var(--scale-lead-fluid);
  color: var(--c-text);
}

.start__desc {
  max-width: 42em;
  margin: 12px 0 0;
  color: var(--c-muted);
}

.start__mosaic {
  margin-top: clamp(32px, 6vw, 64px);
}

/* 快捷 Tile 内文 */
.start__tile-kicker {
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1.4;
}

.start__tile-big {
  font-family: var(--font-head);
  font-size: clamp(21px, 2vw, 28px);
  font-weight: 700;
  line-height: 1.15;
}

.start__tile-glyph {
  font-size: clamp(21px, 2.2vw, 32px);
  font-weight: 300;
  line-height: 1;
}

/* —— 首屏不对称磁贴：1 大 2 小，块内是真实内容而非导航占位 —— */
.hero-tile-item {
  min-width: 0;
}

.hero-tile-kicker {
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.14em;
  opacity: 0.85;
}

.hero-tile-main {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.hero-tile-title {
  font-family: var(--font-head);
  font-size: clamp(20px, 2.4vw, 34px);
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

/* 小磁贴高度固定，长标题会把日期挤出可视区（390 实测溢出 35px）。
   限制两行显示：内容不删，完整标题在详情页；日期与箭头始终可见。 */
.hero-tile-title--sm {
  display: -webkit-box;
  overflow: hidden;
  font-size: clamp(16px, 1.5vw, 21px);
  line-height: 1.25;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.hero-tile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
}

.hero-tile-tag {
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  border: var(--border-w) solid currentcolor;
  opacity: 0.9;
}

.hero-tile-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  opacity: 0.9;
}

.hero-tile-arrow {
  font-size: clamp(18px, 2vw, 26px);
  line-height: 1;
  transition: transform var(--transition);
}

.hero-tile-item:hover .hero-tile-arrow {
  transform: translateX(4px);
}

/* 大磁贴占位骨架：与主磁贴同跨度，数据到位后不跳动 */
.hero-tile-skel {
  grid-column: span 2;
  grid-row: span 2;
}

@media (prefers-reduced-motion: reduce) {
  .hero-tile-arrow {
    transition: none;
  }

  .hero-tile-item:hover .hero-tile-arrow {
    transform: none;
  }
}

/* ================= 区块节奏：组距大于 Tile 沟槽 ================= */
/* （.block 已抽到风格级 layout.css，首页与子页共用） */
/* ============ 文章区搜索入口：输入 Tile（Metro 色块语言） ============ */
.post-search {
  display: flex;
  align-items: center;
  margin: 20px 0 4px;
  padding: 0 16px;
  min-height: 52px;
  background: var(--c-surface);
  border: 2px solid var(--c-border);
  transition: border-color var(--transition);
}

.post-search:focus-within {
  border-color: var(--c-accent);
}

.post-search input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 44px;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  color: var(--c-text);
  background: transparent;
  border: none;
  outline: none;
}

.post-search input::placeholder {
  color: var(--c-muted);
}
</style>
