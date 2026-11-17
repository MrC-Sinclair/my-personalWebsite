<!--
  NeumorphismHero - neumorphism 风格首屏英雄区
  ------------------------------------------------------------
  居中对称的首屏：凸起圆形头像 + 问候 + 浮雕姓名 + 标语/简介 +
  两枚凸起按钮，下方是一块「内凹」的真实文章面板。

  评审诊断：原来首屏底部有一组材质仪表（两枚凸起表盘 + 一条
  内凹推子），「拟物控件完成度高，但和个人简介毫无关系，属于
  纯炫技」。本轮删掉整组控件，把腾出的位置交给最新三篇真实
  文章（标题 / 日期 / 分类 / 详情链接）。材质签名不丢：面板用
  --shadow-press 做内凹槽，条目是凸起/内凹交替的新拟态行。

  边界说明：评审的 fix 还提到「把控件变成文章筛选 / 主题切换 /
  年份滑块」，那属于新增业务交互，超出本阶段「只改变现层取用
  与摆放已有内容、不改 composables、不编造数据」的硬边界，故
  本轮不实现；仅做删装饰 + 真实内容上屏。
  数据来自共享层 useBlog（由首页以 props 传入），日期格式化与
  详情链接复用共享层 utils / useStyleContentPath。
-->
<template>
  <section class="hero">
    <div class="hero-avatar" aria-hidden="true">{{ initials }}</div>
    <p class="hero-greeting">{{ t('home.greeting') }}</p>
    <h1 class="hero-name">{{ t('home.name') }}</h1>
    <p class="hero-tagline">{{ t('home.tagline') }}</p>
    <p class="hero-desc">{{ t('home.description') }}</p>

    <div class="hero-actions">
      <a class="hero-btn" href="#projects">{{ t('home.viewProjects') }}</a>
      <a class="hero-btn" href="#posts">{{ t('home.viewBlog') }}</a>
    </div>

    <!-- 内凹内容面板：原「两表盘 + 推子」材质仪表组的位置，
         换成最新三篇真实文章。材质由内容承担，不再纯炫技。 -->
    <section class="hero-feed" :aria-label="t('home.latestPosts')">
      <p class="feed-kicker">{{ t('home.latestPosts') }}</p>

      <div v-if="pending" class="feed-loading" role="status">
        <p class="sr-only">{{ t('common.loading') }}</p>
        <span v-for="i in FEED_COUNT" :key="i" class="feed-loading-line" aria-hidden="true"/>
      </div>

      <ol v-else-if="feedItems.length" class="feed-list">
        <li v-for="item in feedItems" :key="item.to">
          <NuxtLink class="neu-hero-item" :to="item.to">
            <span class="feed-main">
              <span class="feed-title">{{ item.title }}</span>
              <span class="feed-meta">
                <time :datetime="item.date">{{ item.dateText }}</time>
                <span v-if="item.category">{{ item.category }}</span>
              </span>
            </span>
            <span class="feed-arrow" aria-hidden="true">→</span>
          </NuxtLink>
        </li>
      </ol>
      <p v-else class="feed-empty">{{ t('blog.noResults') }}</p>
    </section>
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

/** 内凹面板展示的文章条数 */
const FEED_COUNT = 3

const { t, locale } = useI18n()
// 详情链接走共享层，风格层不重写路由拼接
const { postPath } = useStyleContentPath()

const dateLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))

/** 从站点名提取首字母缩写（纯字符串推导，SSR/客户端一致） */
const initials = computed(() => {
  const parts = t('home.name')
    .split(/[^A-Za-z0-9\u4e00-\u9fa5]+/)
    .filter(Boolean)
  const letters = parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return letters || 'N'
})

/** 内凹面板条目：把共享层数据映射成真实内容（标题 / 日期 / 分类 / 链接） */
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
/* —— 首屏：居中单列（新拟态的对称轴） ——
   高度从「撑满一屏」收紧为「内容高度 + 适度留白」，避免首屏出现
   大片无内容的死灰材料面（阴影需要呼吸空间，但不需要空屏） */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-height: clamp(520px, 62vh, 680px);
  padding: 32px 0 24px;
  text-align: center;
}

/* 凸起圆形头像：材料上压出一枚圆台 */
.hero-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  /* 头像占位字形，图标尺寸是独立体系。 */
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--c-accent);
  background: var(--c-bg);
  border-radius: 50%;
  box-shadow: 7px 7px 15px #a3b1c6, -7px -7px 15px #ffffff;
}

.hero-greeting {
  margin: 8px 0 0;
  font-size: var(--fs-base);
  letter-spacing: 0.12em;
  color: var(--c-muted);
}

/* 大号浮雕姓名：文字本身也带凸起的光影 */
.hero-name {
  margin: 0;
  /* 首屏展示级例外：原第一参数隐式依赖 --fs-head，已固定为原值 44px，
     避免改 --fs-head 时出现 min > max 的非法 clamp。 */
  font-size: clamp(44px, 8vw, 60px);
  font-weight: 800;
  line-height: 1.15;
  color: var(--c-text);
  letter-spacing: 0.01em;
  overflow-wrap: anywhere;
  text-shadow: 1px 1px 1px rgb(255 255 255 / 0.92), -1px -1px 1px rgb(163 177 198 / 0.45);
}

.hero-tagline {
  max-width: 40ch;
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-text);
}

.hero-desc {
  max-width: 46ch;
  margin: 0;
  color: var(--c-muted);
}

/* —— 凸起按钮：hover 光影加深，active 凹进材料 —— */
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 12px;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--scale-hit);
  padding: 12px 28px;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-accent);
  text-decoration: none;
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff;
  transition:
    box-shadow var(--transition),
    color var(--transition);
}

.hero-btn:hover {
  color: var(--c-text);
  box-shadow: 8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff;
}

.hero-btn:active {
  color: var(--c-accent);
  box-shadow: var(--shadow-press);
}

.hero-btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

/* —— 内凹内容面板：删掉表盘 / 推子后由真实文章承担材质 —— */
.hero-feed {
  width: 100%;
  max-width: 640px;
  min-width: 0;
  margin-top: 20px;
  padding: clamp(16px, 3vw, 28px);
  text-align: left;
  background: var(--c-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow-press);
}

.feed-kicker {
  margin: 0 0 12px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--c-accent);
}

.feed-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.neu-hero-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: var(--scale-hit);
  padding: 12px 16px;
  color: var(--c-text);
  text-decoration: none;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  box-shadow: 4px 4px 9px #a3b1c6, -4px -4px 9px #ffffff;
  transition:
    box-shadow var(--transition),
    color var(--transition);
}

.feed-list li + li {
  margin-top: 10px;
}

.neu-hero-item:hover {
  color: var(--c-accent);
  box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff;
}

.neu-hero-item:active {
  box-shadow: var(--shadow-press);
}

.neu-hero-item:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

.feed-main {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.feed-title {
  font-size: var(--scale-body);
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.feed-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.feed-arrow {
  flex: none;
  margin-left: auto;
  color: var(--c-accent);
  opacity: 0.75;
  transition: transform var(--transition);
}

.neu-hero-item:hover .feed-arrow {
  transform: translateX(4px);
}

.feed-empty {
  margin: 0;
  padding: 12px 0;
  font-size: var(--fs-base);
  color: var(--c-muted);
}

.feed-loading {
  display: grid;
  gap: 12px;
}

.feed-loading-line {
  height: var(--scale-space-5);
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-press);
  animation: feed-breathe 1.4s ease-in-out infinite;
}

@keyframes feed-breathe {
  0%,
  100% {
    opacity: 0.55;
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

/* 入场浮现动画（纯 CSS，交错延迟） */
.hero > * {
  animation: hero-rise 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero > :nth-child(2) {
  animation-delay: 60ms;
}

.hero > :nth-child(3) {
  animation-delay: 120ms;
}

.hero > :nth-child(4) {
  animation-delay: 180ms;
}

.hero > :nth-child(5) {
  animation-delay: 240ms;
}

.hero > :nth-child(6) {
  animation-delay: 300ms;
}

.hero > :nth-child(7) {
  animation-delay: 360ms;
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero > *,
  .feed-loading-line {
    animation: none;
  }

  .hero-btn,
  .neu-hero-item,
  .feed-arrow {
    transition: none;
  }

  .neu-hero-item:hover .feed-arrow {
    transform: none;
  }
}
</style>
