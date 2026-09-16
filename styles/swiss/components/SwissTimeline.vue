<!--
  SwissTimeline - swiss 风格经历时间线
  ------------------------------------------------------------
  条目式细则线排版：每条经历一行三段——时间段（左，小号
  宽字距）、职位 + 机构（中，加粗）、描述（右，灰色）。
  编号由红色数字承担，规则线承担分隔。数据来自共享层
  useAppInfo 的 timeline（页面获取后传入）。
-->
<template>
  <ol class="timeline">
    <li v-for="(item, i) in items" :key="`${item.period}-${i}`" class="tl-row">
      <span class="tl-no" aria-hidden="true">{{ pad(i + 1) }}</span>
      <span class="tl-period">{{ item.period }}</span>
      <div class="tl-main">
        <p class="tl-title">
          {{ item.title }}
          <span class="tl-org">{{ item.organization }}</span>
        </p>
        <p class="tl-desc">{{ item.description }}</p>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { TimelineItem } from '~/types/site'

defineProps<{
  /** 时间线条目（来自 useAppInfo，文案随语言更新） */
  items: TimelineItem[]
}>()

/** 编号格式化：补零到两位 */
function pad(n: number): string {
  return String(n).padStart(2, '0')
}
</script>

<style scoped>
.timeline {
  margin: 0;
  padding: 0;
  list-style: none;
  border-bottom: var(--border-w) solid var(--c-border);
}

.tl-row {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 6px var(--gap);
  align-items: baseline;
  padding: 20px 0;
  border-top: var(--border-w) solid var(--c-border);
}

.tl-no {
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-accent);
  font-variant-numeric: tabular-nums;
}

/* 时间段：小号宽字距 */
.tl-period {
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;
}

.tl-main {
  grid-column: 2;
  display: grid;
  gap: 6px;
}

.tl-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--c-text);
}

/* 机构名：常规字重回退，与前文形成字重对比 */
.tl-org {
  margin-left: 8px;
  font-size: 15px;
  font-weight: 400;
  color: var(--c-muted);
}

.tl-desc {
  margin: 0;
  max-width: 64ch;
  font-size: 14px;
  color: var(--c-muted);
}

/* —— 桌面端：编号 | 时间段 | 主内容 同行（2/3/7 非对称分栏） —— */
@media (min-width: 768px) {
  .tl-row {
    grid-template-columns: 40px 2fr 7fr;
  }

  .tl-main {
    grid-column: 3;
  }
}
</style>
