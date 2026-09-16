<!--
  FlatDesignEmpty - 扁平化风格空状态
  ------------------------------------------------------------
  几何图形（描边圆 + 内嵌三角）代替插图：纯色 + 文案的极简
  空状态，用于列表为空时的提示（不留白）。
-->
<template>
  <div class="empty" role="status">
    <span class="empty__mark" aria-hidden="true"/>
    <p class="empty__msg">{{ message }}</p>
    <p v-if="hint" class="empty__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 空状态提示文案 */
  message: string
  /** 可选补充提示 */
  hint?: string
}>()
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: clamp(32px, 6vw, 56px) 16px;
  text-align: center;
  border: 2px dashed var(--c-border);
  border-radius: var(--radius);
}

/* 几何标识：描边圆内嵌一个三角，颜色全部来自契约变量 */
.empty__mark {
  position: relative;
  width: 72px;
  height: 72px;
  margin-bottom: 10px;
  border: 6px solid var(--c-border);
  border-radius: 50%;
}

.empty__mark::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 16px solid var(--c-muted);
  transform: translate(-50%, -58%);
}

.empty__msg {
  margin: 0;
  font-family: var(--font-head);
  font-size: 16px;
  font-weight: 700;
  color: var(--c-text);
}

.empty__hint {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}
</style>
