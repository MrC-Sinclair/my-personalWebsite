<!--
  CyberpunkProjectCard - cyberpunk 风格项目「悬赏数据板」
  ------------------------------------------------------------
  单个精选项目的切角数据板：顶部视觉区（有封面图则展示并叠
  加扫描线，无图则用纯 CSS 网格 + 字符装饰占位），下方标题
  （霓虹发光）、描述、三色轮换技术栈芯片，底部外链按钮
  （在线演示 / GitHub，原生 <a> + @click.stop 阻止冒泡）。
  整卡 NuxtLink 包裹跳项目详情页（支持 Ctrl+Click / 右键），
  slug 换算复用共享层 contentSlug（不在风格里重写业务逻辑）。
-->
<template>
  <NuxtLink :to="localePath(projectRoute)" class="card-link">
    <article class="card">
      <!-- 视觉区：封面图或纯 CSS 网格占位 -->
      <div class="visual" :class="{ 'visual-plain': !project.image }">
        <img
          v-if="project.image"
          class="visual-img"
          :src="project.image"
          :alt="project.title"
          loading="lazy"
        >
        <span v-else class="visual-glyph" aria-hidden="true">▞▚</span>
        <span class="visual-scan" aria-hidden="true"/>
      </div>

      <div class="main">
        <header class="top">
          <h3 class="name">{{ project.title }}</h3>
          <span v-if="project.featured" class="badge">
            <span aria-hidden="true">★</span>{{ t('projects.featured') }}
          </span>
        </header>

        <p v-if="project.description" class="desc">{{ project.description }}</p>

        <ul v-if="displayTags.length" class="tags">
          <li
            v-for="(tag, index) in displayTags"
            :key="tag"
            class="tag"
            :class="`tag-${index % 3}`"
          >
            {{ tag }}
          </li>
        </ul>

        <footer v-if="project.demoUrl || project.githubUrl" class="actions">
          <a
            v-if="project.demoUrl"
            class="action action-demo"
            :href="project.demoUrl"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
          >
            {{ t('projects.demo') }}<span class="arrow" aria-hidden="true">↗</span>
          </a>
          <a
            v-if="project.githubUrl"
            class="action action-gh"
            :href="project.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
          >
            {{ t('projects.github') }}<span class="arrow" aria-hidden="true">↗</span>
          </a>
        </footer>
      </div>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { Project } from '~/types/project'

const props = defineProps<{
  /** 项目数据（来自共享层 useProjects） */
  project: Project
}>()

const { t } = useI18n()
const localePath = useLocalePath()
// 详情链接走风格内路由（/style/<id>/projects/<slug>），旧的 /projects/<slug> 已 404
const { styleId } = useStyleContentPath()

/** 标签防御：只取前 4 个非空标签 */
const displayTags = computed(() =>
  (Array.isArray(props.project.tags) ? props.project.tags : [])
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 4),
)

/** 由内容路径推导详情页路由（slug 换算复用共享层 contentSlug） */
/** 由内容路径推导详情页路由（风格内：/style/<id>/projects/<slug>） */
const projectRoute = computed(
  () => `/style/${styleId.value}/projects/${contentSlug(props.project.path)}`,
)
</script>

<style scoped>
/* 链接本体接管切角，保证整卡可点击区域完整 */
.card-link {
  display: block;
  height: 100%;
  outline-offset: 3px;
}

/* —— 双层切角卡：外层发光描边，内层深底 —— */
.card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1px;
  background: linear-gradient(
    140deg,
    rgb(34 211 238 / 0.75),
    var(--c-border) 40%,
    rgb(255 45 149 / 0.55)
  );
  clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
  transition:
    box-shadow var(--transition),
    transform var(--transition);
}

.card-link:hover .card {
  transform: translateY(-4px);
  box-shadow:
    0 0 22px rgb(34 211 238 / 0.4),
    0 0 44px rgb(255 45 149 / 0.22);
}

.card-link:active .card {
  transform: var(--press-transform);
}

.main {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: var(--space);
  background: var(--c-surface);
  clip-path: polygon(0 0, calc(100% - 19px) 0, 100% 19px, 100% 100%, 19px 100%, 0 calc(100% - 19px));
}

/* —— 视觉区：封面 / 网格占位 + 扫描线 + hover 扫光 —— */
.visual {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  height: 132px;
  background: var(--c-bg);
  clip-path: polygon(0 0, calc(100% - 19px) 0, 100% 19px, 100% 100%, 19px 100%, 0 calc(100% - 19px));
}

/* 纯 CSS 网格占位：无封面图时的数据网格 */
.visual-plain {
  background:
    repeating-linear-gradient(90deg, rgb(34 211 238 / 0.14) 0 1px, transparent 1px 26px),
    repeating-linear-gradient(0deg, rgb(255 45 149 / 0.1) 0 1px, transparent 1px 22px),
    var(--c-bg);
}

.visual-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: var(--img-rendering);
}

/* 占位大字符：无图时的数字装饰 */
.visual-glyph {
  font-family: var(--font-head);
  font-size: 52px;
  color: rgb(34 211 238 / 0.4);
  text-shadow: 0 0 18px rgb(34 211 238 / 0.5);
}

/* 视觉区扫描线（--deco） */
.visual-scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: var(--deco);
}

/* hover 扫光：一道亮带从上到下掠过 */
.visual::after {
  position: absolute;
  top: -40%;
  right: 0;
  left: 0;
  height: 40%;
  content: '';
  pointer-events: none;
  background: linear-gradient(180deg, transparent, rgb(34 211 238 / 0.14), transparent);
  opacity: 0;
  transition:
    top 0.7s ease,
    opacity var(--transition);
}

.card-link:hover .visual::after {
  top: 110%;
  opacity: 1;
}

/* —— 标题行 —— */
.top {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 10px;
}

.name {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--c-accent);
  text-shadow: 0 0 12px rgb(34 211 238 / 0.5);
  overflow-wrap: break-word;
  transition: text-shadow var(--transition);
}

.card-link:hover .name {
  text-shadow: 0 0 18px rgb(34 211 238 / 0.85);
}

/* 精选徽标：粉色斜切小签 */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  background: rgb(255 45 149 / 0.1);
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  box-shadow: inset 0 0 0 var(--border-w) rgb(255 45 149 / 0.5);
}

.desc {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

/* —— 技术栈芯片（三色轮换） —— */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  background: rgb(255 255 255 / 0.03);
  clip-path: polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px);
  box-shadow: inset 0 0 0 var(--border-w) var(--tag-line);
}

.tag-0 {
  --tag-line: rgb(34 211 238 / 0.5);
  color: var(--c-accent);
}

.tag-1 {
  --tag-line: rgb(168 85 247 / 0.5);
  color: color-mix(in srgb, var(--c-accent) 48%, var(--c-accent-2));
}

.tag-2 {
  --tag-line: rgb(255 45 149 / 0.5);
  color: var(--c-accent-2);
}

/* —— 外链按钮：≥40px 触控目标，青 / 粉双档 —— */
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
  padding-top: 4px;
}

.action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 16px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-decoration: none;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.action-demo {
  color: var(--c-on-accent);
  background: var(--c-accent);
  box-shadow: 0 0 12px rgb(34 211 238 / 0.4);
}

.action-demo:hover {
  box-shadow: 0 0 22px rgb(34 211 238 / 0.7);
}

.action-gh {
  color: var(--c-accent-2);
  background: rgb(255 45 149 / 0.08);
  box-shadow: inset 0 0 0 var(--border-w) rgb(255 45 149 / 0.55);
}

.action-gh:hover {
  color: var(--c-on-accent);
  background: var(--c-accent-2);
  box-shadow:
    inset 0 0 0 var(--border-w) var(--c-accent-2),
    0 0 16px rgb(255 45 149 / 0.5);
}

.action:active {
  transform: var(--press-transform);
}

.arrow {
  font-family: var(--font-mono);
  transition: transform var(--transition);
}

.action:hover .arrow {
  transform: translate(2px, -2px);
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .name,
  .visual::after,
  .action,
  .arrow {
    transition: none;
  }

  .card-link:hover .card,
  .card-link:active .card,
  .action:active,
  .action:hover .arrow {
    transform: none;
  }

  .card-link:hover .visual::after {
    top: -40%;
    opacity: 0;
  }
}
</style>
