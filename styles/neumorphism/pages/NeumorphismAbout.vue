<!--
  NeumorphismAbout - neumorphism 风格的「关于」子页（/style/neumorphism/about）
  ------------------------------------------------------------
  壳由 NeumorphismSubPage 提供；主体两块凸起面板：关于（经历时间线，
  与首页共用 NeumorphismAboutBlock）+ 技能（内凹轨道里的凸起填充块）。
  首页这两块是上下相邻的两块面板，子页同样纵排——本风格本来就是
  居中单列，层级变化不改变排版轴。
-->
<template>
  <NeumorphismSubPage>
    <NeumorphismPanel id="about" data-section="about" :level="1" :title="t('about.title')">
      <NeumorphismAboutBlock />
    </NeumorphismPanel>

    <NeumorphismPanel id="skills" data-section="skills" :title="t('about.skills')">
      <NeumorphismSkillBars :groups="skillGroups" />
    </NeumorphismPanel>
  </NeumorphismSubPage>
</template>

<script setup lang="ts">
import NeumorphismSubPage from '../components/NeumorphismSubPage.vue'
import NeumorphismPanel from '../components/NeumorphismPanel.vue'
import NeumorphismAboutBlock from '../components/NeumorphismAboutBlock.vue'
import NeumorphismSkillBars from '../components/NeumorphismSkillBars.vue'

const { t } = useI18n()
const { skillGroups } = useAppInfo()
</script>
