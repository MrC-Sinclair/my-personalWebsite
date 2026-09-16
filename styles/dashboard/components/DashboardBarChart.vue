<!--
  DashboardBarChart - dashboard 风格横向条形图（纯 CSS）
  ------------------------------------------------------------
  数据行：标签 + 轨道 + 填充条 + 数值。填充宽度由真实数据
  归一化计算（value / max），SSR 与客户端渲染结果一致。
  tone 可切换 accent / accent-2 两种序列色。
-->
<template>
  <ol class="bars" :class="{ 'bars-tone2': tone === 'accent2' }">
    <li v-for="item in items" :key="item.label" class="bar-row">
      <span class="bar-label" :title="item.label">{{ item.label }}</span>
      <span class="bar-track">
        <span class="bar-fill" :style="{ width: percent(item.value) }"/>
      </span>
      <span class="bar-value">{{ item.value }}</span>
    </li>
  </ol>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** 图表数据：label 为类目名，value 为真实计数 */
  items: Array<{ label: string; value: number }>
  /** 序列色：默认 accent，可切换 accent-2 */
  tone?: 'accent' | 'accent2'
}>()

/** 归一化基准：数据全为 0 时取 1，避免除零 */
const max = computed(() => Math.max(1, ...props.items.map((item) => item.value)))

/** 由数据计算填充宽度（纯同步计算，SSR 安全） */
function percent(value: number): string {
  return `${Math.round((value / max.value) * 100)}%`
}
</script>

<style scoped>
.bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.bar-row {
  display: grid;
  grid-template-columns: clamp(64px, 32%, 132px) minmax(0, 1fr) 2.5rem;
  align-items: center;
  gap: 8px;
}

.bar-label {
  overflow: hidden;
  font-size: var(--fs-base);
  color: var(--c-text);
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--transition);
}

.bar-track {
  display: block;
  height: 14px;
  background: color-mix(in srgb, var(--c-border) 55%, transparent);
  border-radius: var(--radius-sm);
  transition: background var(--transition);
}

.bar-fill {
  display: block;
  height: 100%;
  background-color: var(--c-accent);
  background-image: repeating-linear-gradient(
    135deg,
    rgb(255 255 255 / 0.14) 0 6px,
    transparent 6px 12px
  );
  border-radius: var(--radius-sm);
}

/* 第二序列色（accent-2） */
.bars-tone2 .bar-fill {
  background-color: var(--c-accent-2);
}

.bar-value {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--c-muted);
  transition: color var(--transition);
}

/* 交互反馈：hover 行高亮，填充条变亮、数值点亮 */
.bar-row:hover .bar-track {
  background: color-mix(in srgb, var(--c-accent) 14%, transparent);
}

.bar-row:hover .bar-label {
  color: var(--c-accent);
}

.bars-tone2 .bar-row:hover .bar-label {
  color: var(--c-accent-2);
}

.bar-row:hover .bar-value {
  color: var(--c-text);
}

@media (prefers-reduced-motion: reduce) {
  .bar-label,
  .bar-track,
  .bar-value {
    transition: none;
  }
}
</style>
