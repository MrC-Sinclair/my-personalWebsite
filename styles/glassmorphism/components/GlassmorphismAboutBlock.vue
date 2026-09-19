<!--
  GlassmorphismAboutBlock - glassmorphism 风格「关于」玻璃板的内容
  ------------------------------------------------------------
  原先这段（简介 + 左技能右经历 6/5 悬殊分栏）写在 GlassmorphismIndex
  的模板里，子页化后首页与 /about 需要同一份内容，抽出来单一来源。

  玻璃语义：一整块磨砂板里上下两层——上层是简介段落，下层是
  「技能云（左 6）| 经历时间线（右 5）」的悬殊分栏。
  数据来自共享层 useAppInfo（随 locale 变化，无需异步）。
-->
<template>
  <div class="about">
    <p class="about-desc">{{ t('about.description') }}</p>
    <div class="about-grid">
      <div class="about-skills">
        <h3 class="sub-title">{{ t('about.skills') }}</h3>
        <GlassmorphismSkillCloud :groups="skillGroups" />
      </div>
      <div class="about-exp">
        <h3 class="sub-title">{{ t('about.experience') }}</h3>
        <GlassmorphismTimeline :items="timeline" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GlassmorphismSkillCloud from './GlassmorphismSkillCloud.vue'
import GlassmorphismTimeline from './GlassmorphismTimeline.vue'

const { t } = useI18n()
const { skillGroups, timeline } = useAppInfo()
</script>

<style scoped>
/* —— 关于板块 —— */
.about-desc {
  max-width: 68ch;
  margin: 0 0 calc(var(--space) * 1.2);
  color: var(--c-muted);
}

/* 左技能右经历：桌面 6/5 悬殊分栏 */
.about-grid {
  display: grid;
  gap: var(--space);
}

@media (min-width: 900px) {
  .about-grid {
    grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
    align-items: start;
  }
}

.sub-title {
  margin: 0 0 14px;
  font-size: var(--fs-title);
  font-weight: 800;
  color: var(--c-text);
}
</style>
