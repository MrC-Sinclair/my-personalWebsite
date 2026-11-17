<!--
  SwissHero - swiss 风格英雄区
  ------------------------------------------------------------
  版式原型：编辑型 / 栅格式节奏（A 档 02 稿）
  与另外两稿的差别：editorial 是「上下分区 + 编号文章索引」、
  minimalism 是「单列阅读流 + 单篇展开」；本稿是「12 栏左右
  不对称栅格」——姓名收进左 7 栏，右 5 栏由真实项目数据承担，
  正是评审对 swiss 的诊断「右半屏几乎空白，没有内容承接」。

  具体做法：
  · 打散「问候 → 巨型姓名 → 头衔 → 一句话 → 两个按钮」六段序列：
    巨型姓名保留（瑞士海报签名）但不再满宽独占，改为与右侧
    「精选项目」索引并置；标语与简介降到底部一行注记。
  · 删掉/降级装饰：红方块从「问候语前的纯色块」改为项目索引的
    编号标记（让几何体承担信息）；不再有空置的右半屏。
  · 腾出的位置交给真实内容：项目标题、日期、技术栈标签全部来自
    共享层 useProjects（由首页以 props 传入），每条 NuxtLink 直达
    项目详情；不编造任何数字与文案。
  页面内区块导航由 SwissMasthead 承担，首屏底部只保留两个
  安静的锚点入口。数据经 useAsyncData 在 SSG 预渲染即已就绪。
-->
<template>
  <section class="hero" aria-labelledby="hero-title">
    <p class="hero-eyebrow">
      <span class="hero-mark" aria-hidden="true" />
      {{ t('home.greeting') }}
    </p>

    <!-- 左 7 栏：巨型姓名（首屏展示级例外，海报签名） -->
    <h1 id="hero-title" class="hero-name">{{ t('home.name') }}</h1>

    <!-- 右 5 栏：真实精选项目索引（编号 / 标题 / 日期 / 技术栈） -->
    <nav class="hero-index" :aria-label="t('home.featuredProjects')">
      <p class="index-caption">{{ t('home.featuredProjects') }}</p>

      <div v-if="pending" class="index-loading" role="status">
        <p class="sr-only">{{ t('common.loading') }}</p>
        <span v-for="i in HERO_ITEMS" :key="i" class="index-loading-row" aria-hidden="true" />
      </div>

      <ol v-else-if="indexItems.length" class="index-list">
        <li v-for="item in indexItems" :key="item.to" class="index-row">
          <NuxtLink class="hero-index-item" :to="item.to">
            <span class="index-no" aria-hidden="true">{{ item.no }}</span>
            <span class="index-main">
              <span class="index-title">{{ item.title }}</span>
              <span v-if="item.tags.length" class="index-tags">
                <span v-for="tag in item.tags" :key="tag" class="index-tag">{{ tag }}</span>
              </span>
            </span>
            <time class="index-date" :datetime="item.date">{{ item.dateText }}</time>
          </NuxtLink>
        </li>
      </ol>
      <p v-else class="index-empty">{{ t('projects.noResults') }}</p>
    </nav>

    <!-- 底部注记：左锚点入口 / 右标语与简介，对角构图收口 -->
    <div class="hero-foot">
      <div class="hero-cta">
        <a class="hero-link" href="#posts">
          {{ t('home.viewBlog') }}
          <span class="hero-arrow" aria-hidden="true">↓</span>
        </a>
        <a class="hero-link" href="#projects">
          {{ t('home.viewProjects') }}
          <span class="hero-arrow" aria-hidden="true">↓</span>
        </a>
      </div>

      <div class="hero-body">
        <p class="hero-tagline">{{ t('home.tagline') }}</p>
        <p class="hero-desc">{{ t('home.description') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import { contentSlug } from '~/utils/content'
import { formatDate } from '~/utils/format'

const props = defineProps<{
  /** 精选项目列表（来自共享层 useProjects，由首页传入） */
  projects: Project[]
  /** 数据是否仍在加载（加载时显示补白行，不误报空状态） */
  pending?: boolean
}>()

/** 首屏索引条数：三条构成数据节奏，又不压垮左栏姓名 */
const HERO_ITEMS = 3
/** 每条项目展示的技术栈标签数（真实标签，按内容顺序） */
const TAGS_PER_ITEM = 2

const { t, locale } = useI18n()
// 详情链接与日期格式走共享层，风格层不重写业务规则
const { projectPath } = useStyleContentPath()

const dateLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))

/** 精选项目索引：把共享层数据映射成网格里的编号数据行 */
const indexItems = computed(() =>
  props.projects.slice(0, HERO_ITEMS).map((project, i) => ({
    no: String(i + 1).padStart(2, '0'),
    title: project.title,
    date: project.date,
    dateText: formatDate(project.date, dateLocale.value),
    tags: (Array.isArray(project.tags) ? project.tags : []).slice(0, TAGS_PER_ITEM),
    to: projectPath(contentSlug(project.path)),
  })),
)
</script>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-content: end;
  gap: var(--gap) 0;
  min-height: clamp(560px, 84vh, 900px);
  padding-top: clamp(48px, 10vh, 120px);
  padding-bottom: var(--space);
}

/* 问候标签：红方块 + 小号宽字距（占满 12 栏的眉题） */
.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  grid-column: 1 / -1;
  margin: 0;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-text);
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.hero-mark {
  flex: none;
  width: 14px;
  height: 14px;
  background: var(--c-accent);
}

/* 姓名：超大左对齐，占左 7 栏；右下的数据块与它构成不对称栅格。
   题材签名例外：不套共享刻度 Display 96，但收窄上限以让出右半屏。 */
.hero-name {
  grid-column: 1 / 8;
  margin: 0;
  margin-left: -0.05em; /* 光学对齐：抵消字形左侧留白 */
  font-family: var(--font-head);
  font-size: clamp(44px, 6.4vw, 92px);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

/* —— 右 5 栏：真实项目数据索引 —— */
.hero-index {
  grid-column: 8 / -1;
  align-self: end;
  min-width: 0;
  padding-left: var(--gap);
  border-left: calc(var(--border-w) * 2) solid var(--c-border);
}

.index-caption {
  margin: 0 0 12px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.index-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.hero-index-item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 2px 12px;
  align-items: baseline;
  min-height: var(--scale-hit);
  padding: 12px 0;
  color: var(--c-text);
  text-decoration: none;
  border-top: var(--border-w) solid var(--c-border);
  transition: color var(--transition);
}

.index-row:last-child .hero-index-item {
  border-bottom: var(--border-w) solid var(--c-border);
}

.hero-index-item:hover {
  color: var(--c-accent);
}

.index-no {
  grid-row: 1 / span 2;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
  color: var(--c-accent);
}

.index-main {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.index-title {
  font-size: var(--scale-body);
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.index-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
}

.index-tag {
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.index-date {
  grid-column: 2;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.index-empty {
  margin: 0;
  padding: var(--gap) 0;
  font-size: var(--fs-base);
  color: var(--c-muted);
}

/* 加载补白：与数据行同高，数据到位后不跳动 */
.index-loading {
  display: grid;
  gap: 0;
}

.index-loading-row {
  height: calc(var(--scale-hit) + 24px);
  border-top: var(--border-w) solid var(--c-border);
  animation: index-breathe 1.4s linear infinite;
}

@keyframes index-breathe {
  0%,
  100% {
    opacity: 0.35;
  }

  50% {
    opacity: 0.8;
  }
}

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

/* —— 底部注记：左锚点 / 右标语，细则线收口 —— */
.hero-foot {
  display: grid;
  gap: var(--gap);
  grid-column: 1 / -1;
  margin-top: var(--space);
  padding-top: 20px;
  border-top: calc(var(--border-w) * 2) solid var(--c-border);
}

.hero-cta {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 4px var(--gap);
}

.hero-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: var(--scale-hit);
  font-size: var(--scale-body);
  font-weight: 700;
  color: var(--c-text);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 3px;
  transition: background-size var(--transition);
}

.hero-link:hover,
.hero-link:focus-visible {
  background-size: 100% 3px;
}

.hero-link:active {
  color: var(--c-accent);
}

.hero-arrow {
  color: var(--c-accent);
  transition: transform var(--transition);
}

.hero-link:hover .hero-arrow {
  transform: translateY(3px);
}

.hero-body {
  display: grid;
  gap: 12px;
}

.hero-tagline {
  margin: 0;
  font-size: var(--scale-lead-fluid);
  font-weight: 500;
  line-height: 1.4;
  color: var(--c-text);
}

.hero-desc {
  max-width: 56ch;
  margin: 0;
  color: var(--c-muted);
}

/* —— 桌面端：左右不对称收口（链接 1–5 栏 / 注记 6–12 栏）—— */
@media (min-width: 768px) {
  .hero-foot {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    align-items: end;
  }

  .hero-cta {
    grid-column: 1 / 6;
  }

  .hero-body {
    grid-column: 6 / -1;
  }
}

/* —— 中窄屏：12 栏左右并置会让姓名被压成逐字竖排，
   改为姓名在上、项目索引在下的单列堆叠（保留红黑与细则线签名）—— */
@media (max-width: 900px) {
  .hero-name {
    grid-column: 1 / -1;
  }

  .hero-index {
    grid-column: 1 / -1;
    margin-top: var(--gap);
    padding-left: 0;
    border-left: none;
    border-top: calc(var(--border-w) * 2) solid var(--c-border);
    padding-top: var(--gap);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-link,
  .hero-arrow,
  .hero-index-item {
    transition: none;
  }

  .index-loading-row {
    animation: none;
    opacity: 0.5;
  }

  .hero-link:hover .hero-arrow {
    transform: none;
  }
}
</style>
