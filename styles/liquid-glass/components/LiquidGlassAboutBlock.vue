<!--
  LiquidGlassAboutBlock - liquid-glass 风格的「关于 / 技能」区块内容
  ------------------------------------------------------------
  原本内联写在首页 LiquidGlassIndex 的玻璃主板里；子页化后
  「关于」子页需要同一块内容，因此抽成组件由两处共用
  （首页嵌在 LiquidGlassPanel 内，子页嵌在 LiquidGlassSubPage 内）。

  只承载主板**内部的排版**，不含玻璃外壳——外壳由调用方决定，
  这样首页能把它放进带眉标的玻璃主板，子页能放进子页壳。
  这是风格内部复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="about-grid">
    <div class="about-copy scroll-reveal scroll-reveal-up">
      <p class="about-lead">{{ t('about.description') }}</p>

      <h3 class="sub-title">{{ t('about.experience') }}</h3>
      <ol class="rail">
        <li v-for="item in timeline" :key="item.period" class="rail-item">
          <span class="rail-node" aria-hidden="true"/>
          <div class="rail-body">
            <p class="rail-head">
              <span class="rail-title">{{ item.title }}</span>
              <span class="rail-org">{{ item.organization }}</span>
              <time class="rail-period">{{ item.period }}</time>
            </p>
            <p class="rail-desc">{{ item.description }}</p>
          </div>
        </li>
      </ol>
    </div>

    <div class="about-skills scroll-reveal scroll-reveal-up scroll-reveal-delay-2">
      <h3 class="sub-title">{{ t('about.skills') }}</h3>
      <LiquidGlassSkillShelf :groups="skillGroups"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import LiquidGlassSkillShelf from './LiquidGlassSkillShelf.vue'

const { t } = useI18n()

// —— 共享层站点信息（技能分组与经历时间线） ——
const { skillGroups, timeline } = useAppInfo()
</script>

<style scoped>
/* —— 主板内部：文案 7 / 技能 5 的悬殊分栏 —— */
.about-grid {
  display: grid;
  gap: var(--space);
}

@media (min-width: 900px) {
  .about-grid {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    align-items: start;
  }
}

.about-lead {
  margin: 0 0 22px;
  font-size: clamp(17px, 1.6vw, 19px);
  line-height: var(--lh-body);
  color: var(--c-muted);
}

/* 小节标题：发光眉标式 */
.sub-title {
  margin: 0 0 14px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--c-accent);
}

.about-skills .sub-title {
  margin-bottom: 12px;
}

/* —— 经历玻璃轨：时间线在玻璃主板内的呈现 —— */
.rail {
  display: grid;
  gap: 18px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rail-item {
  position: relative;
  display: flex;
  gap: 14px;
  padding-left: 6px;
}

/* 轨道连线：贯穿的渐变光轨 */
.rail-item::before {
  position: absolute;
  top: 18px;
  bottom: -18px;
  left: 10px;
  width: 2px;
  content: '';
  background: linear-gradient(180deg, rgb(94 227 255 / 0.4), rgb(167 139 255 / 0.12));
}

.rail-item:last-child::before {
  display: none;
}

/* 轨道节点：小玻璃珠 */
.rail-node {
  flex: none;
  width: 12px;
  height: 12px;
  margin-top: 6px;
  background:
    radial-gradient(circle at 32% 28%, rgb(255 255 255 / 0.9), transparent 46%),
    linear-gradient(140deg, var(--c-accent), var(--c-accent-2));
  border-radius: 50%;
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.35),
    0 0 10px rgb(94 227 255 / 0.45);
}

.rail-body {
  flex: 1 1 auto;
  min-width: 0;
}

.rail-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  margin: 0 0 4px;
}

.rail-title {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-text);
}

.rail-org {
  font-size: var(--fs-small);
  color: var(--c-accent-2);
}

.rail-period {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.rail-desc {
  margin: 0;
  font-size: var(--fs-small);
  line-height: var(--lh-body);
  color: var(--c-muted);
}

/* 窄屏：分栏落回单列，日期不再推到行尾 */
@media (max-width: 759px) {
  .rail-period {
    margin-left: 0;
  }
}
</style>
