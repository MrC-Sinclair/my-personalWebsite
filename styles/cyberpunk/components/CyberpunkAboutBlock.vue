<!--
  CyberpunkAboutBlock - cyberpunk 风格的「关于档案 + 技能芯片墙」
  ------------------------------------------------------------
  原本内联写在首页 CyberpunkIndex 的 .duo 里；子页化后「关于」子页
  需要同一块内容，因此抽成组件由两处共用。

  刻意保持「两块面板」的形态而不合并：7/5 非对称分栏 + 技能面板
  下沉错位（duo-b 的 44px 下沉）是首页霓虹招牌错落轮廓的一部分，
  合并成一块就失去了这个签名。子页沿用同一形态——关于这一页
  讲的就是「档案 + 技能」两件事。

  两个面板各自保留 id="about" / id="skills"，首页锚点照旧可用。
  这是风格内部复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="duo">
    <CyberpunkPanel
      id="about"
      data-section="about"
      class="duo-a scroll-reveal scroll-reveal-up"
      :eyebrow="t('nav.about')"
      :title="t('about.title')"
      tone="cyan"
    >
      <p class="about-lead">{{ t('about.description') }}</p>

      <h3 class="sub-title">{{ t('about.experience') }}</h3>
      <CyberpunkTimeline :items="timeline"/>
    </CyberpunkPanel>

    <CyberpunkPanel
      id="skills"
      data-section="skills"
      class="duo-b scroll-reveal scroll-reveal-up scroll-reveal-delay-2"
      :eyebrow="t('nav.about')"
      :title="t('about.skills')"
      tone="violet"
      flip
    >
      <CyberpunkSkillGrid :groups="skillGroups"/>
    </CyberpunkPanel>
  </div>
</template>

<script setup lang="ts">
import CyberpunkPanel from './CyberpunkPanel.vue'
import CyberpunkTimeline from './CyberpunkTimeline.vue'
import CyberpunkSkillGrid from './CyberpunkSkillGrid.vue'

const { t } = useI18n()

// —— 共享层站点信息（技能分组与经历时间线） ——
const { skillGroups, timeline } = useAppInfo()
</script>

<style scoped>
/* —— 7/5 非对称分栏 + 技能面板下沉（首页霓虹错落轮廓） —— */
.duo {
  display: grid;
  gap: clamp(36px, 5vw, 64px);
}

@media (min-width: 960px) {
  .duo {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    align-items: start;
    gap: var(--space);
  }

  .duo-b {
    margin-top: 44px;
  }
}

.about-lead {
  margin: 0 0 var(--space);
  font-size: clamp(16px, 1.6vw, 18px);
  line-height: var(--lh-body);
  color: var(--c-muted);
}

/* 小节标题：等宽粉字 + 发光下划线 */
.sub-title {
  margin: 0 0 var(--gap);
  padding-bottom: 8px;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  letter-spacing: 0.18em;
  color: var(--c-accent-2);
  border-bottom: 1px solid rgb(255 45 149 / 0.35);
  text-shadow: 0 0 10px rgb(255 45 149 / 0.35);
}

/* 窄屏：下沉落回单列 */
@media (max-width: 959px) {
  .duo-b {
    margin-top: 0;
  }
}
</style>
