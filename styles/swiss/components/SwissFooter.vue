<!--
  SwissFooter - swiss 风格页脚
  ------------------------------------------------------------
  黑底反白的收尾色块（与白底正文形成最强对比，瑞士海报的
  经典收尾）：左侧版权与作者，中间「构建于 Nuxt」，右侧
  「回到顶部」锚点链接。链接反馈：强调色粗下划线生长
  （深底上红仅作装饰线，文字保持白色以满足对比度）。
-->
<template>
  <footer class="foot">
    <div class="foot-inner">
      <p class="foot-copy">© {{ t('footer.author') }} · {{ t('footer.copyright') }}</p>
      <p class="foot-built">{{ t('footer.builtWith') }}</p>
      <a class="foot-top" href="#top">
        {{ t('common.backToTop') }}
        <span class="top-arrow" aria-hidden="true">↑</span>
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
/* 黑底反白：正文的反转色块 */
.foot {
  background: var(--c-text);
  color: var(--c-bg);
}

.foot-inner {
  display: grid;
  gap: 10px;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: calc(var(--space) * 0.9) clamp(20px, 5vw, 64px);
}

.foot-copy,
.foot-built {
  margin: 0;
  font-size: 14px;
  letter-spacing: 0.06em;
}

.foot-built {
  color: color-mix(in srgb, var(--c-bg) 72%, var(--c-text));
}

/* 回到顶部：白字 + 强调色下划线生长（装饰线不影响文字对比度） */
.foot-top {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-self: start;
  min-height: 44px;
  font-size: 14px;
  font-weight: 700;
  color: var(--c-bg);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 3px;
  transition: background-size var(--transition);
}

.foot-top:hover,
.foot-top:focus-visible {
  background-size: 100% 3px;
}

.top-arrow {
  color: var(--c-accent);
  transition: transform var(--transition);
}

.foot-top:hover .top-arrow {
  transform: translateY(-3px);
}

/* —— 桌面端：三栏非对称 —— */
@media (min-width: 768px) {
  .foot-inner {
    grid-template-columns: 2fr 2fr 1fr;
    align-items: center;
  }

  .foot-top {
    justify-self: end;
  }
}

@media (prefers-reduced-motion: reduce) {
  .foot-top,
  .top-arrow {
    transition: none;
  }
}
</style>
