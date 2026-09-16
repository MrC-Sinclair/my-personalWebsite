<!--
  SciFiHudEmpty - sci-fi-hud 风格空状态
  ------------------------------------------------------------
  数据为空 / 筛选无结果时的占位：虚线目标框（未捕获目标
  语义）+ 提示文案（i18n），可选副提示。纯展示组件。
-->
<template>
  <div class="empty">
    <span class="reticle" aria-hidden="true"/>
    <p class="message">{{ message }}</p>
    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 空状态主提示（i18n 文案） */
  message: string
  /** 空状态副提示（可选） */
  hint?: string
}>()
</script>

<style scoped>
/* —— 空状态：虚线目标框 —— */
.empty {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: clamp(24px, 4vw, 40px) var(--space);
  text-align: center;
}

/* 虚线准星框 */
.reticle {
  position: relative;
  width: 44px;
  height: 44px;
  border: 1px dashed color-mix(in srgb, var(--c-accent) 55%, transparent);
}

.reticle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  background: color-mix(in srgb, var(--c-accent) 55%, transparent);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
}

.message {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  color: var(--c-text);
}

.hint {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}
</style>
