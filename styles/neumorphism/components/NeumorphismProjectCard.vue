<!--
  NeumorphismProjectCard - neumorphism 风格精选项目卡片
  ------------------------------------------------------------
  凸起大圆角卡片：右上角刻着凹陷序号，标题为指向项目详情的
  链接（走 localePath），日期/简介/技术栈胶囊与「在线演示 /
  GitHub」外链凸起小按钮。卡片 hover 光影加深 + 微上浮，
  按钮 active 凹进材料（reduced-motion 下关闭位移）。
  slug 换算复用共享层 contentSlug（不在风格里重写业务逻辑）。
-->
<template>
  <article class="card">
    <span class="card-no" aria-hidden="true">{{ no }}</span>

    <h3 class="card-title">
      <NuxtLink class="card-link" :to="localePath(`/projects/${contentSlug(project.path)}`)">
        {{ project.title }}
      </NuxtLink>
    </h3>

    <p v-if="project.date" class="card-date">{{ formatDate(project.date, locale) }}</p>

    <p v-if="project.description" class="card-desc">{{ project.description }}</p>

    <ul v-if="tags.length" class="card-tags" :aria-label="t('projects.techStack')">
      <li v-for="tag in tags" :key="tag" class="card-tag">{{ tag }}</li>
    </ul>

    <div v-if="project.demoUrl || project.githubUrl" class="card-actions">
      <a
        v-if="project.demoUrl"
        class="mini-btn"
        :href="project.demoUrl"
        target="_blank"
        rel="noopener"
      >
        {{ t('projects.demo') }}<span class="arrow" aria-hidden="true">↗</span>
      </a>
      <a
        v-if="project.githubUrl"
        class="mini-btn"
        :href="project.githubUrl"
        target="_blank"
        rel="noopener"
      >
        {{ t('projects.github') }}<span class="arrow" aria-hidden="true">↗</span>
      </a>
    </div>
  </article>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { Project } from '~/types/project'

const props = defineProps<{
  /** 项目数据（来自共享层 useProjects） */
  project: Project
  /** 卡片序号（用于右上角凹陷编号） */
  index: number
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

/** 右上角编号：01 / 02 …（装饰） */
const no = computed(() => String(props.index + 1).padStart(2, '0'))

/** 技术栈标签（防御性处理非数组字段） */
const tags = computed(() => (Array.isArray(props.project.tags) ? props.project.tags : []))
</script>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: calc(var(--space) + 4px);
  background: var(--c-bg);
  border-radius: calc(var(--radius) + 8px);
  box-shadow: var(--shadow);
  transition:
    box-shadow var(--transition),
    transform var(--transition);
}

/* hover：光影加深 + 微上浮 */
.card:hover {
  transform: translateY(-3px);
  box-shadow: 12px 12px 24px #a3b1c6, -12px -12px 24px #ffffff;
}

/* 右上角凹陷编号（装饰） */
.card-no {
  position: absolute;
  top: 20px;
  right: 26px;
  font-size: 30px;
  font-weight: 800;
  color: #c5cedd;
  text-shadow: 1px 1px 1px rgb(255 255 255 / 0.9);
}

.card-title {
  margin: 0;
  padding-right: 56px;
  font-size: var(--fs-title);
  font-weight: 700;
  line-height: 1.4;
}

.card-link {
  color: var(--c-text);
  text-decoration: none;
  transition: color var(--transition);
}

.card-link:hover {
  color: var(--c-accent);
}

.card-link:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 4px;
  border-radius: 4px;
}

.card-date {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.card-desc {
  margin: 0;
  color: var(--c-muted);
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.card-tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-accent);
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: 2px 2px 5px #a3b1c6, -2px -2px 5px #ffffff;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
}

/* —— 凸起外链小按钮：hover 加深、active 凹进 —— */
.mini-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 18px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-accent);
  text-decoration: none;
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: 4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff;
  transition:
    box-shadow var(--transition),
    color var(--transition);
}

.mini-btn:hover {
  color: var(--c-text);
  box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff;
}

.mini-btn:active {
  color: var(--c-accent);
  box-shadow: var(--shadow-press);
}

.mini-btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

.arrow {
  font-family: var(--font-mono);
}

/* 移动端：hover 加深阴影收敛，签名保留 */
@media (max-width: 640px) {
  .card:hover {
    transform: none;
    box-shadow: 8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }

  .card:hover {
    transform: none;
  }

  .card-link,
  .mini-btn {
    transition: none;
  }
}
</style>
