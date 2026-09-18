<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismTimeline - 拟物风格经历时间线
  ------------------------------------------------------------
  「缝在木板上的皮革书签」：左侧黄铜铆钉轨道 + 缝线竖轨，
  每条经历是一张微旋转的皮革书签卡（交替倾斜、像钉在板上的
  标签），时期为黄铜打字机小铭牌。数据来自共享层 useAppInfo。
-->
<template>
  <ol class="tl">
    <li v-for="(item, i) in items" :key="`${item.title}-${i}`" class="tl-item">
      <span class="tl-dot" aria-hidden="true" />
      <div class="tl-card" :style="{ '--tilt': `${tilts[i % tilts.length]}deg` }">
        <p class="tl-period">
          <span class="tl-tag">{{ item.period }}</span>
        </p>
        <p class="tl-title">
          {{ item.title }}
          <span class="tl-org">· {{ item.organization }}</span>
        </p>
        <p class="tl-desc">{{ item.description }}</p>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
/**
 * @file 拟物风格的经历时间线组件
 * @description 皮革书签卡时间线：黄铜轨道铆钉 + 缝线竖轨 + 交替微旋转。
 */
import type { TimelineItem } from '~/types/site'

defineProps<{
  /** 时间线条目（共享层 useAppInfo 返回值） */
  items: TimelineItem[]
}>()

/** 书签卡的交替倾角（确定性数值，SSR 安全） */
const tilts = [-1.1, 0.9, -0.7, 1.2]
</script>

<style scoped>
.tl {
  position: relative;
  display: grid;
  gap: var(--gap);
  margin: 0;
  padding: 4px 0 4px 26px;
  list-style: none;
}

/* 缝线竖轨（dashed 针脚） */
.tl::before {
  content: '';
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 8px;
  border-left: 2px dashed rgb(243 234 215 / 0.3);
}

/* 轨道上的黄铜固定铆钉 */
.tl-dot {
  position: absolute;
  top: 14px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f0dca6 0%, #c39a4c 52%, #6e4c1a 100%);
  box-shadow:
    inset 0 -1px 2px rgb(0 0 0 / 0.55),
    0 1px 1px rgb(255 240 210 / 0.3);
}

.tl-item {
  position: relative;
  min-width: 0;
}

/* —— 皮革书签卡：微旋转 + 缝线 —— */
.tl-card {
  position: relative;
  display: grid;
  gap: 6px;
  padding: 14px 18px 14px 20px;
  border: 1px solid rgb(0 0 0 / 0.55);
  border-radius: var(--radius-sm);
  /* 皮革：深棕底 + 小噪点 */
  background:
    radial-gradient(circle at 24% 30%, rgb(255 255 255 / 0.05) 1px, transparent 1.6px),
    radial-gradient(circle at 70% 64%, rgb(0 0 0 / 0.15) 1.1px, transparent 1.8px),
    linear-gradient(170deg, #6b4223 0%, #543116 100%);
  background-size: 8px 8px, 10px 10px, 100% 100%;
  box-shadow:
    inset 0 1px 0 rgb(255 240 210 / 0.14),
    inset 0 -2px 5px rgb(0 0 0 / 0.4),
    0 4px 9px rgb(10 4 0 / 0.5);
  transform: rotate(var(--tilt, 0deg));
  transition: transform var(--transition), box-shadow var(--transition);
}

/* 卡内一圈缝线 */
.tl-card::after {
  content: '';
  position: absolute;
  inset: 5px;
  border: 1px dashed rgb(243 234 215 / 0.26);
  border-radius: calc(var(--radius-sm) - 2px);
  pointer-events: none;
}

/* hover：书签被扶正并抬离木板 */
.tl-card:hover {
  transform: rotate(0deg) translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgb(255 240 210 / 0.2),
    inset 0 -2px 5px rgb(0 0 0 / 0.4),
    0 9px 16px rgb(10 4 0 / 0.55);
}

/* —— 时期：黄铜打字机铭牌 —— */
.tl-period {
  display: flex;
  margin: 0;
}

.tl-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-on-accent);
  border: 1px solid rgb(0 0 0 / 0.5);
  border-radius: 3px;
  background: linear-gradient(180deg, #dcb56b 0%, #b8893a 55%, #96682a 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.5),
    0 1px 2px rgb(10 4 0 / 0.5);
}

.tl-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 700;
  color: #fbf2dd;
}

.tl-org {
  font-weight: 400;
  color: #e6d5b4;
}

.tl-desc {
  margin: 0;
  font-size: 15px;
  line-height: var(--lh-body);
  color: #e6d5b4;
  overflow-wrap: break-word;
}

@media (prefers-reduced-motion: reduce) {
  .tl-card {
    transition: none;
    transform: none;
  }

  .tl-card:hover {
    transform: none;
  }
}
</style>
