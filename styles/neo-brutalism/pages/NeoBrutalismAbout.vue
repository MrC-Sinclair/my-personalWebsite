<!--
  NeoBrutalismAbout - neo-brutalism 风格的「关于」子页（/style/neo-brutalism/about）
  ------------------------------------------------------------
  壳由 NeoBrutalismSubPage 提供。首页把「关于」拆成三块错落摆放
  （黄块关于 × 黑块技能对撞 + 下沉时间线），本页讲的是同一件事，
  所以三块全上，只是改成单列纵排——首页的「对撞」是拼贴签名，
  子页没有并排对象，纵向堆叠才读得下去。
-->
<template>
  <NeoBrutalismSubPage>
    <!-- 子页页头：区块里只有 h3，整页缺 h1 -->
    <NeoBrutalismSectionTitle :text="t('about.title')" tone="ink" :level="1"/>
    <NeoBrutalismAboutBlock class="scroll-reveal"/>
    <NeoBrutalismSkillsBlock class="scroll-reveal" :groups="skillGroups"/>
    <NeoBrutalismTimeline class="scroll-reveal" :items="timeline"/>
  </NeoBrutalismSubPage>
</template>

<script setup lang="ts">
import NeoBrutalismSubPage from '../components/NeoBrutalismSubPage.vue'
import NeoBrutalismAboutBlock from '../components/NeoBrutalismAboutBlock.vue'
import NeoBrutalismSkillsBlock from '../components/NeoBrutalismSkillsBlock.vue'
import NeoBrutalismTimeline from '../components/NeoBrutalismTimeline.vue'
import NeoBrutalismSectionTitle from '../components/NeoBrutalismSectionTitle.vue'

// 本页原本不直接用 i18n，补页头后需要取标题文案
const { t } = useI18n()

// —— 共享层站点信息（技能分组与经历时间线） ——
const { skillGroups, timeline } = useAppInfo()
</script>
