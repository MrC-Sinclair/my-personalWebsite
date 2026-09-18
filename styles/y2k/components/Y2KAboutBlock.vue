<!--
  Y2KAboutBlock - y2k 风格的「关于 / 技能」错位浮岛
  ------------------------------------------------------------
  原本内联写在首页 Y2KIndex 的 about-grid 里；子页化后「关于」子页
  需要同一块内容，因此抽成组件由两处共用。

  保留「7:5 分栏 + 右列（cyan 塑料板）下沉」的形态——桌面端的
  错位是 y2k 「深空浮岛」排版轴的一部分，拆成两块独立面板就散了。
  不含 Y2KSectionHead：标题由调用方决定（首页带锚点 id，子页用
  子页自己的标题）。
  这是风格内部复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="about-grid">
    <Y2KPlasticPanel variant="violet" class="about-main scroll-reveal">
      <p class="about-intro">{{ t('about.description') }}</p>
      <h3 class="about-sub">{{ t('about.experience') }}</h3>
      <Y2KTimeline v-if="safeTimeline.length" :items="safeTimeline"/>
    </Y2KPlasticPanel>

    <Y2KPlasticPanel
      variant="cyan"
      class="about-side scroll-reveal scroll-reveal-delay-2"
    >
      <h3 class="about-sub">{{ t('about.skills') }}</h3>
      <Y2KSkillBubbles v-if="safeSkillGroups.length" :groups="safeSkillGroups"/>
    </Y2KPlasticPanel>
  </div>
</template>

<script setup lang="ts">
import Y2KPlasticPanel from './Y2KPlasticPanel.vue'
import Y2KTimeline from './Y2KTimeline.vue'
import Y2KSkillBubbles from './Y2KSkillBubbles.vue'

const { t } = useI18n()

// —— 共享层站点信息（数组字段一律 Array.isArray 防御） ——
const { skillGroups, timeline } = useAppInfo()

const safeSkillGroups = computed(() => (Array.isArray(skillGroups.value) ? skillGroups.value : []))
const safeTimeline = computed(() => (Array.isArray(timeline.value) ? timeline.value : []))
</script>

<style scoped>
/* —— 7:5 分栏 + 右列下沉（桌面端错位浮岛） —— */
.about-grid {
  display: grid;
  gap: var(--gap);
}

.about-intro {
  margin: 0 0 var(--gap);
  color: var(--c-muted);
}

/* 小节标题：铬金属渐变字（与首页同款，字号用 --fs-title） */
.about-sub {
  margin: 0 0 14px;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 900;
  background: linear-gradient(180deg, #ffffff 0%, #ccd6f6 44%, #7d89c9 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

@media (min-width: 900px) {
  .about-grid {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    align-items: start;
  }

  /* 右列下沉：与左列形成浮岛落差 */
  .about-side {
    margin-top: 48px;
  }
}
</style>
