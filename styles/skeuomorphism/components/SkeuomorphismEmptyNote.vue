<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismEmptyNote - 拟物风格空状态便签
  ------------------------------------------------------------
  一张「空白的横线便签」：米白纸面 + 淡横线 + 回形针装饰，
  用于列表/卡片为空或加载失败时的提示（图标 + 文案，不留白）。
-->
<template>
  <p class="empty" role="status">
    <span class="clip" aria-hidden="true" />
    <span class="empty-text">
      <span class="empty-msg">{{ message }}</span>
      <span v-if="hint" class="empty-hint">{{ hint }}</span>
    </span>
  </p>
</template>

<script setup lang="ts">
/**
 * @file 拟物风格的空状态便签组件
 * @description 空白横线便签 + 回形针：数据为空时的提示，不留白。
 */
withDefaults(
  defineProps<{
    /** 空状态主提示文案 */
    message: string
    /** 可选的补充提示文案 */
    hint?: string
  }>(),
  {
    hint: '',
  },
)
</script>

<style scoped>
.empty {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0;
  padding: var(--space) var(--space) var(--space) 58px;
  border: 1px solid rgb(0 0 0 / 0.4);
  border-radius: var(--radius-sm);
  /* 空白横线便签：淡横线 + 纸色渐变 */
  background:
    repeating-linear-gradient(
      transparent 0 27px,
      rgb(109 83 53 / 0.12) 27px 28px
    ),
    linear-gradient(178deg, #f6efdd 0%, #eee3c9 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.8),
    0 6px 12px rgb(10 4 0 / 0.4);
}

.empty-text {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.empty-msg {
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
}

.empty-hint {
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* —— 回形针（纯 CSS：两个圆角矩形环） —— */
.clip {
  position: absolute;
  top: 14px;
  left: 18px;
  width: 14px;
  height: 34px;
  border: 2px solid #9a8562;
  border-radius: 8px;
  box-shadow:
    inset 0 1px 1px rgb(255 255 255 / 0.5),
    0 1px 2px rgb(10 4 0 / 0.35);
}

.clip::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 2px;
  width: 6px;
  height: 18px;
  border: 2px solid #9a8562;
  border-radius: 4px;
  border-top: none;
}
</style>
