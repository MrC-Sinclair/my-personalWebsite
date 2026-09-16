<!--
  ClaymorphismProjectCard - claymorphism 风格项目黏土卡
  ------------------------------------------------------------
  整卡 NuxtLink 包裹跳项目详情（支持 Ctrl+Click / 右键），
  内部外链按钮（在线演示 / GitHub）用原生 <a> + @click.stop
  阻止冒泡。卡片是一大块厚黏土板：左上角一颗 3D 黏土小球
  图标（径向高光），标题 / 描述 / 技术栈黏土点，底行外链。
  色相随 tone prop 在五色 Pastel 间轮换（大色块对撞）。
  详情页 slug 由共享层 contentSlug 从内容路径推导。
-->
<template>
  <NuxtLink class="card-link" :to="localePath(projectRoute)">
    <article class="card" :class="`tone-${tone}`">
      <header class="card-head">
        <!-- 3D 黏土球图标（纯 CSS：径向高光 + 内底影） -->
        <span class="orb" aria-hidden="true"/>
        <h3 class="name">{{ project.title }}</h3>
        <span v-if="project.featured" class="badge">{{ t('projects.featured') }}</span>
      </header>

      <p v-if="project.description" class="desc">{{ project.description }}</p>

      <!-- 技术栈：小黏土点 -->
      <ul class="tags">
        <li v-for="tag in displayTags" :key="tag" class="tag">{{ tag }}</li>
      </ul>

      <footer class="actions">
        <a
          v-if="project.demoUrl"
          class="action"
          :href="project.demoUrl"
          target="_blank"
          rel="noopener noreferrer"
          @click.stop
        >
          {{ t('projects.demo') }}<span class="arrow" aria-hidden="true">→</span>
        </a>
        <a
          v-if="project.githubUrl"
          class="action"
          :href="project.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          @click.stop
        >
          {{ t('projects.github') }}<span class="arrow" aria-hidden="true">→</span>
        </a>
      </footer>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { Project } from '~/types/project'

const props = withDefaults(
  defineProps<{
    /** 项目数据（来自共享层 useProjects） */
    project: Project
    /** 黏土色相：粉 / 薄荷 / 奶油 / 丁香 / 天蓝 */
    tone?: 'pink' | 'mint' | 'butter' | 'lilac' | 'blue'
  }>(),
  { tone: 'lilac' },
)

const { t } = useI18n()
const localePath = useLocalePath()

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
/* 整卡可点击：链接本体接管圆角裁切 */
.card-link {
  display: block;
  height: 100%;
  border-radius: var(--radius);
}

/* 厚黏土板：外双层投影 + 内顶部高光 + 内底部微影（色相随 tone） */
.card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--space);
  background: var(--tone-bg);
  border-radius: var(--radius);
  box-shadow:
    0 20px 34px var(--tone-shadow),
    0 6px 12px var(--tone-shadow-soft),
    inset 0 10px 18px rgb(255 255 255 / 0.55),
    inset 0 -10px 16px var(--tone-inset);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

/* hover：整块黏土抬起 + 阴影加深；按压交给 card-link 的 active */
.card-link:hover .card {
  transform: translateY(-6px);
  box-shadow:
    0 28px 44px var(--tone-shadow),
    0 10px 18px var(--tone-shadow-soft),
    inset 0 10px 18px rgb(255 255 255 / 0.55),
    inset 0 -10px 16px var(--tone-inset);
}

.card-link:active .card {
  transform: var(--press-transform);
  box-shadow:
    0 8px 14px var(--tone-shadow),
    0 3px 6px var(--tone-shadow-soft),
    inset 0 6px 12px rgb(255 255 255 / 0.45),
    inset 0 -8px 14px var(--tone-inset);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

/* 3D 黏土球图标：径向高光 + 内底影（--deco 为球体高光渐变） */
.orb {
  flex: none;
  width: 46px;
  height: 46px;
  background: var(--deco), var(--tone-orb);
  border-radius: 50%;
  box-shadow:
    0 8px 14px var(--tone-shadow),
    inset 0 -6px 10px var(--tone-inset);
  transition: transform var(--transition);
}

/* hover 时小球 Q 弹放大（3D 图标感） */
.card-link:hover .orb {
  transform: scale(1.1);
}

.name {
  flex: 1;
  margin: 0;
  font-size: var(--fs-title);
  font-weight: 800;
  color: var(--tone-text);
  overflow-wrap: anywhere;
}

/* 精选徽标：近白压印胶囊 */
.badge {
  flex: none;
  padding: 4px 12px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--tone-text);
  background: var(--c-surface);
  border-radius: 999px;
  box-shadow:
    inset 0 2px 5px var(--tone-shadow),
    inset 0 -2px 4px rgb(255 255 255 / 0.85);
}

.desc {
  display: -webkit-box;
  margin: 0 0 14px;
  overflow: hidden;
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

/* 技术栈小黏土点 */
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
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--tone-text);
  background: var(--c-surface);
  border-radius: 999px;
  box-shadow:
    0 4px 7px var(--tone-shadow-soft),
    inset 0 3px 5px rgb(255 255 255 / 0.8),
    inset 0 -3px 4px var(--tone-inset);
}

/* 底部操作行：外链（≥40px 触控目标） */
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
  padding: 8px 18px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--tone-text);
  text-decoration: none;
  background: var(--c-surface);
  border-radius: 999px;
  box-shadow:
    0 6px 10px var(--tone-shadow-soft),
    inset 0 4px 7px rgb(255 255 255 / 0.8),
    inset 0 -4px 6px var(--tone-inset);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.action:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 16px var(--tone-shadow),
    inset 0 4px 7px rgb(255 255 255 / 0.8),
    inset 0 -4px 6px var(--tone-inset);
}

.action:active {
  transform: var(--press-transform);
}

.arrow {
  transition: transform var(--transition);
}

.action:hover .arrow {
  transform: translateX(3px);
}

/* —— Pastel 色相（风格签名装饰色；正文类文字用加深色保证对比度） —— */
.tone-pink {
  --tone-bg: #ffdfe9;
  --tone-text: #7a2953;
  --tone-orb: #f7a8c8;
  --tone-shadow: rgb(215 100 150 / 0.32);
  --tone-shadow-soft: rgb(215 100 150 / 0.16);
  --tone-inset: rgb(215 100 150 / 0.24);
}

.tone-mint {
  --tone-bg: #d3f3e1;
  --tone-text: #175639;
  --tone-orb: #8fddb7;
  --tone-shadow: rgb(90 175 135 / 0.32);
  --tone-shadow-soft: rgb(90 175 135 / 0.16);
  --tone-inset: rgb(70 145 105 / 0.24);
}

.tone-butter {
  --tone-bg: #fff3cd;
  --tone-text: #65450c;
  --tone-orb: #ffd97a;
  --tone-shadow: rgb(215 170 70 / 0.32);
  --tone-shadow-soft: rgb(215 170 70 / 0.16);
  --tone-inset: rgb(190 140 40 / 0.24);
}

.tone-lilac {
  --tone-bg: #e9defc;
  --tone-text: #4c2689;
  --tone-orb: #c3a6f5;
  --tone-shadow: rgb(140 100 200 / 0.32);
  --tone-shadow-soft: rgb(140 100 200 / 0.16);
  --tone-inset: rgb(120 80 185 / 0.24);
}

.tone-blue {
  --tone-bg: #dcebff;
  --tone-text: #173f73;
  --tone-orb: #93c2f5;
  --tone-shadow: rgb(80 130 200 / 0.32);
  --tone-shadow-soft: rgb(80 130 200 / 0.16);
  --tone-inset: rgb(60 105 175 / 0.24);
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .orb,
  .action,
  .arrow {
    transition: none;
  }

  .card-link:hover .card,
  .card-link:active .card,
  .card-link:hover .orb,
  .action:hover,
  .action:active {
    transform: none;
  }
}
</style>
