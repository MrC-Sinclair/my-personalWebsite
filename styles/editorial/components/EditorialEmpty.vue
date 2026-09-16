<!--
  EditorialEmpty - editorial 风格的空状态
  ------------------------------------------------------------
  列表无数据时的「杂志补白页」：大号衬线节符（§）+ 说明
  文案 + 提示小字，上下以 hairline 细线围合，像杂志排版中
  的空白栏目占位。文案全部来自 i18n（由父组件传入）。
-->
<template>
  <div class="empty" role="status">
    <span class="glyph" aria-hidden="true">§</span>
    <p class="msg">{{ message }}</p>
    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 空状态说明文案（i18n） */
  message: string
  /** 空状态提示文案（i18n，可选） */
  hint?: string
}>()
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: clamp(40px, 7vw, 80px) var(--space);
  border-top: var(--border-w) solid var(--c-border);
  border-bottom: var(--border-w) solid var(--c-border);
  text-align: center;
}

/* 节符：杂志补白的装饰性铅字 */
.glyph {
  font-family: var(--font-head);
  font-size: clamp(40px, 6vw, 64px);
  line-height: 1;
  color: var(--c-accent);
}

.msg {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(19px, 2.4vw, 24px);
  line-height: 1.5;
  color: var(--c-text);
}

.hint {
  margin: 0;
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
  color: var(--c-muted);
}
</style>
