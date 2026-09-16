<!--
  ClaymorphismEmptyState - claymorphism 风格空状态
  ------------------------------------------------------------
  列表为空时的提示：一颗呆萌的黏土小球（眼睛与嘴均为纯 CSS
  伪元素）+ 文案 + 可选提示语。不做留白。
-->
<template>
  <div class="empty">
    <!-- 呆萌黏土小球（纯 CSS） -->
    <span class="ball" aria-hidden="true"/>
    <p class="message">{{ message }}</p>
    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 空状态主文案（i18n） */
  message: string
  /** 空状态提示语（可选，i18n） */
  hint?: string
}>()
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: var(--space) var(--gap);
  text-align: center;
}

/* 呆萌黏土小球：径向高光 + 内底影 + 眼睛嘴巴 */
.ball {
  position: relative;
  display: block;
  width: 64px;
  height: 64px;
  background: var(--deco), #e2d4ff;
  border-radius: 50%;
  box-shadow:
    0 10px 18px rgb(140 100 200 / 0.35),
    inset 0 -6px 10px rgb(120 80 185 / 0.25);
}

/* 眼睛：两颗小深点 */
.ball::before {
  position: absolute;
  top: 26px;
  left: 18px;
  width: 7px;
  height: 9px;
  content: '';
  background: #4c2689;
  border-radius: 50%;
  box-shadow: 21px 0 0 #4c2689;
}

/* 嘴：小弧（下凹半圆） */
.ball::after {
  position: absolute;
  bottom: 13px;
  left: 50%;
  width: 14px;
  height: 7px;
  content: '';
  background: #4c2689;
  border-radius: 0 0 14px 14px;
  transform: translateX(-50%);
}

.message {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
}

.hint {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}
</style>
