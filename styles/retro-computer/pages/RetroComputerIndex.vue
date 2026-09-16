<!--
  RetroComputerIndex - 复古电脑（retro-computer）风格的完整首页
  ------------------------------------------------------------
  「一站多风格」架构中 retro-computer 风格的交付页面。
  桌面隐喻：整页就是一台 1990 年代电脑的屏幕——
  - 顶部固定菜单条（站点标识 + 页内锚点菜单 + 风格画廊入口 + 系统时钟）
  - 桌面区域（经典青绿底 + 低分辨率点阵纹理）上摆放多个「窗口」：
    欢迎窗口（h1 主标题 + 两个 95 式按钮）/ 关于窗口（经历 + 技能）/
    项目窗口（精选项目）/ 文章窗口（最新文章）/ 联系窗口（社交信息）
  - 底部固定任务栏（页脚：开始按钮 + 各窗口任务按钮 + 系统托盘）
  - CRT 覆盖层：扫描线 + 暗角（pointer-events: none，不挡交互），
    扫描亮带动画在 prefers-reduced-motion 下关闭（静态纹理保留）

  排版轴：12 列桌面网格，窗口宽窄悬殊（7:5 / 5:7 交替）且上下
  错位摆放，与滚动文档式布局根本不同；窄屏窗口纵向堆叠满宽，
  回退的是「布局」不是「设计」（立体边框、扫描线全部保留）。

  数据全部来自共享层 composables（useAppInfo / useProjects /
  useBlog），异步数据在 onMounted 获取（SSG 安全：服务端与客户端
  首帧一致渲染加载态），失败回退空列表并用 Array.isArray 防御；
  文案全部走 i18n；滚动进入动画复用共享层 useScrollReveal。
-->
<template>
  <div id="top" class="rc-desktop">
    <RetroComputerMenuBar />

    <main class="rc-screen">
      <div class="rc-screen__inner">
        <!-- ============ 欢迎窗口：程序名 - 首页 ============ -->
        <RetroComputerWindow
          window-id="win-home"
          :title="homeTitle"
          :heading-level="1"
          icon="floppy"
          :active="activeWindow === 'win-home'"
          :status-text="t('footer.builtWith')"
          class="rc-pos-home scroll-reveal"
          @activate="activate('win-home')"
        >
          <div class="rc-hero">
            <p class="rc-hero__greeting">{{ t('home.greeting') }}</p>
            <p class="rc-hero__name">{{ t('home.name') }}</p>
            <p class="rc-hero__tagline">{{ t('home.tagline') }}</p>
            <p class="rc-hero__desc">{{ t('home.description') }}</p>
            <div class="rc-hero__actions">
              <RetroComputerPushButton href="#win-blog">
                {{ t('home.viewBlog') }}
              </RetroComputerPushButton>
              <RetroComputerPushButton href="#win-projects">
                {{ t('home.viewProjects') }}
              </RetroComputerPushButton>
            </div>
          </div>
        </RetroComputerWindow>

        <!-- ============ 关于窗口：经历 + 技能 ============ -->
        <RetroComputerWindow
          window-id="win-about"
          :title="t('about.title')"
          icon="user"
          :active="activeWindow === 'win-about'"
          class="rc-pos-about scroll-reveal"
          @activate="activate('win-about')"
        >
          <p class="rc-about__intro">{{ t('about.description') }}</p>

          <h3 class="rc-sub">{{ t('about.experience') }}</h3>
          <ol class="rc-timeline">
            <li v-for="item in safeTimeline" :key="item.period" class="rc-timeline__item">
              <p class="rc-timeline__head">
                <span class="rc-timeline__period">{{ item.period }}</span>
                <span class="rc-timeline__title">{{ item.title }} · {{ item.organization }}</span>
              </p>
              <p class="rc-timeline__desc">{{ item.description }}</p>
            </li>
          </ol>

          <h3 class="rc-sub">{{ t('about.skills') }}</h3>
          <div class="rc-skills">
            <div v-for="group in safeSkillGroups" :key="group.category" class="rc-skills__group">
              <h4 class="rc-skills__label">{{ group.category }}</h4>
              <ul class="rc-skills__well">
                <li v-for="skill in safeSkillList(group)" :key="skill" class="rc-skills__item">
                  {{ skill }}
                </li>
              </ul>
            </div>
          </div>
        </RetroComputerWindow>

        <!-- ============ 项目窗口：精选项目 ============ -->
        <RetroComputerWindow
          window-id="win-projects"
          :title="t('home.featuredProjects')"
          icon="folder"
          :active="activeWindow === 'win-projects'"
          :status-text="t('projects.description')"
          class="rc-pos-projects scroll-reveal"
          @activate="activate('win-projects')"
        >
          <div v-if="projectsLoading" class="rc-loading" role="status">
            <span class="rc-loading__blocks" aria-hidden="true"><i/><i/><i/></span>
            <span>{{ t('common.loading') }}</span>
          </div>
          <p v-else-if="!safeProjects.length" class="rc-empty">
            <RetroComputerPixelIcon variant="folder" />
            <span>{{ t('projects.noResults') }}</span>
          </p>
          <template v-else>
            <RetroComputerProjectItem
              v-for="project in safeProjects"
              :key="project.path"
              :project="project"
            />
          </template>
        </RetroComputerWindow>

        <!-- ============ 文章窗口：最新文章 ============ -->
        <RetroComputerWindow
          window-id="win-blog"
          :title="t('home.latestPosts')"
          icon="doc"
          :active="activeWindow === 'win-blog'"
          :status-text="t('blog.description')"
          class="rc-pos-blog scroll-reveal"
          @activate="activate('win-blog')"
        >
          <div v-if="postsLoading" class="rc-loading" role="status">
            <span class="rc-loading__blocks" aria-hidden="true"><i/><i/><i/></span>
            <span>{{ t('common.loading') }}</span>
          </div>
          <p v-else-if="!safePosts.length" class="rc-empty">
            <RetroComputerPixelIcon variant="doc" />
            <span>{{ t('blog.noResults') }}</span>
          </p>
          <template v-else>
            <RetroComputerPostItem v-for="post in safePosts" :key="post.path" :post="post" />
          </template>
        </RetroComputerWindow>

        <!-- ============ 联系窗口：社交信息（不复用过渡层 ContactForm）============ -->
        <RetroComputerWindow
          window-id="win-contact"
          :title="t('contact.title')"
          icon="mail"
          :active="activeWindow === 'win-contact'"
          class="rc-pos-contact scroll-reveal"
          @activate="activate('win-contact')"
        >
          <p class="rc-contact__intro">{{ t('contact.description') }}</p>

          <h3 class="rc-sub">{{ t('contact.socialLinks') }}</h3>
          <ul class="rc-contact__list">
            <li v-for="link in safeSocialLinks" :key="link.name">
              <a
                v-if="link.url"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="rc-contact__row rc-contact__row--link"
              >
                <RetroComputerPixelIcon variant="floppy" />
                <span class="rc-contact__name">{{ link.name }}</span>
                <span class="rc-contact__value">{{ hostOf(link.url) }}</span>
              </a>
              <div v-else class="rc-contact__row">
                <RetroComputerPixelIcon variant="mail" />
                <span class="rc-contact__name">{{ link.name }}</span>
                <span v-if="link.value" class="rc-contact__value">
                  <span class="rc-contact__value-label">{{ t('contact.wechatId') }}</span>
                  {{ link.value }}
                </span>
              </div>
            </li>
          </ul>
        </RetroComputerWindow>
      </div>
    </main>

    <RetroComputerTaskbar :windows="taskbarWindows" :active-id="activeWindow" />

    <!-- CRT 覆盖层：扫描线 + 暗角 + 扫描亮带（纯装饰） -->
    <div class="rc-crt" aria-hidden="true"/>
  </div>
</template>

<script setup lang="ts">
/**
 * @file 复古电脑风格首页
 * @description 页面结构完全由本风格自定义；数据/i18n/滚动动画全部走共享层。
 *              窗口激活（点击/聚焦置顶）是本风格的表现层交互，由页面统一
 *              管理 activeWindow 状态；无全局监听器，无需额外清理
 *              （菜单条时钟的定时器在其组件内部成对清理）。
 */
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import type { SkillGroup } from '~/types/site'
import type { RetroTaskbarWindow } from '../components/RetroComputerTaskbar.vue'
import RetroComputerMenuBar from '../components/RetroComputerMenuBar.vue'
import RetroComputerPixelIcon from '../components/RetroComputerPixelIcon.vue'
import RetroComputerPostItem from '../components/RetroComputerPostItem.vue'
import RetroComputerProjectItem from '../components/RetroComputerProjectItem.vue'
import RetroComputerPushButton from '../components/RetroComputerPushButton.vue'
import RetroComputerTaskbar from '../components/RetroComputerTaskbar.vue'
import RetroComputerWindow from '../components/RetroComputerWindow.vue'

const { t } = useI18n()

// —— 共享业务层：站点信息 / 项目 / 博客 / 滚动动画 ——
const { skillGroups, timeline, socialLinks } = useAppInfo()
const { getFeaturedProjects } = useProjects()
const { getFeaturedPosts } = useBlog()
useScrollReveal()

// —— 异步数据状态（首帧与 SSG 输出一致：加载态）——
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
    console.error('RetroComputer：获取精选项目失败', error)
    projects.value = []
  } finally {
    projectsLoading.value = false
  }

  // 最新文章
  try {
    const featuredPosts = await getFeaturedPosts(3)
    posts.value = Array.isArray(featuredPosts) ? featuredPosts : []
  } catch (error) {
    console.error('RetroComputer：获取最新文章失败', error)
    posts.value = []
  } finally {
    postsLoading.value = false
  }
})

// —— 防御：数组字段非数组时回退为空列表 ——
const safeProjects = computed(() => (Array.isArray(projects.value) ? projects.value : []))
const safePosts = computed(() => (Array.isArray(posts.value) ? posts.value : []))
const safeSkillGroups = computed(() => (Array.isArray(skillGroups.value) ? skillGroups.value : []))
const safeTimeline = computed(() => (Array.isArray(timeline.value) ? timeline.value : []))
const safeSocialLinks = computed(() => (Array.isArray(socialLinks.value) ? socialLinks.value : []))

/** 防御：技能列表非数组时回退为空列表 */
function safeSkillList(group: SkillGroup): string[] {
  return Array.isArray(group.skills) ? group.skills : []
}

/** 外链域名展示（纯字符串解析，SSR 安全）；解析失败回退空串 */
function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return ''
  }
}

// —— 窗口激活状态（本风格表现层交互：点击/聚焦即激活置顶）——
const activeWindow = ref('win-home')

/** 激活指定窗口（点击窗口任意处 / 聚焦标题按钮时触发） */
function activate(id: string) {
  activeWindow.value = id
}

/** 欢迎窗口标题：程序名 - 位置 的经典窗口标题拼法 */
const homeTitle = computed(() => `${t('home.name')} - ${t('nav.home')}`)

/** 任务栏窗口清单（锚点 id + 标题文案 + 像素图标） */
const taskbarWindows = computed<RetroTaskbarWindow[]>(() => [
  { id: 'win-home', label: t('nav.home'), icon: 'floppy' },
  { id: 'win-about', label: t('about.title'), icon: 'user' },
  { id: 'win-projects', label: t('home.featuredProjects'), icon: 'folder' },
  { id: 'win-blog', label: t('home.latestPosts'), icon: 'doc' },
  { id: 'win-contact', label: t('contact.title'), icon: 'mail' },
])
</script>

<style scoped>
/* ============ 桌面：青绿底 + 2px 棋盘点阵（低分辨率抖动纹理）============ */
.rc-desktop {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--c-bg);
  background-image: conic-gradient(
    rgb(255 255 255 / 0.05) 25%,
    transparent 0 50%,
    rgb(255 255 255 / 0.05) 0 75%,
    transparent 0
  );
  background-size: 4px 4px;
}

/* —— 屏幕区域：为固定菜单条 / 任务栏让位（含刘海安全区）—— */
.rc-screen {
  flex: 1;
  width: 100%;
  padding: calc(56px + env(safe-area-inset-top, 0px)) var(--space)
    calc(64px + env(safe-area-inset-bottom, 0px));
}

.rc-screen__inner {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: calc(var(--gap) * 1.5);
  align-items: start;
  max-width: var(--page-w);
  margin: 0 auto;
}

/* ============ 窗口摆放：宽窄悬殊 + 上下错位（窗口随手搁在桌面上）============ */
.rc-pos-home {
  grid-column: 1 / -1;
}

.rc-pos-about {
  grid-column: 1 / 8;
}

.rc-pos-projects {
  grid-column: 8 / -1;
  margin-top: var(--space);
}

.rc-pos-blog {
  grid-column: 1 / 6;
}

.rc-pos-contact {
  grid-column: 6 / -1;
  margin-top: var(--space);
}

/* 窄屏：窗口纵向堆叠满宽（只回退布局，不回退设计） */
@media (max-width: 879px) {
  .rc-pos-about,
  .rc-pos-projects,
  .rc-pos-blog,
  .rc-pos-contact {
    grid-column: 1 / -1;
    margin-top: 0;
  }
}

/* ============ 欢迎窗口 ============ */
.rc-hero {
  padding: 4px 0;
}

.rc-hero__greeting {
  margin: 0;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: var(--fs-base);
}

/* 主标题：大到不合理的像素块字 + 硬边深蓝投影 */
.rc-hero__name {
  margin: 8px 0 0;
  overflow-wrap: anywhere;
  color: var(--c-text);
  font-family: var(--font-head);
  font-size: clamp(32px, 7vw, var(--fs-head));
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-shadow: 3px 3px 0 rgb(0 0 128 / 0.25);
}

.rc-hero__tagline {
  margin: 14px 0 0;
  padding-left: 10px;
  border-left: 4px solid var(--c-accent);
  font-weight: 700;
}

.rc-hero__desc {
  margin: 10px 0 0;
  color: var(--c-muted);
}

.rc-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

/* ============ 窗口内容通用 ============ */
.rc-about__intro,
.rc-contact__intro {
  margin: 0 0 14px;
}

/* 小节标题：深蓝下划线（像菜单分组线） */
.rc-sub {
  margin: 18px 0 10px;
  padding-bottom: 4px;
  border-bottom: 2px solid var(--c-accent);
  font-family: var(--font-head);
  font-size: var(--fs-title);
}

/* ============ 关于窗口：经历时间线 ============ */
.rc-timeline {
  margin: 0;
  padding: 0;
  list-style: none;
}

.rc-timeline__item {
  padding: 10px 12px;
  box-shadow: inset 3px 0 0 0 var(--c-accent);
}

.rc-timeline__item:hover {
  background: #d4d4d4;
}

.rc-timeline__item + .rc-timeline__item {
  margin-top: 6px;
}

.rc-timeline__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.rc-timeline__period {
  padding: 2px 8px;
  background: var(--c-accent);
  color: var(--c-on-accent);
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  white-space: nowrap;
}

.rc-timeline__title {
  font-weight: 700;
}

.rc-timeline__desc {
  margin: 6px 0 0;
  color: var(--c-muted);
}

/* ============ 关于窗口：技能（白色凹陷槽，像文本输入框）============ */
.rc-skills {
  display: grid;
  gap: 12px;
}

.rc-skills__label {
  margin: 0 0 6px;
  font-family: var(--font-head);
  font-size: var(--fs-base);
}

.rc-skills__well {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 8px 10px;
  background: #ffffff;
  border: var(--border-w) solid;
  border-color: var(--c-border) #ffffff #ffffff var(--c-border);
  box-shadow: inset 1px 1px 0 0 #0a0a0a;
  list-style: none;
}

.rc-skills__item {
  color: var(--c-text);
  font-family: var(--font-mono);
  font-size: var(--fs-small);
}

/* ============ 加载态 / 空状态 ============ */
.rc-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  color: var(--c-muted);
}

.rc-loading__blocks {
  display: inline-flex;
  gap: 4px;
}

/* 三格闪烁的加载块（steps 硬切，符合无过渡的性格） */
.rc-loading__blocks i {
  width: 10px;
  height: 10px;
  background: var(--c-accent);
  animation: rc-blink 900ms steps(1, end) infinite;
}

.rc-loading__blocks i:nth-child(2) {
  animation-delay: 150ms;
}

.rc-loading__blocks i:nth-child(3) {
  animation-delay: 300ms;
}

@keyframes rc-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.15;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rc-loading__blocks i {
    animation: none;
  }
}

.rc-empty {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 16px;
  background: #ffffff;
  border: var(--border-w) solid;
  border-color: var(--c-border) #ffffff #ffffff var(--c-border);
  box-shadow: inset 1px 1px 0 0 #0a0a0a;
  color: var(--c-muted);
}

/* ============ 联系窗口：社交信息行 ============ */
.rc-contact__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.rc-contact__list li + li {
  margin-top: 6px;
}

.rc-contact__row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 8px 12px;
  border: var(--border-w) solid transparent;
  color: var(--c-text);
}

/* 外链行：悬停深蓝反白（瞬时切换） */
.rc-contact__row--link {
  cursor: pointer;
  text-decoration: none;
}

.rc-contact__row--link:hover {
  background: var(--c-accent);
  border-color: #dfdfdf #0a0a0a #0a0a0a #dfdfdf;
  color: var(--c-on-accent);
}

.rc-contact__row--link:focus-visible {
  outline: 2px dotted var(--c-text);
  outline-offset: -3px;
}

.rc-contact__name {
  flex: none;
  font-weight: 700;
}

.rc-contact__value {
  margin-left: auto;
  overflow-wrap: anywhere;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  text-align: right;
}

.rc-contact__value-label {
  margin-right: 6px;
  color: var(--c-muted);
}

.rc-contact__row--link:hover .rc-contact__value-label {
  color: var(--c-on-accent);
}

/* ============ CRT 覆盖层：扫描线 + 暗角 + 扫描亮带 ============ */
.rc-crt {
  position: fixed;
  inset: 0;
  z-index: 90;
  pointer-events: none;
  background:
    repeating-linear-gradient(0deg, rgb(0 0 0 / 0.12) 0 1px, transparent 1px 3px),
    radial-gradient(120% 90% at 50% 50%, transparent 62%, rgb(0 0 0 / 0.24) 100%);
}

/* 扫描亮带：缓慢下移，pointer-events none，不挡交互 */
.rc-crt::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 18%;
  background: linear-gradient(180deg, transparent, rgb(255 255 255 / 0.06), transparent);
  animation: rc-sweep 8s linear infinite;
}

@keyframes rc-sweep {
  from {
    transform: translateY(-40vh);
  }

  to {
    transform: translateY(120vh);
  }
}

/* reduced-motion：关闭扫描亮带动画（静态扫描线纹理保留） */
@media (prefers-reduced-motion: reduce) {
  .rc-crt::after {
    display: none;
  }
}
</style>
