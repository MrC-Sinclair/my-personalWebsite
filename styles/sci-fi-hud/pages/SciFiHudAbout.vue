<!--
  SciFiHudAbout - sci-fi-hud 风格的「关于」子页（/style/sci-fi-hud/about）
  ------------------------------------------------------------
  壳由 SciFiHudSubPage 提供；主体是单个 SEC-01 HUD 面板（标题升为 h1），
  面板内两段：任务履历（MissionLog）+ 技能模块（SkillGauge）。
  首页这两段是分列在左右两块面板上的，子页合成一块——单主题页把
  两块读数并进同一块面板，才是「调出一份完整档案」的读法。
-->
<template>
  <SciFiHudSubPage>
    <SciFiHudPanel
      code="SEC-01"
      :level="1"
      :title="t('about.title')"
      :meta="String(timeline.length)"
      class="scroll-reveal scroll-reveal-up"
    >
      <h3 class="sub-head">{{ t('about.experience') }}</h3>
      <SciFiHudMissionLog :items="timeline" />

      <h3 class="sub-head sub-head--gap">{{ t('about.skills') }}</h3>
      <SciFiHudSkillGauge :groups="skillGroups" />
    </SciFiHudPanel>
  </SciFiHudSubPage>
</template>

<script setup lang="ts">
import SciFiHudSubPage from '../components/SciFiHudSubPage.vue'
import SciFiHudPanel from '../components/SciFiHudPanel.vue'
import SciFiHudMissionLog from '../components/SciFiHudMissionLog.vue'
import SciFiHudSkillGauge from '../components/SciFiHudSkillGauge.vue'

const { t } = useI18n()
const { skillGroups, timeline } = useAppInfo()
</script>

<style scoped>
/* 面板内子标题：左缘信号条 + 等宽小字（与首页同款） */
.sub-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 var(--space);
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.12em;
  color: var(--c-accent);
}

.sub-head::before {
  content: '';
  width: 3px;
  height: 12px;
  background: var(--c-accent);
}

/* 同面板内的第二段：与第一段拉开距离 */
.sub-head--gap {
  margin-top: calc(var(--space) * 1.6);
}
</style>
