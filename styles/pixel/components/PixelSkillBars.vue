<!--
  PixelSkillBars - pixel 风格 STATUS 技能面板内容
  ------------------------------------------------------------
  技能不做标签云，做成老游戏状态栏的字符进度条：
  实心 █ = 该分组的技能数，空心 ░ = 缺口（相对最满分组），
  满格基准取所有分组中的最大技能数。字符条为装饰（aria-hidden），
  真实信息由分组名 + n/max 数字承载；分组下方列出全部技能名。
  数据来自共享层 useAppInfo 的 skillGroups（页面传入）。
-->
<template>
  <ul class="stats">
    <li v-for="group in groups" :key="group.category" class="stat">
      <div class="stat-row">
        <span class="stat-label">{{ group.category }}</span>
        <span class="stat-bar" aria-hidden="true">{{ barOf(group) }}</span>
        <span class="stat-num">{{ countOf(group) }}/{{ maxCount }}</span>
      </div>
      <p class="stat-names">{{ namesOf(group) }}</p>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { SkillGroup } from '~/types/site'

const props = defineProps<{
  /** 技能分组列表（来自 useAppInfo） */
  groups: SkillGroup[]
}>()

/** 满格基准：取最满分组的技能数（至少 1，避免空数据时出现 0 格） */
const maxCount = computed(() =>
  Math.max(1, ...props.groups.map((group) => (Array.isArray(group.skills) ? group.skills.length : 0))),
)

/** 分组技能数（防御：skills 非数组按 0 处理） */
function countOf(group: SkillGroup): number {
  return Array.isArray(group.skills) ? group.skills.length : 0
}

/** 字符进度条：实心块 + 空心块拼出该分组的「等级」 */
function barOf(group: SkillGroup): string {
  const filled = countOf(group)
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, maxCount.value - filled))
}

/** 技能名清单（· 分隔，一行放不下自动换行） */
function namesOf(group: SkillGroup): string {
  return (Array.isArray(group.skills) ? group.skills : []).join(' · ')
}
</script>

<style scoped>
.stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.stat-row {
  display: grid;
  grid-template-columns: minmax(72px, auto) 1fr auto;
  align-items: center;
  gap: 10px;
}

.stat-label {
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  white-space: nowrap;
  color: var(--c-text);
  text-shadow: 2px 2px 0 var(--c-border);
}

/* 字符进度条：草绿 + 宽字距，硬偏移文字阴影 */
.stat-bar {
  overflow: hidden;
  font-size: var(--fs-small);
  letter-spacing: 0.18em;
  white-space: nowrap;
  color: var(--c-accent-2);
  text-shadow: 2px 2px 0 var(--c-border);
}

.stat-num {
  font-size: var(--fs-small);
  color: var(--c-muted);
  font-variant-numeric: tabular-nums;
}

.stat-names {
  margin: 2px 0 0;
  font-size: var(--fs-small);
  line-height: 1.9;
  color: var(--c-muted);
  overflow-wrap: break-word;
}
</style>
