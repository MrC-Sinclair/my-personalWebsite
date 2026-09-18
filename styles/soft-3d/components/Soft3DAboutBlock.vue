<!--
  Soft3DAboutBlock - soft-3d 风格的「关于 / 技能」区块内容
  ------------------------------------------------------------
  原本内联写在首页 Soft3DIndex 的「关于」区里；子页化后「关于」子页
  需要同一块内容，因此抽成组件由两处共用。

  只承载区块**内部**的摆件（技能舱网格 + 经历里程碑浮板），不含
  Soft3DSectionHead——标题由调用方（首页 section 或子页外壳）决定，
  这样首页能带上锚点 id，子页能用子页的标题档位。
  这是风格内部复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="about">
    <!-- 技能舱：分组数据 + 配色 + Z 层 + reveal 交错 -->
    <div class="skill-grid">
      <div
        v-for="pod in revealSkills"
        :key="pod.label"
        class="reveal-wrap scroll-reveal scroll-reveal-up"
        :class="pod.reveal"
      >
        <div class="z-item" :class="pod.z">
          <Soft3DSkillPod :label="pod.label" :skills="pod.skills" :variant="pod.variant"/>
        </div>
      </div>
    </div>

    <!-- 经历：一排摆上台面的里程碑浮板 -->
    <h3 class="exp-title">{{ t('about.experience') }}</h3>
    <ol class="exp-row">
      <li v-for="item in timeline" :key="item.period" class="exp-item">
        <article class="exp-card">
          <span class="exp-period">{{ item.period }}</span>
          <h4 class="exp-role">{{ item.title }}</h4>
          <p class="exp-org">{{ item.organization }}</p>
          <p class="exp-desc">{{ item.description }}</p>
        </article>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import type { SkillGroup } from '~/types/site'
import Soft3DSkillPod from './Soft3DSkillPod.vue'

const { t } = useI18n()

// —— 共享层站点信息（技能分组与经历时间线） ——
const { skillGroups, timeline } = useAppInfo()

// —— 技能舱配色轮换（纯装饰，索引取模，SSR 安全） ——
const skillPalette = ['violet', 'cyan', 'pink', 'mint'] as const

const revealSkills = computed(() =>
  (Array.isArray(skillGroups.value) ? skillGroups.value : []).map(
    (group: SkillGroup, i: number) => ({
      label: group.category,
      skills: Array.isArray(group.skills) ? group.skills : [],
      variant: skillPalette[i % skillPalette.length],
      z: zOf(i + 1),
      reveal: revealClass(i),
    }),
  ),
)

/** Z 层轮换：远 / 近 / 中循环，形成「物体错落摆放」的纵深（确定性，SSR 安全） */
function zOf(index: number): 'z-near' | 'z-mid' | 'z-far' {
  const order: Array<'z-near' | 'z-mid' | 'z-far'> = ['z-far', 'z-near', 'z-mid']
  return order[index % 3]!
}

/** reveal 交错延迟类（滚动进入动画的全局类，确定性） */
function revealClass(index: number): string {
  const delays = ['', 'scroll-reveal-delay-1', 'scroll-reveal-delay-2']
  return delays[index % 3]!
}
</script>

<style scoped>
/* —— 技能舱网格 —— */
.skill-grid {
  display: grid;
  gap: var(--gap);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

/* Z 层包裹：reveal 在外层，层级变换在内层，transform 互不覆盖 */
.reveal-wrap {
  min-width: 0;
}

.z-item {
  height: 100%;
}

/* —— 经历里程碑：一排浮板，窄屏纵排 —— */
.exp-title {
  margin: calc(var(--space) * 1.3) 0 var(--gap);
  font-family: var(--font-head);
  font-size: clamp(20px, 2.6vw, 26px);
  font-weight: 700;
  color: var(--c-text);
}

.exp-row {
  display: grid;
  gap: var(--gap);
  margin: 0;
  padding: 0;
  list-style: none;
  grid-template-columns: 1fr;
}

/* 桌面端：浮板错落（台面纵深），偶数块下沉 */
@media (min-width: 900px) {
  .exp-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .exp-item:nth-child(even) {
    margin-top: 22px;
  }
}

.exp-card {
  height: 100%;
  padding: calc(var(--space) * 0.8);
  background: linear-gradient(160deg, color-mix(in srgb, var(--c-accent) 8%, var(--c-surface)), var(--c-surface) 60%);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  transition: transform var(--transition), box-shadow var(--transition);
}

.exp-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 30px 52px rgb(6 3 26 / 0.62),
    0 12px 24px rgb(139 92 246 / 0.28),
    inset 0 2px 5px rgb(255 255 255 / 0.24),
    inset 0 -8px 16px rgb(9 5 40 / 0.5);
}

.exp-period {
  display: inline-block;
  margin-bottom: 8px;
  padding: 3px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  background: color-mix(in srgb, var(--c-accent-2) 13%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-accent-2) 36%, transparent);
  border-radius: 999px;
}

.exp-role {
  margin: 0 0 4px;
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 700;
  color: var(--c-text);
}

.exp-org {
  margin: 0 0 8px;
  font-size: var(--fs-small);
  color: var(--c-accent);
}

.exp-desc {
  margin: 0;
  font-size: var(--fs-small);
  line-height: 1.7;
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .exp-card {
    transition: none;
  }

  .exp-card:hover {
    transform: none;
  }
}
</style>
