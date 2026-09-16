<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismIndex - 拟物风格完整首页（/style/skeuomorphism/）
  ------------------------------------------------------------
  「一站多风格」架构中 skeuomorphism 风格的唯一交付页面：
  - 排版轴「木桌实物摊开」：整页是一张深色胡桃木桌面（左上
    暖光 + 暗角 + 拼板缝），内容像散落在桌上的实物——皮革
    横幅、橡木镶板、散落旋转的皮革挂签、钉住的横线纸卡、
    打孔索引卡、黄铜铭牌，各材质各有倾角与偏移，与其它风格
    的居中网格 / 浮岛 / 分栏轴完全不同
  - 自带导航头部（木杆菜单条 + 皮革锚点标签 + 风格画廊入口）
    与页脚（铁质铭牌）
  - 区块：英雄区（皮革烫金名牌）→ 关于/技能（橡木镶板时间线
    + 皮革工具卡）→ 精选项目（图钉横线纸卡）→ 最新文章
    （打孔索引卡行）→ 联系方式（黄铜铭牌，不复用 ContactForm）
  - 数据全部来自共享层 composables（useAsyncData 承载，SSG
    预渲染即含真实内容；loading 骨架 + 空状态 + Array.isArray
    防御）；文案全部走 i18n；滚动进入动画复用共享层
    useScrollReveal；窄屏只回退布局，材质签名全部保留
-->
<template>
  <div id="top" class="page">
    <SkeuomorphismDeskHeader />

    <main class="page-main">
      <!-- ============ 英雄区：皮革烫金名牌 ============ -->
      <SkeuomorphismHeroPlate />

      <div class="page-inner">
        <!-- ============ 关于 + 技能：橡木镶板 + 皮革挂签 ============ -->
        <section id="about" data-section="about" class="section" aria-labelledby="about-title">
          <SkeuomorphismSectionHead
            id="about-title"
            :badge="t('nav.about')"
            :title="t('about.title')"
          />
          <div class="about-grid">
            <SkeuomorphismWoodPanel
              :title="t('about.experience')"
              class="about-main scroll-reveal"
            >
              <p class="about-intro">{{ t('about.description') }}</p>
              <SkeuomorphismTimeline v-if="safeTimeline.length" :items="safeTimeline" />
            </SkeuomorphismWoodPanel>

            <div
              class="about-side scroll-reveal scroll-reveal-delay-2"
              role="group"
              :aria-label="t('about.skills')"
            >
              <h3 class="side-label">
                <span class="side-label-plate">{{ t('about.skills') }}</span>
              </h3>
              <SkeuomorphismSkillTags v-if="safeSkillGroups.length" :groups="safeSkillGroups" />
              <SkeuomorphismEmptyNote v-else :message="t('projects.noResults')" />
            </div>
          </div>
        </section>

        <!-- ============ 精选项目：钉在桌上的横线纸卡 ============ -->
        <section
          id="projects"
          data-section="projects"
          class="section"
          aria-labelledby="projects-title"
        >
          <SkeuomorphismSectionHead
            id="projects-title"
            :badge="t('projects.featured')"
            :title="t('home.featuredProjects')"
          />

          <!-- 加载骨架：空白纸卡 -->
          <div v-if="projectsLoading" class="cards" role="status" :aria-label="t('common.loading')">
            <span class="sr-only">{{ t('common.loading') }}</span>
            <div v-for="n in 3" :key="n" class="skel skel--card" aria-hidden="true" />
          </div>

          <!-- 空状态 -->
          <SkeuomorphismEmptyNote v-else-if="safeProjects.length === 0" :message="t('projects.noResults')" />

          <div v-else class="cards">
            <SkeuomorphismPaperCard
              v-for="(project, i) in safeProjects"
              :key="project.path"
              :project="project"
              :wide="i === 0"
              :tilt="projectTilts[i % projectTilts.length]"
              class="scroll-reveal"
            />
          </div>
        </section>

        <!-- ============ 最新文章：打孔索引卡 ============ -->
        <section id="posts" data-section="posts" class="section" aria-labelledby="posts-title">
          <SkeuomorphismSectionHead
            id="posts-title"
            :badge="t('nav.blog')"
            :title="t('home.latestPosts')"
          />

          <!-- 加载骨架：索引卡纸条 -->
          <div v-if="postsLoading" class="rows" role="status" :aria-label="t('common.loading')">
            <span class="sr-only">{{ t('common.loading') }}</span>
            <div v-for="n in 4" :key="n" class="skel skel--row" aria-hidden="true" />
          </div>

          <!-- 空状态（含提示文案） -->
          <SkeuomorphismEmptyNote
            v-else-if="safePosts.length === 0"
            :message="t('blog.noResults')"
            :hint="t('blog.noResultsHint')"
          />

          <template v-else>
            <div class="rows">
              <SkeuomorphismNoteRow
                v-for="(post, i) in safePosts"
                :key="post.path"
                :post="post"
                :index="i"
                :tilt="i % 2 === 0 ? -0.5 : 0.6"
                class="scroll-reveal"
              />
            </div>

            <!-- 查看全部：皮革按钮 → 过渡层博客列表 -->
            <div class="rows-foot">
              <NuxtLink class="view-all" :to="localePath('/blog')">
                {{ t('home.viewAll') }}
                <span class="view-all-arrow" aria-hidden="true">→</span>
              </NuxtLink>
            </div>
          </template>
        </section>

        <!-- ============ 联系方式：黄铜蚀刻铭牌 ============ -->
        <section id="contact" data-section="contact" class="section" aria-labelledby="contact-title">
          <SkeuomorphismSectionHead
            id="contact-title"
            :badge="t('nav.contact')"
            :title="t('contact.title')"
          />
          <SkeuomorphismBrassPlate
            v-if="safeSocials.length"
            :socials="safeSocials"
            class="contact-plate scroll-reveal"
          />
          <SkeuomorphismEmptyNote v-else :message="t('contact.description')" />
        </section>
      </div>
    </main>

    <SkeuomorphismMetalFooter />
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import SkeuomorphismDeskHeader from '../components/SkeuomorphismDeskHeader.vue'
import SkeuomorphismHeroPlate from '../components/SkeuomorphismHeroPlate.vue'
import SkeuomorphismSectionHead from '../components/SkeuomorphismSectionHead.vue'
import SkeuomorphismWoodPanel from '../components/SkeuomorphismWoodPanel.vue'
import SkeuomorphismTimeline from '../components/SkeuomorphismTimeline.vue'
import SkeuomorphismSkillTags from '../components/SkeuomorphismSkillTags.vue'
import SkeuomorphismPaperCard from '../components/SkeuomorphismPaperCard.vue'
import SkeuomorphismNoteRow from '../components/SkeuomorphismNoteRow.vue'
import SkeuomorphismBrassPlate from '../components/SkeuomorphismBrassPlate.vue'
import SkeuomorphismEmptyNote from '../components/SkeuomorphismEmptyNote.vue'
import SkeuomorphismMetalFooter from '../components/SkeuomorphismMetalFooter.vue'

/** 首页展示的最新文章条数 */
const LATEST_POST_COUNT = 4
/** 首页展示的精选项目数 */
const FEATURED_PROJECT_COUNT = 3

const { t, locale } = useI18n()
const localePath = useLocalePath()

// —— 共享层数据（组件不直接调用 content API） ——
const { getFeaturedPosts } = useBlog()
const { getFeaturedProjects } = useProjects()
const { socialLinks, skillGroups, timeline } = useAppInfo()

// 精选项目（useAsyncData 承载：SSG 预渲染即含数据，payload 下发避免水合不一致）
const {
  data: projectsData,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useAsyncData<Project[]>('skeuomorphism-projects', async () => {
  const list = await getFeaturedProjects(FEATURED_PROJECT_COUNT)
  return Array.isArray(list) ? list : []
})

// 最新文章（getFeaturedPosts 按日期倒序取前 N 条）
const {
  data: postsData,
  pending: postsPending,
  refresh: refreshPosts,
} = await useAsyncData<BlogPost[]>('skeuomorphism-posts', async () => {
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
const safeSkillGroups = computed(() => (Array.isArray(skillGroups.value) ? skillGroups.value : []))
const safeTimeline = computed(() => (Array.isArray(timeline.value) ? timeline.value : []))

/** 加载态：仅在尚无任何数据时显示骨架 */
const projectsLoading = computed(() => projectsPending.value && !projectsData.value)
const postsLoading = computed(() => postsPending.value && !postsData.value)

/** 纸卡的交替倾角（确定性数值，SSR 安全；首卡为宽卡用小倾角） */
const projectTilts = [-0.8, 1.1, -0.6]

// 滚动进入动画（共享层 composable，observer 在其内部成对清理）
useScrollReveal()
</script>

<style scoped>
/* —— 页面骨架：深色胡桃木桌面 —— */
.page {
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  /* 深色材质上的正文默认使用「象牙墨水」（即米白纸面颜料） */
  color: var(--c-surface);
  /* 木桌：左上暖光光源 + 右下暗角 + 横向拼板缝 + 竖向木纹 */
  background:
    radial-gradient(120% 90% at 8% 0%, rgb(255 214 150 / 0.1), transparent 52%),
    radial-gradient(140% 120% at 50% 110%, rgb(0 0 0 / 0.42), transparent 60%),
    repeating-linear-gradient(0deg, rgb(0 0 0 / 0.22) 0 2px, transparent 2px 168px),
    repeating-linear-gradient(
      90deg,
      rgb(0 0 0 / 0.11) 0 2px,
      transparent 2px 9px,
      rgb(0 0 0 / 0.05) 9px 13px,
      transparent 13px 24px
    ),
    repeating-linear-gradient(
      91deg,
      #33200f 0 34px,
      #3b2513 34px 47px,
      #301d0d 47px 74px,
      #3d2814 74px 88px
    ),
    linear-gradient(180deg, #33200f, #2b1a0f);
}

.page-main {
  display: flex;
  flex-direction: column;
  gap: clamp(56px, 9vh, 96px);
  padding-bottom: calc(var(--space) * 2);
}

.page-inner {
  display: grid;
  gap: clamp(56px, 9vh, 96px);
  width: min(100% - 2 * var(--space), var(--page-w));
  margin-inline: auto;
}

/* 锚点定位补偿：吸顶木杆约 64px 高 */
.section {
  scroll-margin-top: 6.5rem;
  min-width: 0;
}

/* —— 关于 + 技能：桌面端 7:5 非对称，右列皮革挂签散落 —— */
.about-grid {
  display: grid;
  gap: var(--gap);
}

.about-intro {
  margin: 0 0 var(--gap);
  color: #e6d5b4;
}

/* 技能列的小标题：斜贴的皮革标签 */
.side-label {
  display: flex;
  margin: 0 0 var(--gap);
}

.side-label-plate {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #fbf2dd;
  border: 1px solid rgb(0 0 0 / 0.55);
  border-radius: var(--radius-sm);
  background:
    radial-gradient(circle at 22% 32%, rgb(255 255 255 / 0.06) 1px, transparent 1.8px),
    linear-gradient(180deg, #6b4223 0%, #5a3617 100%);
  background-size: 9px 9px, 100% 100%;
  box-shadow:
    inset 0 1px 0 rgb(255 240 210 / 0.16),
    inset 0 -2px 4px rgb(0 0 0 / 0.4),
    0 2px 4px rgb(10 4 0 / 0.5);
  transform: rotate(-1.4deg);
}

/* —— 精选项目：首卡横向跨列，其余错位 —— */
.cards {
  display: grid;
  gap: var(--gap);
}

@media (min-width: 768px) {
  .cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* 首卡（wide 大卡）横跨两列 */
  .cards > :first-child {
    grid-column: 1 / -1;
  }
}

/* —— 最新文章：索引卡堆叠 —— */
.rows {
  display: grid;
  gap: 14px;
}

/* 查看全部：皮革长条按钮 */
.rows-foot {
  display: flex;
  margin-top: var(--gap);
}

.view-all {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 46px;
  padding: 12px 24px;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #f3e7c9;
  text-decoration: none;
  border: 1px solid rgb(0 0 0 / 0.55);
  border-radius: var(--radius-sm);
  background:
    radial-gradient(circle at 22% 32%, rgb(255 255 255 / 0.05) 1px, transparent 1.6px),
    linear-gradient(180deg, #6b4223 0%, #543116 100%);
  background-size: 9px 9px, 100% 100%;
  box-shadow:
    inset 0 1px 0 rgb(255 240 210 / 0.16),
    inset 0 -3px 6px rgb(0 0 0 / 0.4),
    0 4px 9px rgb(10 4 0 / 0.55);
  transition:
    filter var(--transition),
    transform var(--transition),
    box-shadow var(--transition);
}

.view-all:hover {
  filter: brightness(1.12);
}

/* 按压行程：按进桌面 */
.view-all:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

.view-all-arrow {
  transition: transform var(--transition);
}

.view-all:hover .view-all-arrow {
  transform: translateX(4px);
}

@media (min-width: 560px) {
  .rows-foot {
    justify-content: flex-end;
  }

  .view-all {
    width: auto;
  }
}

/* —— 联系方式：铭牌居中收窄（桌面端） —— */
.contact-plate {
  max-width: 860px;
  margin-inline: auto;
  width: 100%;
}

/* —— 加载骨架：空白纸张 —— */
.skel {
  border: 1px solid rgb(0 0 0 / 0.35);
  border-radius: var(--radius-sm);
  background:
    repeating-linear-gradient(
      transparent 0 27px,
      rgb(109 83 53 / 0.12) 27px 28px
    ),
    linear-gradient(178deg, #efe5cd 0%, #e4d7ba 100%);
  animation: skel-breathe 1.4s ease-in-out infinite;
}

.skel--card {
  min-height: 220px;
}

.skel--row {
  min-height: 76px;
}

@keyframes skel-breathe {
  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
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

/* —— 桌面端：关于/技能 7:5 分栏（右列下沉错位） —— */
@media (min-width: 900px) {
  .about-grid {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    align-items: start;
  }

  .about-side {
    margin-top: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skel {
    animation: none;
  }

  .view-all,
  .view-all-arrow {
    transition: none;
  }

  .view-all:active {
    transform: none;
  }

  .view-all:hover .view-all-arrow {
    transform: none;
  }
}
</style>
