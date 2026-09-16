<!--
  Soft3DProjectCard - soft-3d 风格精选项目卡
  ------------------------------------------------------------
  一件「摆在展台上的作品」：顶部是纯 CSS 绘制的渐变受光
  「体积盖面」（首字母浮雕字形做 3D 图标感，不依赖图片），
  下方是标题 / 日期 / 描述 / 技术标签 / 外链按钮。
  桌面 hover 时卡片带轻微透视倾斜（perspective + rotateX），
  移动端收敛为普通上浮；按压走 --press-transform。
  外链为真实业务地址（demoUrl / githubUrl），新窗口打开。
-->
<template>
  <article class="project-card">
    <!-- 渐变体积盖面：项目首字母做成浮雕 3D 字形 -->
    <div class="project-card-cover" :class="`project-card-cover-${variant}`">
      <span class="project-card-glyph" aria-hidden="true">{{ glyph }}</span>
      <span class="project-card-shine" aria-hidden="true"/>
    </div>

    <div class="project-card-body">
      <div class="project-card-top">
        <h3 class="project-card-title">{{ project.title }}</h3>
        <time v-if="project.date" class="project-card-date">{{
          formatDate(project.date, locale === 'zh' ? 'zh-CN' : 'en-US')
        }}</time>
      </div>

      <p v-if="project.description" class="project-card-desc">{{ project.description }}</p>

      <ul v-if="safeTags.length" class="project-card-tags" :aria-label="t('projects.techStack')">
        <li v-for="tag in safeTags" :key="tag" class="project-card-tag">{{ tag }}</li>
      </ul>

      <footer v-if="hasLinks" class="project-card-links">
        <a
          v-if="project.demoUrl"
          class="project-card-link project-card-link-solid"
          :href="project.demoUrl"
          target="_blank"
          rel="noopener"
        >
          {{ t('projects.demo') }}<span class="project-card-link-arrow" aria-hidden="true">↗</span>
        </a>
        <a
          v-if="project.githubUrl"
          class="project-card-link"
          :href="project.githubUrl"
          target="_blank"
          rel="noopener"
        >
          {{ t('projects.github') }}<span class="project-card-link-arrow" aria-hidden="true">↗</span>
        </a>
      </footer>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'

const props = withDefaults(
  defineProps<{
    /** 项目数据（来自 useProjects） */
    project: Project
    /** 体积盖面配色（糖果渐变变体） */
    variant?: 'violet' | 'cyan' | 'warm' | 'mint' | 'sun' | 'grape'
  }>(),
  {
    variant: 'violet',
  },
)

const { t, locale } = useI18n()

/** 盖面浮雕字形：取项目标题首字符（数据派生，非硬编码文案） */
const glyph = computed(() => props.project.title.trim().charAt(0).toUpperCase())

/** 数组防御：标签非数组回退为空 */
const safeTags = computed(() => (Array.isArray(props.project.tags) ? props.project.tags : []))

/** 是否有可展示的外链 */
const hasLinks = computed(() => Boolean(props.project.demoUrl || props.project.githubUrl))
</script>

<style scoped>
.project-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(168deg, color-mix(in srgb, var(--c-accent) 8%, var(--c-surface)), var(--c-surface) 52%);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: transform var(--transition), box-shadow var(--transition);
}

/* 桌面 hover：轻微透视倾斜 + 上浮（空间纵深签名） */
@media (hover: hover) and (min-width: 768px) {
  .project-card:hover {
    transform: perspective(900px) rotateX(2.4deg) translateY(-7px);
    box-shadow:
      0 40px 68px rgb(6 3 26 / 0.68),
      0 16px 30px rgb(139 92 246 / 0.34),
      0 4px 9px rgb(6 3 26 / 0.5),
      inset 0 2px 5px rgb(255 255 255 / 0.24),
      inset 0 -8px 16px rgb(9 5 40 / 0.5);
  }
}

/* —— 体积盖面：受光渐变板 + 内高光 + 内底影 —— */
.project-card-cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 128px;
  border-bottom: var(--border-w) solid var(--c-border);
  box-shadow:
    inset 0 2px 6px rgb(255 255 255 / 0.35),
    inset 0 -10px 20px rgb(9 5 40 / 0.42);
}

.project-card-cover-violet {
  background: linear-gradient(135deg, #a855f7, #ec4899);
}

.project-card-cover-cyan {
  background: linear-gradient(135deg, #6366f1, #22d3ee);
}

.project-card-cover-warm {
  background: linear-gradient(135deg, #f472b6, #fb923c);
}

.project-card-cover-mint {
  background: linear-gradient(135deg, #34d399, #22d3ee);
}

.project-card-cover-sun {
  background: linear-gradient(135deg, #fbbf24, #fb7185);
}

.project-card-cover-grape {
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
}

/* 盖面高光条：左上柔光，暗示光源方向 */
.project-card-shine {
  position: absolute;
  top: 0;
  left: 0;
  width: 58%;
  height: 46%;
  background: radial-gradient(ellipse at top left, rgb(255 255 255 / 0.42), rgb(255 255 255 / 0) 68%);
  pointer-events: none;
}

/* 首字母浮雕字形：下深上亮的错位阴影挤出立体感 */
.project-card-glyph {
  font-family: var(--font-head);
  font-size: 54px;
  font-weight: 800;
  color: rgb(255 255 255 / 0.94);
  text-shadow:
    0 3px 0 rgb(9 5 40 / 0.45),
    0 -1px 0 rgb(255 255 255 / 0.4),
    0 10px 22px rgb(9 5 40 / 0.5);
}

/* —— 卡片主体 —— */
.project-card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 10px;
  padding: var(--space);
}

.project-card-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--gap);
}

.project-card-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.project-card-date {
  flex: none;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.project-card-desc {
  margin: 0;
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-muted);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* —— 技术标签药丸 —— */
.project-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.project-card-tag {
  padding: 4px 12px;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: color-mix(in srgb, var(--c-accent-2) 15%, var(--c-surface));
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: 999px;
  box-shadow: inset 0 1px 2px rgb(255 255 255 / 0.2);
}

/* —— 外链按钮：≥40px 触控目标，悬浮上抬 + 辉光 —— */
.project-card-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
  padding-top: 6px;
}

.project-card-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 40px;
  padding: 8px 16px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-accent);
  text-decoration: none;
  background: color-mix(in srgb, var(--c-accent) 13%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-accent) 42%, transparent);
  border-radius: 999px;
  transition: color var(--transition), background var(--transition), transform var(--transition),
    box-shadow var(--transition);
}

.project-card-link:hover {
  color: var(--c-on-accent);
  background: linear-gradient(135deg, #7c3aed, #db2777);
  border-color: rgb(255 255 255 / 0.28);
  transform: translateY(-2px);
  box-shadow:
    0 10px 20px rgb(124 58 237 / 0.4),
    inset 0 1px 3px rgb(255 255 255 / 0.35);
}

.project-card-link:active {
  transform: var(--press-transform);
}

/* 实心主按钮（在线演示）：默认即为糖果渐变 */
.project-card-link-solid {
  color: var(--c-on-accent);
  background: linear-gradient(135deg, #7c3aed, #db2777);
  border-color: rgb(255 255 255 / 0.28);
  box-shadow:
    0 8px 16px rgb(124 58 237 / 0.38),
    inset 0 1px 3px rgb(255 255 255 / 0.35);
}

.project-card-link-solid:hover {
  filter: brightness(1.08);
}

.project-card-link-arrow {
  transition: transform var(--transition);
}

/* 键盘可见焦点环 */
.project-card-link:focus-visible {
  outline: 2px solid var(--c-accent-2);
  outline-offset: 3px;
}

.project-card-link:hover .project-card-link-arrow {
  transform: translate(2px, -2px);
}

@media (prefers-reduced-motion: reduce) {
  .project-card,
  .project-card-link,
  .project-card-link-arrow {
    transition: none;
  }

  .project-card:hover,
  .project-card-link:hover {
    transform: none;
  }

  .project-card-link:active {
    transform: none;
  }
}
</style>
