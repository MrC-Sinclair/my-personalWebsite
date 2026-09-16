<!--
  PixelInventoryItem - pixel 风格 INVENTORY 物品栏条目
  ------------------------------------------------------------
  精选项目不做海报卡片，做成 RPG 物品行（根元素 <li>）：
  左侧两位数编号格 + 名称/日期/标签/描述 + 行尾 DEMO / GITHUB
  道具按钮。标题 NuxtLink 用伪元素拉伸铺满整行（整行可点，
  且不产生嵌套锚点），行尾按钮抬升层级保持可点。
  整行 hover 色块反转为金黄底（像素风的反馈方式）。
  数据来自共享层 useProjects 的 getFeaturedProjects（页面传入），
  slug 换算复用共享层 contentSlug。
-->
<template>
  <li class="item">
    <span class="item-slot" aria-hidden="true">{{ slotNo }}</span>
    <div class="item-body">
      <h3 class="item-name">
        <NuxtLink class="item-link" :to="localePath(`/projects/${slug}`)">
          {{ project.title }}
        </NuxtLink>
      </h3>
      <p v-if="metaText" class="item-meta">{{ metaText }}</p>
      <p v-if="project.description" class="item-desc">{{ project.description }}</p>
      <div v-if="project.demoUrl || project.githubUrl" class="item-actions">
        <a
          v-if="project.demoUrl"
          class="item-btn"
          :href="project.demoUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t('projects.demo') }}<span aria-hidden="true"> ↗</span>
        </a>
        <a
          v-if="project.githubUrl"
          class="item-btn"
          :href="project.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t('projects.github') }}<span aria-hidden="true"> ↗</span>
        </a>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { Project } from '~/types/project'

const props = defineProps<{
  /** 项目数据（来自共享层） */
  project: Project
  /** 物品栏序号（从 0 开始，展示为两位数编号） */
  index: number
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

/** 编号格：01 起的两位数（语言无关） */
const slotNo = computed(() => String(props.index + 1).padStart(2, '0'))

/** 从内容路径提取 slug（复用共享层 contentSlug，详情页链接形态不变） */
const slug = computed(() => contentSlug(props.project.path))

/** 元信息行：日期 + 前 3 个标签（tags 防御性处理） */
const metaText = computed(() => {
  const tags = Array.isArray(props.project.tags) ? props.project.tags.slice(0, 3) : []
  const date = props.project.date ? formatDate(props.project.date, locale.value) : ''
  return [date, tags.join(' / ')].filter(Boolean).join(' · ')
})
</script>

<style scoped>
.item {
  position: relative;
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 12px;
  padding: 12px;
  background: color-mix(in srgb, var(--c-bg) 55%, var(--c-surface));
  border: 3px solid var(--c-border);
}

/* hover 色块反转：整行变金黄底，文字全部转深色 */
.item:hover {
  background: var(--c-accent);
}

.item-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  background: var(--c-bg);
  border: 2px solid color-mix(in srgb, var(--c-muted) 55%, transparent);
  color: var(--c-accent);
  font-size: var(--fs-small);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.item:hover .item-slot {
  background: transparent;
  border-color: var(--c-on-accent);
  color: var(--c-on-accent);
}

.item-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.item-name {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--c-text);
  text-shadow: 2px 2px 0 var(--c-border);
  overflow-wrap: anywhere;
}

/* 标题链接拉伸铺满整行（相对 .item 定位），实现整行可点 */
.item-link {
  color: var(--c-text);
  text-decoration: none;
}

.item-link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.item-meta {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  overflow-wrap: anywhere;
}

.item-desc {
  margin: 0;
  font-size: var(--fs-small);
  line-height: 1.9;
  color: var(--c-muted);
}

/* hover 反转后所有文字转深色，保证对比度 */
.item:hover .item-link,
.item:hover .item-meta,
.item:hover .item-desc {
  color: var(--c-on-accent);
}

.item-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

/* 道具按钮：抬升层级，保持在拉伸链接之上可点 */
.item-btn {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 12px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-text);
  background: var(--c-bg);
  border: 2px solid var(--c-border);
  text-decoration: none;
}

.item-btn:hover {
  color: var(--c-on-accent);
  background: var(--c-accent-2);
}

.item-btn:active {
  transform: var(--press-transform);
}

.item-link:focus-visible,
.item-btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}
</style>
