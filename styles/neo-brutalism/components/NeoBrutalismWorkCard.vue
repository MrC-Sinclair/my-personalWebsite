<!--
  NeoBrutalismWorkCard - neo-brutalism 风格精选项目卡
  ------------------------------------------------------------
  「大编号榜单」条目：巨大描边序号（01/02…）+ 项目标题 +
  描述 + 日期与标签，底色按 海报黄/粉/浅蓝 循环对撞。
  整卡由 NuxtLink 包裹跳项目详情（slug 换算复用共享层 contentSlug），
  卡内在线演示 / GitHub 外链按钮用 @click.stop 阻止冒泡。
  数据来自共享层 useProjects（页面传入）。
-->
<template>
  <NuxtLink class="work" :class="`is-tone-${index % 3}`" :to="localePath(`/projects/${contentSlug(project.path)}`)">
    <article class="card">
      <span class="no" aria-hidden="true">{{ no }}</span>
      <div class="body">
        <h3 class="title">
          {{ project.title }}
          <span v-if="project.featured" class="flag">{{ t('projects.featured') }}</span>
        </h3>
        <p v-if="project.description" class="desc">{{ project.description }}</p>
        <p class="meta">
          <span class="date">{{ formatDate(project.date, locale) }}</span>
          <span v-for="tag in safeTags.slice(0, 4)" :key="tag" class="tag">{{ tag }}</span>
        </p>
        <p class="links">
          <a
            v-if="project.demoUrl"
            class="ext is-fill"
            :href="project.demoUrl"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
          >
            {{ t('projects.demo') }}<span class="ext-arrow" aria-hidden="true">↗</span>
          </a>
          <a
            v-if="project.githubUrl"
            class="ext"
            :href="project.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
          >
            {{ t('projects.github') }}<span class="ext-arrow" aria-hidden="true">↗</span>
          </a>
        </p>
      </div>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { Project } from '~/types/project'

const props = defineProps<{
  /** 项目数据（来自 useProjects） */
  project: Project
  /** 序号（用于大编号与底色循环） */
  index: number
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

/** 巨大编号：01 起，两位补零（纯算术，SSR 安全） */
const no = computed(() => String(props.index + 1).padStart(2, '0'))

/** 防御性归一化：tags 数组字段用 Array.isArray 检查 */
const safeTags = computed<string[]>(() => (Array.isArray(props.project.tags) ? props.project.tags : []))
</script>

<style scoped>
.card {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 18px;
  align-items: start;
  padding: 20px;
  border: var(--border-w) solid var(--c-border);
  box-shadow: var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

/* —— 底色循环：海报黄 / 粉 / 浅蓝（风格签名撞色） —— */
.work.is-tone-0 .card {
  background: var(--c-accent);
  color: var(--c-on-accent);
}

.work.is-tone-1 .card {
  /* 粉：撞色签名装饰 */
  background: #ff90e8;
  color: var(--c-text);
}

.work.is-tone-2 .card {
  /* 浅蓝：撞色签名装饰 */
  background: #a0e7ff;
  color: var(--c-text);
}

/* hover 抬起、按压缩回：硬影随之增大 / 收缩 */
.work:hover .card {
  transform: translate(-4px, -4px);
  box-shadow: 10px 10px 0 var(--c-border);
}

.work:active .card {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

.work:focus-visible {
  outline: var(--border-w) solid var(--c-accent-2);
  outline-offset: 4px;
}

/* —— 大编号：描边空心字 —— */
.no {
  font-family: var(--font-head);
  font-size: 56px;
  font-weight: 900;
  line-height: 0.8;
  color: transparent;
  -webkit-text-stroke: 2px var(--c-border);
}

.title {
  margin: 0;
  font-family: var(--font-head);
  font-size: 22px;
  font-weight: 900;
  line-height: 1.25;
  overflow-wrap: break-word;
}

/* 精选小旗：黑底反白角标 */
.flag {
  display: inline-block;
  padding: 1px 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--c-bg);
  background: var(--c-text);
  vertical-align: middle;
}

.desc {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.6;
  /* 彩底上的正文墨色（对比度 ≥ 4.5:1） */
  color: #33332e;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 10px 0 0;
}

.date {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
}

.tag {
  padding: 1px 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  border: 2px solid var(--c-border);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 14px 0 0;
}

/* —— 外链按钮：≥40px 触控目标，hover 反白 —— */
.ext {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 40px;
  padding: 8px 14px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  transition:
    color var(--transition),
    background var(--transition);
}

.ext.is-fill {
  background: var(--c-text);
  color: var(--c-bg);
}

.ext:hover {
  color: var(--c-bg);
  background: var(--c-accent-2);
}

.ext:active {
  transform: var(--press-transform);
}

.ext:focus-visible {
  outline: var(--border-w) solid var(--c-accent-2);
  outline-offset: 3px;
}

.ext-arrow {
  font-family: var(--font-mono);
}

/* —— 窄屏：编号与正文改上下排，签名保留 —— */
@media (max-width: 640px) {
  .card {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .no {
    font-size: 44px;
    line-height: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }

  .work:hover .card {
    transform: none;
  }

  .work:active .card,
  .ext:active {
    transform: none;
  }

  .ext {
    transition: none;
  }
}
</style>
