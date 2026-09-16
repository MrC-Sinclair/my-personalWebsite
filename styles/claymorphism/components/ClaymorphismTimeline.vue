<!--
  ClaymorphismTimeline - claymorphism 风格黏土时间线
  ------------------------------------------------------------
  经历时间线做成一串「黏土踏脚石」：左侧黏土圆点沿虚线
  串起，右侧每段经历是一块厚黏土板（时期胶囊 + 职位 +
  组织 + 描述）。最后一块石板用不同色相收尾（教育背景）。
-->
<template>
  <ol class="timeline">
    <li v-for="(item, index) in items" :key="`${item.period}-${item.title}`" class="step">
      <span class="dot" :class="`tone-${toneOf(index)}`" aria-hidden="true"/>
      <article class="stone" :class="`tone-${toneOf(index)}`">
        <header class="stone-head">
          <span class="period">{{ item.period }}</span>
          <h4 class="stone-title">{{ item.title }}</h4>
        </header>
        <p class="org">{{ item.organization }}</p>
        <p class="story">{{ item.description }}</p>
      </article>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { TimelineItem } from '~/types/site'

defineProps<{
  /** 时间线条目（来自共享层 useAppInfo） */
  items: TimelineItem[]
}>()

/** 色相轮换序列（与技能块同一 Pastel 色板） */
const TONES = ['lilac', 'mint', 'butter', 'pink'] as const

/** 按索引轮换色相 */
function toneOf(index: number): string {
  return TONES[index % TONES.length]!
}
</script>

<style scoped>
.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  margin: 0;
  padding: 0 0 0 26px;
  list-style: none;
}

/* 连接虚线：黏土串绳 */
.timeline::before {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 8px;
  width: 0;
  content: '';
  border-left: 4px dotted rgb(125 63 201 / 0.3);
}

.step {
  position: relative;
}

/* 串绳上的黏土圆点 */
.dot {
  position: absolute;
  top: 22px;
  left: -26px;
  width: 20px;
  height: 20px;
  background: var(--deco), var(--tone-bg);
  border-radius: 50%;
  box-shadow:
    0 4px 8px var(--tone-shadow),
    inset 0 -3px 5px var(--tone-inset);
}

/* 每段经历一块厚黏土板 */
.stone {
  padding: 18px 22px;
  background: var(--tone-bg);
  border-radius: var(--radius-sm);
  box-shadow:
    0 10px 18px var(--tone-shadow),
    0 3px 6px var(--tone-shadow),
    inset 0 6px 10px rgb(255 255 255 / 0.55),
    inset 0 -6px 9px var(--tone-inset);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

/* 列表项 hover：微微抬起 */
.stone:hover {
  transform: translateY(-3px);
}

.stone-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

/* 时期胶囊：小颗压印 */
.period {
  display: inline-block;
  padding: 3px 12px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--tone-text);
  background: var(--c-surface);
  border-radius: 999px;
  box-shadow:
    inset 0 2px 5px var(--tone-shadow),
    inset 0 -2px 4px rgb(255 255 255 / 0.85);
}

.stone-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 800;
  color: var(--tone-text);
}

.org {
  margin: 0 0 4px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--tone-text);
}

.story {
  margin: 0;
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
}

/* —— Pastel 色相（文字为加深色，保证彩底上 ≥ 4.5:1） —— */
.tone-lilac {
  --tone-bg: #e9defc;
  --tone-text: #4c2689;
  --tone-shadow: rgb(140 100 200 / 0.32);
  --tone-inset: rgb(120 80 185 / 0.24);
}

.tone-mint {
  --tone-bg: #d3f3e1;
  --tone-text: #175639;
  --tone-shadow: rgb(90 175 135 / 0.32);
  --tone-inset: rgb(70 145 105 / 0.24);
}

.tone-butter {
  --tone-bg: #fff3cd;
  --tone-text: #65450c;
  --tone-shadow: rgb(215 170 70 / 0.32);
  --tone-inset: rgb(190 140 40 / 0.24);
}

.tone-pink {
  --tone-bg: #ffdfe9;
  --tone-text: #7a2953;
  --tone-shadow: rgb(215 100 150 / 0.32);
  --tone-inset: rgb(215 100 150 / 0.24);
}

@media (prefers-reduced-motion: reduce) {
  .stone {
    transition: none;
  }

  .stone:hover {
    transform: none;
  }
}
</style>
