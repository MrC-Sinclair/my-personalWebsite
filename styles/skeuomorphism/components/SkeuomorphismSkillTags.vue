<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismSkillTags - 拟物风格技能展示
  ------------------------------------------------------------
  「挂在工作台边的皮革工具卡」：每组技能一张皮革卡（顶部
  黄铜气眼可挂绳、四边缝线、交替微旋转如散落的挂签），技能
  项是缝在皮革上的米白纸质小签（深棕墨字，对比度达标）。
  数据来自共享层 useAppInfo 的 skillGroups。
-->
<template>
  <div class="skills">
    <div
      v-for="(group, i) in groups"
      :key="group.category"
      class="skill-card"
      :style="{ '--tilt': `${tilts[i % tilts.length]}deg` }"
    >
      <!-- 顶部黄铜气眼（穿绳孔） -->
      <span class="grommet" aria-hidden="true" />
      <h4 class="skill-cat">{{ group.category }}</h4>
      <ul class="skill-list">
        <li v-for="skill in safeSkills(group)" :key="skill" class="skill-chip">
          {{ skill }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file 拟物风格的技能展示组件
 * @description 皮革工具卡 + 缝上的纸质技能签；数组字段 Array.isArray 防御。
 */
import type { SkillGroup } from '~/types/site'

defineProps<{
  /** 技能分组（共享层 useAppInfo 返回值） */
  groups: SkillGroup[]
}>()

/** 皮革卡的交替倾角（确定性数值，SSR 安全） */
const tilts = [-1.4, 1.1, -0.8, 1.5, -1, 0.9]

/** 防御：skills 非数组时回退为空列表 */
function safeSkills(group: SkillGroup): string[] {
  return Array.isArray(group.skills) ? group.skills : []
}
</script>

<style scoped>
.skills {
  display: grid;
  gap: var(--gap);
}

/* —— 皮革工具卡 —— */
.skill-card {
  position: relative;
  padding: 26px 18px 18px;
  border: 1px solid rgb(0 0 0 / 0.55);
  border-radius: var(--radius-sm);
  /* 皮革：深棕底 + 小噪点 */
  background:
    radial-gradient(circle at 26% 34%, rgb(255 255 255 / 0.05) 1px, transparent 1.6px),
    radial-gradient(circle at 72% 60%, rgb(0 0 0 / 0.15) 1.1px, transparent 1.8px),
    linear-gradient(168deg, #6b4223 0%, #543116 100%);
  background-size: 8px 8px, 10px 10px, 100% 100%;
  box-shadow:
    inset 0 1px 0 rgb(255 240 210 / 0.14),
    inset 0 -2px 5px rgb(0 0 0 / 0.4),
    0 5px 10px rgb(10 4 0 / 0.5);
  transform: rotate(var(--tilt, 0deg));
  transition: transform var(--transition), box-shadow var(--transition);
}

/* 四边缝线 */
.skill-card::after {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px dashed rgb(243 234 215 / 0.28);
  border-radius: calc(var(--radius-sm) - 2px);
  pointer-events: none;
}

/* hover：挂签被扶正抬离桌面 */
.skill-card:hover {
  transform: rotate(0deg) translateY(-3px);
  box-shadow:
    inset 0 1px 0 rgb(255 240 210 / 0.2),
    inset 0 -2px 5px rgb(0 0 0 / 0.4),
    0 10px 18px rgb(10 4 0 / 0.55);
}

/* 顶部黄铜气眼（金属圈） */
.grommet {
  position: absolute;
  top: 8px;
  left: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #6e4c1a 0%, #3a250e 55%, #201304 100%);
  box-shadow:
    0 0 0 3px #c39a4c,
    0 0 0 4px rgb(0 0 0 / 0.55),
    inset 0 1px 2px rgb(0 0 0 / 0.8);
  transform: translateX(-50%);
}

/* —— 分类名：压印进皮革 —— */
.skill-cat {
  margin: 0 0 12px;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-align: center;
  color: #fbf2dd;
  text-shadow:
    0 -1px 0 rgb(0 0 0 / 0.7),
    0 1px 0 rgb(255 240 210 / 0.14);
}

/* —— 技能签：缝在皮革上的米白纸签 —— */
.skill-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.skill-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: var(--fs-small);
  color: var(--c-text);
  border: 1px solid rgb(0 0 0 / 0.35);
  border-radius: 3px;
  /* 米白纸签：浅色渐变 + 顶部高光 */
  background: linear-gradient(180deg, #faf4e4 0%, #f0e5cc 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.7),
    0 2px 3px rgb(10 4 0 / 0.45);
  transition: transform var(--transition), box-shadow var(--transition);
}

/* hover：纸签微微翘起 */
.skill-chip:hover {
  transform: translateY(-2px) rotate(-1deg);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.7),
    0 5px 7px rgb(10 4 0 / 0.5);
}

@media (prefers-reduced-motion: reduce) {
  .skill-card,
  .skill-chip {
    transition: none;
  }

  .skill-card:hover {
    transform: rotate(var(--tilt, 0deg));
  }

  .skill-chip:hover {
    transform: none;
  }
}
</style>
