<!--
  CyberpunkSkillGrid - cyberpunk 风格技能「能量芯片」墙
  ------------------------------------------------------------
  技能以分组呈现：每组一个等宽类别标头（左侧斜切色块），
  下方是切角「芯片」墙——芯片按青 / 紫 / 粉三色轮换（纯视图
  装饰轮换，index 取模，SSR 安全确定值），hover 时芯片填充
  发光并微微上浮。技能数组用 Array.isArray 防御。
-->
<template>
  <div class="skill-groups">
    <div v-for="group in safeGroups" :key="group.category" class="skill-group">
      <h3 class="group-name">
        <span class="group-notch" aria-hidden="true"/>
        {{ group.category }}
      </h3>

      <ul class="chips">
        <li
          v-for="(skill, index) in group.skills"
          :key="skill"
          class="chip"
          :class="`chip-${index % 3}`"
        >
          {{ skill }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SkillGroup } from '~/types/site'

const props = defineProps<{
  /** 技能分组（来自共享层 useAppInfo） */
  groups: SkillGroup[]
}>()

/** 数组防御：skills 非数组时按空组过滤掉 */
const safeGroups = computed(() =>
  props.groups
    .map((group) => ({
      category: group.category,
      skills: Array.isArray(group.skills) ? group.skills : [],
    }))
    .filter((group) => group.skills.length > 0),
)
</script>

<style scoped>
.skill-groups {
  display: grid;
  gap: var(--space);
}

/* —— 类别标头：斜切色块 + 等宽字 —— */
.group-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  letter-spacing: 0.14em;
  color: var(--c-text);
}

.group-notch {
  flex: none;
  width: 10px;
  height: 10px;
  background: var(--c-accent);
  clip-path: polygon(0 0, 100% 0, 100% 60%, 60% 100%, 0 100%);
  box-shadow: 0 0 8px rgb(34 211 238 / 0.7);
}

/* —— 芯片墙：自适应换行的切角芯片 —— */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.chip {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 5px 14px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.04em;
  background: rgb(255 255 255 / 0.03);
  clip-path: polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px);
  box-shadow: inset 0 0 0 var(--border-w) var(--chip-line);
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.chip:hover {
  transform: translateY(-2px);
}

.chip:active {
  transform: var(--press-transform);
}

/* 三色轮换：青 / 紫（青粉混合）/ 粉 */
.chip-0 {
  --chip-line: rgb(34 211 238 / 0.5);
  color: var(--c-accent);
}

.chip-0:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
  box-shadow:
    inset 0 0 0 var(--border-w) var(--c-accent),
    0 0 14px rgb(34 211 238 / 0.55);
}

.chip-1 {
  --chip-line: rgb(168 85 247 / 0.5);
  color: color-mix(in srgb, var(--c-accent) 48%, var(--c-accent-2));
}

.chip-1:hover {
  color: var(--c-on-accent);
  background: color-mix(in srgb, var(--c-accent) 48%, var(--c-accent-2));
  box-shadow:
    inset 0 0 0 var(--border-w) rgb(168 85 247 / 0.9),
    0 0 14px rgb(168 85 247 / 0.55);
}

.chip-2 {
  --chip-line: rgb(255 45 149 / 0.5);
  color: var(--c-accent-2);
}

.chip-2:hover {
  color: var(--c-on-accent);
  background: var(--c-accent-2);
  box-shadow:
    inset 0 0 0 var(--border-w) var(--c-accent-2),
    0 0 14px rgb(255 45 149 / 0.55);
}

@media (prefers-reduced-motion: reduce) {
  .chip {
    transition: none;
  }

  .chip:hover,
  .chip:active {
    transform: none;
  }
}
</style>
