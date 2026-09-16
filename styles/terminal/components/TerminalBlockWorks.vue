<!--
  TerminalBlockWorks - terminal 风格「精选作品」区块
  ------------------------------------------------------------
  作品集是 ls -l 式的清单：[n] 编号 + 标题（NuxtLink 进入详情，
  slug 由共享层 contentSlug 从内容 path 提取）+ 描述 + tags + 行尾
  GitHub / Demo 外链。数据来自共享层 useProjects（页面经
  useAsyncData 传入）；空列表显示 i18n 空状态文案。
  同一组件同时服务于命令输出区与页尾隐藏降级区。
-->
<template>
  <ol class="works">
    <li v-for="(project, i) in safeProjects" :key="project.path || i" class="work">
      <p class="work-title">
        <span class="work-idx" aria-hidden="true">[{{ i + 1 }}]</span>
        <template v-if="slugOf(project)">
          <NuxtLink class="work-link" :to="localePath(`/projects/${slugOf(project)}`)">
            {{ project.title }}
          </NuxtLink>
        </template>
        <span v-else class="work-plain">{{ project.title }}</span>
      </p>

      <p v-if="project.description" class="work-desc">{{ project.description }}</p>
      <p v-if="tagsOf(project).length" class="work-tags">
        <span class="work-tags-label">{{ t('projects.techStack') }}</span>
        {{ tagsOf(project).join(' / ') }}
      </p>

      <p v-if="project.githubUrl || project.demoUrl" class="work-links">
        <a
          v-if="project.githubUrl"
          class="work-ext"
          :href="project.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="work-ext-glyph" aria-hidden="true">-&gt;&nbsp;</span>{{ t('projects.github')
          }}<span aria-hidden="true">&nbsp;↗</span>
        </a>
        <a
          v-if="project.demoUrl"
          class="work-ext"
          :href="project.demoUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="work-ext-glyph" aria-hidden="true">-&gt;&nbsp;</span>{{ t('projects.demo')
          }}<span aria-hidden="true">&nbsp;↗</span>
        </a>
      </p>
    </li>

    <li v-if="!safeProjects.length" class="empty">{{ t('projects.noResults') }}</li>
  </ol>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import { contentSlug } from '~/utils/content'

const props = defineProps<{
  /** 项目数据（来自共享层 useProjects，经 useAsyncData 传入） */
  projects: Project[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()

/** 防御：数组字段用 Array.isArray 检查，异常时回落为空列表 */
const safeProjects = computed(() => (Array.isArray(props.projects) ? props.projects : []))

/** 从内容路径提取 slug（收敛到共享层 contentSlug，多风格唯一实现） */
function slugOf(project: Project): string {
  return contentSlug(project.path)
}

/** tags 防御性处理 */
function tagsOf(project: Project): string[] {
  return Array.isArray(project.tags) ? project.tags : []
}
</script>

<style scoped>
.works {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 4px 0;
  list-style: none;
}

.work {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  border-bottom: var(--border-w) dashed color-mix(in srgb, var(--c-border) 70%, transparent);
}

.work:last-of-type {
  border-bottom: none;
}

.work-title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 8px;
  margin: 0;
}

.work-idx {
  color: var(--c-accent-2);
  font-variant-numeric: tabular-nums;
}

/* 标题链接：薄荷绿 + hover 辉光提亮（瞬时）；≥40px 触控目标 */
.work-link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  color: var(--c-accent);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.work-link:hover {
  text-decoration: underline;
  text-shadow: 0 0 8px color-mix(in srgb, var(--c-accent) 45%, transparent);
}

.work-link:active {
  transform: var(--press-transform);
}

.work-link:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.work-plain {
  color: var(--c-accent);
  overflow-wrap: anywhere;
}

.work-desc {
  margin: 0;
  color: var(--c-muted);
  overflow-wrap: anywhere;
}

/* 标签行统一用 muted 绿（对比度 ≥ 4.5:1），标签名略暗 */
.work-tags {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
  overflow-wrap: anywhere;
}

.work-tags-label {
  color: var(--c-text);
}

.work-links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  margin: 2px 0 0;
}

/* 外链：琥珀色，≥40px 触控目标，hover 琥珀底反色（瞬时切换） */
.work-ext {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  color: var(--c-accent-2);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.work-ext-glyph {
  color: var(--c-muted);
}

.work-ext:hover {
  color: var(--c-on-accent);
  background: var(--c-accent-2);
}

.work-ext:hover .work-ext-glyph {
  color: var(--c-on-accent);
}

.work-ext:active {
  transform: var(--press-transform);
}

.work-ext:focus-visible {
  outline: 2px solid var(--c-accent-2);
  outline-offset: 2px;
}

.empty {
  padding: 8px 0;
  color: var(--c-muted);
}
</style>
