<!--
  ClaymorphismSkillClump - claymorphism 风格技能黏土进度块
  ------------------------------------------------------------
  每个技能分组 = 一块黏土板：分类胶囊 + 黏土进度轨道
  （内凹）+ 黏土填充条（色相随分组轮换，宽度 = 该组技能数
  占总技能数的比例，全部来自真实数据推导，不造假数值）+
  技能黏土小块（圆润 pill，hover 微浮、按压压扁）。
  进度仅为组内技能数量的占比展示（无等级数据，不做虚构）。
-->
<template>
  <div class="clump">
    <div v-for="(group, index) in groups" :key="group.category" class="slab" :class="`tone-${toneOf(index)}`">
      <header class="slab-head">
        <h3 class="category">{{ group.category }}</h3>
        <span class="amount" :aria-label="`${group.category} ${skillCount(group)} ${t('about.skills')}`">
          {{ skillsOf(group).length }}
        </span>
      </header>

      <!-- 黏土进度轨道（内凹）+ 填充条（同色系凸起） -->
      <div class="track" role="presentation">
        <span class="fill" :style="{ width: `${progressOf(group)}%` }"/>
      </div>

      <!-- 技能黏土小块 -->
      <ul class="pills">
        <li v-for="skill in skillsOf(group)" :key="skill" class="pill">
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

const { t } = useI18n()

/** 色相轮换序列（Pastel 对撞） */
const TONES = ['lilac', 'mint', 'pink', 'butter', 'blue'] as const

/** 按索引轮换色相 */
function toneOf(index: number): string {
  return TONES[index % TONES.length]!
}

/** 数组字段防御：组内技能列表 */
function skillsOf(group: SkillGroup): string[] {
  return Array.isArray(group.skills) ? group.skills : []
}

/** 组内技能数（进度条的真实数值来源） */
function skillCount(group: SkillGroup): number {
  return skillsOf(group).length
}

/** 进度占比：该组技能数 / 全部技能数（无数据时 0） */
function progressOf(group: SkillGroup): number {
  const total = props.groups.reduce((sum, item) => sum + skillCount(item), 0)
  if (total <= 0) return 0
  return Math.round((skillCount(group) / total) * 100)
}
</script>

<style scoped>
.clump {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

/* 每组一块黏土板 */
.slab {
  padding: var(--space);
  background: var(--c-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.slab-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.category {
  margin: 0;
  font-size: var(--fs-title);
  font-weight: 800;
  color: var(--c-text);
}

/* 数量徽章：小颗同色系黏土球 */
.amount {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  min-height: 34px;
  padding: 0 9px;
  font-size: var(--fs-small);
  font-weight: 800;
  color: var(--tone-text);
  background: var(--tone-bg);
  border-radius: 999px;
  box-shadow:
    0 5px 9px var(--tone-shadow),
    inset 0 3px 5px rgb(255 255 255 / 0.55),
    inset 0 -3px 5px var(--tone-inset);
}

/* —— 进度轨道：内凹的黏土槽 —— */
.track {
  height: 18px;
  margin-bottom: 16px;
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow:
    inset 0 4px 8px rgb(125 63 201 / 0.18),
    inset 0 -3px 6px rgb(255 255 255 / 0.8);
  overflow: hidden;
}

/* 填充条：同色系凸起黏土条（顶部高光 + 底部微影） */
.fill {
  display: block;
  min-width: 18px;
  height: 100%;
  background: linear-gradient(180deg, var(--tone-bg), color-mix(in srgb, var(--tone-bg) 78%, var(--tone-text)));
  border-radius: 999px;
  box-shadow:
    0 3px 6px var(--tone-shadow),
    inset 0 3px 5px rgb(255 255 255 / 0.6),
    inset 0 -3px 5px var(--tone-inset);
  transition: width var(--transition);
}

/* —— 技能黏土小块 —— */
.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pill {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 7px 16px;
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-text);
  background: var(--tone-bg);
  border-radius: 999px;
  box-shadow:
    0 6px 10px var(--tone-shadow),
    inset 0 4px 7px rgb(255 255 255 / 0.6),
    inset 0 -4px 6px var(--tone-inset);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

/* 列表项 hover：微浮 + 阴影提升；active：压扁（非链接块，纯增强） */
.pill:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 16px var(--tone-shadow),
    inset 0 4px 7px rgb(255 255 255 / 0.6),
    inset 0 -4px 6px var(--tone-inset);
}

.pill:active {
  transform: var(--press-transform);
}

/* —— Pastel 色相（与 SectionHead 同一色板） —— */
.tone-lilac {
  --tone-bg: #e2d4ff;
  --tone-text: #5b2fa8;
  --tone-shadow: rgb(140 100 200 / 0.3);
  --tone-inset: rgb(120 80 185 / 0.22);
}

.tone-mint {
  --tone-bg: #c9f2dd;
  --tone-text: #1d6a45;
  --tone-shadow: rgb(90 175 135 / 0.3);
  --tone-inset: rgb(70 145 105 / 0.22);
}

.tone-pink {
  --tone-bg: #ffd7e8;
  --tone-text: #8c2f60;
  --tone-shadow: rgb(215 100 150 / 0.3);
  --tone-inset: rgb(215 100 150 / 0.22);
}

.tone-butter {
  --tone-bg: #fff1c2;
  --tone-text: #7a5410;
  --tone-shadow: rgb(215 170 70 / 0.3);
  --tone-inset: rgb(190 140 40 / 0.22);
}

.tone-blue {
  --tone-bg: #d4e6ff;
  --tone-text: #1d4e8c;
  --tone-shadow: rgb(80 130 200 / 0.3);
  --tone-inset: rgb(60 105 175 / 0.22);
}

@media (prefers-reduced-motion: reduce) {
  .pill,
  .fill {
    transition: none;
  }

  .pill:hover,
  .pill:active {
    transform: none;
  }
}
</style>
