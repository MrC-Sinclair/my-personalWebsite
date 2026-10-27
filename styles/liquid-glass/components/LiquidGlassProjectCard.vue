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
      <span class="lens" aria-hidden="true"/>
      <span class="sheen" aria-hidden="true"/>
      <header class="top">
        <NuxtImg
          v-if="project.image"
          class="proj-cover"
          :src="project.image"
          :alt="project.title"
          sizes="sm:100vw md:50vw"
          loading="lazy"
        />
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

/* —— 玻璃配方（卡片级：模糊比面板浅一级，形成景深） ——
   与 Panel 同源，只换尺寸档位：更小的板子用更浅的模糊与更窄的
   折射环，否则小卡会被自己的边缘光学吃掉内容区。 */
.glass {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: clamp(20px, 2.6vw, 30px);
  background: var(--lg-depth), var(--lg-fill);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-press);
  backdrop-filter: blur(var(--lg-blur-sm)) saturate(1.28) brightness(1.03) contrast(1.12);
  -webkit-backdrop-filter: blur(var(--lg-blur-sm)) saturate(1.28) brightness(1.03) contrast(1.12);
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

/* hover：上浮 + 投影加深。不再加 inset 高光与青色外发光——
   卡片悬停时边缘突然亮起来是「塑料感」的重灾区，玻璃浮起来靠的是
   投影变化，不是自己发光。 */
.card-link:hover .glass {
  border-color: rgb(255 255 255 / 0.2);
  box-shadow: var(--shadow);
  transform: translateY(-6px);
}

.card-link:active .glass {
  transform: var(--press-transform);
}

/* 镜面高光环 */
.glass::after {
  position: absolute;
  inset: 0;
  padding: var(--lg-spec-w);
  border-radius: inherit;
  pointer-events: none;
  content: '';
  background: var(--lg-spec);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

/* 顶部泛光 */
.glass::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: var(--lg-luster);
}

/* 折射环：小卡用 12px，比面板的 15px 窄 */
.lens {
  position: absolute;
  inset: 0;
  padding: 12px;
  border-radius: inherit;
  pointer-events: none;
  /* 透镜环带 + 折射染色 */
  backdrop-filter: blur(6px) saturate(1.7) brightness(1.15) contrast(1.1);
  -webkit-backdrop-filter: blur(6px) saturate(1.7) brightness(1.15) contrast(1.1);
  background: var(--lg-refract);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

.lens::after {
  position: absolute;
  inset: 0;
  padding: 5px;
  border-radius: inherit;
  content: '';
  /* 透镜环带 + 折射染色 */
  backdrop-filter: blur(6px) saturate(1.7) brightness(1.15) contrast(1.1);
  -webkit-backdrop-filter: blur(6px) saturate(1.7) brightness(1.15) contrast(1.1);
  background: var(--lg-refract);
  opacity: 0.6;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

/* 折射光带：hover 扫过（默认隐形） */
.sheen {
  position: absolute;
  top: -30%;
  bottom: -30%;
  left: -40%;
  width: 32%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.07), transparent);
  transform: rotate(14deg);
  transition:
    left 1s cubic-bezier(0.45, 0, 0.2, 1),
    opacity var(--transition);
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
  box-shadow: inset 0 1px 0 var(--lg-bevel);
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
  box-shadow: inset 0 1px 0 var(--lg-bevel-solid);
}

.action-solid:hover {
  box-shadow:
    inset 0 1px 0 var(--lg-bevel-solid),
    0 8px 20px rgb(94 227 255 / 0.35);
}

.action-ghost {
  color: var(--c-text);
  background: rgb(255 255 255 / 0.08);
  border: var(--border-w) solid var(--c-border);
  box-shadow: inset 0 1px 0 var(--lg-bevel);
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

/* —— 内容封面：全站统一 16:9 裁切，圆角与底色继承本风格 token —— */
.proj-cover {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--radius-sm);
  background: var(--c-surface);
}
</style>
