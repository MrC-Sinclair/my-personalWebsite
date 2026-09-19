<!--
  SwissAbout - swiss 风格的「关于」子页（/style/swiss/about）
  ------------------------------------------------------------
  壳由 SwissSubPage 提供；主体是编号 01 的区块：技能表 + 经历时间线，
  与首页 01 区块同一套结构（子标题用红方块小标 + 细则线表格）。
  区块头标题升为 h1：子页只有一个区块，首页那套 h2 会让整页没有
  一级标题。
-->
<template>
  <SwissSubPage>
    <section class="section scroll-reveal scroll-reveal-up" aria-labelledby="about-head">
      <SwissSectionHead
        :no="1"
        :level="1"
        head-id="about-head"
        :title="t('about.title')"
        :meta="t('about.description')"
      />
      <div class="section-body">
        <p class="sub-label">
          <span class="sub-mark" aria-hidden="true" />
          {{ t('about.skills') }}
        </p>
        <SwissSkillTable v-if="skillList.length" :groups="skillList" />
        <p v-else class="empty">{{ t('projects.noResults') }}</p>

        <p class="sub-label sub-label--gap">
          <span class="sub-mark" aria-hidden="true" />
          {{ t('about.experience') }}
        </p>
        <SwissTimeline v-if="timelineList.length" :items="timelineList" />
        <p v-else class="empty">{{ t('projects.noResults') }}</p>
      </div>
    </section>
  </SwissSubPage>
</template>

<script setup lang="ts">
import SwissSubPage from '../components/SwissSubPage.vue'
import SwissSectionHead from '../components/SwissSectionHead.vue'
import SwissSkillTable from '../components/SwissSkillTable.vue'
import SwissTimeline from '../components/SwissTimeline.vue'

const { t } = useI18n()
const { skillGroups, timeline } = useAppInfo()

const skillList = computed(() => (Array.isArray(skillGroups.value) ? skillGroups.value : []))
const timelineList = computed(() => (Array.isArray(timeline.value) ? timeline.value : []))
</script>

<style scoped>
.section {
  margin-top: calc(var(--space) * 2.4);
}

.section-body {
  margin-top: var(--space);
}

/* 区块内子标签：红方块 + 小号宽字距（与首页同构） */
.sub-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 12px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-text);
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.sub-label--gap {
  margin-top: calc(var(--space) * 1.4);
}

.sub-mark {
  flex: none;
  width: 10px;
  height: 10px;
  background: var(--c-accent);
}

/* 空状态：细则线框 + 提示文案（不留白） */
.empty {
  padding: var(--space) 0;
  margin: 0;
  border-top: var(--border-w) solid var(--c-border);
  border-bottom: var(--border-w) solid var(--c-border);
  color: var(--c-muted);
}

@media (min-width: 768px) {
  .section {
    margin-top: calc(var(--space) * 2.8);
  }
}
</style>
