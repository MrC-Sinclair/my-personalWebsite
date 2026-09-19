<!--
  MetroIndex - 现代信息界面（Metro）风格的完整首页
  ------------------------------------------------------------
  「一站多风格」架构中 metro 风格的交付页面，开始屏幕布局：
  - 顶部标题区：站点标识 + t('home.*') 超大左对齐字 +
    「风格画廊」入口（localePath('/styles') 做成 Tile）
  - Tile 网格：快捷 Tiles（画廊/实时时钟/项目/博客锚点）→
    关于 Tile（2x2）+ 技能 Tiles → 精选项目 Tiles →
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
            <span class="start__mark" aria-hidden="true"/>
            {{ t('home.greeting') }}
          </p>
          <h1 class="start__name scroll-reveal scroll-reveal-delay-1">{{ t('home.name') }}</h1>
          <p class="start__tagline scroll-reveal scroll-reveal-delay-2">{{ t('home.tagline') }}</p>
          <p class="start__desc scroll-reveal scroll-reveal-delay-3">{{ t('home.description') }}</p>

          <!-- 快捷 Tiles：风格画廊 / 实时时钟 / 项目与博客锚点 -->
          <div class="mosaic start__mosaic">
            <MetroTile :to="localePath('/styles')" variant="orange" class="scroll-reveal">
              <span class="start__tile-kicker">{{ t('styles.gallery.enter') }}</span>
              <span class="start__tile-big">{{ t('styles.pageTitleSuffix') }}</span>
            </MetroTile>

            <MetroClockTile class="scroll-reveal" />

            <MetroTile href="#projects" variant="cobalt" class="scroll-reveal">
              <span class="start__tile-glyph" aria-hidden="true">↓</span>
              <span class="start__tile-big">{{ t('home.viewProjects') }}</span>
            </MetroTile>

            <MetroTile href="#blog" variant="magenta" class="scroll-reveal">
              <span class="start__tile-glyph" aria-hidden="true">↓</span>
              <span class="start__tile-big">{{ t('home.viewBlog') }}</span>
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
          <div v-if="projectsLoading" class="mosaic" role="status" :aria-label="t('common.loading')">
            <div class="skel skel--wide" aria-hidden="true"/>
            <div class="skel" aria-hidden="true"/>
            <div class="skel" aria-hidden="true"/>
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

          <!-- 加载中：扁平骨架 Tile -->
          <div v-if="postsLoading" class="mosaic" role="status" :aria-label="t('common.loading')">
            <div class="skel" aria-hidden="true"/>
            <div class="skel skel--wide" aria-hidden="true"/>
            <div class="skel" aria-hidden="true"/>
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
import MetroClockTile from '../components/MetroClockTile.vue'
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

const { t } = useI18n()
const localePath = useLocalePath()

// —— 共享业务层：站点信息 / 项目 / 博客 / 滚动动画 ——
const { skillGroups } = useAppInfo()
const { getFeaturedProjects } = useProjects()
const { getFeaturedPosts } = useBlog()
useScrollReveal()

// —— 异步数据状态（首帧与 SSG 输出一致：骨架屏） ——
const projects = ref<Project[]>([])
const posts = ref<BlogPost[]>([])
const projectsLoading = ref(true)
const postsLoading = ref(true)

onMounted(async () => {
  // 精选项目
  try {
    const featured = await getFeaturedProjects(3)
    projects.value = Array.isArray(featured) ? featured : []
  } catch (error) {
    console.error('Metro：获取精选项目失败', error)
    projects.value = []
  } finally {
    projectsLoading.value = false
  }

  // 最新文章
  try {
    const featuredPosts = await getFeaturedPosts(3)
    posts.value = Array.isArray(featuredPosts) ? featuredPosts : []
  } catch (error) {
    console.error('Metro：获取最新文章失败', error)
    posts.value = []
  } finally {
    postsLoading.value = false
  }
})

// —— 防御：数组字段非数组时回退为空列表 ——
const safeProjects = computed(() => (Array.isArray(projects.value) ? projects.value : []))
const safePosts = computed(() => (Array.isArray(posts.value) ? posts.value : []))
const safeSkillGroups = computed(() => (Array.isArray(skillGroups.value) ? skillGroups.value : []))

// —— Tile 配色循环（Metro 经典色块的排布节奏） ——
const skillVariants: MetroTileVariant[] = ['cobalt', 'green', 'purple', 'orange']
const projectVariants: MetroTileVariant[] = ['magenta', 'cobalt', 'purple']
const postVariants: MetroTileVariant[] = ['green', 'cobalt', 'red']

/** 按索引取配色，越界回退 cobalt */
function pickVariant(list: MetroTileVariant[], index: number): MetroTileVariant {
  return list[index] ?? 'cobalt'
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
  padding-block: clamp(40px, 7vh, 90px) clamp(24px, 4vw, 48px);
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
  margin: clamp(14px, 2vw, 22px) 0 0;
  font-size: clamp(18px, 2.4vw, 30px);
  color: var(--c-text);
}

.start__desc {
  max-width: 42em;
  margin: 10px 0 0;
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
  font-size: clamp(20px, 2vw, 27px);
  font-weight: 700;
  line-height: 1.15;
}

.start__tile-glyph {
  font-size: clamp(22px, 2.2vw, 30px);
  font-weight: 300;
  line-height: 1;
}

/* ================= 区块节奏：组距大于 Tile 沟槽 ================= */
/* （.block 已抽到风格级 layout.css，首页与子页共用） */
</style>
