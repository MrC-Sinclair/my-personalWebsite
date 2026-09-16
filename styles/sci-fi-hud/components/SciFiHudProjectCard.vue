<!--
  SciFiHudProjectCard - sci-fi-hud 风格项目「载荷舱」卡片
  ------------------------------------------------------------
  单个精选项目的目标标注卡：顶部视觉区（有封面图则展示并
  叠加扫描线，无图则用纯 CSS 网格 + 准星字符占位），下方
  载荷编号（装饰）、标题、描述、技术栈芯片，底部外链按钮
  （在线演示 / GitHub，原生 <a> + @click.stop 阻止冒泡）。
  整卡 NuxtLink 包裹跳项目详情页（支持 Ctrl+Click / 右键），
  路由规则与过渡层一致：详情页 slug 由共享层 contentSlug
  从内容路径推导。
  hover 时卡片点亮括角与辉光（交互反馈）。
-->
<template>
  <NuxtLink :to="localePath(projectRoute)" class="pod-link">
    <article class="pod">
      <!-- 视觉区：封面图或纯 CSS 准星占位 -->
      <div class="visual" :class="{ 'visual-plain': !project.image }">
        <img
          v-if="project.image"
          class="visual-img"
          :src="project.image"
          :alt="project.title"
          loading="lazy"
        >
        <span v-else class="visual-glyph" aria-hidden="true">✛</span>
        <span class="visual-scan" aria-hidden="true"/>
      </div>

      <div class="pod-main">
        <header class="pod-head">
          <span class="pod-code" aria-hidden="true">PAYLOAD-{{ code }}</span>
          <span v-if="project.featured" class="pod-flag">
            <span class="flag-dot" aria-hidden="true"/>{{ t('projects.featured') }}
          </span>
        </header>

        <h3 class="pod-title">{{ project.title }}</h3>

        <p v-if="project.description" class="pod-desc">{{ project.description }}</p>

        <ul v-if="displayTags.length" class="pod-tags">
          <li v-for="tag in displayTags" :key="tag" class="pod-tag">{{ tag }}</li>
        </ul>

        <footer v-if="project.demoUrl || project.githubUrl" class="pod-actions">
          <a
            v-if="project.demoUrl"
            class="pod-action"
            :href="project.demoUrl"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
          >
            {{ t('projects.demo') }}<span class="action-glyph" aria-hidden="true">↗</span>
          </a>
          <a
            v-if="project.githubUrl"
            class="pod-action"
            :href="project.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
          >
            {{ t('projects.github') }}<span class="action-glyph" aria-hidden="true">↗</span>
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
  /** 项目数据（来自 useProjects，字段已在共享层做防御映射） */
  project: Project
  /** 载荷序号（用于装饰编号，从 0 起） */
  index: number
}>()

const { t } = useI18n()
const localePath = useLocalePath()

/** 载荷编号：两位补零（装饰读数） */
const code = computed(() => String(props.index + 1).padStart(2, '0'))

/** 标签防御：只取前 4 个非空标签 */
const displayTags = computed(() =>
  (Array.isArray(props.project.tags) ? props.project.tags : [])
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 4),
)

/** 由内容路径推导详情页路由（slug 换算复用共享层 contentSlug） */
const projectRoute = computed(() => `/projects/${contentSlug(props.project.path)}`)
</script>

<style scoped>
/* 链接本体接管卡片高度，保证整卡可点击 */
.pod-link {
  display: block;
  height: 100%;
  outline-offset: 3px;
}

/* —— 载荷卡：细线框 + hover 点亮 —— */
.pod {
  --corner-c: rgb(74 240 198 / 0.7);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  transition:
    border-color var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

/* 四角 HUD 括角（与面板同源手法：8 段渐变） */
.pod::before {
  content: '';
  position: absolute;
  inset: -1px;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(var(--corner-c), var(--corner-c)) top left / 12px 2px,
    linear-gradient(var(--corner-c), var(--corner-c)) top left / 2px 12px,
    linear-gradient(var(--corner-c), var(--corner-c)) top right / 12px 2px,
    linear-gradient(var(--corner-c), var(--corner-c)) top right / 2px 12px,
    linear-gradient(var(--corner-c), var(--corner-c)) bottom left / 12px 2px,
    linear-gradient(var(--corner-c), var(--corner-c)) bottom left / 2px 12px,
    linear-gradient(var(--corner-c), var(--corner-c)) bottom right / 12px 2px,
    linear-gradient(var(--corner-c), var(--corner-c)) bottom right / 2px 12px;
  background-repeat: no-repeat;
}

/* hover：点亮 + 微上浮 + 辉光 */
.pod-link:hover .pod {
  --corner-c: var(--c-accent);
  border-color: color-mix(in srgb, var(--c-accent) 50%, var(--c-border));
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.pod-link:active .pod {
  transform: var(--press-transform);
}

/* —— 视觉区 —— */
.visual {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-bottom: var(--border-w) solid var(--c-border);
}

.visual-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: var(--img-rendering);
  filter: saturate(0.82);
  transition: filter var(--transition);
}

.pod-link:hover .visual-img {
  filter: saturate(1);
}

/* 无图占位：座舱网格 + 准星字符 */
.visual-plain {
  display: grid;
  place-items: center;
  background:
    repeating-linear-gradient(
      0deg,
      rgb(74 240 198 / 0.07) 0 1px,
      transparent 1px 20px
    ),
    repeating-linear-gradient(
      90deg,
      rgb(74 240 198 / 0.07) 0 1px,
      transparent 1px 20px
    ),
    var(--c-bg);
}

.visual-glyph {
  font-family: var(--font-mono);
  font-size: 34px;
  color: color-mix(in srgb, var(--c-accent) 60%, transparent);
}

/* 扫描线：半透明横纹叠加（装饰） */
.visual-scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgb(4 16 26 / 0.22) 0 1px,
    transparent 1px 4px
  );
}

/* —— 主区 —— */
.pod-main {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 8px;
  padding: 12px var(--space) var(--space);
}

.pod-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pod-code {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.12em;
  color: var(--c-muted);
}

/* 精选标记：琥珀警示色（军用 caution 语义） */
.pod-flag {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 5px;
  padding: 1px 8px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  border: var(--border-w) solid color-mix(in srgb, var(--c-accent-2) 50%, transparent);
}

.flag-dot {
  width: 5px;
  height: 5px;
  background: var(--c-accent-2);
  border-radius: 50%;
}

.pod-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  line-height: 1.35;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.pod-desc {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  font-size: var(--fs-small);
  line-height: 1.75;
  color: var(--c-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.pod-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pod-tag {
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
  border: var(--border-w) solid var(--c-border);
}

.pod-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 6px;
}

/* 外链按钮：≥40px 触控目标 + hover 信号色填充 */
.pod-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 40px;
  padding: 8px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent);
  text-decoration: none;
  border: var(--border-w) solid color-mix(in srgb, var(--c-accent) 45%, transparent);
  transition:
    color var(--transition),
    background var(--transition),
    border-color var(--transition);
}

.pod-action:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.action-glyph {
  font-family: var(--font-mono);
}

@media (prefers-reduced-motion: reduce) {
  .pod,
  .visual-img,
  .pod-action {
    transition: none;
  }

  .pod-link:hover .pod {
    transform: none;
  }

  .pod-link:active .pod {
    transform: none;
  }
}
</style>
