<!--
  DashboardEmptyState - dashboard 风格空状态占位
  ------------------------------------------------------------
  图表 / 表格无数据时的占位块：虚线边框 + 等宽小字提示。
  role="status" 让读屏软件可感知。
-->
<template>
  <div class="empty" role="status">
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
  justify-content: center;
  gap: 4px;
  min-height: 96px;
  padding: var(--space);
  text-align: center;
  border: var(--border-w) dashed var(--c-border);
  border-radius: var(--radius-sm);
}

.empty-msg {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-base);
  color: var(--c-text);
}

.empty-hint {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}
</style>
