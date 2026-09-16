<!--
  FlatDesignSkillBars - 扁平化风格技能纯色进度条
  ------------------------------------------------------------
  每个技能分类一条纯色进度条：宽度 = 该分类技能数 / 最大分类数
  （真实数据占比，不虚构熟练度），下方平铺技能标签。进度条为
  装饰性图形（aria-hidden），数值由文字直接承载。
-->
<template>
  <ul class="skill-bars">
    <li v-for="(bar, i) in bars" :key="bar.category" class="skill-bars__group">
      <div class="skill-bars__row">
        <span class="skill-bars__label">{{ bar.category }}</span>
        <span class="skill-bars__count">{{ bar.count }}</span>
      </div>

      <!-- 纯色进度条：颜色按分类轮换扁平色板 -->
      <div class="skill-bars__track" aria-hidden="true">
        <span
          class="skill-bars__fill"
          :style="{ width: bar.percent + '%', background: tone(i).main }"
        />
      </div>

      <ul class="skill-bars__chips">
        <li v-for="skill in bar.skills" :key="skill" class="skill-bars__chip">{{ skill }}</li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { FlatTone } from '../tones'
import { flatTone } from '../tones'

/** 单条进度条数据（由页面从共享层 skillGroups 推导） */
export interface SkillBar {
  /** 分类名（i18n） */
  category: string
  /** 该分类技能数量（真实数据） */
  count: number
  /** 相对最大分类的百分比宽度 */
  percent: number
  /** 该分类下的技能名列表 */
  skills: string[]
}

defineProps<{
  /** 进度条数据列表 */
  bars: SkillBar[]
}>()

/** 轮换扁平色板（暴露给模板） */
function tone(index: number): FlatTone {
  return flatTone(index)
}
</script>

<style scoped>
.skill-bars {
  display: grid;
  gap: clamp(20px, 3vw, 28px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.skill-bars__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.skill-bars__label {
  font-family: var(--font-head);
  font-size: 16px;
  font-weight: 700;
  color: var(--c-text);
}

/* 数量标注：真实数据由文字承载 */
.skill-bars__count {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* 轨道：浅灰纯色，无内阴影无渐变 */
.skill-bars__track {
  height: 12px;
  background: #e2e8ef;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

/* 填充：纯色直条（flat 签名），宽度来自真实占比 */
.skill-bars__fill {
  display: block;
  height: 100%;
  border-radius: var(--radius-sm);
}

/* 技能标签：浅灰扁平小片 */
.skill-bars__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.skill-bars__chip {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text);
  background: #edf1f6;
  border-radius: var(--radius-sm);
}
</style>
