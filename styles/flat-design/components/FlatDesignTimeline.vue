<!--
  FlatDesignTimeline - 扁平化风格圆点时间线
  ------------------------------------------------------------
  工作 / 教育经历：左侧纯色几何圆点 + 细竖线（几何图形代替
  图标），右侧时期 / 职位 / 组织 / 描述。数据来自共享层 useAppInfo。
-->
<template>
  <ol class="tl">
    <li v-for="(item, i) in items" :key="`${item.period}-${i}`" class="tl__item">
      <span class="tl__dot" :style="{ background: tone(i).main }" aria-hidden="true"/>
      <div class="tl__body">
        <p class="tl__period">{{ item.period }}</p>
        <h3 class="tl__title">{{ item.title }}</h3>
        <p class="tl__org">{{ item.organization }}</p>
        <p class="tl__desc">{{ item.description }}</p>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { TimelineItem } from '~/types/site'
import type { FlatTone } from '../tones'
import { flatTone } from '../tones'

defineProps<{
  /** 时间线条目（来自共享层 useAppInfo） */
  items: TimelineItem[]
}>()

/** 圆点颜色按条目轮换扁平色板 */
function tone(index: number): FlatTone {
  return flatTone(index)
}
</script>

<style scoped>
.tl {
  display: grid;
  gap: clamp(20px, 3vw, 26px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.tl__item {
  position: relative;
  padding-left: 30px;
}

/* 细竖线：浅灰纯色，末条不画（几何代替装饰线） */
.tl__item::before {
  content: '';
  position: absolute;
  top: 16px;
  bottom: -20px;
  left: 5px;
  width: 2px;
  background: var(--c-border);
}

.tl__item:last-child::before {
  display: none;
}

/* 纯色圆点 */
.tl__dot {
  position: absolute;
  top: 5px;
  left: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.tl__period {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.06em;
  color: var(--c-muted);
}

.tl__title {
  margin: 4px 0 0;
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 700;
  color: var(--c-text);
}

.tl__org {
  margin: 2px 0 0;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-accent);
}

.tl__desc {
  margin: 6px 0 0;
  font-size: var(--fs-small);
  line-height: 1.7;
  color: var(--c-muted);
}
</style>
