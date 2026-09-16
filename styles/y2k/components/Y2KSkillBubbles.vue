<!--
  Y2KSkillBubbles - y2k 风格技能气泡组
  ------------------------------------------------------------
  把共享层 useAppInfo().skillGroups 渲染为「气泡簇」：
  每个分组一行铬字类别名 + 一组透明塑料气泡芯片（顶部白高光
  inset 渐变 + 银边），芯片悬浮时辉光点亮 + 上浮。
  skills 数组用 Array.isArray 防御。
-->
<template>
  <div class="bubbles">
    <div v-for="group in groups" :key="group.category" class="bubble-group">
      <h3 class="bubble-cat">
        <span class="bubble-cat-star" aria-hidden="true">✧</span>
        {{ group.category }}
      </h3>
      <ul class="bubble-list">
        <li v-for="skill in safeSkills(group)" :key="skill" class="bubble-chip">
          {{ skill }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file Y2K 风格的技能气泡组件
 * @description 技能分组以透明塑料气泡芯片呈现。
 */
import type { SkillGroup } from '~/types/site'

defineProps<{
  /** 技能分组数据（共享层 useAppInfo 返回） */
  groups: SkillGroup[]
}>()

/** 防御：skills 非数组时回退为空列表 */
function safeSkills(group: SkillGroup): string[] {
  return Array.isArray(group.skills) ? group.skills : []
}
</script>

<style scoped>
.bubbles {
  display: grid;
  gap: calc(var(--gap) * 1.2);
}

.bubble-cat {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 10px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--c-muted);
}

.bubble-cat-star {
  color: var(--c-accent);
}

.bubble-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* —— 气泡芯片：透明塑料球感 —— */
.bubble-chip {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 18px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--c-text);
  border: var(--border-w) solid rgb(200 210 255 / 0.45);
  border-radius: 999px;
  background:
    radial-gradient(130% 110% at 30% 18%, rgb(255 255 255 / 0.55) 0%, rgb(255 255 255 / 0.1) 40%, transparent 66%),
    linear-gradient(180deg, rgb(139 123 255 / 0.22) 0%, rgb(34 26 102 / 0.35) 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.5),
    0 4px 12px rgb(5 0 42 / 0.4);
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    border-color var(--transition);
}

/* 悬浮：气泡被「吹亮」 */
.bubble-chip:hover {
  transform: translateY(-3px);
  border-color: rgb(255 255 255 / 0.75);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.8),
    0 10px 22px rgb(5 0 42 / 0.5),
    0 0 16px rgb(139 123 255 / 0.5);
}

@media (prefers-reduced-motion: reduce) {
  .bubble-chip {
    transition: none;
  }

  .bubble-chip:hover {
    transform: none;
  }
}
</style>
