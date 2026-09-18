<!--
  PixelIndex - pixel 风格完整首页（/style/pixel/）
  ------------------------------------------------------------
  把个人网站做成一台老游戏机的状态界面（排版轴：老游戏分栏）：
  · 游戏菜单条（HUD 导航 + 风格画廊入口）
  · 角色栏英雄区（纯 CSS box-shadow 绘制的 8-bit 外星人头像，
    hover 切换动画帧 + 色块反转）
  · ABOUT 对话框（全宽）：简介 + 经历时间线
  · STATUS 技能字符条（左 5 栏）× INVENTORY 精选项目物品栏
    （右 7 栏）——尺寸悬殊的老游戏左右分栏
  · QUEST LOG 最新文章日志行（全宽）
  · CONTACT 存档情报键值行（偏左收窄，右侧留白呼吸）
  数据全部来自共享层 composables（useAsyncData 承载，SSG 预渲染
  即含真实内容）；文案全部走 i18n；扫描线与像素网格为纯 CSS 装饰。
-->
<template>
  <div id="top" class="page">
    <PixelHudBar :sections="sections" />

    <main class="screen">
      <!-- ① 角色栏英雄区（col-full：桌面 grid 模式下跨满 12 栏） -->
      <section class="hero col-full" data-section="hero">
        <div class="hero-portrait">
          <span class="sprite" aria-hidden="true" />
        </div>
        <div class="hero-id">
          <p class="hero-greeting">{{ t('home.greeting') }}</p>
          <h1 class="hero-name">{{ t('home.name') }}</h1>
          <p class="hero-tagline">{{ t('home.tagline') }}</p>
          <p class="hero-desc">{{ t('home.description') }}</p>
          <div class="hero-actions">
            <a href="#posts" class="hero-btn">{{ t('home.viewBlog') }}</a>
            <a href="#projects" class="hero-btn hero-btn--alt">{{ t('home.viewProjects') }}</a>
          </div>
        </div>
      </section>

      <!-- 加载占位（防御分支：正常情况下 await 后数据已就绪） -->
      <PixelPanel
        v-if="loading"
        class="col-full"
        head="NOW LOADING"
        :title="t('common.loading')"
        role="status"
      >
        <p class="loading-art" aria-hidden="true">
          [ ▓▓▓▓▓▓░░░░ ]<span class="blink">▉</span>
        </p>
      </PixelPanel>

      <template v-else>
        <!-- ② ABOUT 对话框：简介 + 经历时间线（全宽） -->
        <PixelPanel
          id="about"
          data-section="about"
          class="col-full"
          head="ABOUT"
          :title="t('nav.about')"
        >
          <p class="prose">{{ t('about.description') }}</p>
          <ul class="timeline">
            <li v-for="item in timeline" :key="`${item.period}-${item.title}`" class="tl-row">
              <span class="tl-period">{{ item.period }}</span>
              <div class="tl-body">
                <p class="tl-head">
                  {{ item.title }}<span class="tl-org"> @ {{ item.organization }}</span>
                </p>
                <p class="tl-desc">{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </PixelPanel>

        <!-- ③ STATUS（左 5 栏）× INVENTORY（右 7 栏）：老游戏左右分栏 -->
        <PixelPanel
          id="skills"
          data-section="skills"
          class="col-status"
          head="STATUS"
          :title="t('about.skills')"
          :meta="String(skillGroups.length)"
        >
          <PixelSkillBars v-if="skillGroups.length" :groups="skillGroups" />
          <PixelEmpty v-else :message="t('projects.noResults')" />
        </PixelPanel>

        <PixelPanel
          id="projects"
          data-section="projects"
          class="col-inventory"
          head="INVENTORY"
          :title="t('home.featuredProjects')"
          :meta="String(featuredProjects.length)"
        >
          <ul v-if="featuredProjects.length" class="stack">
            <PixelInventoryItem
              v-for="(project, i) in featuredProjects"
              :key="project.path"
              :project="project"
              :index="i"
            />
          </ul>
          <PixelEmpty v-else :message="t('projects.noResults')" />
        </PixelPanel>

        <!-- ④ QUEST LOG：最新文章日志行（全宽） -->
        <PixelPanel
          id="posts"
          data-section="posts"
          class="col-full"
          head="QUEST LOG"
          :title="t('home.latestPosts')"
          :meta="String(latestPosts.length)"
        >
          <ol v-if="latestPosts.length" class="stack">
            <PixelPostRow v-for="post in latestPosts" :key="post.path" :post="post" />
          </ol>
          <PixelEmpty v-else :message="t('blog.noResults')" :hint="t('blog.noResultsHint')" />
        </PixelPanel>

        <!-- ⑤ CONTACT 存档情报：偏左收窄，右侧留白（老游戏分栏呼吸感） -->
        <PixelPanel
          id="contact"
          data-section="contact"
          class="col-contact"
          head="CONTACT"
          :title="t('contact.title')"
        >
          <p class="prose prose--muted">{{ t('contact.description') }}</p>
          <PixelContactList :socials="socialLinks" />
        </PixelPanel>
      </template>
    </main>

    <PixelSiteFooter />
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import PixelHudBar from '../components/PixelHudBar.vue'
import PixelPanel from '../components/PixelPanel.vue'
import PixelSkillBars from '../components/PixelSkillBars.vue'
import PixelInventoryItem from '../components/PixelInventoryItem.vue'
import PixelPostRow from '../components/PixelPostRow.vue'
import PixelContactList from '../components/PixelContactList.vue'
import PixelEmpty from '../components/PixelEmpty.vue'

/** 最新文章展示条数 */
const POST_COUNT = 4
/** 精选项目展示条数 */
const PROJECT_COUNT = 4

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()
const { getFeaturedProjects } = useProjects()
const { skillGroups, timeline, socialLinks } = useAppInfo()

// 文章列表（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('pixel-posts', async () => {
  const list = await getAllPosts()
  return Array.isArray(list) ? list.slice(0, POST_COUNT) : []
})

// 精选项目
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('pixel-projects', async () => {
  const list = await getFeaturedProjects(PROJECT_COUNT)
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshPosts()
  refreshProjects()
})

// —— 数据防御与视图推导（同步计算，SSR 安全） ——
const latestPosts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))
const featuredProjects = computed<Project[]>(() =>
  Array.isArray(projectsData.value) ? projectsData.value : [],
)

/** 加载态：仅在尚无任何数据时显示占位 */
const loading = computed(
  () => (postsPending.value && !postsData.value) || (projectsPending.value && !projectsData.value),
)

// —— HUD 菜单锚点（label 随语言更新） ——
const sections = computed(() => [
  { id: 'about', label: t('nav.about') },
  { id: 'skills', label: t('about.skills') },
  { id: 'projects', label: t('home.featuredProjects') },
  { id: 'posts', label: t('home.latestPosts') },
  { id: 'contact', label: t('nav.contact') },
])
</script>

<style scoped>
/* —— 页面根：像素网格底纹 + 关闭字体抗锯齿 + 扫描线覆盖层 —— */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background-color: var(--c-bg);
  /* 16px 像素网格底纹（低分辨率屏幕感，风格签名装饰） */
  background-image:
    linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px);
  background-size: 16px 16px;
  /* 换性质开关：关掉字体抗锯齿 */
  -webkit-font-smoothing: var(--font-smooth);
}

/* CRT 扫描线覆盖层（--deco，纯装饰不可交互） */
.page::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 60;
  pointer-events: none;
  background: var(--deco);
}

/* —— 游戏屏幕：窄屏单列，≥900px 起 12 栏分栏 —— */
.screen {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space);
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: var(--space);
}

@media (min-width: 900px) {
  .screen {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: var(--space);
  }

  .col-full {
    grid-column: 1 / -1;
  }

  /* 老游戏分栏：STATUS 左 5 栏 / INVENTORY 右 7 栏（尺寸悬殊） */
  .col-status {
    grid-column: 1 / 6;
  }

  .col-inventory {
    grid-column: 6 / -1;
  }

  /* CONTACT 偏左收窄，右侧留白呼吸 */
  .col-contact {
    grid-column: 1 / 9;
  }
}

/* 锚点定位补偿吸顶菜单条 */
[data-section] {
  scroll-margin-top: 6rem;
}

/* —— 角色栏英雄区：面板外壳 + 头像格 + 名字/职业/任务说明 —— */
.hero {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: var(--space);
  padding: calc(var(--space) + 4px);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  box-shadow:
    inset 0 0 0 3px color-mix(in srgb, var(--c-muted) 55%, transparent),
    var(--shadow);
}

.hero-portrait {
  position: relative;
  width: 64px;
  height: 64px;
  background: var(--c-bg);
  border: var(--border-w) solid var(--c-border);
}

/* 8-bit 外星人：4px 网格 × 11×8 的 box-shadow 像素画（待机帧） */
.sprite {
  position: absolute;
  top: 16px;
  left: 10px;
  width: 4px;
  height: 4px;
  color: var(--c-accent);
  box-shadow:
    8px 0,
    32px 0,
    12px 4px,
    28px 4px,
    8px 8px,
    12px 8px,
    16px 8px,
    20px 8px,
    24px 8px,
    28px 8px,
    32px 8px,
    4px 12px,
    8px 12px,
    16px 12px,
    20px 12px,
    24px 12px,
    32px 12px,
    36px 12px,
    0 16px,
    4px 16px,
    8px 16px,
    12px 16px,
    16px 16px,
    20px 16px,
    24px 16px,
    28px 16px,
    32px 16px,
    36px 16px,
    40px 16px,
    0 20px,
    8px 20px,
    12px 20px,
    16px 20px,
    20px 20px,
    24px 20px,
    28px 20px,
    32px 20px,
    40px 20px,
    0 24px,
    8px 24px,
    32px 24px,
    40px 24px,
    12px 28px,
    16px 28px,
    24px 28px,
    28px 28px;
}

/* hover：切换到第二动画帧 + 头像格色块反转（像素风的动画=换帧） */
.hero-portrait:hover {
  background: var(--c-accent);
}

.hero-portrait:hover .sprite {
  color: var(--c-on-accent);
  box-shadow:
    8px 0,
    32px 0,
    0 4px,
    12px 4px,
    28px 4px,
    40px 4px,
    0 8px,
    8px 8px,
    12px 8px,
    16px 8px,
    20px 8px,
    24px 8px,
    28px 8px,
    32px 8px,
    40px 8px,
    0 12px,
    4px 12px,
    8px 12px,
    16px 12px,
    20px 12px,
    24px 12px,
    32px 12px,
    36px 12px,
    40px 12px,
    0 16px,
    4px 16px,
    8px 16px,
    12px 16px,
    16px 16px,
    20px 16px,
    24px 16px,
    28px 16px,
    32px 16px,
    36px 16px,
    40px 16px,
    4px 20px,
    8px 20px,
    12px 20px,
    16px 20px,
    20px 20px,
    24px 20px,
    28px 20px,
    32px 20px,
    36px 20px,
    8px 24px,
    32px 24px,
    4px 28px,
    36px 28px;
}

.hero-id {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.hero-greeting {
  margin: 0;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.16em;
  color: var(--c-accent-2);
  text-shadow: 2px 2px 0 var(--c-border);
}

/* 名字：等宽 + 全大写 + 大号 + 4px 硬偏移文字阴影 */
.hero-name {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(30px, 7vw, 56px);
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.15;
  text-transform: uppercase;
  color: var(--c-text);
  text-shadow: 4px 4px 0 var(--c-border);
  overflow-wrap: break-word;
}

.hero-tagline {
  margin: 0;
  color: var(--c-text);
}

.hero-desc {
  margin: 0;
  max-width: 60ch;
  color: var(--c-muted);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

/* 菜单式 CTA：草绿主按钮 / 描边副按钮，hover 反转为金黄 */
.hero-btn {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 8px 16px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-on-accent);
  background: var(--c-accent-2);
  border: var(--border-w) solid var(--c-border);
  text-decoration: none;
}

.hero-btn--alt {
  color: var(--c-text);
  background: var(--c-bg);
}

.hero-btn:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
}

.hero-btn:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

.hero-btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* —— ABOUT 时间线：存档记录式条目 —— */
.prose {
  margin: 0;
  max-width: 70ch;
}

.prose--muted {
  color: var(--c-muted);
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tl-row {
  display: grid;
  grid-template-columns: minmax(96px, auto) 1fr;
  align-items: start;
  gap: 12px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--c-bg) 55%, var(--c-surface));
  border: 2px solid color-mix(in srgb, var(--c-muted) 40%, transparent);
}

/* 列表项 hover：底色轻微变化（瞬时，无过渡） */
.tl-row:hover {
  background: color-mix(in srgb, var(--c-accent) 14%, var(--c-surface));
  border-color: var(--c-border);
}

.tl-period {
  padding: 2px 8px;
  font-size: var(--fs-small);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--c-on-accent);
  background: var(--c-accent-2);
  border: 2px solid var(--c-border);
}

.tl-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tl-head {
  margin: 0;
  font-weight: 700;
  color: var(--c-text);
}

.tl-org {
  font-weight: 400;
  color: var(--c-muted);
}

.tl-desc {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* —— 物品栏 / 日志行容器 —— */
.stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* —— 加载占位：方块进度 + 步进闪烁光标（唯一保留的动画） —— */
.loading-art {
  margin: 0;
  font-size: var(--fs-small);
  letter-spacing: 0.2em;
  color: var(--c-muted);
}

.blink {
  animation: pixel-blink 0.8s steps(1) infinite;
}

@keyframes pixel-blink {
  50% {
    opacity: 0;
  }
}

/* prefers-reduced-motion：保留的动画一并关闭 */
@media (prefers-reduced-motion: reduce) {
  .blink {
    animation: none;
  }
}
</style>
