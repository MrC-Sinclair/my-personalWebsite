<!--
  RetroComputerProjectItem - 复古电脑风格的项目条目
  ------------------------------------------------------------
  项目窗口里的一个「文件条目」：像素文件夹图标 + 项目名 +
  精选徽章（深蓝底白字）+ 摘要 + 技术栈（白色凹陷槽里的等宽
  词条）+ 日期 + 在线演示 / GitHub 外链（悬停深蓝反白）。
  数据来自共享层 useProjects()；tags 用 Array.isArray 防御。
-->
<template>
  <article class="rc-proj">
    <header class="rc-proj__head">
      <RetroComputerPixelIcon variant="folder" />
      <h3 class="rc-proj__title">{{ project.title }}</h3>
      <span v-if="project.featured" class="rc-proj__badge">{{ t('projects.featured') }}</span>
    </header>

    <p v-if="project.description" class="rc-proj__desc">{{ project.description }}</p>

    <ul v-if="safeTags.length" class="rc-proj__tags">
      <li v-for="tag in safeTags" :key="tag" class="rc-proj__tag">{{ tag }}</li>
    </ul>

    <footer class="rc-proj__foot">
      <time class="rc-proj__date" :datetime="project.date">{{ formattedDate }}</time>

      <span v-if="project.demoUrl || project.githubUrl" class="rc-proj__actions">
        <a
          v-if="project.demoUrl"
          :href="project.demoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="rc-proj__link"
        >
          {{ t('projects.demo') }}
        </a>
        <a
          v-if="project.githubUrl"
          :href="project.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="rc-proj__link"
        >
          {{ t('projects.github') }}
        </a>
      </span>
    </footer>
  </article>
</template>

<script setup lang="ts">
/**
 * @file 复古电脑风格的项目条目组件
 * @description 数据来自共享层 useProjects()；日期格式化调用共享层
 *              formatDate（业务逻辑只写一份）；tags 防御非数组输入。
 */
import type { Project } from '~/types/project'
import RetroComputerPixelIcon from './RetroComputerPixelIcon.vue'

const props = defineProps<{
  /** 项目数据（共享层返回值） */
  project: Project
}>()

const { t, locale } = useI18n()

/** 按当前语言格式化的项目日期（共享层工具函数） */
const formattedDate = computed(() => formatDate(props.project.date, locale.value))

/** 防御：tags 非数组时回退为空列表 */
const safeTags = computed(() => (Array.isArray(props.project.tags) ? props.project.tags : []))
</script>

<style scoped>
/* —— 条目：虚线分隔 + 悬停底色 + 左侧深蓝指示条 —— */
.rc-proj {
  padding: 12px;
  border: var(--border-w) solid transparent;
  box-shadow: inset 3px 0 0 0 var(--c-accent);
}

.rc-proj:hover {
  background: #d4d4d4;
  border-color: var(--c-border);
}

.rc-proj + .rc-proj {
  margin-top: 8px;
}

/* —— 头部：图标 + 标题 + 精选徽章 —— */
.rc-proj__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rc-proj__title {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rc-proj__badge {
  flex: none;
  padding: 2px 8px;
  background: var(--c-accent);
  color: var(--c-on-accent);
  font-family: var(--font-body);
  font-size: var(--fs-small);
  font-weight: 700;
  white-space: nowrap;
}

.rc-proj__desc {
  margin: 8px 0 0;
  color: var(--c-text);
}

/* —— 技术栈：白色凹陷槽内的等宽词条 —— */
.rc-proj__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.rc-proj__tag {
  padding: 3px 8px;
  background: #ffffff;
  border: var(--border-w) solid;
  border-color: var(--c-border) #ffffff #ffffff var(--c-border);
  box-shadow: inset 1px 1px 0 0 #0a0a0a;
  color: var(--c-text);
  font-family: var(--font-mono);
  font-size: var(--fs-small);
}

/* —— 底部：日期 + 外链 —— */
.rc-proj__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
}

.rc-proj__date {
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: var(--fs-small);
}

.rc-proj__actions {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 外链：深蓝下划线，悬停深蓝底白字（瞬时反色） */
.rc-proj__link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 12px;
  border: var(--border-w) solid transparent;
  color: var(--c-accent);
  font-size: var(--fs-small);
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.rc-proj__link:hover {
  background: var(--c-accent);
  border-color: #dfdfdf #0a0a0a #0a0a0a #dfdfdf;
  color: var(--c-on-accent);
  text-decoration: none;
}

.rc-proj__link:focus-visible {
  outline: 2px dotted var(--c-text);
  outline-offset: 0;
}
</style>
