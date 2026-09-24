<!--
  SwissProjectList - swiss 风格精选项目列表
  ------------------------------------------------------------
  编号 + 非对称网格：卡片交替占据 7 栏 / 5 栏（宽窄悬殊，
  拒绝三等分），末位留白也是构图的一部分。每张卡片：红色
  编号 + 项目名（链接，强调色下划线生长）+ 描述 + 日期与
  技术栈小标签 + 外链（演示 / GitHub，带 ↗）。数据来自
  共享层 useProjects（页面获取后传入）。
-->
<template>
  <div class="proj-grid">
    <article
      v-for="(project, i) in projects"
      :key="project.path"
      class="proj-card"
      :class="i % 2 === 0 ? 'is-wide' : 'is-narrow'"
    >
      <p class="proj-head">
        <span class="proj-no" aria-hidden="true">{{ pad(i + 1) }}</span>
        <time class="proj-date" :datetime="project.date">{{ formatDate(project.date, locale) }}</time>
      </p>

      <h3 class="proj-title">
        <NuxtLink class="proj-link" :to="localePath(projectPath(project))">
          {{ project.title }}
        </NuxtLink>
      </h3>

      <p v-if="project.description" class="proj-desc">{{ project.description }}</p>

      <p v-if="tagsText(project.tags)" class="proj-tags">{{ tagsText(project.tags) }}</p>

      <footer
        v-if="project.demoUrl || project.githubUrl"
        class="proj-links"
      >
        <a
          v-if="project.demoUrl"
          class="ext-link"
          :href="project.demoUrl"
          target="_blank"
          rel="noopener"
        >
          {{ t('projects.demo') }}
          <span class="ext-arrow" aria-hidden="true">↗</span>
        </a>
        <a
          v-if="project.githubUrl"
          class="ext-link"
          :href="project.githubUrl"
          target="_blank"
          rel="noopener"
        >
          {{ t('projects.github') }}
          <span class="ext-arrow" aria-hidden="true">↗</span>
        </a>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import { contentSlug } from '~/utils/content'

defineProps<{
  /** 精选项目（来自 useProjects，已按日期倒序） */
  projects: Project[]
}>()

const { t, locale } = useI18n()
// 详情链接走风格内路由（/style/<id>/projects/<slug>），旧的 /projects/<slug> 已 404
const { styleId } = useStyleContentPath()
const localePath = useLocalePath()

/** 编号格式化：补零到两位 */
function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** 项目详情路由（风格内：/style/<id>/projects/<slug>） */
function projectPath(project: Project): string {
  return `/style/${styleId.value}/projects/${contentSlug(project.path)}`
}

/** 技术栈标签转斜杠分隔文本（数组字段防御，最多取 4 个） */
function tagsText(tags: unknown): string {
  if (!Array.isArray(tags)) return ''
  const list = tags.map((item) => String(item).trim()).filter(Boolean)
  return list.slice(0, 4).join(' / ')
}
</script>

<style scoped>
/* 移动端：单列，宽窄差异回退为统一的细则线行 */
.proj-grid {
  display: grid;
  gap: 0;
}

.proj-card {
  display: grid;
  gap: 10px;
  align-content: start;
  padding: var(--space) 0;
  border-top: var(--border-w) solid var(--c-border);
}

.proj-card:last-child {
  border-bottom: var(--border-w) solid var(--c-border);
}

/* 头部：红色编号 + 日期两端对齐 */
.proj-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--gap);
  margin: 0;
}

.proj-no {
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-accent);
  letter-spacing: 0.14em;
  font-variant-numeric: tabular-nums;
}

.proj-date {
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;
}

/* 项目名：大号 + 强调色下划线生长 */
.proj-title {
  margin: 0;
  font-size: clamp(24px, 3vw, 38px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--c-text);
}

.proj-link {
  color: inherit;
  text-decoration: none;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 3px;
  transition: background-size var(--transition);
}

.proj-link:hover,
.proj-link:focus-visible {
  background-size: 100% 3px;
}

.proj-link:active {
  color: var(--c-accent);
}

.proj-desc {
  margin: 0;
  max-width: 62ch;
  color: var(--c-muted);
}

/* 技术栈：小号宽字距斜杠清单 */
.proj-tags {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-text);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* 外链行：下划线位移反馈 + 箭头微动，触控目标 ≥ 40px */
.proj-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 32px;
  margin-top: 6px;
}

.ext-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 2px;
  transition: background-size var(--transition);
}

.ext-link:hover,
.ext-link:focus-visible {
  background-size: 100% 2px;
}

.ext-link:active {
  color: var(--c-accent);
}

.ext-arrow {
  color: var(--c-accent);
  transition: transform var(--transition);
}

.ext-link:hover .ext-arrow {
  transform: translate(2px, -2px);
}

/* —— 桌面端：12 栏非对称网格，宽窄交替 —— */
@media (min-width: 900px) {
  .proj-grid {
    grid-template-columns: repeat(12, 1fr);
    gap: 0 var(--gap);
  }

  .proj-card.is-wide {
    grid-column: span 7;
  }

  .proj-card.is-narrow {
    grid-column: span 5;
  }

  /* 非首行卡片补回被网格 gap 顶掉的左边界感：宽卡右留白即可，
     卡片间用规则线自然分隔（每张卡自带 border-top） */
}
</style>
