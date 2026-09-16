<!--
  Web2GlossySkillPanel - Web 2.0 光泽风格的技能分组面板
  ------------------------------------------------------------
  白色光泽面板：凝胶 3D 小图标 + 分类标题 + 技能胶囊芯片列表。
  skills 数组用 Array.isArray 防御，避免非法数据导致渲染崩溃。
-->
<template>
  <article class="skill">
    <Web2GlossyGelIcon :variant="icon" />
    <h3 class="skill__cat">{{ group.category }}</h3>
    <ul class="skill__list">
      <li v-for="skill in safeSkills" :key="skill" class="skill__chip">{{ skill }}</li>
    </ul>
  </article>
</template>

<script setup lang="ts">
/**
 * @file Web 2.0 光泽风格的技能分组面板组件
 * @description 数据来自共享层 useAppInfo().skillGroups；技能芯片为亮面胶囊。
 */
import type { SkillGroup } from '~/types/site'
import type { GelIconVariant } from './Web2GlossyGelIcon.vue'
import Web2GlossyGelIcon from './Web2GlossyGelIcon.vue'

const props = withDefaults(
  defineProps<{
    /** 技能分组数据（共享层返回值） */
    group: SkillGroup
    /** 分组对应的凝胶图标变体 */
    icon?: GelIconVariant
  }>(),
  {
    icon: 'spark',
  },
)

/** 防御：skills 非数组时回退为空列表 */
const safeSkills = computed(() => (Array.isArray(props.group.skills) ? props.group.skills : []))
</script>

<style scoped>
/* —— 白色光泽面板 —— */
.skill {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 20px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: linear-gradient(180deg, #ffffff 0%, #f3f9ff 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

/* 面板顶部淡蓝光泽反光条 */
.skill::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 46%;
  border-radius: var(--radius) var(--radius) 45% 45%;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.85) 0%, rgb(214 233 250 / 0.28) 100%);
  pointer-events: none;
}

.skill:hover {
  transform: translateY(-3px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    0 4px 10px rgb(23 74 128 / 0.2),
    0 18px 34px rgb(23 74 128 / 0.18);
}

.skill__cat {
  margin: 0;
  font-family: var(--font-head);
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--c-text);
}

/* —— 技能胶囊芯片 —— */
.skill__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.skill__chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 13px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  font-size: var(--fs-small);
  font-weight: 600;
  color: #1a5fc0;
  background: linear-gradient(180deg, #ffffff 0%, #e9f2fc 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.9),
    0 1px 3px rgb(23 74 128 / 0.14);
}
</style>
