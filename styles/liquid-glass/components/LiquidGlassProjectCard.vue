<!--
  LiquidGlassProjectCard - liquid-glass 风格的项目玻璃卡
  ------------------------------------------------------------
  单个精选项目的漂浮玻璃卡：整卡 NuxtLink 包裹跳详情页
  （支持 Ctrl+Click / 中键 / 右键），内部外链按钮（在线演示
  / GitHub）用原生 <a> + @click.stop 阻止冒泡避免嵌套链接。
  玻璃签名：折射微染色 + 半透描边 + 上缘高光 + 悬浮投影，
  hover 时上浮、投影加深；模糊半径 14px（与面板错开的景深）。
-->
<template>
  <NuxtLink :to="localePath(projectRoute)" class="card-link">
    <article class="card glass">
      <span class="sheen" aria-hidden="true"/>
      <header class="top">
        <h3 class="name">{{ project.title }}</h3>
        <span v-if="project.featured" class="badge">{{ t('projects.featured') }}</span>
      </header>

      <p v-if="project.description" class="desc">{{ project.description }}</p>

      <ul class="tags">
        <li v-for="tag in displayTags" :key="tag" class="tag">{{ tag }}</li>
      </ul>

      <footer class="actions">
        <a
          v-if="project.demoUrl"
          class="action action-solid"
          :href="project.demoUrl"
          target="_blank"
          rel="noopener noreferrer"
          @click.stop
        >
          {{ t('projects.demo') }}<span class="arrow" aria-hidden="true">↗</span>
        </a>
        <a
          v-if="project.githubUrl"
          class="action action-ghost"
          :href="project.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          @click.stop
        >
          {{ t('projects.github') }}<span class="arrow" aria-hidden="true">↗</span>
        </a>
      </footer>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import { contentSlug } from '~/utils/content'

const props = defineProps<{
  /** 项目数据（来自共享层 useProjects） */
  project: Project
}>()

const { t } = useI18n()
const localePath = useLocalePath()
// 详情链接走风格内路由（/style/<id>/projects/<slug>），旧的 /projects/<slug> 已 404
const { styleId } = useStyleContentPath()

/** 标签防御：只取前 5 个非空标签 */
const displayTags = computed(() =>
  (Array.isArray(props.project.tags) ? props.project.tags : [])
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 5),
)

/** 由内容路径推导详情页路由（风格内：/style/<id>/projects/<slug>） */
const projectRoute = computed(
  () => `/style/${styleId.value}/projects/${contentSlug(props.project.path)}`,
)
</script>

<style scoped>
/* 整卡可点击：链接本体接管圆角裁切 */
.card-link {
  display: block;
  height: 100%;
  border-radius: var(--radius);
}

/* —— 玻璃配方（卡片级，模糊半径 14px，比面板浅一级形成景深） —— */
.glass {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: clamp(20px, 2.6vw, 30px);
  background:
    linear-gradient(120deg, rgb(167 139 255 / 0.1), rgb(94 227 255 / 0.05) 52%, rgb(255 122 184 / 0.1)),
    linear-gradient(180deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.04));
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  box-shadow:
    var(--shadow-press),
    inset 0 1px 0 rgb(255 255 255 / 0.3),
    inset 0 -1px 0 rgb(255 255 255 / 0.05);
  backdrop-filter: blur(14px) saturate(1.35);
  -webkit-backdrop-filter: blur(14px) saturate(1.35);
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    border-color var(--transition);
}

@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: rgb(24 17 60 / 0.94);
  }
}

.card-link:hover .glass {
  border-color: rgb(255 255 255 / 0.32);
  box-shadow:
    var(--shadow),
    inset 0 1px 0 rgb(255 255 255 / 0.36),
    0 0 24px rgb(94 227 255 / 0.12);
  transform: translateY(-6px);
}

.card-link:active .glass {
  transform: var(--press-transform);
}

/* 上缘高光弧（--deco） */
.glass::after {
  position: absolute;
  top: 0;
  right: 16%;
  left: 16%;
  height: 1px;
  content: '';
  background: var(--deco);
}

/* 折射光带：hover 扫过 */
.sheen {
  position: absolute;
  top: -30%;
  bottom: -30%;
  left: -40%;
  width: 32%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.09), transparent);
  transform: rotate(14deg);
  transition: left 1s cubic-bezier(0.45, 0, 0.2, 1), opacity var(--transition);
  opacity: 0;
}

.card-link:hover .sheen {
  left: 118%;
  opacity: 1;
}

.top {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}

.name {
  margin: 0;
  font-size: var(--fs-title);
  font-weight: 700;
  color: var(--c-text);
  overflow-wrap: break-word;
}

/* 精选徽标：小玻璃胶囊 */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent);
  background: rgb(94 227 255 / 0.1);
  border: var(--border-w) solid rgb(94 227 255 / 0.35);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.25);
}

.desc {
  margin: 0 0 14px;
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-muted);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 18px;
  padding: 0;
  list-style: none;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-text);
  background: rgb(255 255 255 / 0.08);
  border: var(--border-w) solid rgb(255 255 255 / 0.18);
  border-radius: 999px;
}

/* 底部操作行：外链按钮（≥40px 触控目标） */
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
}

.action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 16px;
  font-size: var(--fs-small);
  font-weight: 600;
  text-decoration: none;
  border-radius: 999px;
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition);
}

.action-solid {
  color: var(--c-on-accent);
  background: linear-gradient(140deg, var(--c-accent), var(--c-accent-2));
  border: var(--border-w) solid rgb(255 255 255 / 0.4);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.5);
}

.action-solid:hover {
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.5),
    0 8px 20px rgb(94 227 255 / 0.35);
}

.action-ghost {
  color: var(--c-text);
  background: rgb(255 255 255 / 0.08);
  border: var(--border-w) solid var(--c-border);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.24);
}

.action-ghost:hover {
  background: rgb(255 255 255 / 0.14);
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
  .glass,
  .sheen,
  .action,
  .arrow {
    transition: none;
  }

  .card-link:hover .glass,
  .action:active {
    transform: none;
  }

  .card-link:hover .sheen {
    left: -40%;
    opacity: 0;
  }
}
</style>
