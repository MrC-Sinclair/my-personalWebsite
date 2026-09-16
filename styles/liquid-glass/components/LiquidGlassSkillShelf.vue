<!--
  LiquidGlassSkillShelf - liquid-glass 风格的技能玻璃架
  ------------------------------------------------------------
  技能分组以「玻璃架上的托盘」呈现：每个分组是一条内嵌玻璃
  托盘（半透白填充 + 半透描边 + 内高光，不加 backdrop-filter，
  避免面板内多层模糊嵌套），技能是架上的小玻璃胶囊。
  数据来自共享层 useAppInfo().skillGroups。
-->
<template>
  <div class="shelf">
    <div v-for="group in groups" :key="group.category" class="tray">
      <h3 class="tray-name">{{ group.category }}</h3>
      <ul class="chips">
        <li v-for="skill in Array.isArray(group.skills) ? group.skills : []" :key="skill" class="chip">
          {{ skill }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SkillGroup } from '~/types/site'

defineProps<{
  /** 技能分组（来自共享层 useAppInfo） */
  groups: SkillGroup[]
}>()
</script>

<style scoped>
.shelf {
  display: grid;
  gap: var(--gap);
}

/* 内嵌玻璃托盘：比外层面板更透一级（无 backdrop-filter，避免嵌套模糊） */
.tray {
  padding: 16px 18px;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.02));
  border: var(--border-w) solid rgb(255 255 255 / 0.14);
  border-radius: var(--radius-sm);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.18);
  transition: border-color var(--transition), background var(--transition);
}

/* 交互反馈：托盘 hover 边缘泛光 */
.tray:hover {
  border-color: rgb(255 255 255 / 0.28);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.09), rgb(255 255 255 / 0.03));
}

.tray-name {
  margin: 0 0 10px;
  font-size: var(--fs-base);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--c-accent-2);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 技能胶囊：架上的小玻璃粒 */
.chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: rgb(255 255 255 / 0.09);
  border: var(--border-w) solid rgb(255 255 255 / 0.2);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.22);
  transition:
    transform var(--transition),
    background var(--transition),
    box-shadow var(--transition);
}

/* 非链接胶囊也给轻反馈：hover 微浮（符合交互规范，非裸交互） */
.chip:hover {
  background: rgb(255 255 255 / 0.14);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.3),
    0 6px 14px rgb(4 2 18 / 0.25);
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .tray,
  .chip {
    transition: none;
  }

  .chip:hover {
    transform: none;
  }
}
</style>
