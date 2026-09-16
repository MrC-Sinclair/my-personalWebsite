<!--
  SciFiHudSkillGauge - sci-fi-hud 风格技能模块阵列
  ------------------------------------------------------------
  把 useAppInfo 的技能分组呈现为「仪表模块」：每组一个模块框
  （分组名 + 真实数量读数 + 刻度尺装饰 + 技能芯片格）。
  技能芯片 hover 点亮（边框 + 微辉光），不伪造技能等级数据。
-->
<template>
  <div class="gauges">
    <section v-for="group in groups" :key="group.category" class="gauge">
      <header class="gauge-head">
        <h3 class="gauge-name">{{ group.category }}</h3>
        <span class="gauge-count">×{{ skillCount(group) }}</span>
      </header>

      <!-- 刻度尺装饰 -->
      <div class="gauge-ruler" aria-hidden="true"/>

      <ul class="gauge-list">
        <li v-for="skill in safeSkills(group)" :key="skill" class="gauge-cell">
          {{ skill }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { SkillGroup } from '~/types/site'

defineProps<{
  /** 技能分组（来自 useAppInfo().skillGroups） */
  groups: SkillGroup[]
}>()

/** 技能数量防御读取（数组字段不盲取） */
function skillCount(group: SkillGroup): number {
  return Array.isArray(group.skills) ? group.skills.length : 0
}

/** 技能列表防御读取：非数组返回空 */
function safeSkills(group: SkillGroup): string[] {
  return Array.isArray(group.skills) ? group.skills.map((skill) => String(skill)) : []
}
</script>

<style scoped>
/* —— 模块纵向阵列 —— */
.gauges {
  display: grid;
  gap: var(--gap);
}

.gauge {
  padding: 12px;
  background: color-mix(in srgb, var(--c-bg) 62%, transparent);
  border: var(--border-w) solid var(--c-border);
  transition: border-color var(--transition);
}

.gauge:hover {
  border-color: color-mix(in srgb, var(--c-accent) 45%, var(--c-border));
}

.gauge-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.gauge-name {
  margin: 0;
  overflow: hidden;
  font-family: var(--font-head);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 数量读数：等宽 + 信号色（真实数据） */
.gauge-count {
  flex: none;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

/* 刻度尺：向右渐隐的细密刻度（装饰） */
.gauge-ruler {
  height: 4px;
  margin: 8px 0 10px;
  background: repeating-linear-gradient(
    90deg,
    color-mix(in srgb, var(--c-accent) 45%, transparent) 0 1px,
    transparent 1px 7px
  );
  -webkit-mask: linear-gradient(90deg, #000 40%, transparent 96%);
  mask: linear-gradient(90deg, #000 40%, transparent 96%);
}

/* —— 技能芯片格 —— */
.gauge-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.gauge-cell {
  display: flex;
  align-items: center;
  min-height: 34px;
  padding: 4px 8px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
  overflow-wrap: anywhere;
  background: color-mix(in srgb, var(--c-surface) 80%, transparent);
  border: var(--border-w) solid var(--c-border);
  transition:
    color var(--transition),
    border-color var(--transition),
    box-shadow var(--transition);
}

/* 列表项 hover：点亮 + 左缘信号条微光 */
.gauge-cell:hover {
  color: var(--c-text);
  border-color: var(--c-accent);
  box-shadow: inset 2px 0 0 var(--c-accent);
}

@media (prefers-reduced-motion: reduce) {
  .gauge,
  .gauge-cell {
    transition: none;
  }
}
</style>
