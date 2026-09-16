<!--
  NeoBrutalismAboutBlock - neo-brutalism 风格「关于我」色块
  ------------------------------------------------------------
  整块海报黄（--c-accent），当作一个色块而不是一段文字：
  盖章式标题 + 等宽字引言 + 粗重正文，底部缀一组纯 CSS
  几何形状（圆 / 矩形 / 三角）作海报家具。文字全部来自 i18n。
  区块在页面 12 栏网格中的占位（span-7）由页面控制。
-->
<template>
  <section class="about">
    <NeoBrutalismSectionTitle :text="t('about.title')" tone="ink" />
    <p class="kicker">{{ t('about.description') }}</p>
    <p class="body">{{ t('home.description') }}</p>

    <!-- 纯 CSS 几何装饰：圆 / 矩形 / 三角 -->
    <span class="shapes" aria-hidden="true">
      <span class="shape shape-circle"/>
      <span class="shape shape-square"/>
      <span class="shape shape-triangle"/>
    </span>
  </section>
</template>

<script setup lang="ts">
import NeoBrutalismSectionTitle from './NeoBrutalismSectionTitle.vue'

const { t } = useI18n()
</script>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding: var(--space);
  background: var(--c-accent);
  color: var(--c-on-accent);
  border: var(--border-w) solid var(--c-border);
  box-shadow: 8px 8px 0 var(--c-border);
}

/* 引言：等宽小字，像海报上的期号 */
.kicker {
  margin: 4px 0 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.1em;
}

/* 正文：粗重一些，撑得起大色块 */
.body {
  margin: 0;
  max-width: 62ch;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.7;
}

/* —— 海报家具：一排几何形状 —— */
.shapes {
  display: inline-flex;
  gap: 14px;
  margin-top: 10px;
}

.shape {
  display: block;
  width: 22px;
  height: 22px;
  border: var(--border-w) solid var(--c-border);
}

.shape-circle {
  border-radius: 50%;
}

.shape-square {
  background: var(--c-text);
}

.shape-triangle {
  width: 0;
  height: 0;
  border: none;
  border-right: 14px solid transparent;
  border-bottom: 22px solid var(--c-border);
  border-left: 14px solid transparent;
}
</style>
