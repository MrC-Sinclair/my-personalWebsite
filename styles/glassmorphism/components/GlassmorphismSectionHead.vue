<!--
  GlassmorphismSectionHead - glassmorphism 风格的区块标题
  ------------------------------------------------------------
  统一的区块头形态：极光渐变光带（var(--deco)，签名装饰）
  + 玻璃小胶囊 eyebrow + 大号标题。各内容区块复用，
  保证「磨砂板上的发光排版」这一签名一致。
-->
<template>
  <div class="sec-head">
    <span class="glow-rule" aria-hidden="true"/>
    <p class="eyebrow">{{ eyebrow }}</p>
    <h2 class="title">{{ title }}</h2>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 眉题（小胶囊文案，来自 i18n） */
  eyebrow: string
  /** 区块主标题（来自 i18n） */
  title: string
}>()
</script>

<style scoped>
.sec-head {
  margin-bottom: calc(var(--space) * 0.9);
}

/* 签名光带：极光渐变 + 彩色 Glow */
.glow-rule {
  display: block;
  width: 72px;
  height: 4px;
  margin-bottom: 16px;
  background: var(--deco);
  border-radius: 999px;
  box-shadow: 0 0 18px rgb(139 92 246 / 0.5);
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  margin: 0 0 10px;
  padding: 5px 14px;
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--c-accent);
  background: rgb(255 255 255 / 0.5);
  border: var(--border-w) solid rgb(255 255 255 / 0.7);
  border-radius: 999px;
}

.title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(24px, 3.6vw, var(--fs-head));
  font-weight: 800;
  line-height: 1.2;
  color: var(--c-text);
  overflow-wrap: break-word;
}
</style>
