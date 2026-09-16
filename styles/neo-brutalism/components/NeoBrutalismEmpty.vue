<!--
  NeoBrutalismEmpty - neo-brutalism 风格空状态提示
  ------------------------------------------------------------
  列表为空时的占位：虚线粗框「未盖章」的空托盘 + 斜纹方块
  （--deco 图案）+ 粗重提示语。绝不留白。
-->
<template>
  <div class="empty" role="status">
    <span class="stamp" aria-hidden="true"/>
    <p class="message">{{ message }}</p>
    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 空状态提示语（i18n） */
  message: string
  /** 补充说明（可选，i18n） */
  hint?: string
}>()
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px var(--space);
  text-align: center;
  border: var(--border-w) dashed var(--c-border);
  background: var(--c-surface);
}

/* 斜纹方块：未盖章的空托盘记号 */
.stamp {
  width: 48px;
  height: 48px;
  background: var(--deco);
  border: var(--border-w) solid var(--c-border);
  transform: rotate(-6deg);
}

.message {
  margin: 0;
  font-family: var(--font-head);
  font-size: 18px;
  font-weight: 900;
}

.hint {
  margin: 0;
  font-size: 14px;
  color: var(--c-muted);
}
</style>
