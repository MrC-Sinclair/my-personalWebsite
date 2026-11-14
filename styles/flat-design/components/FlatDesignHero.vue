<!--
  FlatDesignHero - 扁平化风格英雄区
  ------------------------------------------------------------
  全宽强调蓝纯色带，首屏撑满一屏。评审诊断：「右上圆环 /
  菱形 / 三角与右下几何体全是填空式装饰，主体只占左半屏，
  下半屏突然变白造成割裂」。

  本稿做法：
  · 删掉全部 4 个纯 CSS 几何装饰（大圆环 / 描边方框 / 黄点 /
    白三角），腾出的右半屏交给真实内容：最新三篇文章的编号、
    标题、日期、分类与详情链接，做成一条纯色内容栏。
  · 首屏由「左文案 / 右内容」两栏构成，蓝色贯穿整屏并在底部
    用一条同色收口条过渡到白色内容带，消掉突然变白的割裂。
  · 按钮统一成一种主次关系：主按钮实色、次按钮描边（原来两个
    按钮各用一套配色）。无阴影无纹理、反馈只有颜色变化，
    扁平化签名保留。
  数据来自共享层 useBlog（由首页以 props 传入），日期格式化与
  详情链接复用共享层 utils / useStyleContentPath。
-->
<template>
  <section class="hero">
    <div class="hero__inner">
      <div class="hero__copy">
        <span class="hero__bar" aria-hidden="true"/>
        <p class="hero__greeting">{{ t('home.greeting') }}</p>
        <h1 class="hero__name">{{ t('home.name') }}</h1>
        <p class="hero__tagline">{{ t('home.tagline') }}</p>
        <p class="hero__desc">{{ t('home.description') }}</p>
        <div class="hero__actions">
          <a href="#blog" class="hero__btn hero__btn--primary">{{ t('home.viewBlog') }}</a>
          <a href="#projects" class="hero__btn hero__btn--ghost">{{ t('home.viewProjects') }}</a>
        </div>
      </div>

      <!-- 真实内容栏：取代原来的几何装饰右半屏 -->
      <section class="hero__feed" :aria-label="t('home.latestPosts')">
        <div class="feed__head">
          <p class="feed__kicker">{{ t('home.latestPosts') }}</p>
          <span v-if="feedItems.length" class="feed__count">{{ feedItems.length }}</span>
        </div>

        <div v-if="pending" class="feed__loading" role="status">
          <p class="sr-only">{{ t('common.loading') }}</p>
          <span v-for="i in FEED_COUNT" :key="i" class="feed__loading-line" aria-hidden="true"/>
        </div>

        <ol v-else-if="feedItems.length" class="feed__list">
          <li v-for="(item, i) in feedItems" :key="item.to">
            <NuxtLink class="flat-hero-item" :to="item.to">
              <span class="feed__no" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="feed__main">
                <span class="feed__title">{{ item.title }}</span>
                <span class="feed__meta">
                  <time :datetime="item.date">{{ item.dateText }}</time>
                  <span v-if="item.category">{{ item.category }}</span>
                </span>
              </span>
              <span class="feed__arrow" aria-hidden="true">→</span>
            </NuxtLink>
          </li>
        </ol>
        <p v-else class="feed__empty">{{ t('blog.noResults') }}</p>
      </section>
    </div>

    <!-- 蓝色收口条：把纯色带明确交给下方白色内容带，避免突然变白 -->
    <span class="hero__seam" aria-hidden="true"/>
  </section>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import { contentSlug } from '~/utils/content'
import { formatDate } from '~/utils/format'

const props = defineProps<{
  /** 最新文章列表（来自共享层 useBlog，由首页传入） */
  posts: BlogPost[]
  /** 数据是否仍在加载（加载时显示补白行，不误报空状态） */
  pending?: boolean
}>()

/** 内容栏展示的文章条数 */
const FEED_COUNT = 3

const { t, locale } = useI18n()
// 详情链接走共享层，风格层不重写路由拼接
const { postPath } = useStyleContentPath()

const dateLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))

/** 内容栏条目：把共享层数据映射成真实内容（标题 / 日期 / 分类 / 链接） */
const feedItems = computed(() =>
  props.posts.slice(0, FEED_COUNT).map((post) => ({
    title: post.title,
    date: post.date,
    dateText: formatDate(post.date, dateLocale.value),
    category: post.category ?? '',
    to: postPath(contentSlug(post.path)),
  })),
)
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  background: var(--c-accent);
  color: #ffffff;
}

/* 桌面左右两栏：左文案 / 右真实内容，蓝色贯穿整屏 */
.hero__inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(28px, 5vw, 64px);
  align-items: center;
  min-height: clamp(520px, 78vh, 800px);
  max-width: var(--page-w);
  margin-inline: auto;
  padding: clamp(56px, 9vw, 88px) clamp(16px, 4vw, 40px) clamp(72px, 10vw, 104px);
}

@media (min-width: 900px) {
  .hero__inner {
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.86fr);
  }
}

.hero__copy {
  min-width: 0;
}

/* 强调色条：本风格的「节」签名，开场第一笔 */
.hero__bar {
  display: block;
  width: 56px;
  height: 6px;
  margin-bottom: clamp(16px, 2.5vw, 24px);
  background: var(--deco);
  border-radius: var(--radius-sm);
}

.hero__greeting {
  margin: 0;
  font-size: var(--scale-meta);
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 0.88);
}

/* 名字：标题大到不合理，扁平粗字重（与 metro 细字重区分） */
.hero__name {
  margin: 8px 0 0;
  font-family: var(--font-head);
  /* 首屏展示级例外：色带上的大幅刊名，不套共享刻度。 */
  font-size: clamp(48px, 8.5vw, 92px);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.015em;
  overflow-wrap: anywhere;
}

.hero__tagline {
  margin: clamp(12px, 2vw, 20px) 0 0;
  font-size: var(--scale-lead-fluid);
  font-weight: 600;
  color: #ffffff;
}

.hero__desc {
  margin: 12px 0 0;
  max-width: 560px;
  font-size: var(--fs-base);
  line-height: 1.8;
  color: rgb(255 255 255 / 0.85);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: clamp(20px, 3vw, 32px);
}

/* 扁平按钮：主实色 / 次描边，统一成一种主次关系；
   反馈只有颜色变化，无位移无阴影。 */
.hero__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--scale-hit);
  padding: 0 28px;
  font-size: var(--scale-body);
  font-weight: 700;
  text-decoration: none;
  border-radius: var(--radius);
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition);
}

.hero__btn--primary {
  background: #ffffff;
  color: var(--c-accent);
}

.hero__btn--primary:hover {
  background: rgb(255 255 255 / 0.84);
}

.hero__btn--primary:active {
  background: rgb(255 255 255 / 0.7);
}

.hero__btn--ghost {
  border: 2px solid rgb(255 255 255 / 0.7);
  color: #ffffff;
}

.hero__btn--ghost:hover {
  background: rgb(255 255 255 / 0.16);
  border-color: #ffffff;
}

.hero__btn--ghost:active {
  background: rgb(255 255 255 / 0.26);
}

.hero__btn:focus-visible {
  outline: 3px solid #ffffff;
  outline-offset: 2px;
}

/* —— 真实内容栏：原几何装饰右半屏的位置 —— */
.hero__feed {
  min-width: 0;
  padding: clamp(20px, 3vw, 32px);
  background: rgb(255 255 255 / 0.1);
  border: 2px solid rgb(255 255 255 / 0.28);
  border-radius: var(--radius);
}

.feed__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.feed__kicker {
  margin: 0;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #ffffff;
}

.feed__count {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: rgb(255 255 255 / 0.75);
}

.feed__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.flat-hero-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: var(--scale-hit);
  padding: 12px 8px;
  color: #ffffff;
  text-decoration: none;
  border-top: 2px solid rgb(255 255 255 / 0.24);
  transition: background var(--transition);
}

.feed__list li:last-child .flat-hero-item {
  border-bottom: 2px solid rgb(255 255 255 / 0.24);
}

.flat-hero-item:hover {
  background: rgb(255 255 255 / 0.12);
}

.flat-hero-item:focus-visible {
  outline: 3px solid #ffffff;
  outline-offset: 2px;
}

.feed__no {
  flex: none;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: rgb(255 255 255 / 0.8);
}

.feed__main {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.feed__title {
  font-size: var(--scale-body);
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.feed__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: rgb(255 255 255 / 0.8);
}

.feed__arrow {
  flex: none;
  margin-left: auto;
  color: #ffffff;
  transition: transform var(--transition);
}

.flat-hero-item:hover .feed__arrow {
  transform: translateX(4px);
}

.feed__empty {
  margin: 0;
  padding: 12px 0;
  font-size: var(--fs-base);
  color: rgb(255 255 255 / 0.85);
}

.feed__loading {
  display: grid;
  gap: 12px;
}

.feed__loading-line {
  height: var(--scale-space-5);
  background: rgb(255 255 255 / 0.16);
  border-radius: var(--radius-sm);
  animation: feed-breathe 1.4s ease-in-out infinite;
}

@keyframes feed-breathe {
  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
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

/* 蓝色收口条：同一强调色的深一档，把色带明确交给下方白色内容带 */
.hero__seam {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 16px;
  background: color-mix(in srgb, var(--c-accent) 78%, #000000);
}

@media (prefers-reduced-motion: reduce) {
  .hero__btn,
  .flat-hero-item,
  .feed__arrow {
    transition: none;
  }

  .feed__loading-line {
    animation: none;
  }

  .flat-hero-item:hover .feed__arrow {
    transform: none;
  }
}
</style>
