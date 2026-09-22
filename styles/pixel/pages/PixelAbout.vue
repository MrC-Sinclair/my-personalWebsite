<!--
  PixelAbout - pixel 风格的「关于」子页（/style/pixel/about）
  ------------------------------------------------------------
  壳由 PixelSubPage 提供；主体两块对话框：
  ABOUT（角色档案：自述 + 经历时间线，与首页共用 PixelAboutBlock）
  + STATUS（技能字符条）。首页这两块是分列摆放的，子页纵排——
  单主题页把窗口叠起来读，才是「翻档案」的顺序。
-->
<template>
  <PixelSubPage>
    <PixelAboutBlock id="about" data-section="about" :title="t('about.title')" :level="1" />

    <PixelPanel
      id="skills"
      data-section="skills"
      head="STATUS"
      :title="t('about.skills')"
      :meta="String(skillGroups.length)"
    >
      <PixelSkillBars v-if="skillGroups.length" :groups="skillGroups" />
      <PixelEmpty v-else :message="t('projects.noResults')" />
    </PixelPanel>
  </PixelSubPage>
</template>

<script setup lang="ts">
import PixelSubPage from '../components/PixelSubPage.vue'
import PixelAboutBlock from '../components/PixelAboutBlock.vue'
import PixelPanel from '../components/PixelPanel.vue'
import PixelSkillBars from '../components/PixelSkillBars.vue'
import PixelEmpty from '../components/PixelEmpty.vue'

const { t } = useI18n()
const { skillGroups } = useAppInfo()
</script>
