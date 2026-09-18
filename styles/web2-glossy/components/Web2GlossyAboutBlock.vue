<!--
  Web2GlossyAboutBlock - web2-glossy 风格的「关于 / 技能」非对称分栏
  ------------------------------------------------------------
  原本内联写在首页 Web2GlossyIndex 的 about-grid 里；子页化后
  「关于」子页需要同一块内容，因此抽成组件由两处共用。

  保留「7:5 非对称分栏」的排版——左列是白面板（简介 + 凝胶时间线），
  右列是光泽标题 + 凝胶图标技能面板，这个分栏是 web2-glossy 排版轴
  的一环，拆成两块独立区块就散了。
  Web2GlossySectionHead 放进本组件（id 固定为 about-title），
  首页与子页的 aria-labelledby 都能引用到。
  这是风格内部复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="about-grid">
    <!-- 左：关于面板 + 经历时间线 -->
    <div class="panel about-main scroll-reveal">
      <Web2GlossySectionHead id="about-title" :badge="t('nav.about')" :title="t('about.title')"/>
      <p class="about-main__intro">{{ t('about.description') }}</p>

      <h3 class="about-main__sub">{{ t('about.experience') }}</h3>
      <ol class="timeline">
        <li v-for="item in safeTimeline" :key="item.period" class="timeline__item">
          <span class="timeline__period">{{ item.period }}</span>
          <div class="timeline__body">
            <p class="timeline__title">{{ item.title }} · {{ item.organization }}</p>
            <p class="timeline__desc">{{ item.description }}</p>
          </div>
        </li>
      </ol>
    </div>

    <!-- 右：技能分组（凝胶图标面板） -->
    <div class="about-side">
      <h3 class="about-side__heading scroll-reveal">
        <span class="about-side__heading-text">{{ t('about.skills') }}</span>
      </h3>
      <Web2GlossySkillPanel
        v-for="(group, index) in safeSkillGroups"
        :key="group.category"
        :group="group"
        :icon="skillIcon(index)"
        class="scroll-reveal"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GelIconVariant } from './Web2GlossyGelIcon.vue'
import Web2GlossySectionHead from './Web2GlossySectionHead.vue'
import Web2GlossySkillPanel from './Web2GlossySkillPanel.vue'

const { t } = useI18n()

// —— 共享层站点信息（数组字段一律 Array.isArray 防御） ——
const { skillGroups, timeline } = useAppInfo()

const safeSkillGroups = computed(() => (Array.isArray(skillGroups.value) ? skillGroups.value : []))
const safeTimeline = computed(() => (Array.isArray(timeline.value) ? timeline.value : []))

/** 凝胶图标轮换（纯装饰，索引取值，SSR 安全） */
function skillIcon(index: number): GelIconVariant {
  const order: GelIconVariant[] = ['window', 'layers', 'orbit', 'spark']
  return order[index] ?? 'spark'
}
</script>

<style scoped>
/* ================= 关于 + 技能 ================= */
.about-grid {
  display: grid;
  gap: var(--gap);
}

/* 白面板（首页 .panel 同款凝胶高光） */
.panel {
  position: relative;
  padding: clamp(22px, 3.5vw, 30px);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: linear-gradient(180deg, #ffffff 0%, #f3f9ff 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    var(--shadow);
}

/* 面板上半部的高光反光（Web 2.0 的「光泽」签名） */
.panel::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 46%;
  border-radius: var(--radius) var(--radius) 45% 45%;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.85) 0%, rgb(214 233 250 / 0.26) 100%);
  pointer-events: none;
}

.about-main__intro {
  margin: 0;
  color: var(--c-muted);
}

.about-main__sub {
  margin: 26px 0 14px;
  font-family: var(--font-head);
  font-size: 1.1875rem;
  font-weight: 800;
  color: var(--c-text);
}

/* —— 经历时间线：凝胶节点 + 渐变连线 —— */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.timeline__item {
  position: relative;
  display: flex;
  gap: 12px;
  padding-left: 30px;
}

/* 渐变连线 */
.timeline__item::before {
  content: '';
  position: absolute;
  top: 22px;
  bottom: -18px;
  left: 8px;
  width: 4px;
  border-radius: 2px;
  background: linear-gradient(180deg, #58a6f5 0%, #1d5fae 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.5);
}

/* 最后一项不向外延伸连线 */
.timeline__item:last-child::before {
  bottom: 6px;
}

/* 凝胶节点 */
.timeline__item::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 2px;
  width: 16px;
  height: 16px;
  border: 1px solid #14417e;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 28%, #ffffff 0 20%, #58a6f5 21%, #1d5fae 100%);
  box-shadow: 0 2px 4px rgb(23 74 128 / 0.35);
}

/* 年份胶囊：橙色凝胶 */
.timeline__period {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  align-self: flex-start;
  min-height: 32px;
  padding: 4px 14px;
  overflow: hidden;
  border: 1px solid #8a3c08;
  border-radius: var(--radius-sm);
  color: #ffffff;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  white-space: nowrap;
  background: linear-gradient(180deg, #d97a1c 0%, #bf5a10 55%, #a84a0c 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.45),
    0 2px 5px rgb(23 74 128 / 0.25);
}

.timeline__period::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.35) 0%, rgb(255 255 255 / 0) 60%);
  pointer-events: none;
}

.timeline__body {
  min-width: 0;
}

.timeline__title {
  margin: 0;
  font-family: var(--font-head);
  font-weight: 800;
  color: var(--c-text);
}

.timeline__desc {
  margin: 4px 0 0;
  color: var(--c-muted);
  font-size: 0.9375rem;
}

/* —— 右列：技能 —— */
.about-side {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

/* 技能列标题：渐变光泽小标题 */
.about-side__heading {
  position: relative;
  margin: 0;
  padding-bottom: 10px;
  font-family: var(--font-head);
  font-size: 1.375rem;
  font-weight: 800;
}

.about-side__heading-text {
  background: linear-gradient(180deg, #2b82e9 0%, #1d5fae 55%, #123c6e 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

/* 标题下的高光胶囊条 */
.about-side__heading::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 72px;
  height: 8px;
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, #58a6f5 0%, #1d5fae 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.6),
    0 2px 5px rgb(23 74 128 / 0.3);
}

/* —— 非对称分栏：宽屏 7:5 —— */
@media (min-width: 900px) {
  .about-grid {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: calc(var(--gap) * 1.5);
  }
}
</style>
