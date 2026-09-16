<!--
  EditorialPosts - editorial 风格的「03 最新文章」区块
  ------------------------------------------------------------
  杂志「本期索引」版面：条目行 = 等宽编号 + 标题（衬线）+
  摘要与标签注释 + 右缘日期/分类注记 + 阅读箭头，条目间以
  hairline 细线分隔。整行 NuxtLink 跳文章详情页；悬停时
  整行泛起荧光笔淡染、编号转红、标题划出下划线、箭头滑入。
  数据来自共享层 useBlog（由页面传入），日期格式化与 slug
  换算复用共享层 utils 的 formatDate / contentSlug（不在风格
  里重写业务逻辑）。
-->
<template>
  <section id="posts" class="section" data-section="posts">
    <EditorialSectionHead :no="'03'" :title="t('home.latestPosts')" :note="t('blog.description')" />

    <EditorialEmpty
      v-if="!posts.length"
      :message="t('blog.noResults')"
      :hint="t('blog.noResultsHint')"
    />

    <ol v-else class="index">
      <li v-for="(post, i) in posts" :key="post.path" class="item">
        <NuxtLink class="row" :to="localePath(postRoute(post))">
          <span class="row-no" aria-hidden="true">{{ padNo(i + 1) }}</span>

          <div class="row-main">
            <h3 class="row-title">{{ post.title }}</h3>
            <span v-if="post.description" class="row-desc">{{ post.description }}</span>
            <span v-if="displayTags(post).length" class="row-tags">
              <span v-for="tag in displayTags(post)" :key="tag" class="row-tag">{{ tag }}</span>
            </span>
          </div>

          <span class="row-meta">
            <time class="row-date" :datetime="post.date">
              {{ formatDate(post.date, locale === 'zh' ? 'zh-CN' : 'en-US') }}
            </time>
            <span v-if="post.category" class="row-cat">{{ post.category }}</span>
          </span>

          <span class="row-arrow" aria-hidden="true">→</span>
        </NuxtLink>
      </li>
    </ol>

    <div class="more-row">
      <NuxtLink class="more" :to="localePath('/blog')">
        {{ t('home.viewBlog') }}<span class="more-arrow" aria-hidden="true">→</span>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import { contentSlug } from '~/utils/content'
import EditorialSectionHead from './EditorialSectionHead.vue'
import EditorialEmpty from './EditorialEmpty.vue'

defineProps<{
  /** 最新文章列表（来自共享层 useBlog） */
  posts: BlogPost[]
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

/** 两位编号（01、02…） */
function padNo(n: number): string {
  return String(n).padStart(2, '0')
}

/** 标签防御：只取前 3 个非空标签 */
function displayTags(post: BlogPost): string[] {
  return (Array.isArray(post.tags) ? post.tags : [])
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 3)
}

/** 由内容路径推导详情页路由（slug 换算复用共享层 contentSlug） */
function postRoute(post: BlogPost): string {
  return `/blog/${contentSlug(post.path)}`
}
</script>

<style scoped>
.index {
  margin: calc(var(--space) * 0.7) 0 0;
  padding: 0;
  list-style: none;
}

/* 索引行：编号 | 内容 | 注记 | 箭头，条目间 hairline */
.row {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto 30px;
  align-items: start;
  gap: 6px 18px;
  min-height: 48px;
  padding: 18px 10px;
  color: inherit;
  text-decoration: none;
  background: transparent;
  transition: background var(--transition);
}

.item + .item {
  border-top: var(--border-w) solid var(--c-border);
}

/* 荧光笔淡染：整行悬停泛起刊头红淡染 */
.row:hover {
  background: var(--deco);
}

.row:active {
  transform: var(--press-transform);
}

.row-no {
  padding-top: 6px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: var(--c-muted);
  transition: color var(--transition);
}

.row:hover .row-no {
  color: var(--c-accent);
}

.row-main {
  display: block;
  min-width: 0;
}

.row-title {
  display: inline;
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(20px, 2.5vw, 29px);
  font-weight: 700;
  line-height: 1.3;
  color: var(--c-text);
  overflow-wrap: anywhere;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 2px;
  transition: background-size var(--transition);
}

.row:hover .row-title {
  background-size: 100% 2px;
}

.row-desc {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin-top: 6px;
  font-size: var(--fs-base);
  line-height: 1.7;
  color: var(--c-muted);
}

.row-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
  color: var(--c-muted);
}

.row-tag + .row-tag::before {
  margin: 0 8px;
  content: '/';
  color: var(--c-border);
}

/* 右缘注记：日期 + 分类（墨绿第二印刷色） */
.row-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  padding-top: 6px;
  white-space: nowrap;
}

.row-date {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.06em;
  color: var(--c-muted);
}

.row-cat {
  font-size: var(--fs-small);
  letter-spacing: 0.14em;
  color: var(--c-accent-2);
}

.row-arrow {
  padding-top: 6px;
  font-family: var(--font-mono);
  color: var(--c-accent);
  opacity: 0;
  transform: translateX(-6px);
  transition:
    opacity var(--transition),
    transform var(--transition);
}

.row:hover .row-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* 「查看博客」行：hairline 顶线 + 划线链接 */
.more-row {
  margin-top: clamp(22px, 3.4vw, 32px);
  padding-top: 14px;
  border-top: var(--border-w) solid var(--c-border);
}

.more {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  font-size: var(--fs-base);
  letter-spacing: 0.14em;
  color: var(--c-accent);
  text-decoration: none;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 1px;
  transition:
    background-size var(--transition),
    transform var(--transition);
}

.more:hover {
  background-size: 100% 1px;
}

.more:active {
  transform: var(--press-transform);
}

.more-arrow {
  font-family: var(--font-mono);
  transition: transform var(--transition);
}

.more:hover .more-arrow {
  transform: translateX(4px);
}

/* 窄屏：注记并到内容列下方，箭头隐藏（保留淡染与编号签名） */
@media (max-width: 760px) {
  .row {
    grid-template-columns: 40px minmax(0, 1fr);
    padding-right: 6px;
  }

  .row-meta {
    flex-direction: row;
    align-items: baseline;
    justify-content: flex-start;
    grid-column: 2;
    gap: 14px;
    padding-top: 2px;
    white-space: normal;
  }

  .row-arrow {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .row,
  .row-no,
  .row-title,
  .row-arrow,
  .more,
  .more-arrow {
    transition: none;
  }

  .row:active,
  .row:hover .row-arrow,
  .more:active,
  .more:hover .more-arrow {
    transform: none;
  }
}
</style>
