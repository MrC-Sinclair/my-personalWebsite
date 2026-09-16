<!--
  DashboardKpiCard - dashboard 风格 KPI 指标卡
  ------------------------------------------------------------
  大号等宽数字 + 小号标签 + 补充说明。
  数值全部来自共享层真实统计（由页面推导后传入），
  本组件不做任何数据加工。hover 时边框点亮 + 微上浮。
-->
<template>
  <div class="kpi">
    <p class="kpi-label">{{ label }}</p>
    <p class="kpi-value">{{ value }}</p>
    <p v-if="hint" class="kpi-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 指标名（i18n） */
  label: string
  /** 指标值（真实统计结果） */
  value: string | number
  /** 补充说明（i18n 或真实数据摘要，可选） */
  hint?: string
}>()
</script>

<style scoped>
.kpi {
  padding: var(--space);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  transition:
    transform var(--transition),
    border-color var(--transition);
}

/* 交互反馈：hover 边框点亮 + 微上浮（阴影已由 token 关闭） */
.kpi:hover {
  transform: translateY(-2px);
  border-color: var(--c-accent);
}

.kpi-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-muted);
}

/* 标签前的数据指示灯方块 */
.kpi-label::before {
  content: '';
  flex: none;
  width: 6px;
  height: 6px;
  background: var(--c-accent);
}

.kpi-value {
  margin: 6px 0 4px;
  font-family: var(--font-head);
  font-size: clamp(30px, 4.5vw, 44px);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  color: var(--c-text);
}

.kpi-hint {
  overflow: hidden;
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .kpi {
    transition: none;
  }

  .kpi:hover {
    transform: none;
  }
}
</style>
