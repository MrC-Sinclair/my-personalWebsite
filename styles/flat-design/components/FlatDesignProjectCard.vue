<!--
  FlatDesignProjectCard - 扁平化风格项目卡片
  ------------------------------------------------------------
  白色表面卡 + 纯色几何图形头（几何拼贴代替封面图，无纹理）+
  「精选」章 / 标题 / 简介 / 技术标签 / 外链按钮。标题链接以
  拉伸热区覆盖整卡（stretched link），外链按钮浮于热区之上，
  避免嵌套 <a>。交互反馈只有颜色变化（色头加深、标题变色）。
-->
<template>
  <article class="project-card" :style="{ '--tone': tone.main, '--tone-deep': tone.deep }">
    <!-- 纯色几何头：按序号轮换颜色与几何构图 -->
    <div class="project-card__cover" :class="`project-card__cover--v${variant}`" aria-hidden="true">
      <span class="project-card__chip">{{ t('projects.featured') }}</span>
    </div>

    <div class="project-card__body">
      <h3 class="project-card__title">
        <NuxtLink :to="detailLink" class="project-card__link">{{ project.title }}</NuxtLink>
      </h3>
      <p v-if="project.description" class="project-card__desc">{{ project.description }}</p>
      <p class="project-card__meta">
        <span v-for="tag in topTags" :key="tag" class="project-card__tag">{{ tag }}</span>
        <span class="project-card__date">{{ formattedDate }}</span>
      </p>
    </div>

    <!-- 外链按钮：浮于拉伸热区之上（z-index），不在链接内嵌套链接 -->
    <div v-if="project.demoUrl || project.githubUrl" class="project-card__foot">
      <a
        v-if="project.demoUrl"
        :href="project.demoUrl"
        target="_blank"
        rel="noopener"
        class="project-card__ext project-card__ext--solid"
      >
        {{ t('projects.demo') }}
        <span aria-hidden="true">↗</span>
      </a>
      <a
        v-if="project.githubUrl"
        :href="project.githubUrl"
        target="_blank"
        rel="noopener"
        class="project-card__ext project-card__ext--ghost"
      >
        {{ t('projects.github') }}
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import { contentSlug } from '~/utils/content'
import { flatTone } from '../tones'

const props = defineProps<{
  /** 项目数据（来自共享层 useProjects） */
  project: Project
  /** 序号：决定色板与几何构图（循环取用，SSR 安全） */
  toneIndex: number
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

/** 当前色调（主色 + 加深色，经 CSS 变量注入） */
const tone = computed(() => flatTone(props.toneIndex))

/** 几何构图变体（0-3 循环） */
const variant = computed(() => ((props.toneIndex % 4) + 4) % 4)

/** 详情页地址：slug 换算复用共享层 contentSlug，再拼本地化详情路由 */
const detailLink = computed(() => localePath(`/projects/${contentSlug(props.project.path)}`))

/** 本地化日期（共享层 formatDate） */
const formattedDate = computed(() => formatDate(props.project.date, locale.value))

/** 防御：tags 非数组时回退空列表，只取前三个 */
const topTags = computed(() =>
  Array.isArray(props.project.tags) ? props.project.tags.slice(0, 3) : [],
)
</script>

<style scoped>
.project-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color var(--transition);
}

.project-card:hover {
  border-color: var(--tone);
}

/* —— 纯色几何头 —— */
.project-card__cover {
  position: relative;
  height: 132px;
  background: var(--tone);
}

.project-card__chip {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--tone);
  background: #ffffff;
  border-radius: var(--radius-sm);
}

/* v0：白圆环 + 白点 */
.project-card__cover--v0::before {
  content: '';
  position: absolute;
  top: 30px;
  left: 28px;
  width: 68px;
  height: 68px;
  border: 10px solid rgb(255 255 255 / 0.85);
  border-radius: 50%;
}

.project-card__cover--v0::after {
  content: '';
  position: absolute;
  right: 34px;
  bottom: 28px;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border-radius: 50%;
}

/* v1：白三角 + 描边小方 */
.project-card__cover--v1::before {
  content: '';
  position: absolute;
  top: 36px;
  left: 36px;
  width: 0;
  height: 0;
  border-left: 30px solid transparent;
  border-right: 30px solid transparent;
  border-bottom: 50px solid rgb(255 255 255 / 0.9);
}

.project-card__cover--v1::after {
  content: '';
  position: absolute;
  right: 36px;
  bottom: 34px;
  width: 22px;
  height: 22px;
  border: 6px solid rgb(255 255 255 / 0.7);
}

/* v2：白菱形 + 白色小方 */
.project-card__cover--v2::before {
  content: '';
  position: absolute;
  top: 28px;
  left: 40px;
  width: 46px;
  height: 46px;
  background: rgb(255 255 255 / 0.9);
  transform: rotate(45deg);
}

.project-card__cover--v2::after {
  content: '';
  position: absolute;
  right: 40px;
  bottom: 30px;
  width: 14px;
  height: 14px;
  background: #ffffff;
}

/* v3：白色半圆 + 黄色色点 */
.project-card__cover--v3::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 32px;
  width: 92px;
  height: 46px;
  background: rgb(255 255 255 / 0.9);
  border-radius: 92px 92px 0 0;
}

.project-card__cover--v3::after {
  content: '';
  position: absolute;
  top: 30px;
  right: 38px;
  width: 20px;
  height: 20px;
  background: var(--deco);
  border-radius: 50%;
}

/* —— 卡片主体 —— */
.project-card__body {
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
  padding: 18px 18px 14px;
}

.project-card__title {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 800;
  line-height: 1.3;
}

.project-card__link {
  color: var(--c-text);
  text-decoration: none;
  transition: color var(--transition);
}

/* 拉伸热区：整卡可点击（保留 NuxtLink 语义与 prefetch） */
.project-card__link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.project-card__link:hover,
.project-card:hover .project-card__link {
  color: var(--tone);
}

.project-card__link:focus-visible {
  outline: 3px solid var(--tone);
  outline-offset: 2px;
}

.project-card__desc {
  display: -webkit-box;
  overflow: hidden;
  margin: 8px 0 0;
  font-size: var(--fs-small);
  line-height: 1.65;
  color: var(--c-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.project-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 14px 0 0;
}

.project-card__tag {
  padding: 3px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text);
  background: #edf1f6;
  border-radius: var(--radius-sm);
}

.project-card__date {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--c-muted);
}

/* —— 外链脚部（浮于热区之上） —— */
.project-card__foot {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 18px 18px;
}

.project-card__ext {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  border-radius: var(--radius);
  transition:
    background var(--transition),
    color var(--transition),
    border-color var(--transition);
}

.project-card__ext--solid {
  color: #ffffff;
  background: var(--tone);
}

.project-card__ext--solid:hover {
  background: var(--tone-deep);
}

.project-card__ext--ghost {
  color: var(--tone);
  border: 2px solid var(--tone);
}

.project-card__ext--ghost:hover {
  color: #ffffff;
  background: var(--tone);
}

.project-card__ext:active {
  color: #ffffff;
  background: var(--tone-deep);
}

.project-card__ext:focus-visible {
  outline: 3px solid var(--tone);
  outline-offset: 2px;
}
</style>
