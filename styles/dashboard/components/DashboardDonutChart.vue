<!--
  DashboardDonutChart - dashboard 风格环形图（纯 SVG）
  ------------------------------------------------------------
  用 stroke-dasharray / stroke-dashoffset 按真实数据比例
  分段绘制环形，中心显示总数，右侧图例带数值与百分比。
  悬停图例时高亮对应扇区（纯视图状态，无副作用）。
-->
<template>
  <div class="donut">
    <div class="donut-chart">
      <svg viewBox="0 0 96 96" role="img" :aria-label="ariaLabel">
        <circle class="ring-track" cx="48" cy="48" r="38" fill="none" stroke-width="14" />
        <g transform="rotate(-90 48 48)">
          <circle
            v-for="seg in segments"
            :key="seg.label"
            class="ring-seg"
            :class="{ 'is-active': activeIndex === null || seg.index === activeIndex, 'is-dim': activeIndex !== null && seg.index !== activeIndex }"
            cx="48"
            cy="48"
            r="38"
            fill="none"
            :stroke="seg.color"
            stroke-width="14"
            :stroke-dasharray="seg.dash"
            :stroke-dashoffset="seg.offset"
          />
        </g>
      </svg>
      <p class="donut-total" aria-hidden="true">{{ total }}</p>
    </div>

    <ul class="legend">
      <li
        v-for="seg in segments"
        :key="seg.label"
        class="legend-row"
        @mouseenter="activeIndex = seg.index"
        @mouseleave="activeIndex = null"
      >
        <span class="legend-chip" :style="{ background: seg.color }" aria-hidden="true"/>
        <span class="legend-label">{{ seg.label }}</span>
        <span class="legend-value">{{ seg.value }} · {{ seg.percent }}%</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** 图表数据：label 为分组名，value 为真实计数 */
  items: Array<{ label: string; value: number }>
  /** 环形图的无障碍描述（i18n） */
  ariaLabel: string
}>()

/** 图表序列色 —— 风格签名装饰（前两位对应 --c-accent / --c-accent-2） */
const PALETTE = ['var(--c-accent)', 'var(--c-accent-2)', '#34d399', '#a78bfa', '#f472b6', '#60a5fa'] as const

/** 当前悬停的扇区下标（null = 无悬停） */
const activeIndex = ref<number | null>(null)

/** 周长（r = 38，与模板中的 circle 保持一致） */
const CIRCUMFERENCE = 2 * Math.PI * 38

/** 总数（真实数据求和） */
const total = computed(() => props.items.reduce((sum, item) => sum + item.value, 0))

/** 由数据比例计算每个扇区的 dash 参数（纯同步，SSR 安全） */
const segments = computed(() => {
  const base = Math.max(1, total.value)
  let acc = 0
  return props.items.map((item, index) => {
    const fraction = item.value / base
    const seg = {
      index,
      label: item.label,
      value: item.value,
      color: PALETTE[index % PALETTE.length],
      dash: `${((fraction * CIRCUMFERENCE).toFixed(2))} ${((CIRCUMFERENCE - fraction * CIRCUMFERENCE).toFixed(2))}`,
      offset: `${(-acc * CIRCUMFERENCE).toFixed(2)}`,
      percent: Math.round(fraction * 100),
    }
    acc += fraction
    return seg
  })
})
</script>

<style scoped>
.donut {
  display: flex;
  flex-direction: column;
  gap: var(--space);
}

.donut-chart {
  position: relative;
  width: min(168px, 60%);
  margin: 0 auto;
}

.donut svg {
  display: block;
  width: 100%;
  height: auto;
}

.ring-track {
  stroke: color-mix(in srgb, var(--c-border) 65%, transparent);
}

/* 扇区：默认轻度透明，悬停图例时高亮 / 压暗 */
.ring-seg {
  opacity: 0.85;
  transition: opacity var(--transition);
}

.ring-seg.is-active {
  opacity: 1;
}

.ring-seg.is-dim {
  opacity: 0.28;
}

.donut-total {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0;
  font-family: var(--font-head);
  font-size: 26px;
  font-variant-numeric: tabular-nums;
  color: var(--c-text);
  transform: translate(-50%, -50%);
}

.legend {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  transition: background var(--transition);
}

.legend-row:hover {
  background: color-mix(in srgb, var(--c-accent) 10%, transparent);
}

.legend-chip {
  flex: none;
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-label {
  overflow: hidden;
  flex: 1;
  min-width: 0;
  font-size: var(--fs-base);
  color: var(--c-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-value {
  flex: none;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .ring-seg,
  .legend-row {
    transition: none;
  }
}
</style>
