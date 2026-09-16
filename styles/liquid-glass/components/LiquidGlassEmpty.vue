<!--
  LiquidGlassEmpty - liquid-glass 风格的空状态提示
  ------------------------------------------------------------
  列表为空时的玻璃空态：悬浮的磨砂圆片（字符装饰）+ 提示
  主文案 + 可选次文案，禁止留白。数据防御分支使用。
-->
<template>
  <div class="empty">
    <span class="disc" aria-hidden="true">◇</span>
    <p class="message">{{ message }}</p>
    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 空态主文案 */
  message: string
  /** 可选的次级提示文案 */
  hint?: string
}>()
</script>

<style scoped>
.empty {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: clamp(28px, 5vw, 48px) var(--space);
  text-align: center;
}

/* 磨砂圆片：半透玻璃圆 + 字符装饰 */
.disc {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  font-size: 26px;
  color: var(--c-accent);
  background: linear-gradient(160deg, rgb(255 255 255 / 0.12), rgb(255 255 255 / 0.03));
  border: var(--border-w) solid var(--c-border);
  border-radius: 50%;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.35),
    0 10px 24px rgb(4 2 18 / 0.3);
}

.message {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-text);
}

.hint {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}
</style>
