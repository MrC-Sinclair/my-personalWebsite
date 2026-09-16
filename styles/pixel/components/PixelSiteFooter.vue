<!--
  PixelSiteFooter - pixel 风格页脚
  ------------------------------------------------------------
  游戏结束画面式信息条：版权 + 作者 + 构建说明 + 回到顶部
  （原生锚点，hover 色块反转）。底部安全区域适配刘海屏
  （env(safe-area-inset-bottom)）。
-->
<template>
  <footer class="ftr">
    <div class="ftr-inner">
      <p class="ftr-text">© {{ t('footer.copyright') }} {{ t('footer.author') }}</p>
      <p class="ftr-text ftr-text--muted">
        <span aria-hidden="true">★ </span>{{ t('footer.builtWith') }}
      </p>
      <a href="#top" class="ftr-top">
        {{ t('common.backToTop') }}<span aria-hidden="true"> ▲</span>
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.ftr {
  background: var(--c-surface);
  border-top: var(--border-w) solid var(--c-border);
}

.ftr-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 24px;
  max-width: var(--page-w);
  margin-inline: auto;
  padding: 12px var(--space);
  /* 刘海屏安全区域 */
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.ftr-text {
  margin: 0;
  font-size: var(--fs-small);
  letter-spacing: 0.06em;
  color: var(--c-text);
}

.ftr-text--muted {
  color: var(--c-muted);
}

.ftr-top {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  margin-left: auto;
  padding: 0 10px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--c-accent);
  text-decoration: none;
  border: 2px solid transparent;
}

/* hover 色块反转：金黄底 + 深色字 */
.ftr-top:hover {
  background: var(--c-accent);
  color: var(--c-on-accent);
  border-color: var(--c-border);
}

.ftr-top:active {
  transform: var(--press-transform);
}

.ftr-top:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}
</style>
