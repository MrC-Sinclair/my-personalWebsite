<!-- cspell:ignore pcard -->
<!--
  Web2GlossyProjectCard - Web 2.0 光泽风格的项目卡片
  ------------------------------------------------------------
  白色光泽面板 + 纯 CSS「浏览器截图」缩略图（窗口栏三圆点 +
  蓝色渐变画布 + 斜向高光扫过）；卡片本体不伪装成可点击链接
  （本风格未实现项目详情页，不提供假跳转），真实交互集中在
  「在线演示 / GitHub」凝胶外链按钮上（hover 光泽扫过 + 按压下沉）。
  wide 模式：首屏大卡，附「精选」橙色徽章，网格中横跨两列。
-->
<template>
  <article class="pcard" :class="{ 'pcard--wide': wide }">
    <span v-if="wide" class="pcard__badge">
      <span class="pcard__badge-text">{{ t('projects.featured') }}</span>
    </span>

    <!-- 纯 CSS 浏览器窗口缩略图（无图片资源） -->
    <div class="pcard__thumb" aria-hidden="true">
      <span class="pcard__chrome"><i/></span>
      <span class="pcard__canvas"/>
      <span class="pcard__sheen"/>
    </div>

    <div class="pcard__body">
      <h3 class="pcard__title">{{ project.title }}</h3>
      <p v-if="project.description" class="pcard__desc">{{ project.description }}</p>

      <ul v-if="safeTags.length" class="pcard__tags">
        <li v-for="tag in safeTags" :key="tag" class="pcard__tag">{{ tag }}</li>
      </ul>

      <div v-if="project.demoUrl || project.githubUrl" class="pcard__actions">
        <Web2GlossyGelButton v-if="project.demoUrl" :href="project.demoUrl" external>
          {{ t('projects.demo') }}
        </Web2GlossyGelButton>
        <Web2GlossyGelButton v-if="project.githubUrl" :href="project.githubUrl" external variant="ghost">
          {{ t('projects.github') }}
        </Web2GlossyGelButton>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * @file Web 2.0 光泽风格的项目卡片组件
 * @description 数据来自共享层 useProjects()；tags 用 Array.isArray 防御。
 */
import type { Project } from '~/types/project'
import Web2GlossyGelButton from './Web2GlossyGelButton.vue'

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

/** 防御：tags 非数组时回退为空列表 */
const safeTags = computed(() => (Array.isArray(props.project.tags) ? props.project.tags : []))
</script>

<style scoped>
/* —— 白色光泽卡片 —— */
.pcard {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: linear-gradient(180deg, #ffffff 0%, #f3f9ff 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

/* 卡片顶部淡蓝光泽反光 */
.pcard::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 42%;
  border-radius: var(--radius) var(--radius) 45% 45%;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.8) 0%, rgb(214 233 250 / 0.22) 100%);
  pointer-events: none;
}

.pcard:hover {
  transform: translateY(-4px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    0 6px 14px rgb(23 74 128 / 0.22),
    0 20px 40px rgb(23 74 128 / 0.18);
}

/* —— 「精选」橙色凝胶徽章 —— */
.pcard__badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 4px 14px;
  overflow: hidden;
  border: 1px solid #8a3c08;
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, #d97a1c 0%, #bf5a10 55%, #a84a0c 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.5),
    0 2px 6px rgb(23 74 128 / 0.3);
}

.pcard__badge::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.38) 0%, rgb(255 255 255 / 0) 62%);
  pointer-events: none;
}

.pcard__badge-text {
  color: #ffffff;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-shadow: 0 1px 1px rgb(80 32 0 / 0.5);
}

/* —— 纯 CSS 浏览器窗口缩略图 —— */
.pcard__thumb {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 7;
  border: 1px solid #14417e;
  border-radius: 12px;
  background: linear-gradient(160deg, #6cb0f4 0%, #2b72c6 55%, #1a56a4 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.4),
    0 4px 10px rgb(23 74 128 / 0.25);
}

/* 窗口栏 + 三圆点 */
.pcard__chrome {
  position: absolute;
  inset: 0 0 auto 0;
  display: flex;
  align-items: center;
  height: 22px;
  padding-left: 10px;
  border-bottom: 1px solid rgb(169 200 232 / 0.8);
  background: linear-gradient(180deg, #f6fbff 0%, #dbeafb 100%);
}

.pcard__chrome i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f0a24a;
  box-shadow:
    14px 0 0 #e8615a,
    28px 0 0 #6cbf6e;
}

/* 画布上的网格纹理与窗口倒影 */
.pcard__canvas {
  position: absolute;
  inset: 22px 0 0 0;
  background:
    radial-gradient(60% 90% at 78% 108%, rgb(255 255 255 / 0.32), transparent 65%),
    repeating-linear-gradient(90deg, rgb(255 255 255 / 0.09) 0 2px, transparent 2px 30px),
    linear-gradient(160deg, rgb(255 255 255 / 0) 55%, rgb(255 255 255 / 0.16) 100%);
}

/* 斜向高光扫过（hover 时随卡片划过） */
.pcard__sheen {
  position: absolute;
  top: -25%;
  bottom: -25%;
  left: -32%;
  width: 34%;
  background: linear-gradient(90deg, rgb(255 255 255 / 0), rgb(255 255 255 / 0.4), rgb(255 255 255 / 0));
  transform: skewX(-20deg) translateX(-160%);
  transition: transform 560ms ease;
  pointer-events: none;
}

.pcard:hover .pcard__sheen {
  transform: skewX(-20deg) translateX(460%);
}

/* —— 文本区 —— */
.pcard__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pcard__title {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 800;
  line-height: 1.3;
  color: var(--c-text);
}

.pcard__desc {
  margin: 0;
  color: var(--c-muted);
  font-size: 0.9375rem;
}

/* —— 技术栈胶囊 —— */
.pcard__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pcard__tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  font-size: var(--fs-small);
  font-weight: 600;
  color: #1a5fc0;
  background: linear-gradient(180deg, #ffffff 0%, #e9f2fc 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.9),
    0 1px 3px rgb(23 74 128 / 0.14);
}

/* —— 动作按钮区 —— */
.pcard__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}
</style>
