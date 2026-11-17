<!--
  ClaymorphismHero - claymorphism 风格英雄区
  ------------------------------------------------------------
  版式原型：沉浸式 / 黏土内容岛（本轮 03 稿）
  评审诊断：原来「糖果色球太多太散，中央一个圆角白板把姓名
  装进去像贴纸，主次不分，五种颜色齐上」。

  本稿做法：
  · 球层由 BlobField 收敛成 3 颗（一个主色 + 两个点缀），
    按大中小 + 透明度递降做前后景深，全部退到内容背后。
  · 中央白板不再只是姓名的贴纸：改成「姓名 + 最新三篇真实
    文章」的黏土内容岛，标题 / 日期 / 分类 / 详情链接全部来自
    共享层 useBlog（由首页以 props 传入），让白板承担内容。
  · 保留厚胶囊、内高光、内底影的黏土配方与 hover 浮起 /
    按下压扁的题材签名；删掉底部纯装饰的黏土云及两个凸圆，
    腾出的首屏位置交给内容岛。
  日期格式化与详情链接复用共享层 utils / useStyleContentPath。
-->
<template>
  <section id="top" class="hero">
    <!-- 漂浮黏土球装饰层（收敛为 3 颗，退景深） -->
    <ClaymorphismBlobField/>

    <div class="hero-inner">
      <p class="greeting-chip">{{ t('home.greeting') }}</p>

      <!-- 黏土内容岛：姓名 + 真实文章索引（原「只装姓名的贴纸白板」） -->
      <div class="island-card">
        <h1 class="name-text">{{ t('home.name') }}</h1>
        <p class="tagline">{{ t('home.tagline') }}</p>

        <div class="card-divider" aria-hidden="true"/>

        <p class="card-kicker">{{ t('home.latestPosts') }}</p>

        <div v-if="pending" class="card-loading" role="status">
          <p class="sr-only">{{ t('common.loading') }}</p>
          <span v-for="i in CARD_COUNT" :key="i" class="card-loading-line" aria-hidden="true"/>
        </div>

        <ol v-else-if="cardItems.length" class="card-list">
          <li v-for="item in cardItems" :key="item.to">
            <NuxtLink class="clay-hero-item" :to="item.to">
              <span class="card-main">
                <span class="card-title">{{ item.title }}</span>
                <span class="card-meta">
                  <time :datetime="item.date">{{ item.dateText }}</time>
                  <span v-if="item.category">{{ item.category }}</span>
                </span>
              </span>
              <span class="card-arrow" aria-hidden="true">→</span>
            </NuxtLink>
          </li>
        </ol>
        <p v-else class="card-empty">{{ t('blog.noResults') }}</p>
      </div>

      <p class="desc">{{ t('home.description') }}</p>

      <div class="cta-row">
        <NuxtLink class="cta cta-purple" :to="{ hash: '#posts' }">
          {{ t('home.viewBlog') }}
        </NuxtLink>
        <NuxtLink class="cta cta-mint" :to="{ hash: '#projects' }">
          {{ t('home.viewProjects') }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// styles/ 下组件不走自动导入，风格内组件显式 import
import type { BlogPost } from '~/types/blog'
import { contentSlug } from '~/utils/content'
import { formatDate } from '~/utils/format'
import ClaymorphismBlobField from './ClaymorphismBlobField.vue'

const props = defineProps<{
  /** 最新文章列表（来自共享层 useBlog，由首页传入） */
  posts: BlogPost[]
  /** 数据是否仍在加载（加载时显示补白行，不误报空状态） */
  pending?: boolean
}>()

/** 内容岛展示的文章条数 */
const CARD_COUNT = 3

const { t, locale } = useI18n()
// 详情链接走共享层，风格层不重写路由拼接
const { postPath } = useStyleContentPath()

const dateLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))

/** 内容岛条目：把共享层数据映射成真实内容（标题 / 日期 / 分类 / 链接） */
const cardItems = computed(() =>
  props.posts.slice(0, CARD_COUNT).map((post) => ({
    title: post.title,
    date: post.date,
    dateText: formatDate(post.date, dateLocale.value),
    category: post.category ?? '',
    to: postPath(contentSlug(post.path)),
  })),
)
</script>

<style scoped>
/* 首屏撑满一屏：黏土舞台 */
.hero {
  position: relative;
  display: grid;
  place-items: center;
  min-height: clamp(560px, 88vh, 880px);
  padding: clamp(56px, 10vh, 96px) var(--gap) clamp(48px, 8vh, 88px);
  overflow: hidden;
}

.hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 720px;
  text-align: center;
}

/* 问候胶囊：小颗紫黏土 */
.greeting-chip {
  display: inline-block;
  margin: 0 0 20px;
  padding: 8px 24px;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-radius: 999px;
  box-shadow:
    0 10px 18px rgb(125 63 201 / 0.32),
    inset 0 5px 9px rgb(255 255 255 / 0.4),
    inset 0 -5px 8px rgb(90 40 150 / 0.25);
}

/* —— 黏土内容岛：原「只装姓名的白板」改造成真实内容卡 —— */
.island-card {
  width: 100%;
  min-width: 0;
  padding: clamp(24px, 4vw, 40px);
  text-align: left;
  background: var(--c-surface);
  border-radius: clamp(32px, 5vw, 48px);
  box-shadow: var(--shadow);
  transition: transform var(--transition);
}

.island-card:active {
  transform: var(--press-transform);
}

.name-text {
  display: block;
  margin: 0;
  font-size: clamp(40px, 6vw, 68px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: 0.01em;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.tagline {
  margin: 12px 0 0;
  font-size: var(--scale-lead-fluid);
  font-weight: 700;
  color: var(--c-text);
}

.card-divider {
  height: 3px;
  margin: var(--scale-space-3) 0 var(--scale-space-2);
  background: color-mix(in srgb, var(--c-accent) 22%, transparent);
  border-radius: 999px;
}

.card-kicker {
  margin: 0 0 8px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.16em;
  color: var(--c-accent);
}

.card-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.clay-hero-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: var(--scale-hit);
  padding: 12px 10px;
  color: var(--c-text);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition:
    background var(--transition),
    transform var(--transition);
}

.clay-hero-item:hover {
  background: color-mix(in srgb, var(--c-accent) 10%, transparent);
  transform: translateY(-2px);
}

.card-main {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.card-title {
  font-size: var(--scale-body);
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.card-arrow {
  flex: none;
  margin-left: auto;
  font-size: var(--scale-lead-fluid);
  color: var(--c-accent);
  transition: transform var(--transition);
}

.clay-hero-item:hover .card-arrow {
  transform: translateX(4px);
}

.card-empty {
  margin: 0;
  padding: 12px 0;
  font-size: var(--fs-base);
  color: var(--c-muted);
}

.card-loading {
  display: grid;
  gap: var(--gap);
}

.card-loading-line {
  height: var(--scale-space-5);
  background: color-mix(in srgb, var(--c-accent) 12%, transparent);
  border-radius: var(--radius-sm);
  animation: card-breathe 1.4s ease-in-out infinite;
}

@keyframes card-breathe {
  0%,
  100% {
    opacity: 0.45;
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

.desc {
  max-width: 56ch;
  margin: 20px 0 24px;
  color: var(--c-muted);
}

/* —— CTA 双胶囊：紫（主）/ 薄荷（次） —— */
.cta-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--gap);
}

.cta {
  display: inline-flex;
  align-items: center;
  min-height: var(--scale-hit);
  padding: 12px 32px;
  font-size: var(--fs-base);
  font-weight: 700;
  text-decoration: none;
  border-radius: 999px;
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.cta:active {
  transform: var(--press-transform);
}

/* 紫黏土胶囊（内高光 + 内底影 + 外双层影 = 厚重 3D） */
.cta-purple {
  color: var(--c-on-accent);
  background: var(--c-accent);
  box-shadow:
    0 16px 28px rgb(125 63 201 / 0.35),
    0 5px 10px rgb(125 63 201 / 0.2),
    inset 0 7px 12px rgb(255 255 255 / 0.4),
    inset 0 -7px 10px rgb(90 40 150 / 0.3);
}

.cta-purple:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    0 22px 36px rgb(125 63 201 / 0.4),
    0 8px 14px rgb(125 63 201 / 0.22),
    inset 0 7px 12px rgb(255 255 255 / 0.4),
    inset 0 -7px 10px rgb(90 40 150 / 0.3);
}

/* 薄荷黏土胶囊 */
.cta-mint {
  color: #14603c;
  background: #8fddb7;
  box-shadow:
    0 16px 28px rgb(90 175 135 / 0.35),
    0 5px 10px rgb(90 175 135 / 0.2),
    inset 0 7px 12px rgb(255 255 255 / 0.55),
    inset 0 -7px 10px rgb(70 145 105 / 0.3);
}

.cta-mint:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    0 22px 36px rgb(90 175 135 / 0.4),
    0 8px 14px rgb(90 175 135 / 0.22),
    inset 0 7px 12px rgb(255 255 255 / 0.55),
    inset 0 -7px 10px rgb(70 145 105 / 0.3);
}

@media (max-width: 640px) {
  .hero {
    min-height: clamp(480px, 78vh, 680px);
  }

  .island-card {
    border-radius: 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .island-card,
  .cta,
  .clay-hero-item,
  .card-arrow {
    transition: none;
  }

  .card-loading-line {
    animation: none;
    opacity: 0.6;
  }

  .island-card:active,
  .cta:active,
  .cta-purple:hover,
  .cta-mint:hover,
  .clay-hero-item:hover,
  .clay-hero-item:hover .card-arrow {
    transform: none;
  }
}
</style>
