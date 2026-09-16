<!--
  TerminalIndex - terminal 风格完整首页（/style/terminal/）
  ------------------------------------------------------------
  把整页做成一台终端（排版轴：命令行文本流，全站唯一）：
  · 顶部：跳转导航（跳转链接平时移出视线、Tab 聚焦时滑入——
    命令输入不可用时的无障碍降级通道）+ 状态条
  · 主体：终端（开机横幅 + 打字机问候 + 命令输入行 + 输出区），
    整页黑底绿字，CRT 扫描线为纯 CSS 装饰（--deco）
  · 页尾：隐藏降级区（sr-only 锚点区块，SSG 预渲染即含全部
    内容，与命令输出复用同一批区块组件）+ 页脚状态行
  数据全部来自共享层 composables（useAsyncData 承载，SSG 预渲染
  即含真实内容）；内容文案全部走 i18n / 共享层，终端操作指引类
  风味文案集中在 ../copy.ts（建议迁入 i18n 的 key 见交付报告）。
-->
<template>
  <div id="top" class="page">
    <!-- 无障碍降级：跳转链接（聚焦时滑入，无需命令输入） -->
    <nav class="skip-nav">
      <p class="skip-hint" aria-hidden="true">{{ copy.skipHint }}</p>
      <a v-for="item in skipLinks" :key="item.id" class="skip-link" :href="`#sec-${item.id}`">
        {{ item.label }}
      </a>
    </nav>

    <TerminalStatusBar />

    <main class="term">
      <h1 class="sr-only">{{ t('home.name') }} — {{ t('home.tagline') }}</h1>

      <!-- 异步数据加载态（await useAsyncData 后通常已就绪，防御分支） -->
      <p v-if="loading" class="loading" role="status">{{ t('common.loading') }}</p>

      <TerminalConsole :posts="latestPosts" :projects="featuredProjects" />
    </main>

    <!-- 隐藏降级区：命令输入不可用时经页首跳转链接直达（焦点可落） -->
    <section id="sec-about" class="sr-only" data-section="about" tabindex="-1">
      <h2>{{ t('about.title') }}</h2>
      <TerminalBlockAbout />
    </section>

    <section id="sec-skills" class="sr-only" data-section="skills" tabindex="-1">
      <h2>{{ t('about.skills') }}</h2>
      <TerminalBlockSkills />
    </section>

    <section id="sec-works" class="sr-only" data-section="works" tabindex="-1">
      <h2>{{ t('home.featuredProjects') }}</h2>
      <TerminalBlockWorks :projects="featuredProjects" />
    </section>

    <section id="sec-blog" class="sr-only" data-section="blog" tabindex="-1">
      <h2>{{ t('home.latestPosts') }}</h2>
      <TerminalBlockBlog :posts="latestPosts" />
    </section>

    <section id="sec-contact" class="sr-only" data-section="contact" tabindex="-1">
      <h2>{{ t('contact.title') }}</h2>
      <TerminalBlockContact />
    </section>

    <TerminalFooter />
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import TerminalStatusBar from '../components/TerminalStatusBar.vue'
import TerminalConsole from '../components/TerminalConsole.vue'
import TerminalFooter from '../components/TerminalFooter.vue'
import TerminalBlockAbout from '../components/TerminalBlockAbout.vue'
import TerminalBlockSkills from '../components/TerminalBlockSkills.vue'
import TerminalBlockWorks from '../components/TerminalBlockWorks.vue'
import TerminalBlockBlog from '../components/TerminalBlockBlog.vue'
import TerminalBlockContact from '../components/TerminalBlockContact.vue'
import { pickTerminalCopy } from '../copy'

/** 最新文章展示条数 */
const POST_COUNT = 4
/** 精选项目展示条数 */
const PROJECT_COUNT = 4

const { t, locale } = useI18n()
/** 终端风味文案（随语言响应式切换；字典本身为纯 TS 模块） */
const copy = computed(() => pickTerminalCopy(locale.value))

// —— 共享层数据（组件不直接调用 content API） ——
const { getAllPosts } = useBlog()
const { getFeaturedProjects } = useProjects()

// 文章列表（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('terminal-posts', async () => {
  const list = await getAllPosts()
  return Array.isArray(list) ? list.slice(0, POST_COUNT) : []
})

// 精选项目
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('terminal-projects', async () => {
  const list = await getFeaturedProjects(PROJECT_COUNT)
  return Array.isArray(list) ? list : []
})

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshPosts()
  refreshProjects()
})

// —— 数据防御与视图推导（同步计算，SSR 安全） ——
const latestPosts = computed<BlogPost[]>(() =>
  Array.isArray(postsData.value) ? postsData.value : [],
)
const featuredProjects = computed<Project[]>(() =>
  Array.isArray(projectsData.value) ? projectsData.value : [],
)

/** 加载态：仅在尚无任何数据时显示占位 */
const loading = computed(
  () => (postsPending.value && !postsData.value) || (projectsPending.value && !projectsData.value),
)

/** 跳转链接清单（锚点对应页尾隐藏降级区；label 全部走已有 i18n key） */
const skipLinks = computed(() => [
  { id: 'about', label: t('nav.about') },
  { id: 'skills', label: t('about.skills') },
  { id: 'works', label: t('nav.projects') },
  { id: 'blog', label: t('nav.blog') },
  { id: 'contact', label: t('nav.contact') },
])
</script>

<style scoped>
/* —— 页面根：黑底磷光屏 + 关闭海拔的终端世界 —— */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background:
    radial-gradient(
      ellipse 120% 60% at 50% -10%,
      color-mix(in srgb, var(--c-accent) 7%, transparent),
      transparent 60%
    ),
    var(--c-bg);
}

/* CRT 扫描线覆盖层（--deco，纯装饰不可交互；置于跳转导航之下） */
.page::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  background: var(--deco);
}

/* 文本选区：磷光绿反色（风格签名） */
.page ::selection {
  background: var(--c-accent);
  color: var(--c-on-accent);
}

/* —— 跳转导航：平时移出视线，Tab 聚焦时整条滑入（降级通道） —— */
.skip-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 8px var(--space);
  background: var(--c-bg);
  border-bottom: var(--border-w) solid var(--c-border);
  transform: translateY(-110%);
  transition: transform var(--transition);
}

.skip-nav:focus-within {
  transform: translateY(0);
}

.skip-hint {
  margin: 0;
  flex: 1 1 100%;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.skip-link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 12px;
  font-size: var(--fs-small);
  color: var(--c-on-accent);
  background: var(--c-accent-2);
  border: var(--border-w) solid var(--c-accent-2);
  text-decoration: none;
}

.skip-link::before {
  content: '-> ';
  color: var(--c-on-accent);
}

.skip-link:hover {
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.skip-link:active {
  transform: var(--press-transform);
}

.skip-link:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* —— 终端主体：占满剩余视口，输出区内部滚动 —— */
.term {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: var(--space);
  min-height: 0;
}

.loading {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* —— 屏幕阅读器专用（隐藏降级区与 sr-only 标题） —— */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* —— 动效降级：滑入动画关闭（保持可聚焦可达） —— */
@media (prefers-reduced-motion: reduce) {
  .skip-nav {
    transition: none;
  }
}
</style>
