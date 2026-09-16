<!--
  Y2KTimeline - y2k 风格经历时间线
  ------------------------------------------------------------
  「能量轨道」时间线：垂直铬渐变轨道线 + 发光铬球节点 +
  铭牌式年份（等宽字体胶囊）+ 标题/机构/描述。
  数据来自共享层 useAppInfo().timeline（TimelineItem[]）。
-->
<template>
  <ol class="timeline">
    <li v-for="item in items" :key="item.period" class="tl-item">
      <span class="tl-node" aria-hidden="true" />
      <div class="tl-body">
        <p class="tl-period">{{ item.period }}</p>
        <p class="tl-title">{{ item.title }} · {{ item.organization }}</p>
        <p class="tl-desc">{{ item.description }}</p>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
/**
 * @file Y2K 风格的经历时间线组件
 * @description 铬球节点 + 能量轨道的千禧年时间线。
 */
import type { TimelineItem } from '~/types/site'

defineProps<{
  /** 时间线数据（共享层 useAppInfo 返回） */
  items: TimelineItem[]
}>()
</script>

<style scoped>
.timeline {
  position: relative;
  display: grid;
  gap: var(--gap);
  margin: 0;
  padding: 0 0 0 4px;
  list-style: none;
}

/* 轨道线：垂直铬渐变 */
.tl-item {
  position: relative;
  padding-left: 34px;
}

.tl-item::before {
  content: '';
  position: absolute;
  top: 10px;
  bottom: -1.75em;
  left: 9px;
  width: 2px;
  background: linear-gradient(180deg, rgb(139 123 255 / 0.8), rgb(255 92 225 / 0.35), rgb(69 227 255 / 0.2));
}

/* 末项轨道线收尾消失 */
.tl-item:last-child::before {
  bottom: auto;
  height: 26px;
  background: linear-gradient(180deg, rgb(139 123 255 / 0.8), transparent);
}

/* 节点：发光铬球 */
.tl-node {
  position: absolute;
  top: 4px;
  left: 0;
  width: 20px;
  height: 20px;
  border: 1px solid rgb(255 255 255 / 0.6);
  border-radius: 50%;
  background: radial-gradient(120% 120% at 32% 26%, #ffffff 0%, #c3cdf2 32%, #6a76b8 66%, #2c3468 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.9),
    0 0 12px rgb(139 123 255 / 0.7);
}

.tl-body {
  display: grid;
  gap: 4px;
}

/* 年份铭牌（等宽字体胶囊） */
.tl-period {
  justify-self: start;
  margin: 0;
  padding: 2px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.12em;
  color: rgb(190 235 255 / 1);
  border: var(--border-w) solid rgb(69 227 255 / 0.4);
  border-radius: 999px;
  background: rgb(69 227 255 / 0.08);
}

.tl-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 700;
  color: var(--c-text);
}

.tl-desc {
  margin: 0;
  font-size: 15px;
  line-height: var(--lh-body);
  color: var(--c-muted);
}
</style>
