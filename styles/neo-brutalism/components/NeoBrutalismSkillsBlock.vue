<!--
  NeoBrutalismSkillsBlock - neo-brutalism 风格「技能栈」黑块
  ------------------------------------------------------------
  与黄底「关于我」并排对撞的黑底反白色块：分类名用海报黄
  等宽字，技能做成一圈粗描边「邮票」，底色按 黄/描边/蓝 循环，
  hover 时抬起压出纸面硬影。数据来自共享层 useAppInfo 的
  skillGroups（页面传入），skills 数组做 Array.isArray 防御。
-->
<template>
  <section class="skills">
    <NeoBrutalismSectionTitle :text="t('about.skills')" tone="paper" />

    <div v-for="group in safeGroups" :key="group.category" class="group">
      <h3 class="group-name">{{ group.category }}</h3>
      <ul class="list">
        <li v-for="skill in group.skills" :key="skill" class="stamp">
          {{ skill }}
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SkillGroup } from '~/types/site'
import NeoBrutalismSectionTitle from './NeoBrutalismSectionTitle.vue'

const props = defineProps<{
  /** 技能分组（来自 useAppInfo） */
  groups: SkillGroup[]
}>()

const { t } = useI18n()

/** 防御性归一化：skills 数组字段用 Array.isArray 检查 */
const safeGroups = computed(() =>
  (Array.isArray(props.groups) ? props.groups : []).map((group) => ({
    category: group.category,
    skills: Array.isArray(group.skills) ? group.skills : [],
  })),
)
</script>

<style scoped>
.skills {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: var(--space);
  background: var(--c-text);
  color: var(--c-bg);
  border: var(--border-w) solid var(--c-border);
  box-shadow: 8px 8px 0 var(--c-border);
}

.group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 分类名：海报黄等宽字（黄/黑对比约 15:1） */
.group-name {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* —— 技能「邮票」：粗描边 + 循环撞色 —— */
.stamp {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--c-bg);
  border: 2px solid var(--c-bg);
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    background var(--transition);
}

/* 底色循环：黄 → 描边 → 蓝（蓝块配白字，对比约 5:1） */
.stamp:nth-child(3n + 1) {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-border);
}

.stamp:nth-child(3n + 3) {
  color: var(--c-surface);
  background: var(--c-accent-2);
  border-color: var(--c-border);
}

.stamp:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--c-bg);
}

.stamp:active {
  transform: var(--press-transform);
}
</style>
