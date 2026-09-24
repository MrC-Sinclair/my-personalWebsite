<!--
  DashboardProjectsTable - dashboard 风格精选项目表格
  ------------------------------------------------------------
  语义化 table/th 结构，列：项目（含精选徽标）/ 技术栈 /
  发布于 / 在线演示 / GitHub。数据由页面从 useProjects 获取
  后传入；行 hover 高亮，内部路由链接走 localePath。
  窄屏下容器横向滚动，表格保持签名式的列结构。
-->
<template>
  <div class="table-wrap">
    <table class="data-table">
      <caption class="sr-only">{{ caption }}</caption>
      <thead>
        <tr>
          <th scope="col">{{ t('projects.title') }}</th>
          <th scope="col">{{ t('projects.techStack') }}</th>
          <th scope="col">{{ t('blog.publishedAt') }}</th>
          <th scope="col">{{ t('projects.demo') }}</th>
          <th scope="col">{{ t('projects.github') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="project in projects" :key="project.path">
          <td class="td-title">
            <NuxtLink
              class="row-link"
              :to="localePath(`/style/${styleId}/projects/${slugOf(project.path)}`)"
            >
              {{ project.title }}
            </NuxtLink>
            <span v-if="project.featured" class="badge">{{ t('projects.featured') }}</span>
          </td>
          <td class="td-tags">{{ tagsText(project) }}</td>
          <td class="td-mono">{{ formatDate(project.date, locale) }}</td>
          <td>
            <a
              v-if="project.demoUrl"
              class="ext-link"
              :href="project.demoUrl"
              target="_blank"
              rel="noopener"
            >
              {{ t('projects.demo') }}<span class="ext-arrow" aria-hidden="true">↗</span>
            </a>
            <span v-else class="td-none" aria-hidden="true">—</span>
          </td>
          <td>
            <a
              v-if="project.githubUrl"
              class="ext-link"
              :href="project.githubUrl"
              target="_blank"
              rel="noopener"
            >
              {{ t('projects.github') }}<span class="ext-arrow" aria-hidden="true">↗</span>
            </a>
            <span v-else class="td-none" aria-hidden="true">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { Project } from '~/types/project'

defineProps<{
  /** 项目列表（真实数据） */
  projects: Project[]
  /** 表格caption文案（i18n，视觉隐藏） */
  caption: string
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
// 详情链接走风格内路由（/style/<id>/projects/<slug>），旧的 /projects/<slug> 已 404
const { styleId } = useStyleContentPath()

/** 从内容路径提取 slug（收敛到共享层 contentSlug，多风格唯一实现，链接形态不变） */
function slugOf(path: string): string {
  return contentSlug(path)
}

/** 技术栈单元格文本（防御性处理数组字段） */
function tagsText(project: Project): string {
  const tags = Array.isArray(project.tags) ? project.tags : []
  return tags.length > 0 ? tags.join(' / ') : '—'
}
</script>

<style scoped>
.table-wrap {
  overflow-x: auto;
  scrollbar-width: thin;
}

/* 通用数据表：密集行高 + 细分隔线 */
.data-table {
  width: 100%;
  min-width: 620px;
  border-collapse: collapse;
}

th {
  padding: 8px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
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
  white-space: nowrap;
}

/* 行内主链接：hover 点亮下划线 */
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
  margin-left: 8px;
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-on-accent);
  white-space: nowrap;
  background: var(--c-accent-2);
  border-radius: var(--radius-sm);
}

.td-tags {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.td-mono {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
  white-space: nowrap;
}

/* 外链按钮：保证 ≥40px 触控目标 */
.ext-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 40px;
  padding: 8px 10px;
  font-size: var(--fs-small);
  color: var(--c-accent);
  text-decoration: none;
  border: var(--border-w) solid transparent;
  border-radius: var(--radius-sm);
  transition:
    color var(--transition),
    border-color var(--transition),
    background var(--transition);
}

.ext-link:hover {
  border-color: var(--c-accent);
  background: color-mix(in srgb, var(--c-accent) 10%, transparent);
}

.ext-arrow {
  font-family: var(--font-mono);
}

.td-none {
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .row-link,
  .ext-link,
  tbody tr {
    transition: none;
  }
}
</style>
