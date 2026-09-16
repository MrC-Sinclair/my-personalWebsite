<!--
  FlatDesignSectionHead - 扁平化风格区块标题
  ------------------------------------------------------------
  本风格的「节」签名：纯色小色条 + 大标题 + 可选副题。
  tone 决定文字颜色语境（浅色带 / 深色带），barColor 允许
  各色带轮换强调色条颜色（几何色条代替装饰线）。
-->
<template>
  <div class="head" :class="`head--${tone}`">
    <span class="head__bar" aria-hidden="true" :style="barColor ? { background: barColor } : undefined"/>
    <h2 class="head__title">{{ title }}</h2>
    <p v-if="subtitle" class="head__subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 区块标题 */
    title: string
    /** 可选副题 */
    subtitle?: string
    /** 语境：light = 浅色带，dark = 深色带 */
    tone?: 'light' | 'dark'
    /** 色条颜色（风格签名装饰色，默认强调蓝） */
    barColor?: string
  }>(),
  { subtitle: '', tone: 'light', barColor: '' },
)
</script>

<style scoped>
.head {
  margin-bottom: clamp(24px, 4vw, 40px);
}

.head__bar {
  display: block;
  width: 48px;
  height: 6px;
  margin-bottom: 14px;
  background: var(--c-accent);
  border-radius: var(--radius-sm);
}

.head__title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(26px, 4vw, 38px);
  font-weight: 800;
  line-height: 1.15;
  color: var(--c-text);
}

.head__subtitle {
  margin: 10px 0 0;
  max-width: 640px;
  font-size: var(--fs-base);
  line-height: 1.7;
  color: var(--c-muted);
}

/* 深色带语境：白字 + 半透明副题 */
.head--dark .head__title {
  color: #ffffff;
}

.head--dark .head__subtitle {
  color: rgb(255 255 255 / 0.78);
}
</style>
