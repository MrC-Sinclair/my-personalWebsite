<!--
  GlassmorphismHero - glassmorphism 风格的英雄区
  ------------------------------------------------------------
  版式原型：沉浸式 / 玻璃承内容（本轮 01 稿）
  评审诊断：「玻璃卡片里没东西可透」——原来首屏只有 2 枚纯装饰
  磨砂圆片 + 3 枚脱离文档流漂浮的统计数字片，玻璃后面是空的。

  本稿做法：
  · 删掉两枚与内容零关系的悬浮圆片，玻璃材质改由「真实内容卡」
    本身承担：卡片半透，背后的 mesh 渐变透过卡面，卡内是最新
    三篇真实文章（标题 / 摘要 / 日期 / 分类 / 详情链接）。
  · 三枚漂浮统计片收进卡片底部的统计行，不再绝对定位漂浮。
  · 左侧保留开放排版（巨型渐变姓名 / 标语 / 简介 / CTA），
    与右侧玻璃内容卡形成左右分栏；窄屏回退单列，材质签名不丢。
  数据全部来自共享层 composables（由首页以 props 传入），
  日期格式化与详情链接复用共享层 utils / useStyleContentPath。
-->
<template>
  <section class="hero">
    <div class="hero-grid">
      <div class="hero-copy scroll-reveal scroll-reveal-up">
        <p class="hero-badge">
          <span class="badge-dot" aria-hidden="true"/>
          {{ t('home.greeting') }}
        </p>

        <h1 class="hero-name">{{ t('home.name') }}</h1>
        <p class="hero-tagline">{{ t('home.tagline') }}</p>
        <p class="hero-desc">{{ t('home.description') }}</p>

        <div class="hero-cta">
          <NuxtLink class="btn btn--primary" :to="localePath('/style/glassmorphism/blog')">
            {{ t('home.viewBlog') }}
          </NuxtLink>
          <NuxtLink class="btn btn--ghost" :to="localePath('/style/glassmorphism/projects')">
            {{ t('home.viewProjects') }}
          </NuxtLink>
        </div>
      </div>

      <!-- 真实内容玻璃卡：玻璃后面是背景 mesh，卡内是最新文章，
           让「透」有对象；统计数字并入卡片底部，不再漂浮。 -->
      <aside class="hero-board scroll-reveal scroll-reveal-up" :aria-label="t('home.latestPosts')">
        <header class="board-head">
          <span class="board-kicker">{{ t('home.latestPosts') }}</span>
          <span v-if="boardItems.length" class="board-date">
            {{ t('blog.publishedAt') }} {{ boardItems[0].dateText }}
          </span>
        </header>

        <div v-if="pending" class="board-loading" role="status">
          <p class="sr-only">{{ t('common.loading') }}</p>
          <span v-for="i in BOARD_COUNT" :key="i" class="board-loading-line" aria-hidden="true"/>
        </div>

        <ol v-else-if="boardItems.length" class="board-list">
          <li v-for="item in boardItems" :key="item.to">
            <NuxtLink class="glass-content-item" :to="item.to">
              <span class="board-main">
                <span class="board-title">{{ item.title }}</span>
                <span v-if="item.desc" class="board-desc">{{ item.desc }}</span>
                <span class="board-meta">
                  <time :datetime="item.date">{{ item.dateText }}</time>
                  <span v-if="item.category">{{ item.category }}</span>
                </span>
              </span>
              <span class="board-arrow" aria-hidden="true">→</span>
            </NuxtLink>
          </li>
        </ol>
        <p v-else class="board-empty">{{ t('blog.noResults') }}</p>

        <!-- 原三枚漂浮统计片并入卡片内部（真实计数，不作装饰） -->
        <dl v-if="chips.length" class="board-stats">
          <div v-for="chip in chips" :key="chip.label" class="stat">
            <dt>{{ chip.label }}</dt>
            <dd>{{ chip.value }}</dd>
          </div>
        </dl>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import { contentSlug } from '~/utils/content'
import { formatDate } from '~/utils/format'

/** 首屏统计片：label 来自 i18n，value 来自共享层真实数据 */
interface HeroChip {
  label: string
  value: number
}

const props = defineProps<{
  /** 最新文章列表（来自共享层 useBlog，由首页传入） */
  posts: BlogPost[]
  /** 统计片（文章数 / 项目数 / 技能数） */
  chips: HeroChip[]
  /** 数据是否仍在加载（加载时显示补白行，不误报空状态） */
  pending?: boolean
}>()

/** 玻璃卡内展示的文章条数 */
const BOARD_COUNT = 3

const { t, locale } = useI18n()
const localePath = useLocalePath()
// 详情链接走共享层，风格层不重写路由拼接
const { postPath } = useStyleContentPath()

const dateLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))

/** 玻璃卡内容：把共享层数据映射成真实条目（标题 / 摘要 / 日期 / 分类 / 链接） */
const boardItems = computed(() =>
  props.posts.slice(0, BOARD_COUNT).map((post) => ({
    title: post.title,
    desc: post.description ?? '',
    date: post.date,
    dateText: formatDate(post.date, dateLocale.value),
    category: post.category ?? '',
    to: postPath(contentSlug(post.path)),
  })),
)
</script>

<style scoped>
/* 首屏撑满一屏：左右分栏，右侧玻璃卡是内容主体 */
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: clamp(560px, 88vh, 860px);
  /* 窄屏导航是 fixed 两行胶囊（实测占到 124px），原 96px 会让
     问候徽标被压住 8px。桌面单行导航时 150px 也只是多留一点呼吸。 */
  padding-top: 150px;
  padding-bottom: var(--space);
}

@media (min-width: 1024px) {
  .hero {
    padding-top: 96px;
  }
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(24px, 4vw, 48px);
  align-items: center;
  width: 100%;
}

@media (min-width: 1024px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.86fr);
  }
}

/* —— 文案区 —— */
.hero-badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 12px;
  margin: 0 0 24px;
  padding: 8px 20px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-accent);
  background: rgb(255 255 255 / 0.5);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border: var(--border-w) solid rgb(255 255 255 / 0.7);
  border-radius: 999px;
  box-shadow: var(--shadow);
}

.badge-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c-accent);
  box-shadow: 0 0 12px rgb(109 40 217 / 0.9);
  animation: badge-breathe 2.8s ease-in-out infinite;
}

/* 巨型姓名：极光渐变文字（题材签名，首屏展示级例外） */
.hero-name {
  margin: 0 0 16px;
  font-family: var(--font-head);
  font-size: clamp(48px, 8.4vw, 96px);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.02em;
  background-image: linear-gradient(118deg, #0e7490 0%, #6d28d9 52%, #be185d 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  overflow-wrap: anywhere;
}

.hero-tagline {
  margin: 0 0 8px;
  font-size: var(--scale-lead-fluid);
  font-weight: 700;
  color: var(--c-text);
}

.hero-desc {
  max-width: 56ch;
  margin: 0;
  color: var(--c-muted);
}

/* —— CTA 按钮对 —— */
.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 32px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--scale-hit);
  padding: 12px 28px;
  font-size: var(--fs-base);
  font-weight: 700;
  text-decoration: none;
  border-radius: 999px;
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    background var(--transition),
    border-color var(--transition);
}

.btn--primary {
  color: var(--c-on-accent);
  background-image: linear-gradient(120deg, #6d28d9 0%, #8b5cf6 55%, #db2777 100%);
  box-shadow: 0 8px 22px rgb(139 92 246 / 0.42);
}

.btn--primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgb(139 92 246 / 0.55);
}

.btn--ghost {
  color: var(--c-text);
  background: rgb(255 255 255 / 0.5);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border: var(--border-w) solid rgb(255 255 255 / 0.7);
  box-shadow: var(--shadow);
}

.btn--ghost:hover {
  transform: translateY(-3px);
  background: rgb(255 255 255 / 0.72);
  box-shadow: 0 12px 28px rgb(31 38 135 / 0.22);
}

.btn:active {
  transform: var(--press-transform);
}

/* —— 真实内容玻璃卡：半透卡面 + 背后 mesh 穿透 —— */
.hero-board {
  min-width: 0;
  padding: clamp(20px, 2.6vw, 32px);
  background: rgb(255 255 255 / 0.42);
  -webkit-backdrop-filter: blur(20px) saturate(130%) brightness(1.04) contrast(1.14);
  backdrop-filter: blur(20px) saturate(130%) brightness(1.04) contrast(1.14);
  border: var(--border-w) solid rgb(255 255 255 / 0.68);
  border-radius: var(--radius);
  box-shadow: var(--shadow), inset 0 1px 0 rgb(255 255 255 / 0.6);
}

.board-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px var(--gap);
  margin-bottom: var(--gap);
}

.board-kicker {
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--c-accent);
}

.board-date {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.board-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.glass-content-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: var(--scale-hit);
  padding: 12px 8px;
  color: var(--c-text);
  text-decoration: none;
  border-top: var(--border-w) solid rgb(255 255 255 / 0.55);
  transition:
    background var(--transition),
    transform var(--transition);
}

.board-list li:last-child .glass-content-item {
  border-bottom: var(--border-w) solid rgb(255 255 255 / 0.55);
}

.glass-content-item:hover {
  background: rgb(255 255 255 / 0.34);
  transform: translateX(3px);
}

.board-main {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.board-title {
  font-size: var(--scale-body);
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.board-desc {
  display: -webkit-box;
  overflow: hidden;
  font-size: var(--fs-small);
  line-height: 1.5;
  color: var(--c-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.board-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.board-arrow {
  flex: none;
  margin-left: auto;
  font-size: var(--scale-lead-fluid);
  color: var(--c-accent);
  opacity: 0.7;
  transition:
    opacity var(--transition),
    transform var(--transition);
}

.glass-content-item:hover .board-arrow {
  opacity: 1;
  transform: translateX(4px);
}

.board-empty {
  margin: 0;
  padding: 16px 0;
  font-size: var(--fs-base);
  color: var(--c-muted);
}

.board-loading {
  display: grid;
  gap: var(--gap);
}

.board-loading-line {
  height: var(--scale-space-5);
  background: rgb(255 255 255 / 0.42);
  border-radius: var(--radius-sm);
  animation: board-breathe 1.4s ease-in-out infinite;
}

@keyframes board-breathe {
  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

/* 统计行：原三枚绝对定位漂浮片并入卡片底部 */
.board-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--gap);
  margin: var(--gap) 0 0;
  padding-top: var(--gap);
  border-top: var(--border-w) solid rgb(255 255 255 / 0.6);
}

.stat {
  min-width: 0;
}

.stat dt {
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-muted);
}

.stat dd {
  margin: 2px 0 0;
  font-family: var(--font-mono);
  font-size: var(--scale-lead-fluid);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
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

@keyframes badge-breathe {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 8px rgb(109 40 217 / 0.7);
  }

  50% {
    opacity: 0.65;
    box-shadow: 0 0 18px rgb(109 40 217 / 1);
  }
}

@media (max-width: 480px) {
  .board-stats {
    gap: 8px;
  }

  .stat dt {
    font-size: var(--fs-small);
  }
}

@media (prefers-reduced-motion: reduce) {
  .badge-dot,
  .board-loading-line {
    animation: none;
  }

  .btn,
  .glass-content-item,
  .board-arrow {
    transition: none;
  }

  .btn--primary:hover,
  .btn--ghost:hover,
  .btn:active,
  .glass-content-item:hover,
  .glass-content-item:hover .board-arrow {
    transform: none;
  }
}
</style>
