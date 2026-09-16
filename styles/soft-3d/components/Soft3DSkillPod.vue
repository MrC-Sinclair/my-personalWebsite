<!--
  Soft3DSkillPod - soft-3d 风格技能舱
  ------------------------------------------------------------
  一组技能 = 一个悬浮在空间中的「舱体」：漂浮小色球 +
  分类名 + 一排 3D 药丸标签。数据来自 useAppInfo 的
  skillGroups（label 为 i18n 文案，skills 为字符串数组）。
  悬浮时舱体上浮、影子加深，像被拿起来端详的物体。
-->
<template>
  <article class="pod">
    <header class="pod-head">
      <Soft3DOrb :size="44" :variant="variant" float :duration="6" :delay="0.8" />
      <h3 class="pod-title">{{ label }}</h3>
    </header>
    <ul v-if="safeSkills.length" class="pod-list">
      <li v-for="skill in safeSkills" :key="skill" class="pod-chip">{{ skill }}</li>
    </ul>
  </article>
</template>

<script setup lang="ts">
import Soft3DOrb from './Soft3DOrb.vue'

const props = withDefaults(
  defineProps<{
    /** 技能分类名（来自 useAppInfo，i18n 文案） */
    label: string
    /** 技能列表（做数组防御，非数组按空处理） */
    skills: string[]
    /** 舱体小球配色 */
    variant?: 'violet' | 'cyan' | 'pink' | 'mint' | 'sun'
  }>(),
  {
    variant: 'violet',
  },
)

/** 数组防御：非数组输入回退为空列表 */
const safeSkills = computed(() => (Array.isArray(props.skills) ? props.skills : []))
</script>

<style scoped>
.pod {
  height: 100%;
  padding: var(--space);
  background: linear-gradient(160deg, color-mix(in srgb, var(--c-accent) 9%, var(--c-surface)), var(--c-surface) 58%);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform var(--transition), box-shadow var(--transition);
}

/* 悬浮：被「拿起」——上浮 + 影子加深 */
.pod:hover {
  transform: translateY(-6px);
  box-shadow:
    0 34px 60px rgb(6 3 26 / 0.66),
    0 14px 28px rgb(139 92 246 / 0.32),
    0 4px 9px rgb(6 3 26 / 0.5),
    inset 0 2px 5px rgb(255 255 255 / 0.24),
    inset 0 -8px 16px rgb(9 5 40 / 0.5);
}

.pod-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: var(--gap);
}

.pod-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  color: var(--c-text);
}

/* —— 技能药丸：小 3D 凸起物 —— */
.pod-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pod-chip {
  padding: 6px 14px;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: color-mix(in srgb, var(--c-accent) 17%, var(--c-surface));
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: 999px;
  box-shadow:
    inset 0 1px 2px rgb(255 255 255 / 0.22),
    0 4px 8px rgb(6 3 26 / 0.35);
  transition: background var(--transition), transform var(--transition);
}

/* 药丸不是交互元素，仅随舱体氛围微光提示，无 hover 行为突变 */
@media (max-width: 640px) {
  .pod {
    padding: calc(var(--space) * 0.8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pod {
    transition: none;
  }

  .pod:hover {
    transform: none;
  }
}
</style>
