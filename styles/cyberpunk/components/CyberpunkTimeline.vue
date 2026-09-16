<!--
  CyberpunkTimeline - cyberpunk 风格经历「数据轨」时间线
  ------------------------------------------------------------
  工作经历以垂直霓虹光轨呈现：左侧贯穿的青→紫→粉渐变光轨
  + 菱形节点（hover 时点亮扩大），右侧条目正文（职位 / 组织
  / 等宽粉色时间段 / 描述）。纯展示组件，无交互状态外的行
  为逻辑；数据来自共享层 useAppInfo 的 timeline。
-->
<template>
  <ol class="timeline">
    <li v-for="item in items" :key="`${item.period}-${item.title}`" class="row">
      <span class="node" aria-hidden="true"/>
      <div class="body">
        <p class="head">
          <span class="title">{{ item.title }}</span>
          <span class="org">{{ item.organization }}</span>
          <time class="period">{{ item.period }}</time>
        </p>
        <p class="desc">{{ item.description }}</p>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { TimelineItem } from '~/types/site'

defineProps<{
  /** 时间线条目（来自共享层 useAppInfo） */
  items: TimelineItem[]
}>()
</script>

<style scoped>
.timeline {
  display: grid;
  gap: var(--space);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* —— 条目：节点 + 光轨 + 正文 —— */
.row {
  position: relative;
  display: flex;
  gap: 14px;
}

/* 光轨：贯穿条目的渐变光线（末条不画） */
.row::before {
  position: absolute;
  top: 16px;
  bottom: calc(-1 * var(--space));
  left: 7px;
  width: 2px;
  content: '';
  background: linear-gradient(
    180deg,
    rgb(34 211 238 / 0.65),
    color-mix(in srgb, var(--c-accent) 48%, var(--c-accent-2)) 55%,
    rgb(255 45 149 / 0.2)
  );
  box-shadow: 0 0 8px rgb(34 211 238 / 0.35);
}

.row:last-child::before {
  display: none;
}

/* 菱形节点：hover 点亮扩大（装饰性反馈） */
.node {
  position: relative;
  z-index: 1;
  flex: none;
  width: 12px;
  height: 12px;
  margin-top: 6px;
  background: var(--c-accent);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  box-shadow: 0 0 10px rgb(34 211 238 / 0.8);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.row:hover .node {
  transform: scale(1.25);
  box-shadow: 0 0 16px rgb(255 45 149 / 0.7);
}

.body {
  flex: 1 1 auto;
  min-width: 0;
}

.head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  margin: 0 0 4px;
}

.title {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-text);
  text-shadow: 0 0 10px rgb(34 211 238 / 0.25);
}

.org {
  font-size: var(--fs-small);
  color: color-mix(in srgb, var(--c-accent) 48%, var(--c-accent-2));
}

/* 时间段：等宽粉字（数据感） */
.period {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent-2);
}

.desc {
  margin: 0;
  font-size: var(--fs-small);
  line-height: var(--lh-body);
  color: var(--c-muted);
}

/* 窄屏：时间段换行到标题下方（不右对齐） */
@media (max-width: 640px) {
  .period {
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .node {
    transition: none;
  }

  .row:hover .node {
    transform: none;
  }
}
</style>
