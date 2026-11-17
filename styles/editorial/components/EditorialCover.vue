<!--
  EditorialCover - editorial 风格的杂志封面（首页英雄区）
  ------------------------------------------------------------
  版式原型：编辑型 / 索引式节奏（A 档 01 稿）
  与另外两稿的差别：swiss 是「左右栅格 + 数据清单」、minimalism 是
  「单列阅读流 + 单篇展开」；本稿是「上下分区 + 编号索引」——
  首屏下半部直接铺真实文章索引，不用巨型姓名独占整屏。

  具体做法：
  · 打散「问候 → 巨型姓名 → 头衔 → 一句话 → 两个按钮」的六段序列：
    保留刊名（唯一 h1）与对开提要，把原来「01–04 四个占位锚点」
    的目录条换成最新三篇真实文章的编号索引（标题 / 摘要 / 日期 / 分类），
    每条用 NuxtLink 直达详情；页内区块导航由 EditorialMasthead 承担。
  · 删掉与内容零关系的装饰：右上角「№ 01」期号换成最新一条内容的
    真实发布日期；不再有纯占位的目录导航条。
  · 腾出的位置交给内容：文章标题、摘要、日期、分类全部来自
    共享层 useBlog（由首页以 props 传入），不编造任何数字与文案。
  数据经 useAsyncData 在 SSG 预渲染时已就绪；异步未完成时目录
  走空状态分支，不会出现半截骨架。
-->
<template>
  <section id="home" class="cover" data-section="cover">
    <div class="inner">
      <header class="top">
        <p class="kicker">{{ t('home.greeting') }}</p>
        <!-- 原装饰性期号改为「本期最新一条内容」的真实发布日期 -->
        <time v-if="latestDate" class="folio" :datetime="latestDate">
          {{ formatDate(latestDate, dateLocale) }}
        </time>
      </header>

      <h1 class="name">{{ t('home.name') }}<span class="dot" aria-hidden="true">.</span></h1>

      <div class="spread">
        <p class="tagline">{{ t('home.tagline') }}</p>
        <p class="desc">{{ t('home.description') }}</p>
      </div>

      <!-- 本期要目：真实内容索引（编号 + 标题 + 摘要 + 日期 + 分类） -->
      <nav class="toc" :aria-label="t('home.latestPosts')">
        <p class="toc-caption">{{ t('home.latestPosts') }}</p>

        <!-- 加载中：不误报「没有文章」，用 hairline 补白行占位 -->
        <div v-if="pending" class="toc-loading" role="status">
          <p class="sr-only">{{ t('common.loading') }}</p>
          <span v-for="i in COVER_ITEMS" :key="i" class="toc-loading-row" aria-hidden="true"/>
        </div>

        <ol v-else-if="tocItems.length" class="toc-list">
          <li v-for="item in tocItems" :key="item.to" class="toc-row">
            <NuxtLink class="toc-item" :to="item.to">
              <span class="toc-no" aria-hidden="true">{{ item.no }}</span>
              <span class="toc-main">
                <span class="toc-label">{{ item.title }}</span>
                <span v-if="item.desc" class="toc-desc">{{ item.desc }}</span>
              </span>
              <span class="toc-meta">
                <time :datetime="item.date">{{ item.dateText }}</time>
                <span v-if="item.category">{{ item.category }}</span>
              </span>
              <span class="toc-arrow" aria-hidden="true">→</span>
            </NuxtLink>
          </li>
        </ol>
        <p v-else class="toc-empty">{{ t('blog.noResults') }}</p>

        <NuxtLink class="toc-more" :to="localePath('/style/editorial/blog')">
          {{ t('home.viewBlog') }}<span class="more-arrow" aria-hidden="true">→</span>
        </NuxtLink>
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

/** 封面索引条数：三条足以构成目录节奏，又不把首屏撑爆 */
const COVER_ITEMS = 3

const { t, locale } = useI18n()
const localePath = useLocalePath()
// 详情链接与日期格式都走共享层，风格层不重写业务规则
const { postPath } = useStyleContentPath()

const dateLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))

/** 期号位置展示的真实日期：取列表首条的发布日期 */
const latestDate = computed(() => props.posts[0]?.date ?? '')

/** 本期要目：把共享层数据映射成杂志目录行（编号 / 标题 / 摘要 / 日期 / 分类 / 链接） */
const tocItems = computed(() =>
  props.posts.slice(0, COVER_ITEMS).map((post, i) => ({
    no: String(i + 1).padStart(2, '0'),
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
.cover {
  --ink-soft: color-mix(in srgb, var(--c-text) 32%, transparent);

  display: flex;
  min-height: clamp(560px, 92vh, 940px);
}

.inner {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: clamp(24px, 4vw, 44px) var(--space) clamp(28px, 4vw, 48px);
}

/* 顶部：宽字距题签 + 真实发布日期（取代纯装饰的期号） */
.top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--gap);
}

.kicker {
  margin: 0;
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.42em;
  color: var(--c-accent);
}

.folio {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.14em;
  color: var(--c-muted);
}

/* 刊名：巨大衬线字，末尾缀刊头红句点。
   题材签名例外：刊名字就是封面本身，不套共享刻度的 Display 96。 */
.name {
  margin: clamp(16px, 3vw, 36px) 0 clamp(20px, 3.4vw, 40px);
  font-family: var(--font-head);
  font-size: clamp(48px, 11.5vw, 164px);
  font-weight: 700;
  line-height: 0.98;
  letter-spacing: -0.015em;
  color: var(--c-text);
  overflow-wrap: break-word;
}

.dot {
  color: var(--c-accent);
}

/* 非对称双栏：左封面语 / 右提要（hairline 分隔） */
.spread {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
  gap: var(--space);
  align-items: end;
}

.tagline {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--scale-heading-fluid);
  font-style: italic;
  line-height: 1.4;
  color: var(--c-text);
  /* 均衡各行长度，避免折行后末行只挂一个字 */
  text-wrap: balance;
}

.desc {
  margin: 0;
  padding-left: var(--space);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-muted);
  border-left: var(--border-w) solid var(--ink-soft);
}

/* —— 本期要目：hairline 顶线 + 编号索引行 ——
   margin-top: auto 把目录钉在封面底边，标题下方不留大片空白。 */
.toc {
  margin-top: auto;
  padding-top: clamp(32px, 6vh, 64px);
  border-top: var(--border-w) solid var(--ink-soft);
}

.toc-caption {
  margin: 12px 0 12px;
  font-size: var(--fs-small);
  letter-spacing: 0.32em;
  color: var(--c-accent);
}

.toc-list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin: 0;
  padding: 0;
  list-style: none;
}

.toc-item {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto 16px;
  gap: 4px 16px;
  align-items: baseline;
  min-height: var(--scale-hit);
  padding: 12px 12px 12px 0;
  color: var(--c-text);
  text-decoration: none;
  background: transparent;
  border-bottom: var(--border-w) solid var(--ink-soft);
  transition: background var(--transition);
}

/* 荧光笔淡染：悬停时整行泛起刊头红淡染 */
.toc-item:hover {
  background: var(--deco);
}

.toc-item:active {
  transform: var(--press-transform);
}

.toc-no {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.14em;
  color: var(--c-muted);
  transition: color var(--transition);
}

.toc-item:hover .toc-no {
  color: var(--c-accent);
}

.toc-main {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.toc-label {
  font-family: var(--font-head);
  font-size: var(--scale-body);
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.toc-desc {
  display: -webkit-box;
  overflow: hidden;
  font-size: var(--fs-small);
  line-height: 1.5;
  color: var(--c-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.toc-meta {
  display: grid;
  gap: 2px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  line-height: 1.5;
  color: var(--c-muted);
  text-align: right;
  white-space: nowrap;
}

.toc-arrow {
  align-self: baseline;
  font-family: var(--font-mono);
  color: var(--c-accent);
  opacity: 0;
  transform: translateX(-6px);
  transition:
    opacity var(--transition),
    transform var(--transition);
}

.toc-item:hover .toc-arrow {
  opacity: 1;
  transform: translateX(0);
}

.toc-empty {
  margin: 0;
  padding: 16px 0;
  font-size: var(--fs-base);
  color: var(--c-muted);
}

/* 加载补白：与索引行同高，数据到位后无布局跳动 */
.toc-loading {
  display: grid;
  gap: var(--gap);
}

.toc-loading-row {
  height: var(--scale-hit);
  border-bottom: var(--border-w) solid var(--ink-soft);
  animation: toc-breathe 1.4s ease-in-out infinite;
}

@keyframes toc-breathe {
  0%,
  100% {
    opacity: 0.4;
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

/* 「查看博客」入口：独立控件，命中区不小于共享刻度红线 */
.toc-more {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: var(--scale-hit);
  margin-top: 12px;
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-accent);
  text-decoration: none;
  border-bottom: var(--border-w) solid transparent;
  transition: border-color var(--transition);
}

.toc-more:hover {
  border-bottom-color: var(--c-accent);
}

.toc-more:active {
  transform: var(--press-transform);
}

.more-arrow {
  transition: transform var(--transition);
}

.toc-more:hover .more-arrow {
  transform: translateX(4px);
}

/* 窄屏：双栏提要回退单栏；目录行的日期/分类落到标题下方，
   避免 390 宽下四列互相挤压造成横向溢出 */
@media (max-width: 760px) {
  .spread {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .desc {
    padding-left: 16px;
  }
}

@media (max-width: 640px) {
  .toc-item {
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 4px 12px;
  }

  .toc-no {
    grid-row: 1 / span 2;
  }

  .toc-meta {
    grid-column: 2;
    display: flex;
    gap: 10px;
    text-align: left;
    white-space: normal;
  }

  .toc-arrow {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .toc-item,
  .toc-no,
  .toc-arrow,
  .toc-more,
  .more-arrow {
    transition: none;
  }

  .toc-loading-row {
    animation: none;
    opacity: 0.6;
  }

  .toc-item:active,
  .toc-more:active,
  .toc-item:hover .toc-arrow,
  .toc-more:hover .more-arrow {
    transform: none;
  }
}
</style>
