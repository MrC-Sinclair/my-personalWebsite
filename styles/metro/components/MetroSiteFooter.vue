<!--
  MetroSiteFooter - Metro 风格底部信息条
  ------------------------------------------------------------
  单行扁平信息条：版权 + 作者 + 构建说明 + 回到顶部（原生锚点）。
  底部安全区域适配刘海屏（env(safe-area-inset-bottom)）。
-->
<template>
  <footer class="ftr">
    <div class="ftr__inner">
      <p class="ftr__text">© {{ t('footer.copyright') }} {{ t('footer.author') }}</p>
      <p class="ftr__text ftr__text--muted">{{ t('footer.builtWith') }}</p>

      <a href="#top" class="ftr__top">
        {{ t('common.backToTop') }}
        <span aria-hidden="true">↑</span>
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.ftr {
  background: var(--c-bg);
  border-top: var(--border-w) solid var(--c-border);
}

.ftr__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 28px;
  max-width: var(--page-w);
  margin-inline: auto;
  padding: 12px clamp(16px, 4vw, 40px);
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.ftr__text {
  margin: 0;
  font-size: var(--fs-small);
  letter-spacing: 0.06em;
  color: var(--c-text);
}

.ftr__text--muted {
  color: var(--c-muted);
}

.ftr__top {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  margin-left: auto;
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: var(--c-muted);
  text-decoration: none;
  transition: color var(--transition);
}

.ftr__top:hover {
  color: var(--c-text);
}

.ftr__top:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}
</style>
