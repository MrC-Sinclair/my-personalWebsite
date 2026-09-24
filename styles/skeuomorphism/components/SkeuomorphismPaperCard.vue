<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismPaperCard - 拟物风格项目卡片
  ------------------------------------------------------------
  一张「钉在木桌上的横线纸」：米白纸面 + 细横线 + 左侧砖红
  页边线 + 顶部黄铜图钉 + 底部卷边落影；卡片带微旋转
  （--tilt），悬浮时被「扶正抬离桌面」。标题链接到过渡层项目
  详情，在线演示 / GitHub 为黄铜小按钮外链；wide 模式为大卡
  并附「精选」火漆徽章。tags 用 Array.isArray 防御。
-->
<template>
  <article class="paper" :class="{ 'paper--wide': wide }" :style="{ '--tilt': `${tilt}deg` }">
    <!-- 顶部黄铜图钉 -->
    <span class="pin" aria-hidden="true" />

    <!-- 火漆「精选」徽章（wide 大卡） -->
    <span v-if="wide" class="seal" aria-hidden="true" />
    <span v-if="wide" class="seal-label">{{ t('projects.featured') }}</span>

    <div class="paper-body">
      <h3 class="paper-title">
        <NuxtLink
          class="paper-link"
          :to="localePath(`/style/${styleId}/projects/${slugOf(project.path)}`)"
        >
          {{ project.title }}
        </NuxtLink>
      </h3>

      <p v-if="project.description" class="paper-desc">{{ project.description }}</p>

      <ul v-if="safeTags.length" class="paper-tags" :aria-label="t('projects.techStack')">
        <li v-for="tag in safeTags" :key="tag" class="paper-tag">{{ tag }}</li>
      </ul>

      <p v-if="project.date" class="paper-date">
        <time :datetime="project.date">{{ formatDate(project.date, locale) }}</time>
      </p>
    </div>

    <div v-if="project.demoUrl || project.githubUrl" class="paper-actions">
      <a v-if="project.demoUrl" class="paper-btn" :href="project.demoUrl" target="_blank" rel="noopener">
        {{ t('projects.demo') }}<span class="paper-ext" aria-hidden="true"> ↗</span>
      </a>
      <a v-if="project.githubUrl" class="paper-btn paper-btn--wood" :href="project.githubUrl" target="_blank" rel="noopener">
        {{ t('projects.github') }}<span class="paper-ext" aria-hidden="true"> ↗</span>
      </a>
    </div>

    <!-- 底部卷边阴影 -->
    <span class="curl" aria-hidden="true" />
  </article>
</template>

<script setup lang="ts">
/**
 * @file 拟物风格的项目卡片组件
 * @description 横线纸卡：图钉 + 火漆徽章 + 卷边落影；数据来自共享层 useProjects()。
 */
import { contentSlug } from '~/utils/content'
import type { Project } from '~/types/project'

const props = withDefaults(
  defineProps<{
    /** 项目数据（共享层返回值） */
    project: Project
    /** 是否为横跨多列的大卡（附「精选」火漆徽章） */
    wide?: boolean
    /** 卡片微旋转角度（deg，父级传入制造散落感） */
    tilt?: number
  }>(),
  {
    wide: false,
    tilt: 0,
  },
)

const { t, locale } = useI18n()
const localePath = useLocalePath()
// 详情链接走风格内路由（/style/<id>/projects/<slug>），旧的 /projects/<slug> 已 404
const { styleId } = useStyleContentPath()

/** 防御：tags 非数组时回退为空列表 */
const safeTags = computed(() => (Array.isArray(props.project.tags) ? props.project.tags : []))

/** 从内容路径提取 slug（收敛到共享层 contentSlug，多风格唯一实现，链接形态不变） */
function slugOf(path: string): string {
  return contentSlug(path)
}
</script>

<style scoped>
.paper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 30px 24px 24px 58px;
  border: 1px solid rgb(0 0 0 / 0.4);
  border-radius: var(--radius-sm);
  /* 米白纸：纸色渐变 + 细横线（28px 节距） */
  background:
    repeating-linear-gradient(
      transparent 0 27px,
      rgb(109 83 53 / 0.16) 27px 28px
    ),
    linear-gradient(176deg, #f8f2e2 0%, #f3ead7 56%, #ebdfc4 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.8),
    var(--shadow);
  transform: rotate(var(--tilt, 0deg));
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

/* 悬浮：纸被扶正并抬离桌面（阴影随之加深加远） */
.paper:hover {
  transform: rotate(0deg) translateY(-5px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.8),
    0 20px 34px rgb(10 4 0 / 0.55),
    0 4px 8px rgb(10 4 0 / 0.4);
}

/* —— 左侧砖红页边线（横线纸的装订线） —— */
.paper::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 44px;
  width: 2px;
  background: var(--c-accent-2);
  opacity: 0.75;
}

/* —— 顶部黄铜图钉 —— */
.pin {
  position: absolute;
  top: -8px;
  left: 50%;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: radial-gradient(circle at 34% 28%, #f6e7ba 0%, #c39a4c 48%, #6e4c1a 88%, #4a320e 100%);
  box-shadow:
    inset 0 -2px 3px rgb(0 0 0 / 0.5),
    0 4px 5px rgb(10 4 0 / 0.5);
  transform: translateX(-50%);
}

/* —— 底部卷边落影（纸角微微翘起的接地影） —— */
.curl {
  position: absolute;
  right: 8px;
  bottom: -9px;
  width: 42%;
  height: 14px;
  background: radial-gradient(55% 100% at 62% 0%, rgb(10 4 0 / 0.4), transparent 75%);
  filter: blur(3px);
  transform: skewX(-18deg);
}

/* —— 火漆「精选」徽章 —— */
.seal {
  position: absolute;
  top: 16px;
  right: 18px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  /* 火漆：砖红蜡质渐变 + 内圈压纹 */
  background:
    radial-gradient(circle at 36% 30%, rgb(255 255 255 / 0.28), transparent 42%),
    radial-gradient(circle at 50% 50%, transparent 52%, rgb(0 0 0 / 0.28) 58%, transparent 66%),
    radial-gradient(circle at 50% 50%, #c05a40 0%, #a84632 52%, #7e2f1f 100%);
  box-shadow:
    inset 0 2px 3px rgb(255 255 255 / 0.25),
    inset 0 -3px 5px rgb(0 0 0 / 0.4),
    0 3px 6px rgb(10 4 0 / 0.5);
  transform: rotate(-8deg);
}

.seal-label {
  position: absolute;
  top: 58px;
  right: 10px;
  padding: 2px 9px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-on-accent);
  border: 1px solid rgb(0 0 0 / 0.5);
  border-radius: 3px;
  background: linear-gradient(180deg, #e0bc72 0%, #b8893a 60%, #96682a 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.5),
    0 2px 4px rgb(10 4 0 / 0.5);
  transform: rotate(2deg);
}

/* —— 纸面文字 —— */
.paper-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.paper-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: break-word;
}

/* 标题墨水链接：hover 泛起砖红 */
.paper-link {
  color: var(--c-text);
  text-decoration: none;
  transition: color var(--transition);
}

.paper-link:hover {
  color: var(--c-accent-2);
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}

.paper-link:focus-visible {
  outline: 2px solid var(--c-accent-2);
  outline-offset: 3px;
  border-radius: 2px;
}

.paper-desc {
  margin: 0;
  font-size: 15px;
  line-height: var(--lh-body);
  color: var(--c-muted);
  overflow-wrap: break-word;
}

/* —— 技术栈：邮票式小签（dashed 齿孔边） —— */
.paper-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
}

.paper-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.03em;
  color: var(--c-muted);
  border: 1px dashed rgb(109 83 53 / 0.55);
  border-radius: 3px;
  background: rgb(255 255 255 / 0.42);
  box-shadow: 0 1px 2px rgb(10 4 0 / 0.2);
  transition: transform var(--transition), color var(--transition);
}

.paper:hover .paper-tag {
  transform: rotate(-1.2deg);
  color: var(--c-text);
}

.paper-date {
  margin: 2px 0 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.05em;
  color: var(--c-muted);
}

/* —— 黄铜小按钮（外链演示 / GitHub） —— */
.paper-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
  padding-top: 6px;
}

.paper-btn {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 16px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--c-on-accent);
  text-decoration: none;
  border: 1px solid rgb(0 0 0 / 0.55);
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, #e0bc72 0%, #b8893a 55%, #91632a 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.55),
    inset 0 -2px 4px rgb(0 0 0 / 0.32),
    0 3px 6px rgb(10 4 0 / 0.5);
  transition:
    filter var(--transition),
    transform var(--transition),
    box-shadow var(--transition);
}

.paper-btn--wood {
  color: #f3e7c9;
  background: linear-gradient(180deg, #7d5429 0%, #66421e 55%, #523418 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 240 210 / 0.22),
    inset 0 -3px 6px rgb(0 0 0 / 0.38),
    0 3px 6px rgb(10 4 0 / 0.5);
}

.paper-btn:hover {
  filter: brightness(1.12);
}

/* 按压行程：按进纸面 */
.paper-btn:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

.paper-ext {
  font-family: var(--font-mono);
}

/* —— wide 大卡：桌面端横向舒展、标题加大 —— */
@media (min-width: 768px) {
  .paper--wide {
    padding: 34px 32px 28px 66px;
  }

  .paper--wide .paper-title {
    font-size: clamp(24px, 3vw, 32px);
  }

  .paper--wide .paper-desc {
    max-width: 72ch;
  }
}

@media (prefers-reduced-motion: reduce) {
  .paper,
  .paper-tag,
  .paper-btn,
  .paper-link {
    transition: none;
  }

  .paper:hover {
    transform: rotate(var(--tilt, 0deg));
  }

  .paper:hover .paper-tag {
    transform: none;
  }

  .paper-btn:active {
    transform: none;
  }
}
</style>
