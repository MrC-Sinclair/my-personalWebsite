<!--
  SciFiHudMissionLog - sci-fi-hud 风格任务履历（工作/教育时间线）
  ------------------------------------------------------------
  把 useAppInfo 的 timeline 呈现为「任务日志」：左缘任务轨 +
  节点，条目含等宽时间段（信号色）、任务编号装饰（LOG-xx）、
  任务名 / 单位与描述。hover 时节点与左轨点亮。
-->
<template>
  <ol class="log">
    <li v-for="(item, index) in items" :key="`${item.period}-${index}`" class="entry">
      <span class="node" aria-hidden="true"/>

      <header class="entry-head">
        <span class="period">{{ item.period }}</span>
        <span class="code" aria-hidden="true">LOG-{{ String(index + 1).padStart(2, '0') }}</span>
      </header>

      <h4 class="entry-title">
        {{ item.title }}<span class="org">/ {{ item.organization }}</span>
      </h4>

      <p class="entry-desc">{{ item.description }}</p>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { TimelineItem } from '~/types/site'

defineProps<{
  /** 时间线条目（来自 useAppInfo().timeline） */
  items: TimelineItem[]
}>()
</script>

<style scoped>
/* —— 日志本体：左缘任务轨 —— */
.log {
  position: relative;
  display: grid;
  gap: var(--space);
  margin: 0;
  padding: 0 0 0 18px;
  list-style: none;
}

/* 任务轨：竖向刻度线 */
.log::before {
  content: '';
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 3px;
  width: 1px;
  background: repeating-linear-gradient(
    180deg,
    color-mix(in srgb, var(--c-accent) 45%, transparent) 0 6px,
    transparent 6px 12px
  );
}

/* —— 条目 —— */
.entry {
  position: relative;
  padding-left: 4px;
}

/* 节点：菱形标记，hover 点亮 */
.node {
  position: absolute;
  top: 6px;
  left: -19px;
  width: 9px;
  height: 9px;
  background: var(--c-border);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  transition:
    background var(--transition),
    box-shadow var(--transition);
}

.entry:hover .node {
  background: var(--c-accent);
  box-shadow: var(--shadow-press);
}

.entry-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

/* 时间段：等宽信号色读数 */
.period {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  color: var(--c-accent);
}

/* 任务编号（装饰） */
.code {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.14em;
  color: var(--c-muted);
  opacity: 0.75;
}

.entry-title {
  margin: 4px 0 2px;
  font-family: var(--font-head);
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text);
  overflow-wrap: break-word;
}

.org {
  margin-left: 6px;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  font-weight: 400;
  color: var(--c-muted);
}

.entry-desc {
  margin: 0;
  font-size: var(--fs-small);
  line-height: 1.8;
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .node {
    transition: none;
  }
}
</style>
