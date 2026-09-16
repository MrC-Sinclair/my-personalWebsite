<!--
  GlassmorphismProjectCard - glassmorphism 风格的精选项目卡
  ------------------------------------------------------------
  磨砂玻璃项目卡：整卡 NuxtLink 包裹（支持 Ctrl+Click 与
  SEO），内部在线演示 / GitHub 为外链按钮并用 @click.stop
  阻止冒泡；标签为半透白小药丸（数组字段做防御性处理）；
  hover 时整卡上浮并叠加彩色 Glow，slug 换算复用共享层
  contentSlug。
-->
<template>
  <NuxtLink class="project-card" :to="localePath(`/projects/${contentSlug(project.path)}`)">
    <div class="card-top">
      <h3 class="card-title">{{ project.title }}</h3>
      <span v-if="project.featured" class="featured-badge">{{ t('projects.featured') }}</span>
    </div>

    <p v-if="project.description" class="card-desc">{{ project.description }}</p>

    <ul v-if="safeTags.length" class="card-tags" :aria-label="t('projects.techStack')">
      <li v-for="tag in safeTags" :key="tag" class="tag-pill">{{ tag }}</li>
    </ul>

    <div class="card-links">
      <a
        v-if="project.demoUrl"
        class="link-pill"
        :href="project.demoUrl"
        target="_blank"
        rel="noopener"
        @click.stop
      >
        {{ t('projects.demo') }}<span class="link-arrow" aria-hidden="true">↗</span>
      </a>
      <a
        v-if="project.githubUrl"
        class="link-pill"
        :href="project.githubUrl"
        target="_blank"
        rel="noopener"
        @click.stop
      >
        {{ t('projects.github') }}<span class="link-arrow" aria-hidden="true">↗</span>
      </a>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { Project } from '~/types/project'

const props = defineProps<{
  /** 项目数据（来自 useProjects，只读展示） */
  project: Project
}>()

const { t } = useI18n()
const localePath = useLocalePath()

// 数组字段防御：tags 必须是数组才渲染
const safeTags = computed(() => (Array.isArray(props.project.tags) ? props.project.tags : []))
</script>

<style scoped>
/* 整卡为链接：磨砂玻璃 + hover 上浮与彩色 Glow */
.project-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: clamp(18px, 2.6vw, 28px);
  text-decoration: none;
  background: var(--c-surface);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  backdrop-filter: blur(18px) saturate(160%);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    border-color var(--transition);
}

.project-card:hover {
  transform: translateY(-6px);
  border-color: rgb(255 255 255 / 0.85);
  box-shadow:
    var(--shadow),
    0 0 40px rgb(139 92 246 / 0.22);
}

.project-card:active {
  transform: var(--press-transform);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.card-title {
  margin: 0;
  font-size: var(--fs-title);
  font-weight: 800;
  line-height: 1.3;
  color: var(--c-text);
  overflow-wrap: anywhere;
  transition: color var(--transition);
}

.project-card:hover .card-title {
  color: var(--c-accent);
}

/* 精选徽标：极光渐变胶囊（签名装饰） */
.featured-badge {
  flex: none;
  padding: 4px 12px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-on-accent);
  background: var(--deco);
  border-radius: 999px;
  box-shadow: 0 4px 12px rgb(139 92 246 / 0.35);
}

.card-desc {
  display: -webkit-box;
  overflow: hidden;
  margin: 10px 0 0;
  font-size: var(--fs-small);
  line-height: var(--lh-body);
  color: var(--c-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.tag-pill {
  padding: 3px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  background: rgb(255 255 255 / 0.5);
  border: var(--border-w) solid rgb(255 255 255 / 0.65);
  border-radius: 999px;
}

/* 外链按钮行：推到卡片底部 */
.card-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
  padding-top: 18px;
}

.link-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 6px 16px;
  font-size: var(--fs-small);
  font-weight: 700;
  text-decoration: none;
  color: var(--c-text);
  background: rgb(255 255 255 / 0.55);
  border: var(--border-w) solid rgb(255 255 255 / 0.7);
  border-radius: 999px;
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    background var(--transition),
    color var(--transition);
}

.link-pill:hover {
  transform: translateY(-2px);
  color: var(--c-accent);
  background: rgb(255 255 255 / 0.85);
  box-shadow: 0 8px 18px rgb(31 38 135 / 0.16);
}

.link-pill:active {
  transform: var(--press-transform);
}

.link-arrow {
  font-family: var(--font-mono);
}

@media (prefers-reduced-motion: reduce) {
  .project-card,
  .link-pill,
  .card-title {
    transition: none;
  }

  .project-card:hover,
  .link-pill:hover {
    transform: none;
  }

  .project-card:active,
  .link-pill:active {
    transform: none;
  }
}
</style>
