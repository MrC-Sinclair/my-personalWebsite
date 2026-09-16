<!--
  GlassmorphismTimeline - glassmorphism 风格的经历时间线
  ------------------------------------------------------------
  竖排玻璃时间线：左缘极光渐变轴线贯穿，每段经历是一块
  半透白玻璃片（职位 + 机构 + 时间段胶囊 + 描述），节点是
  发光小圆点。数据来自 useAppInfo 的 timeline（只读展示）。
-->
<template>
  <ol class="timeline">
    <li v-for="item in items" :key="item.title" class="tl-item">
      <span class="tl-node" aria-hidden="true"/>
      <div class="tl-card">
        <div class="tl-top">
          <h4 class="tl-title">{{ item.title }}</h4>
          <span class="tl-period">{{ item.period }}</span>
        </div>
        <p class="tl-org">{{ item.organization }}</p>
        <p class="tl-desc">{{ item.description }}</p>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { TimelineItem } from '~/types/site'

defineProps<{
  /** 经历时间线（来自 useAppInfo） */
  items: TimelineItem[]
}>()
</script>

<style scoped>
/* 竖排时间线：左缘轴线用签名极光渐变 */
.timeline {
  position: relative;
  display: grid;
  gap: var(--gap);
  margin: 0;
  padding: 0 0 0 22px;
  list-style: none;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 5px;
  width: 3px;
  background: var(--deco);
  border-radius: 999px;
  opacity: 0.75;
  box-shadow: 0 0 12px rgb(139 92 246 / 0.4);
}

/* 节点：发光圆点（对齐轴线） */
.tl-node {
  position: absolute;
  top: 22px;
  left: 0;
  width: 13px;
  height: 13px;
  background: rgb(255 255 255 / 0.9);
  border: 3px solid var(--c-accent);
  border-radius: 50%;
  box-shadow: 0 0 10px rgb(109 40 217 / 0.55);
}

.tl-item {
  position: relative;
}

/* 经历玻璃片：hover 微亮（只动底色，避免玻璃叠玻璃 blur） */
.tl-card {
  padding: 14px 18px;
  background: rgb(255 255 255 / 0.4);
  border: var(--border-w) solid rgb(255 255 255 / 0.55);
  border-radius: var(--radius-sm);
  transition: background var(--transition), border-color var(--transition);
}

.tl-card:hover {
  background: rgb(255 255 255 / 0.55);
  border-color: rgb(255 255 255 / 0.8);
}

.tl-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tl-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 800;
  color: var(--c-text);
}

/* 时间段：等宽字胶囊 */
.tl-period {
  flex: none;
  padding: 3px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  background: rgb(255 255 255 / 0.55);
  border: var(--border-w) solid rgb(255 255 255 / 0.7);
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}

.tl-org {
  margin: 4px 0 0;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-accent);
}

.tl-desc {
  margin: 6px 0 0;
  font-size: var(--fs-small);
  line-height: var(--lh-body);
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .tl-card {
    transition: none;
  }
}
</style>
