<!--
  DashboardSubPage - dashboard 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「侧栏 + 主区网格 + 页头 + 页脚状态条」，
  只有主体区块不同。抽成外壳后子页只写主体。

  与首页的差别：
  · 页头取代英雄区。首页第一屏是「小 eyebrow + 大号名字 + 幽灵数字」——
    那是总览屏的开机画面；子页用同一套字形把页头降一级：eyebrow 仍是
    等宽小标，主标题是本页的 h1（首页的 h1 是人名，子页的 h1 必须是
    本页主题，否则整页没有一级标题）。
  · 主区仍是 12 栏密集网格，但默认每块占满 12 栏，具体跨栏由子页的
    class 决定——首页那套 4/4/4、8/4 的拼法是「一屏多指标」的排布，
    子页单主题时按需切分。

  用法：
    <DashboardSubPage :eyebrow="t('nav.blog')" :title="t('blog.title')">
      <DashboardPanel …>…</DashboardPanel>
    </DashboardSubPage>

  这是 dashboard 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="page">
    <DashboardSubNav />

    <div class="main">
      <div class="main-inner">
        <header class="pagehead">
          <p class="pagehead-eyebrow">{{ eyebrow }}</p>
          <h1 class="pagehead-title">{{ title }}</h1>
          <p v-if="description" class="pagehead-desc">{{ description }}</p>
        </header>

        <slot />
      </div>

      <DashboardStatusStrip />
    </div>
  </div>
</template>

<script setup lang="ts">
import DashboardSubNav from './DashboardSubNav.vue'
import DashboardStatusStrip from './DashboardStatusStrip.vue'

defineProps<{
  /** 页头小标（等宽、全大写，i18n 短词） */
  eyebrow: string
  /** 页头主标题（本页唯一的 h1，i18n） */
  title: string
  /** 页头补充说明（i18n，可选） */
  description?: string
}>()
</script>

<style scoped>
/* —— 页面骨架：窄屏单列（侧栏收起为顶部条），桌面双列 —— */
.page {
  display: block;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

@media (min-width: 1024px) {
  .page {
    display: grid;
    grid-template-columns: 248px minmax(0, 1fr);
  }
}

.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: var(--space);
}

.main-inner {
  display: grid;
  flex: 1 0 auto;
  align-content: start;
  gap: var(--gap);
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
}

/* —— 页头：等宽小标 + h1（首页英雄区的降一级版本） —— */
.pagehead {
  padding: calc(var(--space) / 2) 0 0;
}

.pagehead-eyebrow {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.pagehead-title {
  margin: 4px 0 6px;
  font-family: var(--font-head);
  font-size: clamp(26px, 4.4vw, 40px);
  font-weight: 700;
  line-height: 1.16;
  color: var(--c-text);
  overflow-wrap: break-word;
}

.pagehead-desc {
  max-width: 64ch;
  margin: 0;
  color: var(--c-muted);
}
</style>
