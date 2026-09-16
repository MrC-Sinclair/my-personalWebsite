<!--
  GlassmorphismSkillCloud - glassmorphism 风格的技能云
  ------------------------------------------------------------
  按「分类玻璃托盘 + 技能玻璃药丸」组织技能：分类名是着色
  小托盘，技能是半透白药丸，hover 时药丸点亮并微微上浮。
  数据来自 useAppInfo 的 skillGroups（只做展示，不加工）。
-->
<template>
  <div class="skill-cloud">
    <div v-for="group in safeGroups" :key="group.category" class="skill-tray">
      <h4 class="tray-name">{{ group.category }}</h4>
      <ul class="skill-list">
        <li v-for="skill in group.skills" :key="skill" class="skill-pill">
          {{ skill }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SkillGroup } from '~/types/site'

const props = defineProps<{
  /** 技能分组（来自 useAppInfo，含分类名与技能数组） */
  groups: SkillGroup[]
}>()

// 数组字段防御：分组内的 skills 必须是数组才渲染
const safeGroups = computed(() =>
  props.groups
    .filter((group) => Array.isArray(group.skills) && group.skills.length > 0)
    .map((group) => ({
      category: group.category,
      skills: group.skills,
    })),
)
</script>

<style scoped>
.skill-cloud {
  display: grid;
  gap: var(--gap);
}

/* 分类托盘：磨砂内层（不加 blur，避免玻璃叠玻璃的性能开销） */
.skill-tray {
  padding: var(--space);
  background: rgb(255 255 255 / 0.38);
  border: var(--border-w) solid rgb(255 255 255 / 0.55);
  border-radius: var(--radius-sm);
  transition: background var(--transition), border-color var(--transition);
}

.skill-tray:hover {
  background: rgb(255 255 255 / 0.52);
  border-color: rgb(255 255 255 / 0.8);
}

.tray-name {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: var(--fs-small);
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--c-accent-2);
}

/* 分类名前的极光小方块（签名装饰） */
.tray-name::before {
  content: '';
  width: 10px;
  height: 10px;
  background: var(--deco);
  border-radius: 3px;
  box-shadow: 0 0 10px rgb(139 92 246 / 0.5);
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 技能药丸：半透白 + hover 点亮上浮 */
.skill-pill {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 16px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-text);
  background: rgb(255 255 255 / 0.55);
  border: var(--border-w) solid rgb(255 255 255 / 0.7);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgb(31 38 135 / 0.08);
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    background var(--transition);
}

.skill-pill:hover {
  transform: translateY(-3px);
  background: rgb(255 255 255 / 0.85);
  box-shadow: 0 8px 18px rgb(31 38 135 / 0.16), 0 0 14px rgb(139 92 246 / 0.22);
}

@media (prefers-reduced-motion: reduce) {
  .skill-tray,
  .skill-pill {
    transition: none;
  }

  .skill-pill:hover {
    transform: none;
  }
}
</style>
