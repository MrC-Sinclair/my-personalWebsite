<!--
  MinimalismProjects - minimalism 风格的「精选项目」区块
  ------------------------------------------------------------
  索引式排版（无图片、无卡片，文字即内容）：等宽日期 →
  项目名（整行链接进入详情页，悬停时强调色 + 箭头右移）
  → 描述 → 标签串 → 外链操作行（在线演示 / GitHub，置于
  NuxtLink 之外避免嵌套链接）。列表为空时显示静默空状态。
  数据来自共享层 useProjects（由页面获取后传入 props）。
-->
<template>
  <MinimalismSection
    id="projects"
    data-section="projects"
    :eyebrow="t('nav.projects')"
    :title="t('home.featuredProjects')"
  >
    <ul v-if="projects.length" class="idx">
      <li v-for="project in projects" :key="project.path" class="idx-item">
        <article class="idx-cell">
          <span class="idx-date">{{ formatDate(project.date, locale) }}</span>
          <div class="idx-main">
            <NuxtLink class="idx-link" :to="localePath(projectRoute(project))">
              <h3 class="idx-title">
                {{ project.title }}<span class="idx-arrow" aria-hidden="true">→</span>
              </h3>
              <p v-if="project.description" class="idx-desc">{{ project.description }}</p>
            </NuxtLink>

            <p v-if="tagsOf(project).length" class="idx-tags">
              <span v-for="tag in tagsOf(project)" :key="tag" class="idx-tag">{{ tag }}</span>
            </p>

            <!-- 外链操作行：独立于上方 NuxtLink，避免嵌套链接 -->
            <div v-if="project.demoUrl || project.githubUrl" class="idx-actions">
              <a
                v-if="project.demoUrl"
                class="idx-action"
                :href="project.demoUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ t('projects.demo') }}
              </a>
              <a
                v-if="project.githubUrl"
                class="idx-action"
                :href="project.githubUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ t('projects.github') }}
              </a>
            </div>
          </div>
        </article>
      </li>
    </ul>
    <p v-else class="empty">{{ t('projects.noResults') }}</p>
  </MinimalismSection>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import { contentSlug } from '~/utils/content'
import MinimalismSection from './MinimalismSection.vue'

defineProps<{
  /** 精选项目列表（来自共享层 useProjects） */
  projects: Project[]
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

/** 标签防御：只保留非空标签，最多取 4 个 */
function tagsOf(project: Project): string[] {
  return (Array.isArray(project.tags) ? project.tags : [])
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 4)
}

/** 由内容路径推导详情页路由（slug 换算复用共享层 contentSlug，链接形态不变） */
function projectRoute(project: Project): string {
  return `/projects/${contentSlug(project.path)}`
}
</script>

<style scoped>
/* —— 索引行：日期 | 内容，hairline 分隔 + 悬停静默渲染 —— */
.idx {
  margin: 0;
  padding: 0;
  list-style: none;
}

.idx-item {
  border-top: var(--border-w) solid var(--c-border);
}

.idx-cell {
  display: grid;
  grid-template-columns: 128px minmax(0, 1fr);
  gap: 4px 20px;
  padding: 20px 10px;
  transition: background var(--transition);
}

.idx-cell:hover {
  background: var(--deco);
}

.idx-date {
  padding-top: 5px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
  white-space: nowrap;
}

.idx-main {
  min-width: 0;
}

/* —— 项目名：整行链接，悬停强调色 + 箭头右移 —— */
.idx-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.idx-title {
  display: inline-block;
  margin: 0;
  font-size: clamp(19px, 2.4vw, 24px);
  font-weight: 500;
  line-height: 1.35;
  color: var(--c-text);
  transition: color var(--transition);
}

.idx-arrow {
  display: inline-block;
  margin-left: 8px;
  color: var(--c-muted);
  transition:
    transform var(--transition),
    color var(--transition);
}

.idx-link:hover .idx-title {
  color: var(--c-accent);
}

.idx-link:hover .idx-arrow {
  color: var(--c-accent);
  transform: translateX(4px);
}

.idx-link:active {
  transform: var(--press-transform);
}

.idx-desc {
  margin: 6px 0 0;
  color: var(--c-muted);
}

/* —— 标签串：顿点连接的纯文本（与技能词条同一语法） —— */
.idx-tags {
  margin: 10px 0 0;
  line-height: 1.7;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.idx-tag + .idx-tag::before {
  content: '·';
  margin: 0 9px;
}

/* —— 外链操作行：安静的下划线文字链 —— */
.idx-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 22px;
  margin-top: 12px;
}

.idx-action {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  font-size: var(--fs-small);
  color: var(--c-text);
  text-decoration: underline;
  text-decoration-color: var(--c-border);
  text-decoration-thickness: 1px;
  text-underline-offset: 6px;
  transition:
    color var(--transition),
    text-decoration-color var(--transition);
}

.idx-action:hover {
  color: var(--c-accent);
  text-decoration-color: var(--c-accent);
}

.idx-action:active {
  transform: var(--press-transform);
}

/* —— 空状态：白色浮起面板（全页少数使用软阴影的地方） —— */
.empty {
  margin: 0;
  padding: 26px var(--space);
  color: var(--c-muted);
  background: var(--c-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

/* —— 窄屏：日期退到内容上方（回退布局不回退设计） —— */
@media (max-width: 560px) {
  .idx-cell {
    grid-template-columns: 1fr;
  }

  .idx-date {
    padding-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .idx-cell,
  .idx-title,
  .idx-arrow,
  .idx-action {
    transition: none;
  }

  .idx-link:hover .idx-arrow {
    transform: none;
  }

  .idx-link:active,
  .idx-action:active {
    transform: none;
  }
}
</style>
