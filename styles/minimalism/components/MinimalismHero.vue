<!--
  MinimalismHero - minimalism 风格的英雄区（/style/minimalism/ 首屏）
  ------------------------------------------------------------
  版式原型：编辑型 / 单列阅读流节奏（A 档 03 稿）
  与另外两稿的差别：editorial 是「上下分区 + 编号文章索引」、
  swiss 是「12 栏左右栅格 + 项目数据清单」；本稿是「窄测量单列
  + 单篇展开」——首屏不再由巨型姓名独占，而是让一篇真实文章
  承担视觉主体，姓名退回页首的安静一级。

  具体做法：
  · 打散「问候 → 巨型姓名 → 头衔 → 一句话 → 两个按钮」六段序列：
    姓名从 120px 独占收到共享刻度的 Title 级（仍是唯一 h1），
    头衔/简介各自成级，形成「姓名 / 文章标题 / 正文 / 元数据」
    四级字阶与字重对比；两个按钮降为容器化次级入口。
  · 删掉与内容零关系的装饰：hairline 大圆弧（.hero-orb）与底部
    落点循环线（.hero-cue）整组移除，把腾出的首屏交给内容。
  · 腾出的位置交给真实内容：最新一篇文章的标题、摘要、日期、
    标签全部来自共享层 useBlog（由首页以 props 传入），NuxtLink
    直达详情；不编造任何数字与文案。
  数据经 useAsyncData 在 SSG 预渲染即已就绪；异步未完成时走
  补白行分支，不会误报空状态。
-->
<template>
  <section id="top" data-section="top" class="hero">
    <div class="hero-inner">
      <p class="hero-greeting">{{ t('home.greeting') }}</p>
      <h1 class="hero-name">{{ t('home.name') }}</h1>
      <p class="hero-tagline">{{ t('home.tagline') }}</p>
      <p class="hero-desc">{{ t('home.description') }}</p>

      <!-- 单篇展开：首屏主体是一篇真实文章，而不是几何装饰 -->
      <article class="hero-read" :aria-label="t('home.latestPosts')">
        <p class="read-label">{{ t('home.latestPosts') }}</p>

        <div v-if="pending" class="read-loading" role="status">
          <p class="sr-only">{{ t('common.loading') }}</p>
          <span class="read-loading-line" aria-hidden="true" />
          <span class="read-loading-line read-loading-line--short" aria-hidden="true" />
        </div>

        <template v-else-if="leadPost">
          <h2 class="read-title">{{ leadPost.title }}</h2>
          <p v-if="leadPost.description" class="read-desc">{{ leadPost.description }}</p>
          <p class="read-meta">
            <time :datetime="leadPost.date">{{ leadPost.dateText }}</time>
            <span v-if="leadPost.category">{{ leadPost.category }}</span>
            <span v-for="tag in leadPost.tags" :key="tag">{{ tag }}</span>
          </p>
          <NuxtLink class="hero-read-item read-link" :to="leadPost.to">
            {{ t('blog.readMore') }}<span class="read-arrow" aria-hidden="true">→</span>
          </NuxtLink>
        </template>

        <p v-else class="read-empty">{{ t('blog.noResults') }}</p>
      </article>

      <!-- 两个页内入口：从裸文字链接改为有明确命中容器的安静按钮 -->
      <nav class="hero-links" :aria-label="t('common.navigation')">
        <a class="hero-link" href="#posts">{{ t('home.viewBlog') }}</a>
        <a class="hero-link" href="#projects">{{ t('home.viewProjects') }}</a>
      </nav>
    </div>
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

/** 单篇展开时展示的标签数（真实标签，按内容顺序） */
const TAGS_SHOWN = 2

const { t, locale } = useI18n()
// 详情链接与日期格式走共享层，风格层不重写业务规则
const { postPath } = useStyleContentPath()

const dateLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))

/** 首屏展开的最新一篇：只取列表首条，其余留在博客区 */
const leadPost = computed(() => {
  const post = props.posts[0]
  if (!post) return null
  return {
    title: post.title,
    description: post.description ?? '',
    date: post.date,
    dateText: formatDate(post.date, dateLocale.value),
    category: post.category ?? '',
    tags: (Array.isArray(post.tags) ? post.tags : []).slice(0, TAGS_SHOWN),
    to: postPath(contentSlug(post.path)),
  }
})
</script>

<style scoped>
/* —— 首屏：窄测量单列，内容自上而下纵向流动 —— */
.hero {
  display: flex;
  flex-direction: column;
  padding: clamp(48px, 9vh, 104px) var(--space) clamp(56px, 9vw, 96px);
}

.hero-inner {
  width: 100%;
  max-width: var(--scale-measure);
  margin: 0 auto;
}

/* —— 四级字阶与字重：Meta → 姓名(轻) → Lead → Body —— */
.hero-greeting {
  margin: 0;
  font-size: var(--fs-small);
  letter-spacing: 0.24em;
  color: var(--c-muted);
}

/* 姓名：收到共享刻度 Title 级，保留轻字重签名但不再独占整屏 */
.hero-name {
  margin: var(--scale-space-2) 0 0;
  font-family: var(--font-head);
  font-size: var(--scale-title-fluid);
  font-weight: 300;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.hero-tagline {
  margin: var(--scale-space-3) 0 0;
  font-size: var(--scale-lead-fluid);
  font-weight: 600;
  line-height: 1.4;
  color: var(--c-text);
  text-wrap: balance;
}

.hero-desc {
  max-width: 52ch;
  margin: var(--scale-space-1) 0 0;
  font-size: var(--fs-base);
  color: var(--c-muted);
}

/* —— 单篇展开：真实文章成为首屏主体 —— */
.hero-read {
  margin-top: var(--scale-space-8);
  padding: var(--scale-space-3) 0 0;
  border-top: var(--border-w) solid var(--c-border);
}

.read-label {
  margin: 0 0 var(--scale-space-2);
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--c-accent);
}

.read-title {
  margin: 0;
  font-size: var(--scale-heading-fluid);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--c-text);
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.read-desc {
  margin: var(--scale-space-2) 0 0;
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-muted);
}

.read-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px var(--scale-space-2);
  margin: var(--scale-space-2) 0 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* 阅读入口：明确容器 + 44px 命中区（评审点名的「裸文字按钮」） */
.read-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: var(--scale-hit);
  margin-top: var(--scale-space-3);
  padding: 8px 20px;
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-accent);
  text-decoration: none;
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  transition:
    background var(--transition),
    border-color var(--transition),
    transform var(--transition);
}

.read-link:hover {
  background: var(--deco);
  border-color: var(--c-accent);
}

.read-link:active {
  transform: var(--press-transform);
}

.read-arrow {
  transition: transform var(--transition);
}

.read-link:hover .read-arrow {
  transform: translateX(4px);
}

.read-empty {
  margin: 0;
  font-size: var(--fs-base);
  color: var(--c-muted);
}

/* 加载补白：与正文同宽，数据到位后不跳动 */
.read-loading {
  display: grid;
  gap: var(--scale-space-2);
}

.read-loading-line {
  height: var(--scale-space-3);
  background: var(--c-surface);
  border-radius: var(--radius-sm);
  animation: read-breathe 1.4s ease-in-out infinite;
}

.read-loading-line--short {
  width: 62%;
}

@keyframes read-breathe {
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

/* —— 页内入口：安静的次级容器按钮 —— */
.hero-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--scale-space-2);
  margin-top: var(--scale-space-3);
}

.hero-link {
  display: inline-flex;
  align-items: center;
  min-height: var(--scale-hit);
  padding: 8px 18px;
  font-size: var(--fs-base);
  font-weight: 500;
  color: var(--c-text);
  text-decoration: none;
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  transition:
    border-color var(--transition),
    color var(--transition),
    transform var(--transition);
}

.hero-link:hover {
  color: var(--c-accent);
  border-color: var(--c-accent);
}

.hero-link:active {
  transform: var(--press-transform);
}

@media (max-width: 640px) {
  .read-link,
  .hero-link {
    padding-right: 16px;
    padding-left: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .read-link,
  .read-arrow,
  .hero-link {
    transition: none;
  }

  .read-loading-line {
    animation: none;
    opacity: 0.6;
  }

  .read-link:hover .read-arrow,
  .read-link:active,
  .hero-link:active {
    transform: none;
  }
}
</style>
