<!--
  Soft3DSiteFooter - soft-3d 风格页脚
  ------------------------------------------------------------
  一块沉在页面底部的「底座」：版权 / 作者 / 构建声明。
  顶部用受光边收边，文案全部来自 i18n（不使用 Date.now，
  规避 SSR / 客户端年份不一致）。
-->
<template>
  <footer class="foot">
    <div class="foot-inner">
      <p class="foot-line">{{ t('footer.copyright') }} · {{ t('footer.author') }}</p>
      <p class="foot-built">{{ t('footer.builtWith') }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.foot {
  position: relative;
  z-index: 1;
  margin-top: calc(var(--space) * 1.5);
  padding: var(--space) var(--gap) calc(var(--space) + env(safe-area-inset-bottom));
  background: color-mix(in srgb, var(--c-bg) 62%, transparent);
  border-top: var(--border-w) solid var(--c-border);
  box-shadow: inset 0 2px 4px rgb(255 255 255 / 0.08);
}

.foot-inner {
  max-width: var(--page-w);
  margin: 0 auto;
  text-align: center;
}

.foot-line {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.foot-built {
  margin: 4px 0 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: color-mix(in srgb, var(--c-accent) 78%, var(--c-text));
}
</style>
