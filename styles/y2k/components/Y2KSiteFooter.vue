<!--
  Y2KSiteFooter - y2k 风格页脚
  ------------------------------------------------------------
  铬边「金属底座」页脚：顶部彩虹棱线 + 版权/作者 + 构建说明 +
  回到顶部链接（回 #top 锚点）。文案全部走 i18n。
-->
<template>
  <footer class="ft">
    <span class="ft-rainbow" aria-hidden="true" />
    <div class="ft-inner">
      <p class="ft-copy">
        <span class="ft-orb" aria-hidden="true" />
        © {{ t('footer.author') }} · {{ t('footer.copyright') }}
      </p>
      <p class="ft-built">{{ t('footer.builtWith') }}</p>
      <a class="ft-top" href="#top">
        {{ t('common.backToTop') }}
        <span class="ft-top-arrow" aria-hidden="true">▲</span>
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * @file Y2K 风格的页脚组件
 * @description 彩虹棱线 + 版权信息 + 回顶锚点的金属底座页脚。
 */
const { t } = useI18n()
</script>

<style scoped>
.ft {
  position: relative;
  z-index: 1;
  margin-top: calc(var(--space) * 2);
}

/* 顶部彩虹棱线 */
.ft-rainbow {
  position: absolute;
  inset: 0 0 auto 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgb(255 92 225 / 0.75) 20%,
    rgb(139 123 255 / 0.9) 50%,
    rgb(69 227 255 / 0.75) 80%,
    transparent 100%
  );
}

.ft-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: min(100% - 2 * var(--space), var(--page-w));
  min-height: 72px;
  margin-inline: auto;
  padding-block: var(--gap);
}

.ft-copy {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* 迷你铬球标识 */
.ft-orb {
  flex: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(120% 120% at 32% 26%, #ffffff 0%, #aeb9e8 44%, #4a569e 100%);
  box-shadow: 0 0 8px rgb(139 123 255 / 0.6);
}

.ft-built {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
  color: var(--c-muted);
}

/* 回到顶部：铬胶囊 */
.ft-top {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 18px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-text);
  text-decoration: none;
  border: var(--border-w) solid rgb(200 210 255 / 0.45);
  border-radius: 999px;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.16) 0%, rgb(255 255 255 / 0.04) 100%);
  transition:
    box-shadow var(--transition),
    border-color var(--transition),
    transform var(--transition);
}

.ft-top:hover {
  border-color: rgb(255 255 255 / 0.75);
  box-shadow: 0 0 16px rgb(139 123 255 / 0.5);
}

.ft-top:active {
  transform: var(--press-transform);
}

.ft-top-arrow {
  color: var(--c-accent);
  font-size: 11px;
}

@media (prefers-reduced-motion: reduce) {
  .ft-top {
    transition: none;
  }

  .ft-top:active {
    transform: none;
  }
}
</style>
