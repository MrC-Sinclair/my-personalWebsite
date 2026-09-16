<!--
  FlatDesignFooter - 扁平化风格页脚
  ------------------------------------------------------------
  深色纯色页脚：顶部向日葵黄几何色条 + 版权 / 构建信息 +
  回页首锚点。文案全部来自 i18n，交互反馈只有颜色变化。
-->
<template>
  <footer class="ftr">
    <div class="ftr__inner">
      <div class="ftr__brand">
        <span class="ftr__mark" aria-hidden="true"/>
        <p class="ftr__copy">© {{ t('footer.copyright') }} {{ t('footer.author') }}</p>
      </div>

      <p class="ftr__built">{{ t('footer.builtWith') }}</p>

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
  background: #24313f;
  border-top: 6px solid var(--deco);
  color: #ffffff;
}

.ftr__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px clamp(16px, 4vw, 40px);
  max-width: var(--page-w);
  margin-inline: auto;
  padding: 26px clamp(16px, 4vw, 40px);
}

.ftr__brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ftr__mark {
  width: 12px;
  height: 12px;
  background: var(--deco);
  border-radius: var(--radius-sm);
}

.ftr__copy {
  margin: 0;
  font-size: var(--fs-small);
  color: rgb(255 255 255 / 0.82);
}

.ftr__built {
  margin: 0;
  font-size: var(--fs-small);
  letter-spacing: 0.06em;
  color: rgb(255 255 255 / 0.6);
}

/* 回页首：浅白文字 hover 提亮，触控目标 ≥ 40px */
.ftr__top {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 12px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgb(255 255 255 / 0.82);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition:
    color var(--transition),
    background var(--transition);
}

.ftr__top:hover {
  color: #ffffff;
  background: rgb(255 255 255 / 0.12);
}

.ftr__top:focus-visible {
  outline: 3px solid var(--deco);
  outline-offset: 2px;
}

/* 窄屏：三段纵向堆叠 */
@media (max-width: 640px) {
  .ftr__inner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
