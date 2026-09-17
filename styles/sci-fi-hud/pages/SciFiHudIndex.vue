<!--
  SciFiHudIndex - sci-fi-hud 风格首页（/style/sci-fi-hud/）
  ------------------------------------------------------------
  把个人网站呈现为「宇宙飞船驾驶舱控制面板」：
  顶部主控条（站点标识 + 页内锚点 + 风格画廊入口）→
  主视屏（英雄区：目标标注框框住名字 + CTA 原生锚点；
  右舷：雷达模块 + 真实数据读数）→ HUD 面板甲板（非对称
  12 列网格：SEC-01 任务履历 / SEC-02 技能模块 / SEC-03
  项目载荷 / SEC-04 文章数据流 / SEC-05 通讯频道）→
  底部遥测状态条（页脚）。

  数据全部来自共享层 composables（useAsyncData 承载，SSG
  预渲染即含真实内容，语言切换时刷新；数组字段一律
  Array.isArray 防御）；文案全部走 i18n；整页装饰（坐标
  网格 / 扫描线 / 括角 / 刻度）均为纯 CSS 且尊重
  prefers-reduced-motion。滚动入场动画走共享层
  useScrollReveal；页内跳转全部为原生锚点 <a href="#...">。
-->
<template>
  <div class="hud">
    <!-- 全页座舱扫描线（纯装饰，reduced-motion 隐藏） -->
    <div class="scanline" aria-hidden="true"/>

    <SciFiHudTopBar :name="siteConfig.name" :sections="sections"/>

    <main class="main">
      <!-- ① 主视屏：英雄区 + 右舷雷达模块 -->
      <section id="overview" data-section="overview" class="viewport">
        <div class="viewport-left">
          <p class="boot scroll-reveal">
            <span class="boot-dot" aria-hidden="true"/>
            {{ t('home.greeting') }}
            <span class="boot-cursor" aria-hidden="true">▮</span>
          </p>

          <!-- 目标标注框：四角括角 + 编号 + 底部刻度尺 -->
          <div class="tf scroll-reveal scroll-reveal-delay-1">
            <span class="tf-tag" aria-hidden="true">TGT-01</span>
            <h1 class="tf-name">{{ t('home.name') }}</h1>
            <span class="tf-ruler" aria-hidden="true"/>
          </div>

          <p class="tagline scroll-reveal scroll-reveal-delay-2">{{ t('home.tagline') }}</p>
          <p class="desc scroll-reveal scroll-reveal-delay-2">{{ t('home.description') }}</p>

          <div class="cta-row scroll-reveal scroll-reveal-delay-3">
            <a class="cta cta-solid" href="#projects">
              {{ t('home.viewProjects') }}<span class="cta-glyph" aria-hidden="true">▸</span>
            </a>
            <a class="cta" href="#posts">
              {{ t('home.viewBlog') }}<span class="cta-glyph" aria-hidden="true">▸</span>
            </a>
          </div>
        </div>

        <!-- 右舷：雷达 + 真实数据读数 -->
        <aside class="viewport-right scroll-reveal scroll-reveal-delay-2">
          <div class="radar-module">
            <header class="radar-head">
              <span class="radar-label" aria-hidden="true">RADAR</span>
              <span class="radar-dot" aria-hidden="true"/>
            </header>
            <SciFiHudRadar/>
            <dl class="readouts">
              <div class="readout">
                <dt>{{ t('nav.blog') }}</dt>
                <dd>{{ readoutPosts }}</dd>
              </div>
              <div class="readout">
                <dt>{{ t('nav.projects') }}</dt>
                <dd>{{ readoutProjects }}</dd>
              </div>
              <div class="readout">
                <dt>{{ t('about.skills') }}</dt>
                <dd>{{ readoutSkills }}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>

      <!-- ② HUD 面板甲板（非对称 12 列网格） -->
      <div class="deck">
        <!-- SEC-01 任务履历 -->
        <SciFiHudPanel
          id="about"
          data-section="about"
          code="SEC-01"
          :title="t('about.title')"
          :meta="String(timeline.length)"
          class="cell cell-about scroll-reveal scroll-reveal-up"
        >
          <h3 class="sub-head">{{ t('about.experience') }}</h3>
          <SciFiHudMissionLog :items="timeline"/>
        </SciFiHudPanel>

        <!-- SEC-02 技能模块 -->
        <SciFiHudPanel
          id="skills"
          data-section="skills"
          code="SEC-02"
          :title="t('about.skills')"
          :meta="String(readoutSkills)"
          class="cell cell-skills scroll-reveal scroll-reveal-up scroll-reveal-delay-1"
        >
          <SciFiHudSkillGauge :groups="skillGroups"/>
        </SciFiHudPanel>

        <!-- SEC-03 项目载荷 -->
        <SciFiHudPanel
          id="projects"
          data-section="projects"
          code="SEC-03"
          :title="t('home.featuredProjects')"
          :meta="String(featuredProjects.length)"
          class="cell cell-12 scroll-reveal scroll-reveal-up"
        >
          <SciFiHudLoader v-if="projectsLoading"/>
          <div v-else-if="featuredProjects.length" class="payload-grid">
            <SciFiHudProjectCard
              v-for="(project, index) in featuredProjects"
              :key="project.path || index"
              :project="project"
              :index="index"
            />
          </div>
          <SciFiHudEmpty v-else :message="t('projects.noResults')"/>
        </SciFiHudPanel>

        <!-- SEC-04 文章数据流 -->
        <SciFiHudPanel
          id="posts"
          data-section="posts"
          code="SEC-04"
          :title="t('home.latestPosts')"
          :meta="String(latestPosts.length)"
          class="cell cell-posts scroll-reveal scroll-reveal-up"
        >
          <SciFiHudLoader v-if="postsLoading"/>
          <SciFiHudPostStream v-else-if="latestPosts.length" :posts="latestPosts"/>
          <SciFiHudEmpty
            v-else
            :message="t('blog.noResults')"
            :hint="t('blog.noResultsHint')"
          />
        </SciFiHudPanel>

        <!-- SEC-05 通讯频道 -->
        <SciFiHudPanel
          id="contact"
          data-section="contact"
          code="SEC-05"
          :title="t('contact.title')"
          :meta="t('contact.socialLinks')"
          class="cell cell-contact scroll-reveal scroll-reveal-up scroll-reveal-delay-1"
        >
          <p class="contact-desc">{{ t('contact.description') }}</p>
          <SciFiHudContactDeck :socials="socialLinks"/>
        </SciFiHudPanel>
      </div>
    </main>

    <SciFiHudTelemetryBar/>
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import SciFiHudTopBar from '../components/SciFiHudTopBar.vue'
import SciFiHudRadar from '../components/SciFiHudRadar.vue'
import SciFiHudPanel from '../components/SciFiHudPanel.vue'
import SciFiHudMissionLog from '../components/SciFiHudMissionLog.vue'
import SciFiHudSkillGauge from '../components/SciFiHudSkillGauge.vue'
import SciFiHudProjectCard from '../components/SciFiHudProjectCard.vue'
import SciFiHudPostStream from '../components/SciFiHudPostStream.vue'
import SciFiHudContactDeck from '../components/SciFiHudContactDeck.vue'
import SciFiHudLoader from '../components/SciFiHudLoader.vue'
import SciFiHudEmpty from '../components/SciFiHudEmpty.vue'
import SciFiHudTelemetryBar from '../components/SciFiHudTelemetryBar.vue'

/** 首页展示的最新文章条数 */
const POST_COUNT = 6
/** 首页展示的精选项目数上限 */
const PROJECT_COUNT = 6

const { t, locale } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { siteConfig, socialLinks, skillGroups, timeline } = useAppInfo()
const { getAllPosts } = useBlog()
const { getAllProjects, getFeaturedProjects } = useProjects()

// 文章列表（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('scifihud-posts', async () => {
  const list = await getAllPosts()
  return Array.isArray(list) ? list : []
})

// 项目列表 + 精选项目（一次取齐，减少重复查询）
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<{ all: Project[]; featured: Project[] }>(
  'scifihud-projects',
  async () => {
    const [all, featured] = await Promise.all([getAllProjects(), getFeaturedProjects(PROJECT_COUNT)])
    return {
      all: Array.isArray(all) ? all : [],
      featured: Array.isArray(featured) ? featured : [],
    }
  },
)

// 语言切换时刷新（useAsyncData 不随 locale 自动失效）
watch(locale, () => {
  refreshPosts()
  refreshProjects()
})

// —— 数据防御与视图推导（同步计算，SSR 安全） ——
const posts = computed<BlogPost[]>(() => (Array.isArray(postsData.value) ? postsData.value : []))
const latestPosts = computed<BlogPost[]>(() => posts.value.slice(0, POST_COUNT))
const featuredProjects = computed<Project[]>(() =>
  Array.isArray(projectsData.value?.featured) ? projectsData.value!.featured : [],
)

/** 加载态：仅在尚无任何数据时显示数据流占位 */
const postsLoading = computed(() => postsPending.value && !postsData.value)
const projectsLoading = computed(() => projectsPending.value && !projectsData.value)

// —— 雷达读数（真实统计的仪表化表达） ——
const readoutPosts = computed(() => String(posts.value.length))
const readoutProjects = computed(() => String(projectsData.value?.all.length ?? 0))
const readoutSkills = computed(() =>
  String(
    skillGroups.value.reduce(
      (sum, group) => sum + (Array.isArray(group.skills) ? group.skills.length : 0),
      0,
    ),
  ),
)

// —— 主控条锚点（label 随语言更新，均为页内区块） ——
const sections = computed(() => [
  { id: 'about', label: t('nav.about') },
  { id: 'skills', label: t('about.skills') },
  { id: 'projects', label: t('nav.projects') },
  { id: 'posts', label: t('nav.blog') },
  { id: 'contact', label: t('nav.contact') },
])

// 滚动进入视口动画（共享层行为，SSG 友好）
useScrollReveal()
</script>

<style scoped>
/* —— 座舱底：深底 + 坐标网格（--deco） —— */
.hud {
  position: relative;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--deco), var(--c-bg);
}

/* —— 全页扫描线：固定视口内的横向亮线缓慢下扫（装饰） —— */
.scanline {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;
  height: 120px;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgb(74 240 198 / 0.04) 55%,
    rgb(74 240 198 / 0.1) 96%,
    transparent 100%
  );
  animation: scan-sweep 8s linear infinite;
}

@keyframes scan-sweep {
  from {
    transform: translateY(-140px);
  }

  to {
    transform: translateY(100vh);
  }
}

/* —— 主区 —— */
.main {
  max-width: var(--page-w);
  margin: 0 auto;
  padding: clamp(28px, 4vw, 56px) var(--gap) clamp(48px, 6vw, 88px);
}

/* —— ① 主视屏：整屏驾驶舱视野 —— */
.viewport {
  display: grid;
  gap: clamp(24px, 3vw, 40px);
  align-items: center;
  min-height: clamp(520px, 78vh, 860px);
}

@media (min-width: 1024px) {
  .viewport {
    grid-template-columns: 1.15fr 0.85fr;
  }
}

/* 引导行：状态灯 + 问候 + 闪烁光标 */
.boot {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  font-family: var(--font-mono);
  font-size: var(--fs-base);
  letter-spacing: 0.12em;
  color: var(--c-accent);
}

.boot-dot {
  width: 7px;
  height: 7px;
  background: var(--c-accent);
  border-radius: 50%;
  box-shadow: 0 0 6px rgb(74 240 198 / 0.9);
  animation: boot-pulse 2.2s ease-in-out infinite;
}

@keyframes boot-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.25;
  }
}

.boot-cursor {
  animation: boot-pulse 1.1s steps(2, start) infinite;
}

/* —— 目标标注框：框住名字 —— */
.tf {
  --corner-c: rgb(74 240 198 / 0.9);
  position: relative;
  display: inline-block;
  padding: 14px 22px 18px;
  background: color-mix(in srgb, var(--c-accent) 4%, transparent);
}

/* 四角括角（与面板同源手法：8 段渐变） */
.tf::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(var(--corner-c), var(--corner-c)) top left / 18px 2px,
    linear-gradient(var(--corner-c), var(--corner-c)) top left / 2px 18px,
    linear-gradient(var(--corner-c), var(--corner-c)) top right / 18px 2px,
    linear-gradient(var(--corner-c), var(--corner-c)) top right / 2px 18px,
    linear-gradient(var(--corner-c), var(--corner-c)) bottom left / 18px 2px,
    linear-gradient(var(--corner-c), var(--corner-c)) bottom left / 2px 18px,
    linear-gradient(var(--corner-c), var(--corner-c)) bottom right / 18px 2px,
    linear-gradient(var(--corner-c), var(--corner-c)) bottom right / 2px 18px;
  background-repeat: no-repeat;
}

/* 目标编号：框外上缘（装饰） */
.tf-tag {
  position: absolute;
  top: -24px;
  left: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.16em;
  color: var(--c-accent-2);
}

/* 名字：等宽巨号读数 */
.tf-name {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(32px, 7vw, 64px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0.04em;
  color: var(--c-text);
  text-shadow: 0 0 24px rgb(74 240 198 / 0.25);
  overflow-wrap: anywhere;
}

/* 框内底部刻度尺（装饰） */
.tf-ruler {
  position: absolute;
  right: 14px;
  bottom: 6px;
  left: 14px;
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    color-mix(in srgb, var(--c-accent) 50%, transparent) 0 1px,
    transparent 1px 10px
  );
}

/* —— 简介文案 —— */
.tagline {
  margin: 20px 0 4px;
  font-size: 17px;
  font-weight: 600;
  color: var(--c-text);
}

.desc {
  max-width: 56ch;
  margin: 0;
  color: var(--c-muted);
}

/* —— CTA：原生锚点，实心 / 描边两态 —— */
.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
  margin-top: 24px;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 22px;
  font-family: var(--font-head);
  font-size: 14px;
  letter-spacing: 0.08em;
  color: var(--c-accent);
  text-decoration: none;
  border: var(--border-w) solid color-mix(in srgb, var(--c-accent) 55%, transparent);
  transition:
    color var(--transition),
    background var(--transition),
    border-color var(--transition),
    box-shadow var(--transition);
}

.cta:hover {
  background: color-mix(in srgb, var(--c-accent) 12%, transparent);
  border-color: var(--c-accent);
  box-shadow: var(--shadow-press);
}

.cta:active {
  transform: var(--press-transform);
}

.cta-solid {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.cta-solid:hover {
  color: var(--c-on-accent);
  background: color-mix(in srgb, var(--c-accent) 84%, #fff);
  box-shadow: 0 0 18px rgb(74 240 198 / 0.35);
}

.cta-glyph {
  font-family: var(--font-mono);
}

/* —— 右舷雷达模块 —— */
.radar-module {
  display: grid;
  gap: 10px;
  max-width: 420px;
  padding: 12px;
  background: color-mix(in srgb, var(--c-surface) 78%, transparent);
  border: var(--border-w) solid var(--c-border);
}

.radar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.radar-label {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.22em;
  color: var(--c-accent);
}

.radar-dot {
  width: 6px;
  height: 6px;
  background: var(--c-accent-2);
  border-radius: 50%;
  animation: boot-pulse 1.6s ease-in-out infinite;
}

/* 读数行：dt 弱化 + dd 等宽信号色（真实数据） */
.readouts {
  display: grid;
  gap: 4px;
  margin: 0;
  padding-top: 8px;
  border-top: var(--border-w) solid var(--c-border);
}

.readout {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.readout dt {
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.readout dd {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-base);
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

/* —— ② 面板甲板：12 列非对称网格 —— */
.deck {
  display: grid;
  gap: var(--gap);
  margin-top: clamp(32px, 4vw, 56px);
}

.cell {
  min-width: 0;
}

@media (min-width: 1024px) {
  .deck {
    grid-template-columns: repeat(12, 1fr);
  }

  .cell-about {
    grid-column: span 8;
  }

  .cell-skills {
    grid-column: span 4;
  }

  .cell-12 {
    grid-column: span 12;
  }

  .cell-posts {
    grid-column: span 7;
  }

  .cell-contact {
    grid-column: span 5;
  }
}

/* 面板内子标题：左缘信号条 + 等宽小字 */
.sub-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 var(--space);
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.12em;
  color: var(--c-accent);
}

.sub-head::before {
  content: '';
  width: 3px;
  height: 12px;
  background: var(--c-accent);
}

/* —— 载荷网格：项目卡自适应 —— */
.payload-grid {
  display: grid;
  gap: var(--gap);
  /* 同 cyberpunk：单条载荷时 auto-fill 会留下大片空轨道 */
  grid-template-columns: repeat(auto-fit, minmax(240px, 420px));
  justify-content: center;
}

/* —— 通讯面板引导语 —— */
.contact-desc {
  margin: 0 0 var(--space);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .scanline {
    display: none;
  }

  .boot-dot,
  .boot-cursor,
  .radar-dot {
    animation: none;
  }

  .cta {
    transition: none;
  }

  .cta:active {
    transform: none;
  }
}
</style>
