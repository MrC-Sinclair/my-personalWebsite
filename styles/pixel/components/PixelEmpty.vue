<!--
  PixelEmpty - pixel 风格空状态
  ------------------------------------------------------------
  列表为空时的「宝箱是空的」提示块：像素砖块字符画 + i18n
  文案（+ 可选补充提示）。纯静态装饰，无任何动画。
-->
<template>
  <div class="empty" role="status">
    <p class="empty-art" aria-hidden="true">▓▒░ · · · ░▒▓</p>
    <p class="empty-msg">{{ message }}</p>
    <p v-if="hint" class="empty-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 空状态主文案（i18n） */
  message: string
  /** 空状态补充提示（i18n，可选） */
  hint?: string
}>()
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 16px;
  background: color-mix(in srgb, var(--c-bg) 55%, var(--c-surface));
  border: 2px solid color-mix(in srgb, var(--c-muted) 45%, transparent);
  text-align: center;
}

.empty-art {
  margin: 0;
  font-size: var(--fs-small);
  letter-spacing: 0.2em;
  color: var(--c-accent-2);
}

.empty-msg {
  margin: 0;
  font-weight: 700;
  color: var(--c-text);
}

.empty-hint {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}
</style>
