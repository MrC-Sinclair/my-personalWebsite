<!--
  ClaymorphismAbout - claymorphism 风格的「关于」子页（/style/claymorphism/about）
  ------------------------------------------------------------
  壳由 ClaymorphismSubPage 提供；主体两座黏土岛（与首页 01/02 同源）：
  丁香色「关于岛」（简介 + 经历时间线）+ 薄荷色「技能岛」（技能黏土团）。
  首页这两座岛是 7/5 错落双栏，子页纵排——单主题页把两座岛叠起来读，
  才是「翻开一页档案」的顺序；错落下沉是首页一屏多岛时才需要的节奏。
-->
<template>
  <ClaymorphismSubPage>
    <section class="island island-lilac">
      <ClaymorphismSectionHead eyebrow="01" :level="1" :title="t('about.title')" tone="pink" />
      <p class="intro">{{ t('about.description') }}</p>
      <ClaymorphismTimeline :items="timeline" />
    </section>

    <section class="island island-mint">
      <ClaymorphismSectionHead
        eyebrow="02"
        :title="t('about.skills')"
        :count="skillTotal"
        tone="blue"
      />
      <ClaymorphismSkillClump :groups="skillGroups" />
    </section>
  </ClaymorphismSubPage>
</template>

<script setup lang="ts">
import ClaymorphismSubPage from '../components/ClaymorphismSubPage.vue'
import ClaymorphismSectionHead from '../components/ClaymorphismSectionHead.vue'
import ClaymorphismTimeline from '../components/ClaymorphismTimeline.vue'
import ClaymorphismSkillClump from '../components/ClaymorphismSkillClump.vue'

const { t } = useI18n()
const { skillGroups, timeline } = useAppInfo()

/** 技能总数（计数徽章，真实统计） */
const skillTotal = computed(() =>
  skillGroups.value.reduce(
    (sum, group) => sum + (Array.isArray(group.skills) ? group.skills.length : 0),
    0,
  ),
)
</script>

<style scoped>
/* —— 黏土岛：厚板 + 超大圆角（与首页同款） —— */
.island {
  padding: clamp(24px, 4vw, 40px);
  border-radius: clamp(32px, 5vw, 44px);
  box-shadow: var(--shadow);
}

.island-lilac {
  background: #ece2fb;
}

.island-mint {
  background: #dff3e8;
}

/* 岛内简介文本 */
.intro {
  margin: 0 0 var(--space);
  color: var(--c-text);
}
</style>
