<!--
  NeumorphismSkillBars - neumorphism 风格技能展示
  ------------------------------------------------------------
  本风格签名组件：技能条 = 内凹轨道 + 凸起渐变填充块。
  共享层 skillGroups 只有「分类 + 技能名列表」，没有等级数据，
  因此填充宽度按各分类技能数量占总数的真实占比推导
  （视图侧同步计算，SSR 安全）；分类下的技能名以凸起小胶囊
  列出，承载真实信息——轨道与填充块为装饰（aria-hidden），
  信息由文字承载保证可访问性。
-->
<template>
  <ul class="skills">
    <li v-for="group in groups" :key="group.category" class="skill">
      <p class="skill-name">{{ group.category }}</p>

      <!-- 内凹轨道 + 凸起填充块（装饰性可视化，信息由下方胶囊承载） -->
      <span class="skill-track" aria-hidden="true">
        <span class="skill-fill" :style="{ width: share(group) + '%' }"/>
      </span>

      <ul class="skill-tags" :aria-label="group.category">
        <li v-for="item in groupSkills(group)" :key="item" class="skill-tag">
          {{ item }}
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { SkillGroup } from '~/types/site'

const props = defineProps<{
  /** 技能分组（来自共享层 useAppInfo，含分类名与技能名列表） */
  groups: SkillGroup[]
}>()

/** 全部技能总数（用于推导各分类占比） */
const total = computed(() =>
  props.groups.reduce((sum, group) => sum + groupSkills(group).length, 0),
)

/** 单个分类的技能数组（防御性处理非数组字段） */
function groupSkills(group: SkillGroup): string[] {
  return Array.isArray(group.skills) ? group.skills : []
}

/** 分类技能数量占总数的百分比（填充块宽度，装饰用） */
function share(group: SkillGroup): number {
  if (!total.value) return 0
  return Math.round((groupSkills(group).length / total.value) * 100)
}
</script>

<style scoped>
.skills {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.skill {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skill-name {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
  text-shadow: 1px 1px 1px rgb(255 255 255 / 0.9);
}

/* —— 内凹轨道：材料表面凹出一条槽 —— */
.skill-track {
  display: block;
  overflow: hidden;
  height: 16px;
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: inset 3px 3px 6px #a3b1c6, inset -3px -3px 6px #ffffff;
}

/* —— 凸起填充块：从槽里隆起的渐变圆条 —— */
.skill-fill {
  display: block;
  height: 100%;
  background: var(--deco);
  border-radius: 999px;
  box-shadow: 1px 1px 3px rgb(59 85 200 / 0.4);
}

/* —— 技能名胶囊：凸起小件承载真实信息 —— */
.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 2px 0 0;
  list-style: none;
}

.skill-tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-text);
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: 2px 2px 5px #a3b1c6, -2px -2px 5px #ffffff;
}
</style>
