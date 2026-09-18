<!--
  Y2KProjectCard - y2k 风格项目卡片
  ------------------------------------------------------------
  「镭射光盘」项目卡：纯 CSS 绘制一张彩虹光晕 CD 光盘
  （conic-gradient 镭射膜 + 中心孔），悬浮时光盘旋转 + 彩虹
  扫光划过。卡片本体不伪装成整卡链接（本风格未实现项目详情
  页，不提供假跳转，与 web2-glossy 同一口径），真实交互集中在：
  标题链接（NuxtLink → 过渡层项目详情）与「在线演示 / GitHub」
  铬按钮外链。tags 用 Array.isArray 防御，slug 换算复用共享层
  contentSlug（不在风格里重写业务逻辑）。wide 模式：首屏大卡，
  桌面端横向布局并横跨两列，附「精选」品红徽章。
-->
<template>
  <article class="card" :class="{ 'card--wide': wide }">
    <span v-if="wide" class="card-badge">
      <span aria-hidden="true">✦</span>
      {{ t('projects.featured') }}
    </span>

    <!-- 纯 CSS 镭射光盘 -->
    <span class="card-disc" aria-hidden="true">
      <span class="card-disc-shine" />
      <span class="card-disc-hole" />
    </span>

    <div class="card-body">
      <h3 class="card-title">
        <NuxtLink class="card-link" :to="localePath(`/projects/${contentSlug(project.path)}`)">
          {{ project.title }}
        </NuxtLink>
      </h3>

      <p v-if="project.description" class="card-desc">{{ project.description }}</p>

      <ul v-if="safeTags.length" class="card-tags">
        <li v-for="tag in safeTags" :key="tag" class="card-tag">{{ tag }}</li>
      </ul>

      <div v-if="project.demoUrl || project.githubUrl" class="card-actions">
        <Y2KChromeButton v-if="project.demoUrl" :href="project.demoUrl" external>
          {{ t('projects.demo') }}
        </Y2KChromeButton>
        <Y2KChromeButton v-if="project.githubUrl" :href="project.githubUrl" external variant="plastic">
          {{ t('projects.github') }}
        </Y2KChromeButton>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * @file Y2K 风格的项目卡片组件
 * @description 镭射光盘视觉 + 铬按钮外链；数据来自共享层 useProjects()。
 */
import { contentSlug } from '~/utils/content'
import type { Project } from '~/types/project'
import Y2KChromeButton from './Y2KChromeButton.vue'

const props = withDefaults(
  defineProps<{
    /** 项目数据（共享层返回值） */
    project: Project
    /** 是否为横跨两列的大卡（附「精选」徽章） */
    wide?: boolean
  }>(),
  {
    wide: false,
  },
)

const { t } = useI18n()
const localePath = useLocalePath()

/** 防御：tags 非数组时回退为空列表 */
const safeTags = computed(() => (Array.isArray(props.project.tags) ? props.project.tags : []))
</script>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  overflow: hidden;
  padding: var(--space);
  border: var(--border-w) solid rgb(190 200 255 / 0.38);
  border-radius: var(--radius);
  background: linear-gradient(
    165deg,
    rgb(255 255 255 / 0.13) 0%,
    rgb(255 255 255 / 0.04) 40%,
    rgb(139 123 255 / 0.1) 100%
  );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.5),
    var(--shadow);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

/* hover：上浮 + 辉光增强 + 光盘旋转 */
.card:hover {
  transform: translateY(-5px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.7),
    0 26px 60px rgb(5 0 42 / 0.62),
    0 0 44px rgb(139 123 255 / 0.3);
}

.card:hover .card-disc {
  transform: rotate(140deg);
}

/* —— 全卡彩虹扫光（hover 划过） —— */
.card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 34%,
    rgb(255 92 225 / 0.14) 44%,
    rgb(69 227 255 / 0.16) 52%,
    transparent 64%
  );
  transform: translateX(-130%);
  transition: transform 620ms ease;
  pointer-events: none;
}

.card:hover::after {
  transform: translateX(130%);
}

/* —— 镭射光盘（conic 彩虹膜） —— */
.card-disc {
  position: relative;
  flex: none;
  align-self: flex-start;
  display: block;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: conic-gradient(
    from 210deg,
    #ff9de2 0%,
    #b7c0ff 18%,
    #9ff3ff 34%,
    #fff6b8 48%,
    #ffb3f0 64%,
    #a5b4ff 82%,
    #ff9de2 100%
  );
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.4),
    0 12px 26px rgb(5 0 42 / 0.5);
  transition: transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* 盘面径向高光 */
.card-disc-shine {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(46% 34% at 30% 22%, rgb(255 255 255 / 0.75), transparent 70%),
    radial-gradient(100% 100% at 50% 50%, transparent 42%, rgb(255 255 255 / 0.18) 58%, transparent 72%);
}

/* 中心孔（透出深空底色） */
.card-disc-hole {
  position: absolute;
  inset: 35%;
  border-radius: 50%;
  background: var(--c-bg);
  box-shadow:
    inset 0 1px 3px rgb(0 0 0 / 0.55),
    0 0 0 3px rgb(255 255 255 / 0.22);
}

/* —— 「精选」品红辉光徽章 —— */
.card-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 30px;
  padding: 4px 14px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #2b0733;
  border: var(--border-w) solid rgb(255 255 255 / 0.65);
  border-radius: 999px;
  background: linear-gradient(180deg, #ffd7f4 0%, #ff5ce1 58%, #e23cc4 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.85),
    0 0 16px rgb(255 92 225 / 0.55);
}

/* —— 文本区 —— */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.card-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 900;
  line-height: 1.28;
  overflow-wrap: break-word;
}

/* 标题链接：铬字 → 悬浮点亮 */
.card-link {
  background: linear-gradient(180deg, #ffffff 0%, #ccd6f6 40%, #7d89c9 62%, #c7d3f2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  text-decoration: none;
  transition: filter var(--transition);
}

.card-link:hover {
  filter: brightness(1.3) drop-shadow(0 0 10px rgb(255 92 225 / 0.6));
}

.card-desc {
  margin: 0;
  font-size: 15px;
  line-height: var(--lh-body);
  color: var(--c-muted);
  overflow-wrap: break-word;
}

/* —— 技术栈铬银胶囊 —— */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.card-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.04em;
  color: var(--c-text);
  border: var(--border-w) solid rgb(200 210 255 / 0.4);
  border-radius: 999px;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.18) 0%, rgb(255 255 255 / 0.04) 100%);
}

/* —— 动作按钮区 —— */
.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

/* —— wide 大卡：桌面端横向布局、光盘加大 —— */
@media (min-width: 768px) {
  .card--wide {
    flex-direction: row;
    align-items: center;
    gap: calc(var(--space) * 1.4);
  }

  .card--wide .card-disc {
    width: 148px;
    height: 148px;
  }

  .card--wide .card-body {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .card::after,
  .card-disc,
  .card-link {
    transition: none;
  }

  .card:hover {
    transform: none;
  }

  .card:hover::after {
    display: none;
  }

  .card:hover .card-disc {
    transform: none;
  }
}
</style>
