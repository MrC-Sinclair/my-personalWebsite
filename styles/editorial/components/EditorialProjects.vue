<!--
  EditorialProjects - editorial 风格的「02 精选项目」区块
  ------------------------------------------------------------
  杂志「专题报道」图文对开：首个项目为跨页主打（图 7 栏 +
  文 5 栏，底部对齐），其余项目为半版图文卡；项目无图时以
  「铅字图版」占位（大号衬线编号）。整卡 NuxtLink 跳详情页
  （支持 Ctrl+Click / 右键），演示 / GitHub 外链放在链接
  之外避免嵌套锚点。悬停时图片轻微放大还原饱和度、标题划
  出刊头红下划线。数据来自共享层 useProjects（由页面传入）。
-->
<template>
  <section id="projects" class="section" data-section="projects">
    <EditorialSectionHead :no="'02'" :title="t('home.featuredProjects')" :note="t('projects.description')" />

    <EditorialEmpty v-if="!projects.length" :message="t('projects.noResults')" />

    <div v-else class="spread">
      <article
        v-for="(project, i) in projects"
        :key="project.path"
        class="project"
        :class="{ 'is-lead': i === 0 }"
      >
        <NuxtLink class="link" :to="localePath(projectRoute(project))">
          <figure class="plate">
            <NuxtImg
              v-if="project.image"
              class="img"
              :src="project.image"
              :alt="project.title"
              sizes="sm:100vw md:50vw lg:66vw"
              loading="lazy"
            />
            <span v-else class="plate-fallback" aria-hidden="true">{{ padNo(i + 1) }}</span>
          </figure>
          <div class="caption">
            <span class="cap-no" aria-hidden="true">{{ padNo(i + 1) }}</span>
            <h3 class="cap-title">{{ project.title }}</h3>
            <p v-if="project.description" class="cap-desc">{{ project.description }}</p>
            <p v-if="displayTags(project).length" class="cap-tags">
              <span v-for="tag in displayTags(project)" :key="tag" class="cap-tag">{{ tag }}</span>
            </p>
          </div>
        </NuxtLink>

        <!-- 外链操作行：置于 NuxtLink 之外，避免嵌套链接 -->
        <footer v-if="project.demoUrl || project.githubUrl" class="actions">
          <a
            v-if="project.demoUrl"
            class="action"
            :href="project.demoUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t('projects.demo') }}<span class="action-arrow" aria-hidden="true">↗</span>
          </a>
          <a
            v-if="project.githubUrl"
            class="action"
            :href="project.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t('projects.github') }}<span class="action-arrow" aria-hidden="true">↗</span>
          </a>
        </footer>
      </article>
    </div>

    <div class="more-row">
      <NuxtLink class="more" :to="localePath('/style/editorial/projects')">
        {{ t('home.viewProjects') }}<span class="more-arrow" aria-hidden="true">→</span>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import { contentSlug } from '~/utils/content'
import EditorialSectionHead from './EditorialSectionHead.vue'
import EditorialEmpty from './EditorialEmpty.vue'

defineProps<{
  /** 精选项目列表（来自共享层 useProjects） */
  projects: Project[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()
// 详情链接走风格内路由（/style/<id>/projects/<slug>），旧的 /projects/<slug> 已 404
const { styleId } = useStyleContentPath()

/** 两位编号（01、02…） */
function padNo(n: number): string {
  return String(n).padStart(2, '0')
}

/** 标签防御：只取前 4 个非空标签 */
function displayTags(project: Project): string[] {
  return (Array.isArray(project.tags) ? project.tags : [])
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 4)
}

/** 由内容路径推导详情页路由（风格内：/style/<id>/projects/<slug>） */
function projectRoute(project: Project): string {
  return `/style/${styleId.value}/projects/${contentSlug(project.path)}`
}
</script>

<style scoped>
.spread {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(28px, 4vw, 44px) clamp(24px, 3.4vw, 40px);
  margin-top: calc(var(--space) * 1.1);
}

.project {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 跨页主打独占整行；仅一个次项目时也铺满整行 */
.project.is-lead {
  grid-column: 1 / -1;
}

.project.is-lead + .project:last-child {
  grid-column: 1 / -1;
}

/* 主打与铺满行的内文排布：图 7 栏 + 文 5 栏，底部对齐 */
.project.is-lead .link,
.project.is-lead + .project:last-child .link {
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  align-items: end;
  gap: var(--space);
}

.link {
  display: grid;
  flex: 1 1 auto;
  gap: 14px;
  color: inherit;
  text-decoration: none;
}

.link:active {
  transform: var(--press-transform);
}

/* 图版：印刷相版（直角 + 纸面底色），悬停轻微放大还原饱和 */
.plate {
  overflow: hidden;
  margin: 0;
  aspect-ratio: 4 / 3;
  background: var(--c-surface);
}

.project.is-lead .plate,
.project.is-lead + .project:last-child .plate {
  aspect-ratio: 16 / 10;
}

.img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.82) contrast(1.04);
  transition:
    transform var(--transition),
    filter var(--transition);
}

.link:hover .img {
  transform: scale(1.025);
  filter: saturate(1) contrast(1);
}

/* 无图占位：铅字图版（大号衬线编号压在纸面上） */
.plate-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-family: var(--font-head);
  font-size: clamp(64px, 9vw, 128px);
  font-style: italic;
  line-height: 1;
  color: color-mix(in srgb, var(--c-accent) 30%, transparent);
}

/* 图注 */
.caption {
  min-width: 0;
}

.cap-no {
  display: block;
  margin-bottom: 8px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.14em;
  color: var(--c-accent);
}

.cap-title {
  display: inline;
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(22px, 2.6vw, 32px);
  font-weight: 700;
  line-height: 1.25;
  color: var(--c-text);
  overflow-wrap: break-word;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 2px;
  transition: background-size var(--transition);
}

.project.is-lead .cap-title {
  font-size: clamp(26px, 3.6vw, 44px);
}

.link:hover .cap-title {
  background-size: 100% 2px;
}

.cap-desc {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  margin: 8px 0 0;
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-muted);
}

/* 技术栈：印刷注释式小字，斜杠分隔 */
.cap-tags {
  display: flex;
  flex-wrap: wrap;
  margin: 10px 0 0;
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
  color: var(--c-muted);
}

.cap-tag + .cap-tag::before {
  margin: 0 8px;
  content: '/';
  color: var(--c-border);
}

/* 外链操作行：印刷下划线按钮（≥40px 触控目标） */
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 22px;
  padding-top: 12px;
}

.action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--c-text);
  text-decoration: none;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 100% 1px;
  transition:
    color var(--transition),
    background-size var(--transition);
}

.action:hover {
  color: var(--c-accent);
  background-size: 0% 1px;
}

.action:active {
  transform: var(--press-transform);
}

.action-arrow {
  font-family: var(--font-mono);
  transition: transform var(--transition);
}

.action:hover .action-arrow {
  transform: translate(2px, -2px);
}

/* 「查看项目」行：hairline 顶线 + 划线链接 */
.more-row {
  margin-top: clamp(26px, 4vw, 40px);
  padding-top: 14px;
  border-top: var(--border-w) solid var(--c-border);
}

.more {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  font-size: var(--fs-base);
  letter-spacing: 0.14em;
  color: var(--c-accent);
  text-decoration: none;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 1px;
  transition:
    background-size var(--transition),
    transform var(--transition);
}

.more:hover {
  background-size: 100% 1px;
}

.more:active {
  transform: var(--press-transform);
}

.more-arrow {
  font-family: var(--font-mono);
  transition: transform var(--transition);
}

.more:hover .more-arrow {
  transform: translateX(4px);
}

/* 窄屏：对开回退单栏（图上文下），签名保留 */
@media (max-width: 820px) {
  .spread {
    grid-template-columns: 1fr;
  }

  .project.is-lead .link,
  .project.is-lead + .project:last-child .link {
    grid-template-columns: 1fr;
  }

  .project.is-lead .plate,
  .project.is-lead + .project:last-child .plate {
    aspect-ratio: 4 / 3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .img,
  .cap-title,
  .action,
  .action-arrow,
  .more,
  .more-arrow {
    transition: none;
  }

  .link:hover .img,
  .link:active,
  .action:active,
  .action:hover .action-arrow,
  .more:active,
  .more:hover .more-arrow {
    transform: none;
  }
}
</style>
