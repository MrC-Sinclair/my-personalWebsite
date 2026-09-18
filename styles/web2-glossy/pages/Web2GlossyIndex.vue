<!--
  Web2GlossyIndex - Web 2.0 光泽风格的完整首页
  ------------------------------------------------------------
  「一站多风格」架构中 web2-glossy 风格的唯一交付页面：
  - 自带导航头部（站点标识 + 页内锚点 + 风格画廊入口）与页脚
  - 区块：英雄区（天空渐变 + 云朵 + 地平线高光 + 星芒徽章 +
    倒影标题）→ 关于/技能（7:5 非对称分栏）→ 精选项目（大卡 +
    双列，色带区块）→ 最新文章（光泽行条目）→ 联系方式（深蓝
    大色块 + 白色光泽磁贴）
  - 排版轴：居中英雄 + 非对称分栏 + 全宽色带交替，与其它风格
    区分；窄屏只回退布局，高光/渐变/投影等风格签名全部保留

  数据全部来自共享层 composables（useAppInfo / useProjects /
  useBlog），异步数据有 loading 骨架与空状态；文案全部走 i18n；
  滚动进入动画复用共享层 useScrollReveal 与全局 scroll-reveal 类。
-->
<template>
  <div id="top" class="w2g-page">
    <Web2GlossySiteHeader />

    <main>
      <!-- ============ 英雄区：Web 2.0 天空 + 光泽 ============ -->
      <section class="hero" data-section="hero" aria-labelledby="hero-title">
        <span class="hero__burst" aria-hidden="true"/>

        <div class="container hero__inner">
          <p class="hero__greeting scroll-reveal">{{ t('home.greeting') }}</p>

          <h1 id="hero-title" class="hero__name scroll-reveal scroll-reveal-delay-1">
            <span class="hero__name-text">{{ t('home.name') }}</span>
            <span class="hero__reflection" aria-hidden="true">{{ t('home.name') }}</span>
          </h1>

          <p class="hero__tagline scroll-reveal scroll-reveal-delay-2">{{ t('home.tagline') }}</p>
          <p class="hero__desc scroll-reveal scroll-reveal-delay-3">{{ t('home.description') }}</p>

          <div class="hero__actions scroll-reveal scroll-reveal-delay-4">
            <Web2GlossyGelButton href="#blog" size="lg">{{ t('home.viewBlog') }}</Web2GlossyGelButton>
            <Web2GlossyGelButton href="#projects" variant="orange" size="lg">
              {{ t('home.viewProjects') }}
            </Web2GlossyGelButton>
          </div>
        </div>
      </section>

      <!-- ============ 关于 + 技能：非对称分栏 ============ -->
      <section id="about" data-section="about" class="section" aria-labelledby="about-title">
        <!-- 关于内容抽成区块组件：「关于」子页复用同一块（见 Web2GlossyAboutBlock） -->
        <div class="container">
          <Web2GlossyAboutBlock/>
        </div>
      </section>

      <!-- ============ 精选项目：浅蓝色带 + 大卡双列 ============ -->
      <section
        id="projects"
        data-section="projects"
        class="section section--tint"
        aria-labelledby="projects-title"
      >
        <div class="container">
          <Web2GlossySectionHead
            id="projects-title"
            :badge="t('projects.featured')"
            :title="t('home.featuredProjects')"
          />

          <!-- 加载中：凝胶骨架屏 -->
          <div
            v-if="projectsLoading"
            class="projects-grid"
            role="status"
            :aria-label="t('common.loading')"
          >
            <div v-for="n in 3" :key="n" class="skel skel--panel" aria-hidden="true"/>
          </div>

          <!-- 空状态 -->
          <p v-else-if="safeProjects.length === 0" class="empty">
            <span class="empty__dot" aria-hidden="true">!</span>
            {{ t('projects.noResults') }}
          </p>

          <!-- 首个项目横跨两列（大卡 + 「精选」徽章），其余双列 -->
          <div v-else class="projects-grid">
            <Web2GlossyProjectCard
              v-for="(project, index) in safeProjects"
              :key="project.path"
              :project="project"
              :wide="index === 0"
              class="projects-grid__item scroll-reveal"
            />
          </div>
        </div>
      </section>

      <!-- ============ 最新文章：光泽行条目 ============ -->
      <section id="blog" data-section="blog" class="section" aria-labelledby="blog-title">
        <div class="container">
          <Web2GlossySectionHead id="blog-title" :badge="t('nav.blog')" :title="t('home.latestPosts')" />

          <!-- 加载中：行骨架屏 -->
          <div v-if="postsLoading" class="posts-list" role="status" :aria-label="t('common.loading')">
            <div v-for="n in 3" :key="n" class="skel skel--row" aria-hidden="true"/>
          </div>

          <!-- 空状态 -->
          <div v-else-if="safePosts.length === 0" class="empty">
            <span class="empty__dot" aria-hidden="true">!</span>
            <span>
              {{ t('blog.noResults') }}
              <br >
              {{ t('blog.noResultsHint') }}
            </span>
          </div>

          <div v-else class="posts-list">
            <Web2GlossyPostRow
              v-for="post in safePosts"
              :key="post.path"
              :post="post"
              class="scroll-reveal"
            />
          </div>
        </div>
      </section>

      <!-- ============ 联系方式：深蓝大色块 ============ -->
      <section
        id="contact"
        data-section="contact"
        class="section section--band"
        aria-labelledby="contact-title"
      >
        <div class="container contact-inner">
          <Web2GlossySectionHead
            id="contact-title"
            :badge="t('contact.socialLinks')"
            :title="t('contact.title')"
            theme="light"
            align="center"
          />
          <p class="contact-inner__desc">{{ t('contact.description') }}</p>

          <div class="social-grid">
            <Web2GlossySocialTile
              v-for="link in safeSocialLinks"
              :key="link.name"
              :link="link"
              class="scroll-reveal"
            />
          </div>
        </div>
      </section>
    </main>

    <Web2GlossySiteFooter />
  </div>
</template>

<script setup lang="ts">
/**
 * @file Web 2.0 光泽风格首页
 * @description 页面结构完全由本风格自定义；数据/i18n/滚动动画全部走共享层。
 *              异步数据在 onMounted 中获取（SSG 安全：服务端与客户端首帧
 *              一致渲染骨架屏），并用 Array.isArray 防御数组字段。
 */
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import Web2GlossyGelButton from '../components/Web2GlossyGelButton.vue'
import Web2GlossySectionHead from '../components/Web2GlossySectionHead.vue'
import Web2GlossySiteHeader from '../components/Web2GlossySiteHeader.vue'
import Web2GlossySiteFooter from '../components/Web2GlossySiteFooter.vue'
import Web2GlossyAboutBlock from '../components/Web2GlossyAboutBlock.vue'
import Web2GlossyProjectCard from '../components/Web2GlossyProjectCard.vue'
import Web2GlossyPostRow from '../components/Web2GlossyPostRow.vue'
import Web2GlossySocialTile from '../components/Web2GlossySocialTile.vue'

const { t } = useI18n()

// —— 共享业务层：站点信息 / 项目 / 博客 / 滚动动画 ——
// 技能分组与经历时间线已随「关于」区块下沉到 Web2GlossyAboutBlock
const { socialLinks } = useAppInfo()
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
    console.error('Web2Glossy：获取精选项目失败', error)
    projects.value = []
  } finally {
    projectsLoading.value = false
  }

  // 最新文章
  try {
    const featuredPosts = await getFeaturedPosts(3)
    posts.value = Array.isArray(featuredPosts) ? featuredPosts : []
  } catch (error) {
    console.error('Web2Glossy：获取最新文章失败', error)
    posts.value = []
  } finally {
    postsLoading.value = false
  }
})

// —— 防御：数组字段非数组时回退为空列表 ——
const safeProjects = computed(() => (Array.isArray(projects.value) ? projects.value : []))
const safePosts = computed(() => (Array.isArray(posts.value) ? posts.value : []))
const safeSocialLinks = computed(() => (Array.isArray(socialLinks.value) ? socialLinks.value : []))

</script>

<style scoped>
/* ================= 页面基座 ================= */
.w2g-page {
  overflow-x: clip;
  color: var(--c-text);
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  background: var(--c-bg);
}

.container {
  max-width: var(--page-w);
  margin-inline: auto;
  padding-inline: clamp(16px, 4vw, 32px);
}

.section {
  padding-block: clamp(56px, 9vw, 96px);
}

/* 浅蓝色带（项目区）：大色块交替节奏 */
.section--tint {
  border-top: 1px solid rgb(255 255 255 / 0.65);
  border-bottom: 1px solid rgb(255 255 255 / 0.65);
  background: linear-gradient(180deg, #d7e9fc 0%, #bfd9f6 100%);
}

/* 深蓝色带（联系区）：整块光泽玻璃感 */
.section--band {
  position: relative;
  overflow: hidden;
  border-top: 2px solid rgb(255 255 255 / 0.5);
  background: linear-gradient(180deg, #2b72c6 0%, #1d5fae 45%, #174a8f 100%);
}

/* 深蓝色带顶部的半条光泽反光 */
.section--band::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 42%;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.2) 0%, rgb(255 255 255 / 0) 100%);
  pointer-events: none;
}

/* ================= 通用白色光泽面板 ================= */
.panel {
  position: relative;
  padding: clamp(22px, 3.5vw, 30px);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: linear-gradient(180deg, #ffffff 0%, #f3f9ff 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    var(--shadow);
}

/* 面板顶部淡蓝光泽反光条 */
.panel::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 46%;
  border-radius: var(--radius) var(--radius) 45% 45%;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.85) 0%, rgb(214 233 250 / 0.26) 100%);
  pointer-events: none;
}

/* ================= 英雄区 ================= */
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: clamp(540px, 82vh, 860px);
  padding: 72px 0 96px;
  overflow: hidden;
  background: linear-gradient(180deg, #c7e0f8 0%, #9cc7ef 42%, #6ba4e4 74%, #4a86d6 100%);
}

/* 云朵：多重径向渐变纯 CSS 绘制 */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(42% 18% at 18% 22%, rgb(255 255 255 / 0.5), transparent 70%),
    radial-gradient(36% 15% at 78% 13%, rgb(255 255 255 / 0.42), transparent 70%),
    radial-gradient(50% 20% at 55% 38%, rgb(255 255 255 / 0.16), transparent 70%);
  pointer-events: none;
}

/* 地平线高光：底部白色渐变 + 2px 高光线 */
.hero::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 36px;
  border-top: 2px solid rgb(255 255 255 / 0.6);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.5) 0%, rgb(255 255 255 / 0) 100%);
  pointer-events: none;
}

.hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
}

/* 问候胶囊：亮面玻璃 */
.hero__greeting {
  display: inline-flex;
  align-items: center;
  margin: 0;
  padding: 8px 22px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  color: #1a5fc0;
  font-family: var(--font-head);
  font-size: 1.0625rem;
  font-weight: 700;
  background: linear-gradient(180deg, #ffffff 0%, #e9f2fc 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    0 3px 8px rgb(23 74 128 / 0.22);
}

/* 巨型渐变光泽标题 */
.hero__name {
  position: relative;
  margin: 0 0 46px;
  font-family: var(--font-head);
  font-size: clamp(2.625rem, 8vw, 5.25rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: 0.01em;
}

.hero__name-text {
  display: block;
  background: linear-gradient(180deg, #2b82e9 0%, #1b5cb0 45%, #0e3261 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  filter: drop-shadow(0 3px 2px rgb(255 255 255 / 0.55));
}

/* 倒影：翻转 + 渐隐遮罩，纯装饰 */
.hero__reflection {
  position: absolute;
  inset: 100% 0 auto 0;
  opacity: 0.32;
  pointer-events: none;
  user-select: none;
  background: linear-gradient(180deg, #1b5cb0 0%, #0e3261 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  transform: scaleY(-1);
  -webkit-mask-image: linear-gradient(to top, rgb(0 0 0 / 0.6) 0%, transparent 62%);
  mask-image: linear-gradient(to top, rgb(0 0 0 / 0.6) 0%, transparent 62%);
}

/* 标语：白色凝胶面板胶囊 */
.hero__tagline {
  display: inline-flex;
  align-items: center;
  margin: 0;
  padding: 12px 28px;
  border: 1px solid var(--c-border);
  border-radius: 18px;
  color: var(--c-text);
  font-family: var(--font-head);
  font-size: clamp(1rem, 2.4vw, 1.1875rem);
  font-weight: 700;
  background: linear-gradient(180deg, #ffffff 0%, #eef5fd 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    0 4px 10px rgb(23 74 128 / 0.2),
    0 12px 26px rgb(23 74 128 / 0.16);
}

/* 简介：半透明白磨砂胶囊 */
.hero__desc {
  max-width: 560px;
  margin: 0;
  padding: 10px 24px;
  border: 1px solid rgb(255 255 255 / 0.55);
  border-radius: 14px;
  color: var(--c-text);
  font-size: 0.9375rem;
  background: rgb(255 255 255 / 0.62);
  box-shadow: 0 2px 8px rgb(23 74 128 / 0.14);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
  margin-top: 8px;
}

/* 星芒徽章：clip-path 十角星 + 橙色凝胶 + 缓慢旋转 */
.hero__burst {
  position: absolute;
  top: 12%;
  right: 4%;
  z-index: 1;
  display: grid;
  place-items: center;
  width: clamp(84px, 12vw, 132px);
  aspect-ratio: 1;
  clip-path: polygon(
    50% 0%,
    61% 12%,
    79% 6%,
    82% 24%,
    100% 28%,
    93% 45%,
    100% 62%,
    82% 66%,
    79% 85%,
    61% 79%,
    50% 92%,
    39% 79%,
    21% 85%,
    18% 66%,
    0% 62%,
    7% 45%,
    0% 28%,
    18% 24%,
    21% 6%,
    39% 12%
  );
  background: linear-gradient(180deg, #f5a54a 0%, #e07b18 55%, #c85a12 100%);
  filter: drop-shadow(0 6px 10px rgb(23 74 128 / 0.35));
  animation: burst-spin 26s linear infinite;
}

/* 星芒中心的玻璃高光圆 */
.hero__burst::before {
  content: '';
  width: 46%;
  aspect-ratio: 1;
  border: 2px solid rgb(255 255 255 / 0.55);
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 22%,
    rgb(255 255 255 / 0.9) 0%,
    rgb(255 255 255 / 0.25) 58%,
    rgb(255 255 255 / 0.08) 100%
  );
  box-shadow: inset 0 -3px 6px rgb(146 58 0 / 0.35);
}

@keyframes burst-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ================= 精选项目 ================= */
.projects-grid {
  display: grid;
  gap: var(--gap);
}

/* 首卡横跨两列（大卡），其余并排——尺寸悬殊避免均分 */
@media (min-width: 760px) {
  .projects-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .projects-grid .projects-grid__item:first-child {
    grid-column: 1 / -1;
  }
}

/* ================= 最新文章 ================= */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ================= 联系方式 ================= */
.contact-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contact-inner__desc {
  max-width: 520px;
  margin: 0 0 var(--space);
  color: rgb(232 242 253 / 0.92);
  text-align: center;
}

.social-grid {
  display: grid;
  width: 100%;
  gap: var(--gap);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

/* ================= 骨架屏与空状态 ================= */
/* 光泽骨架屏：斜向流光扫过 */
.skel {
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.55) 0%, rgb(255 255 255 / 0) 46%),
    linear-gradient(100deg, #e4eefb 42%, #f9fcff 50%, #e4eefb 58%);
  background-size: 100% 100%, 220% 100%;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.8),
    0 2px 6px rgb(23 74 128 / 0.1);
  animation: skel-shimmer 1.3s linear infinite;
}

.skel--panel {
  min-height: 220px;
}

.skel--row {
  min-height: 96px;
}

@keyframes skel-shimmer {
  to {
    background-position:
      0 0,
      -220% 0;
  }
}

/* 空状态：凝胶警示圆点 + 提示文案 */
.empty {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0;
  padding: 20px 24px;
  border: 1px dashed var(--c-border);
  border-radius: var(--radius);
  color: var(--c-muted);
  background: rgb(255 255 255 / 0.65);
}

.empty__dot {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border: 1px solid #14417e;
  border-radius: 50%;
  color: #ffffff;
  font-family: var(--font-head);
  font-weight: 800;
  background: linear-gradient(180deg, #4f9cf0 0%, #2b72c6 52%, #1d5fae 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.55),
    0 2px 5px rgb(23 74 128 / 0.3);
}

.empty__dot::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.5) 0%, rgb(255 255 255 / 0) 58%);
  pointer-events: none;
}

/* ================= 动效尊重 prefers-reduced-motion ================= */
@media (prefers-reduced-motion: reduce) {
  .hero__burst {
    animation: none;
  }

  .skel {
    animation: none;
  }
}
</style>
