<!--
  SwissSkillTable - swiss 风格技能条目表
  ------------------------------------------------------------
  条目式细则线排版：每行「编号 | 类别 | 技能清单（斜杠分隔）」，
  行与行之间用黑色 hairline 分隔——信息完全靠规则线与栅格
  对齐建立秩序，无卡片、无底色。数据来自共享层 useAppInfo
  的 skillGroups（页面获取后传入）。
-->
<template>
  <ul class="skill-table">
    <li v-for="(group, i) in groups" :key="group.category" class="skill-row">
      <span class="row-no" aria-hidden="true">{{ pad(i + 1) }}</span>
      <span class="row-cat">{{ group.category }}</span>
      <span class="row-list">{{ skillsText(group.skills) }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { SkillGroup } from '~/types/site'

defineProps<{
  /** 技能分组（来自 useAppInfo，类别名已随语言更新） */
  groups: SkillGroup[]
}>()

/** 编号格式化：补零到两位 */
function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** 技能清单转斜杠分隔文本（数组字段防御，空清单以占位线表示） */
function skillsText(skills: unknown): string {
  if (!Array.isArray(skills)) return '—'
  const list = skills.map((item) => String(item).trim()).filter(Boolean)
  return list.length > 0 ? list.join(' / ') : '—'
}
</script>

<style scoped>
.skill-table {
  margin: 0;
  padding: 0;
  list-style: none;
  border-bottom: var(--border-w) solid var(--c-border);
}

/* 每行：编号 | 类别 | 清单 的细则线三栏 */
.skill-row {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 6px var(--gap);
  align-items: baseline;
  padding: 16px 0;
  border-top: var(--border-w) solid var(--c-border);
}

.row-no {
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-accent);
  font-variant-numeric: tabular-nums;
}

.row-cat {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--c-text);
}

/* 技能清单：小号宽字距，斜杠分隔是本风格的清单签名 */
.row-list {
  grid-column: 2;
  font-size: 14px;
  line-height: 1.9;
  color: var(--c-muted);
  letter-spacing: 0.04em;
  overflow-wrap: break-word;
}

/* —— 桌面端：编号 | 类别 | 清单 同行，非对称 3/9 分栏 —— */
@media (min-width: 768px) {
  .skill-row {
    grid-template-columns: 40px 3fr 9fr;
  }

  .row-list {
    grid-column: 3;
  }
}
</style>
