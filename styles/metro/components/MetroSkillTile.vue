<!--
  MetroSkillTile - 技能分组 Tile
  ------------------------------------------------------------
  一个技能分组直接铺在色块上：右上角数量角标 + 分组名大字 + 技能清单。
  数据来自共享层 useAppInfo 的 skillGroups；skills 数组做 Array.isArray 防御。
-->
<template>
  <MetroTile :variant="variant">
    <span class="skill__count" aria-hidden="true">{{ countText }}</span>
    <div>
      <h3 class="skill__category">{{ group.category }}</h3>
      <p class="skill__list">{{ listText }}</p>
    </div>
  </MetroTile>
</template>

<script setup lang="ts">
import type { SkillGroup } from '~/types/site'
import MetroTile from './MetroTile.vue'
import type { MetroTileVariant } from './MetroTile.vue'

const props = defineProps<{
  /** 技能分组数据（来自共享层 useAppInfo） */
  group: SkillGroup
  /** 色块变体 */
  variant?: MetroTileVariant
}>()

/** 防御：skills 非数组时回退空列表 */
const safeSkills = computed(() => (Array.isArray(props.group.skills) ? props.group.skills : []))

/** 数量角标：02 位读数（信息版面的数据感） */
const countText = computed(() => String(safeSkills.value.length).padStart(2, '0'))

/** 技能清单：中点分隔，纯文本铺排 */
const listText = computed(() => safeSkills.value.join(' · '))
</script>

<style scoped>
.skill__count {
  align-self: flex-end;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
}

.skill__category {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  line-height: 1.15;
}

.skill__list {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  margin: 6px 0 0;
  font-size: var(--fs-small);
  line-height: 1.55;
}
</style>
