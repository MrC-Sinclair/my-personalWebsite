<!--
  DashboardPostsTable - dashboard 风格最新文章表格
  ------------------------------------------------------------
  密集信息列表：发布于（等宽日期）/ 标题（行内链接）/
  分类徽标 / 标签摘要。数据由页面从 useBlog 获取后传入；
  窄屏下容器横向滚动，表格列结构（信息密度签名）保留。
-->
<template>
  <div class="table-wrap">
    <table class="data-table">
      <caption class="sr-only">{{ caption }}</caption>
      <thead>
        <tr>
          <th scope="col">{{ t('blog.publishedAt') }}</th>
          <th scope="col">{{ t('blog.title') }}</th>
          <th scope="col">{{ t('blog.categories') }}</th>
          <th scope="col">{{ t('blog.tags') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in posts" :key="post.path">
          <td class="td-mono">{{ formatDate(post.date, locale) }}</td>
          <td class="td-title">
            <NuxtLink
              class="row-link"
              :to="localePath(`/style/${styleId}/blog/${slugOf(post.path)}`)"
            >
              {{ post.title }}
            </NuxtLink>
          </td>
          <td>
            <span v-if="post.category" class="badge">{{ post.category }}</span>
            <span v-else class="td-none" aria-hidden="true">—</span>
          </td>
          <td class="td-tags">{{ tagsCell(post) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { BlogPost } from '~/types/blog'

defineProps<{
  /** 文章列表（真实数据，已按日期倒序） */
  posts: BlogPost[]
  /** 表格caption文案（i18n，视觉隐藏） */
  caption: string
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
// 详情链接走风格内路由（/style/<id>/blog/<slug>），旧的 /blog/<slug> 已 404
const { styleId } = useStyleContentPath()

/** 从内容路径提取 slug（收敛到共享层 contentSlug，多风格唯一实现，链接形态不变） */
function slugOf(path: string): string {
  return contentSlug(path)
}

/** 标签摘要单元格：最多显示前 2 个，其余以 "+N" 计数呈现 */
function tagsCell(post: BlogPost): string {
  const tags = Array.isArray(post.tags) ? post.tags : []
  if (tags.length === 0) return '—'
  const head = tags.slice(0, 2).join(' / ')
  const rest = tags.length - 2
  return rest > 0 ? `${head} +${rest}` : head
}
</script>

<style scoped>
.table-wrap {
  overflow-x: auto;
  scrollbar-width: thin;
}

.data-table {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
}

th {
  padding: 8px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-align: left;
  color: var(--c-muted);
  white-space: nowrap;
  border-bottom: var(--border-w) solid var(--c-border);
}

td {
  padding: 8px 10px;
  font-size: var(--fs-base);
  color: var(--c-text);
  border-bottom: var(--border-w) solid color-mix(in srgb, var(--c-border) 55%, transparent);
}

tbody tr {
  transition: background var(--transition);
}

/* 交互反馈：行 hover 数据蓝底 */
tbody tr:hover {
  background: color-mix(in srgb, var(--c-accent) 7%, transparent);
}

tbody tr:last-child td {
  border-bottom: none;
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

.td-title {
  min-width: 180px;
}

.row-link {
  color: var(--c-text);
  text-decoration: none;
  border-bottom: var(--border-w) solid transparent;
  transition:
    color var(--transition),
    border-color var(--transition);
}

.row-link:hover {
  color: var(--c-accent);
  border-bottom-color: var(--c-accent);
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-text);
  white-space: nowrap;
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
}

.td-mono {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
  white-space: nowrap;
}

.td-tags {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.td-none {
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .row-link,
  tbody tr {
    transition: none;
  }
}
</style>
