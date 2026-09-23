<!--
  DashboardTrendLine - dashboard 风格迷你趋势线（纯 SVG）
  ------------------------------------------------------------
  用 polyline + area path 绘制最近 12 个月的内容计数趋势，
  数据由页面从共享层文章日期推导后传入（真实统计）。
  preserveAspectRatio="none" + vector-effect 保证拉伸时描边
  不变形；坐标轴标签为纯数字月份（语言无关）。
-->
<template>
  <div class="trend">
    <svg
      class="trend-svg"
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      preserveAspectRatio="none"
      role="img"
      :aria-label="caption"
    >
      <!-- 横向网格基线 -->
      <line
        v-for="gy in GRID_YS"
        :key="gy"
        class="trend-grid"
        x1="0"
        :y1="gy"
        :x2="WIDTH"
        :y2="gy"
      />
      <path class="trend-area" :d="areaPath" />
      <polyline class="trend-line" :points="linePoints" vector-effect="non-scaling-stroke" />
    </svg>

    <!-- 月份坐标轴：纯数字标签，语言无关 -->
    <div v-if="labels.length" class="trend-axis" aria-hidden="true">
      <span v-for="(label, i) in labels" :key="`${label}-${i}`">{{ label }}</span>
    </div>

    <!-- 读屏摘要：逐月数值（纯数字，语言无关） -->
    <p class="sr-only">{{ srSummary }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** 趋势数值序列（真实计数，按月） */
  values: number[]
  /** 横轴标签（两位数字月份） */
  labels: string[]
  /** 趋势图的无障碍描述（i18n），渲染为 svg 的 aria-label。
      同 DashboardDonutChart：prop 名不含连字符，避免 kebab/camel 规则冲突 */
  caption: string
}>()

/** SVG 视口尺寸（配合 preserveAspectRatio="none" 拉伸铺满） */
const WIDTH = 240
const HEIGHT = 56

/** 横向网格基线的 y 坐标 */
const GRID_YS = [14, 28, 42] as const

/** 归一化基准：数据全为 0 时取 1，避免除零 */
const maxValue = computed(() => Math.max(1, ...props.values))

/** 折线顶点序列 "x,y x,y ..."（纯同步计算，SSR 安全） */
const linePoints = computed(() => {
  const n = props.values.length
  if (n === 0) return ''
  return props.values
    .map((value, i) => {
      const x = n === 1 ? WIDTH / 2 : (i / (n - 1)) * WIDTH
      const y = HEIGHT - 4 - (value / maxValue.value) * (HEIGHT - 10)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

/** 面积路径：折线向下闭合到基线 */
const areaPath = computed(() => {
  if (!linePoints.value) return ''
  return `M0,${HEIGHT} L${linePoints.value.split(' ').join(' L')} L${WIDTH},${HEIGHT} Z`
})

/** 读屏摘要：逐月 "标签:数值" 列表（纯数字） */
const srSummary = computed(() =>
  props.values.map((value, i) => `${props.labels[i] ?? i + 1}: ${value}`).join('，'),
)
</script>

<style scoped>
.trend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trend-svg {
  display: block;
  width: 100%;
  height: 96px;
}

.trend-grid {
  stroke: color-mix(in srgb, var(--c-border) 80%, transparent);
  stroke-width: 1;
}

.trend-area {
  fill: var(--c-accent);
  opacity: 0.12;
}

.trend-line {
  fill: none;
  stroke: var(--c-accent);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.trend-axis {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
}

/* 视觉隐藏（读屏可用） */
.sr-only {
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  white-space: nowrap;
}
</style>
