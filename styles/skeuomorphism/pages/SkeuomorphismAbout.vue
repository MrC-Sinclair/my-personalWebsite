<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismAbout - 拟物风格的「关于」子页（/style/skeuomorphism/about）
  ------------------------------------------------------------
  壳由 SkeuomorphismSubPage 提供；主体与首页「关于 + 技能」同一套
  实物：橡木镶板（简介 + 经历时间线）+ 斜贴皮革挂签（技能工具卡）。
  首页这两件是 7:5 非对称摆放，子页保留同一比例——它们是两件不同
  材质的实物，比例本身就是「桌子上的摆放关系」，不随页面层级变。
-->
<template>
  <SkeuomorphismSubPage>
    <section id="about" data-section="about" class="section" aria-labelledby="about-title">
      <SkeuomorphismSectionHead
        id="about-title"
        :level="1"
        :badge="t('nav.about')"
        :title="t('about.title')"
      />
      <div class="about-grid">
        <SkeuomorphismWoodPanel :title="t('about.experience')" class="about-main scroll-reveal">
          <p class="about-intro">{{ t('about.description') }}</p>
          <SkeuomorphismTimeline v-if="safeTimeline.length" :items="safeTimeline" />
        </SkeuomorphismWoodPanel>

        <div
          class="about-side scroll-reveal scroll-reveal-delay-2"
          role="group"
          :aria-label="t('about.skills')"
        >
          <h3 class="side-label">
            <span class="side-label-plate">{{ t('about.skills') }}</span>
          </h3>
          <SkeuomorphismSkillTags v-if="safeSkillGroups.length" :groups="safeSkillGroups" />
          <SkeuomorphismEmptyNote v-else :message="t('projects.noResults')" />
        </div>
      </div>
    </section>
  </SkeuomorphismSubPage>
</template>

<script setup lang="ts">
import SkeuomorphismSubPage from '../components/SkeuomorphismSubPage.vue'
import SkeuomorphismSectionHead from '../components/SkeuomorphismSectionHead.vue'
import SkeuomorphismWoodPanel from '../components/SkeuomorphismWoodPanel.vue'
import SkeuomorphismTimeline from '../components/SkeuomorphismTimeline.vue'
import SkeuomorphismSkillTags from '../components/SkeuomorphismSkillTags.vue'
import SkeuomorphismEmptyNote from '../components/SkeuomorphismEmptyNote.vue'

const { t } = useI18n()
const { skillGroups, timeline } = useAppInfo()

const safeSkillGroups = computed(() => (Array.isArray(skillGroups.value) ? skillGroups.value : []))
const safeTimeline = computed(() => (Array.isArray(timeline.value) ? timeline.value : []))
</script>

<style scoped>
/* 锚点定位补偿：吸顶木杆约 64px 高 */
.section {
  scroll-margin-top: 6.5rem;
  min-width: 0;
}

/* —— 关于 + 技能：桌面端 7:5 非对称，右列皮革挂签散落 —— */
.about-grid {
  display: grid;
  gap: var(--gap);
}

.about-intro {
  margin: 0 0 var(--gap);
  color: #e6d5b4;
}

/* 技能列的小标题：斜贴的皮革标签 */
.side-label {
  display: flex;
  margin: 0 0 var(--gap);
}

.side-label-plate {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #fbf2dd;
  border: 1px solid rgb(0 0 0 / 0.55);
  border-radius: var(--radius-sm);
  background:
    radial-gradient(circle at 22% 32%, rgb(255 255 255 / 0.06) 1px, transparent 1.8px),
    linear-gradient(180deg, #6b4223 0%, #5a3617 100%);
  background-size: 9px 9px, 100% 100%;
  box-shadow:
    inset 0 1px 0 rgb(255 240 210 / 0.16),
    inset 0 -2px 4px rgb(0 0 0 / 0.4),
    0 2px 4px rgb(10 4 0 / 0.5);
  transform: rotate(-1.4deg);
}

@media (min-width: 900px) {
  .about-grid {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    align-items: start;
  }

  .about-side {
    margin-top: 28px;
  }
}
</style>
