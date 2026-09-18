<!--
  Soft3DIndex - soft-3d 风格首页（/style/soft-3d/）
  ------------------------------------------------------------
  布局轴：空间舞台 + 漂浮物体拼摆——整页是一座深色空间
  「展台」：英雄区是一组受光球体（主球 + 卫星 + 星环 +
  立方体）与巨型渐变标题；下方各区块是摆在不同 Z 层的
  漂浮物体（技能舱 / 里程碑 / 项目卡 / 刊物卡 / 联系舱），
  桌面端用 translateY + scale 表达前后层级，窄屏收敛为
  同层但保留物体感阴影与圆角。
  数据全部来自共享层 composables（useAsyncData 承载，
  SSG 预渲染即含内容）；文案全部走 i18n；页内跳转用原生
  锚点（全局 smooth 滚动 + scroll-margin 已就绪）。
  滚动进入动画复用共享层 useScrollReveal（reveal 变换加在
  外层包裹，Z 层变换加在内层，两层 transform 不冲突）。
-->
<template>
  <div class="p3d">
    <!-- 深空氛围背景（固定层，不参与交互） -->
    <Soft3DBackground />

    <!-- 漂浮胶囊导航 -->
    <Soft3DFloatNav :sections="navSections" />

    <main class="p3d-main">
      <!-- ① 英雄区：巨型渐变标题 + 受光球体群 -->
      <section id="top" class="hero" data-section="top">
        <div class="hero-copy">
          <p class="hero-eyebrow">{{ t('home.greeting') }}</p>
          <h1 class="hero-name">{{ t('home.name') }}</h1>
          <p class="hero-tagline">{{ t('home.tagline') }}</p>
          <p class="hero-desc">{{ t('home.description') }}</p>
          <div class="hero-cta">
            <a class="cta cta-solid" href="#projects">{{ t('home.viewProjects') }}</a>
            <a class="cta cta-ghost" href="#posts">{{ t('home.viewBlog') }}</a>
          </div>
        </div>

        <!-- 球体群：纯 CSS 物体，纯装饰 -->
        <div class="hero-scene" aria-hidden="true">
          <Soft3DOrb :size="66" variant="cyan" float :duration="6" :delay="0.6" class="sat sat-1" />
          <Soft3DOrb :size="44" variant="pink" float ring :duration="7.5" :delay="1.4" class="sat sat-2" />
          <Soft3DOrb :size="34" variant="mint" float :duration="5.4" :delay="2" class="sat sat-3" />
          <span class="scene-cube"/>
          <Soft3DOrb :size="248" variant="violet" float :duration="8" class="hero-core" />
          <span class="hero-floor"/>
        </div>
      </section>

      <!-- ② 关于 / 技能：技能舱 + 经历里程碑（不同 Z 层拼摆） -->
      <section id="about" class="sec scroll-reveal scroll-reveal-up" data-section="about">
        <Soft3DSectionHead
          :eyebrow="t('nav.about')"
          :title="t('about.title')"
          :description="t('about.description')"
          variant="cyan"
        />

        <!-- 关于内容抽成区块组件：「关于」子页复用同一块（见 Soft3DAboutBlock） -->
        <Soft3DAboutBlock/>
      </section>

      <!-- ③ 精选项目：三列 Z 层错落（近 / 中 / 远） -->
      <section id="projects" class="sec scroll-reveal scroll-reveal-up" data-section="projects">
        <Soft3DSectionHead
          :eyebrow="t('nav.projects')"
          :title="t('home.featuredProjects')"
          :description="t('projects.description')"
          variant="pink"
        />

        <div class="proj-grid">
          <!-- 加载态 -->
          <Soft3DEmpty v-if="loading" class="proj-item" loading :message="t('common.loading')" />

          <template v-else>
            <div
              v-for="(project, i) in projects"
              :key="project.path"
              class="reveal-wrap scroll-reveal scroll-reveal-up"
              :class="revealClass(i)"
            >
              <div class="z-item" :class="zOf(i)">
                <Soft3DProjectCard
                  :project="project"
                  :variant="coverVariants[i % coverVariants.length]"
                />
              </div>
            </div>

            <!-- 空态 -->
            <Soft3DEmpty
              v-if="!projects.length"
              class="proj-item"
              :message="t('projects.noResults')"
            />
          </template>
        </div>

        <div class="sec-foot">
          <NuxtLink class="more" :to="localePath('/projects')">
            {{ t('home.viewAll') }}<span class="more-arrow" aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </section>

      <!-- ④ 最新文章：双列错落漂浮刊物 -->
      <section id="posts" class="sec scroll-reveal scroll-reveal-up" data-section="posts">
        <Soft3DSectionHead
          :eyebrow="t('nav.blog')"
          :title="t('home.latestPosts')"
          :description="t('blog.description')"
          variant="mint"
        />

        <div class="post-grid">
          <Soft3DEmpty v-if="loading" class="post-item" loading :message="t('common.loading')" />

          <template v-else>
            <div
              v-for="(post, i) in posts"
              :key="post.path"
              class="reveal-wrap scroll-reveal scroll-reveal-up"
              :class="revealClass(i)"
            >
              <div class="z-item z-post" :class="{ 'z-post-raised': i % 2 === 1 }">
                <Soft3DPostCard
                  :post="post"
                  :variant="postVariants[i % postVariants.length]"
                />
              </div>
            </div>

            <Soft3DEmpty
              v-if="!posts.length"
              class="post-item"
              :message="t('blog.noResults')"
              :hint="t('blog.noResultsHint')"
            />
          </template>
        </div>

        <div class="sec-foot">
          <NuxtLink class="more" :to="localePath('/blog')">
            {{ t('home.viewAll') }}<span class="more-arrow" aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </section>

      <!-- ⑤ 联系方式：展示型联系舱（不复用过渡层 ContactForm） -->
      <section id="contact" class="sec scroll-reveal scroll-reveal-up" data-section="contact">
        <Soft3DSectionHead
          :eyebrow="t('nav.contact')"
          :title="t('contact.title')"
          :description="t('contact.description')"
          variant="sun"
        />

        <div class="contact-grid">
          <div
            v-for="(item, i) in socialLinks"
            :key="item.name"
            class="reveal-wrap scroll-reveal scroll-reveal-up"
            :class="revealClass(i)"
          >
            <Soft3DContactPod
              :item="item"
              :variant="contactVariants[i % contactVariants.length]"
            />
          </div>
        </div>
      </section>
    </main>

    <!-- 页脚底座 -->
    <Soft3DSiteFooter />

    <!-- 回顶浮球：原生锚点 + aria-label -->
    <a class="top-orb" href="#top" :aria-label="t('common.backToTop')">
      <span class="top-orb-arrow" aria-hidden="true">↑</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import Soft3DBackground from '../components/Soft3DBackground.vue'
import Soft3DFloatNav from '../components/Soft3DFloatNav.vue'
import Soft3DSectionHead from '../components/Soft3DSectionHead.vue'
import Soft3DAboutBlock from '../components/Soft3DAboutBlock.vue'
import Soft3DProjectCard from '../components/Soft3DProjectCard.vue'
import Soft3DPostCard from '../components/Soft3DPostCard.vue'
import Soft3DContactPod from '../components/Soft3DContactPod.vue'
import Soft3DSiteFooter from '../components/Soft3DSiteFooter.vue'
import Soft3DEmpty from '../components/Soft3DEmpty.vue'
import Soft3DOrb from '../components/Soft3DOrb.vue'

/** 每区展示的文章 / 项目数量上限 */
const FEATURED_LIMIT = 6

const { t, locale } = useI18n()

// 对外路由链接的本地化路径（模板中使用，需在 setup 中取得）
const localePath = useLocalePath()

// —— 共享层数据（组件不直接调用 content API） ——
// 技能分组与经历时间线已随「关于」区块下沉到 Soft3DAboutBlock
const { socialLinks } = useAppInfo()
const { getFeaturedPosts } = useBlog()
const { getFeaturedProjects } = useProjects()

// 滚动进入动画：共享层行为（观察 .scroll-reveal 元素）
useScrollReveal()

// 文章列表（useAsyncData 承载：SSG 预渲染即含数据）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('soft3d-posts', async () => {
  const list = await getFeaturedPosts(FEATURED_LIMIT)
  return Array.isArray(list) ? list : []
})

// 精选项目列表
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('soft3d-projects', async () => {
  const list = await getFeaturedProjects(FEATURED_LIMIT)
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshPosts()
  refreshProjects()
})

// —— 数据防御（数组字段统一兜底） ——
const posts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))
const projects = computed<Project[]>(() =>
  Array.isArray(projectsData.value) ? projectsData.value : [],
)

/** 加载态：仅在尚无任何数据时显示 */
const loading = computed(
  () => (postsPending.value && !postsData.value) || (projectsPending.value && !projectsData.value),
)

// —— 导航锚点（label 随语言更新） ——
const navSections = computed(() => [
  { id: 'about', label: t('about.title') },
  { id: 'projects', label: t('nav.projects') },
  { id: 'posts', label: t('nav.blog') },
  { id: 'contact', label: t('nav.contact') },
])

// —— 配色轮换（纯装饰，索引取模，SSR 安全） ——
const coverVariants = ['violet', 'cyan', 'warm', 'mint', 'sun', 'grape'] as const
const postVariants = ['cyan', 'violet', 'mint', 'pink', 'sun'] as const
const contactVariants = ['violet', 'cyan', 'pink', 'sun'] as const

/** Z 层轮换：远 / 近 / 中循环，形成「物体错落摆放」的纵深（确定性，SSR 安全） */
function zOf(index: number): 'z-near' | 'z-mid' | 'z-far' {
  const order: Array<'z-near' | 'z-mid' | 'z-far'> = ['z-far', 'z-near', 'z-mid']
  return order[index % 3]!
}

/** reveal 交错延迟类（滚动进入动画的全局类，确定性） */
function revealClass(index: number): string {
  const delays = ['', 'scroll-reveal-delay-1', 'scroll-reveal-delay-2']
  return delays[index % 3]!
}
</script>

<style scoped>
/* —— 页面骨架 —— */
.p3d {
  position: relative;
  min-height: 100vh;
  overflow-x: clip;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

.p3d-main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: calc(var(--space) * 2);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 0 var(--gap) calc(var(--space) * 1.2);
}

.sec {
  padding-top: calc(var(--space) * 0.6);
  scroll-margin-top: 6.5rem;
}

/* Z 层包裹：reveal 在外层，层级变换在内层，transform 互不覆盖 */
.reveal-wrap {
  min-width: 0;
}

.z-item {
  height: 100%;
}

/* 键盘可见焦点（风格内统一焦点环） */
.p3d :focus-visible {
  outline: 2px solid var(--c-accent-2);
  outline-offset: 3px;
  border-radius: 6px;
}

/* ============ ① 英雄区 ============ */
.hero {
  display: grid;
  align-items: center;
  gap: var(--space);
  min-height: clamp(540px, 88vh, 860px);
  padding-top: calc(var(--space) * 0.6);
  grid-template-columns: minmax(0, 1fr);
  scroll-margin-top: 0;
}

.hero-copy {
  max-width: 60rem;
}

.hero-eyebrow {
  display: inline-block;
  margin: 0 0 14px;
  padding: 5px 16px;
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
  color: var(--c-accent);
  background: color-mix(in srgb, var(--c-accent) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-accent) 36%, transparent);
  border-radius: 999px;
  box-shadow: inset 0 1px 2px rgb(255 255 255 / 0.18);
}

/* 名字：渐变文字（大到不合理的海报标题） */
.hero-name {
  margin: 0 0 14px;
  font-family: var(--font-head);
  font-size: clamp(46px, 8.4vw, 92px);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: 0.01em;
  background: linear-gradient(118deg, #ede9fe 8%, #a78bfa 46%, #67e8f9 92%);
  background-clip: text;
  color: transparent;
  overflow-wrap: break-word;
}

.hero-tagline {
  margin: 0 0 10px;
  padding-left: 14px;
  font-size: clamp(17px, 2.2vw, 21px);
  font-weight: 600;
  color: var(--c-accent-2);
  border-left: 3px solid var(--c-accent-2);
}

.hero-desc {
  max-width: 56ch;
  margin: 0;
  color: var(--c-muted);
}

/* CTA：糖果实心 + 幽灵胶囊 */
.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: var(--space);
}

.cta {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 10px 24px;
  font-size: var(--fs-base);
  font-weight: 700;
  text-decoration: none;
  border-radius: 999px;
  transition: transform var(--transition), box-shadow var(--transition), background var(--transition),
    color var(--transition), border-color var(--transition), filter var(--transition);
}

.cta-solid {
  color: var(--c-on-accent);
  background: linear-gradient(135deg, #7c3aed, #db2777);
  border: var(--border-w) solid rgb(255 255 255 / 0.28);
  box-shadow:
    0 14px 26px rgb(124 58 237 / 0.42),
    inset 0 1px 4px rgb(255 255 255 / 0.38);
}

.cta-solid:hover {
  transform: translateY(-3px);
  filter: brightness(1.08);
  box-shadow:
    0 20px 34px rgb(124 58 237 / 0.52),
    inset 0 1px 4px rgb(255 255 255 / 0.38);
}

.cta-solid:active {
  transform: var(--press-transform);
}

.cta-ghost {
  color: var(--c-text);
  background: color-mix(in srgb, var(--c-surface) 82%, transparent);
  border: var(--border-w) solid var(--c-border);
  box-shadow: var(--shadow);
}

.cta-ghost:hover {
  transform: translateY(-3px);
  color: var(--c-accent);
  border-color: color-mix(in srgb, var(--c-accent) 52%, transparent);
}

.cta-ghost:active {
  transform: var(--press-transform);
}

/* —— 球体群场景 —— */
.hero-scene {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 340px;
}

/* 卫星物体：绝对定位在主球四周，各占一层 */
.sat {
  position: absolute;
  z-index: 2;
}

.sat-1 {
  top: 4%;
  left: 6%;
}

.sat-2 {
  right: 8%;
  bottom: 22%;
}

.sat-3 {
  top: 18%;
  right: 14%;
}

/* 立方小物体：圆角方块受光体，与球体拉开几何差异 */
.scene-cube {
  position: absolute;
  bottom: 8%;
  left: 12%;
  z-index: 2;
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border-radius: 16px;
  box-shadow:
    inset 0 2px 5px rgb(255 255 255 / 0.4),
    inset 0 -8px 14px rgb(9 5 40 / 0.5),
    0 16px 28px rgb(99 102 241 / 0.4);
  transform: rotate(14deg);
  animation: cube-float 6.2s ease-in-out 1s infinite;
}

@keyframes cube-float {
  0%,
  100% {
    transform: rotate(14deg) translateY(0);
  }

  50% {
    transform: rotate(9deg) translateY(-10px);
  }
}

/* 主球：场景核心 */
.hero-core {
  position: relative;
  z-index: 1;
}

/* 地面接触影：物体「摆在」空间里的落点 */
.hero-floor {
  position: absolute;
  bottom: -6px;
  left: 50%;
  width: 58%;
  height: 34px;
  background: radial-gradient(ellipse, rgb(5 3 20 / 0.6), rgb(5 3 20 / 0) 70%);
  filter: blur(7px);
  transform: translateX(-50%);
}

/* ============ ③ 项目网格：三列 Z 层 ============ */
.proj-grid {
  display: grid;
  gap: calc(var(--gap) + 8px);
  margin-top: calc(var(--space) * 1.1);
  grid-template-columns: 1fr;
}

/* 桌面端：近 / 中 / 远三档层级——近层上浮放大 + 影更沉 */
@media (min-width: 900px) {
  .proj-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .z-item.z-near {
    transform: translateY(-18px) scale(1.02);
  }

  .z-item.z-mid {
    transform: translateY(0);
  }

  .z-item.z-far {
    transform: translateY(16px) scale(0.97);
  }
}

/* ============ ④ 文章网格：双列错落 ============ */
.post-grid {
  display: grid;
  gap: calc(var(--gap) + 4px);
  margin-top: calc(var(--space) * 1.1);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .post-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* 偶数列上浮半层，形成漂浮交错 */
  .z-item.z-post-raised {
    transform: translateY(-14px);
  }
}

/* —— 区块尾部「查看全部」 —— */
.sec-foot {
  display: flex;
  justify-content: center;
  margin-top: var(--space);
}

.more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 26px;
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-text);
  text-decoration: none;
  background: color-mix(in srgb, var(--c-surface) 82%, transparent);
  border: var(--border-w) solid var(--c-border);
  border-radius: 999px;
  box-shadow: var(--shadow);
  transition: transform var(--transition), box-shadow var(--transition), color var(--transition),
    border-color var(--transition);
}

.more:hover {
  transform: translateY(-3px);
  color: var(--c-accent);
  border-color: color-mix(in srgb, var(--c-accent) 52%, transparent);
}

.more:active {
  transform: var(--press-transform);
}

.more-arrow {
  transition: transform var(--transition);
}

.more:hover .more-arrow {
  transform: translateX(4px);
}

/* ============ ⑤ 联系舱网格 ============ */
.contact-grid {
  display: grid;
  gap: var(--gap);
  margin-top: calc(var(--space) * 1.1);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

/* ============ 回顶浮球 ============ */
.top-orb {
  position: fixed;
  right: calc(18px + env(safe-area-inset-right));
  bottom: calc(18px + env(safe-area-inset-bottom));
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: radial-gradient(circle at 32% 26%, #e9d5ff 0%, #a78bfa 38%, #7c3aed 72%, #3f2d8f 100%);
  border: var(--border-w) solid rgb(255 255 255 / 0.3);
  border-radius: 50%;
  box-shadow:
    inset -6px -9px 14px rgb(9 5 40 / 0.5),
    inset 2px 3px 6px rgb(255 255 255 / 0.4),
    0 14px 26px rgb(139 92 246 / 0.45);
  transition: transform var(--transition), box-shadow var(--transition);
}

.top-orb:hover {
  transform: translateY(-4px);
  box-shadow:
    inset -6px -9px 14px rgb(9 5 40 / 0.5),
    inset 2px 3px 6px rgb(255 255 255 / 0.4),
    0 20px 34px rgb(139 92 246 / 0.55);
}

.top-orb:active {
  transform: var(--press-transform);
}

.top-orb-arrow {
  font-size: 20px;
  font-weight: 700;
  color: var(--c-on-accent);
}

/* ============ 窄屏回退：收布局不收设计 ============ */
@media (max-width: 1023px) {
  .hero {
    min-height: auto;
    padding-top: var(--space);
  }

  .hero-scene {
    order: 2;
    min-height: 300px;
  }
}

@media (max-width: 640px) {
  .p3d-main {
    padding: 0 14px calc(var(--space));
    gap: calc(var(--space) * 1.4);
  }

  /* 场景整体缩放，卫星收拢，主球仍是视觉核心 */
  .hero-scene {
    transform: scale(0.72);
    transform-origin: center;
    margin: -30px 0;
  }

  .hero-name {
    font-size: clamp(40px, 12vw, 56px);
  }

  /* 透视倾斜收敛为普通上浮（性能与稳定性优先） */
  .sec {
    scroll-margin-top: 7rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta,
  .more,
  .more-arrow,
  .top-orb,
  .hero-scene,
  .z-item {
    transition: none;
  }

  .cta-solid:hover,
  .cta-ghost:hover,
  .more:hover,
  .top-orb:hover {
    transform: none;
  }

  .cta-solid:active,
  .cta-ghost:active,
  .more:active,
  .top-orb:active {
    transform: none;
  }

  .scene-cube {
    animation: none;
  }
}
</style>
