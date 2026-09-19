<!--
  FlatDesignAboutBlock - 扁平化风格「关于」内容块（首页与 /about 共用）
  ------------------------------------------------------------
  首页关于色带里的那段：SectionHead + 左经历圆点时间线 / 右纯色进度条。
  抽成独立组件后，首页与子页共用同一份内容与布局，避免两处各写。
  level 控制 SectionHead 的标题层级：首页并列区块用 2，子页唯一区块用 1。

  数据来自共享层 useAppInfo（timeline / skillGroups，随 locale 变化）。
-->
<template>
  <section :id="id || undefined" class="band band--white" :data-section="id || undefined">
    <div class="band__inner">
      <FlatDesignSectionHead
        :title="t('about.title')"
        :subtitle="t('about.description')"
        bar-color="#117a65"
        :level="level"
      />
      <div class="about-grid">
        <div class="about-grid__story">
          <h3 class="minor-head">{{ t('about.experience') }}</h3>
          <FlatDesignTimeline :items="timeline" />
        </div>
        <div class="about-grid__skills">
          <h3 class="minor-head">{{ t('about.skills') }}</h3>
          <FlatDesignSkillBars v-if="skillBars.length" :bars="skillBars" />
          <FlatDesignEmpty v-else :message="t('projects.noResults')" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import FlatDesignEmpty from './FlatDesignEmpty.vue'
import FlatDesignSectionHead from './FlatDesignSectionHead.vue'
import FlatDesignSkillBars from './FlatDesignSkillBars.vue'
import FlatDesignTimeline from './FlatDesignTimeline.vue'
import type { SkillBar } from './FlatDesignSkillBars.vue'

const { level = 2, id = '' } = defineProps<{ level?: 1 | 2, id?: string }>()

const { t } = useI18n()
const { skillGroups, timeline } = useAppInfo()

/**
 * 技能进度条：宽度 = 分类技能数 / 最大分类技能数（真实数据占比，
 * 不虚构熟练度）；数量标注由文字直接承载。
 */
const skillBars = computed<SkillBar[]>(() => {
  const groups = skillGroups.value
  const counts = groups.map((group) => (Array.isArray(group.skills) ? group.skills.length : 0))
  const max = Math.max(1, ...counts)
  return groups.map((group, i) => ({
    category: group.category,
    skills: Array.isArray(group.skills) ? group.skills : [],
    count: counts[i],
    percent: Math.round((counts[i] / max) * 100),
  }))
})
</script>
