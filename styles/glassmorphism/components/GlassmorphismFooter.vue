<!--
  GlassmorphismFooter - glassmorphism 风格页脚
  ------------------------------------------------------------
  一条磨砂玻璃页脚条：版权 + 作者 + 技术栈说明 + 回到顶部
  （原生锚点 #top）。文案全部来自 i18n（footer.*）。
-->
<template>
  <footer class="footer">
    <div class="footer-glass">
      <p class="footer-copy">
        © {{ t('footer.copyright') }} · {{ t('footer.author') }} · {{ t('footer.builtWith') }}
      </p>
      <a class="back-top" href="#top">
        {{ t('common.backToTop') }}<span class="top-arrow" aria-hidden="true">↑</span>
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.footer {
  padding: var(--space) 0 calc(var(--space) + env(safe-area-inset-bottom, 0px));
}

/* 页脚玻璃条 */
.footer-glass {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px;
  background: rgb(255 255 255 / 0.4);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
  border: var(--border-w) solid rgb(255 255 255 / 0.55);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.footer-copy {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* 回到顶部：玻璃药丸（触控目标 ≥ 40px） */
.back-top {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 6px 16px;
  font-size: var(--fs-small);
  font-weight: 700;
  text-decoration: none;
  color: var(--c-accent);
  background: rgb(255 255 255 / 0.55);
  border: var(--border-w) solid rgb(255 255 255 / 0.7);
  border-radius: 999px;
  transition:
    transform var(--transition),
    background var(--transition),
    box-shadow var(--transition);
}

.back-top:hover {
  transform: translateY(-2px);
  background: rgb(255 255 255 / 0.85);
  box-shadow: 0 8px 18px rgb(31 38 135 / 0.16);
}

.back-top:active {
  transform: var(--press-transform);
}

.top-arrow {
  font-family: var(--font-mono);
}

@media (prefers-reduced-motion: reduce) {
  .back-top {
    transition: none;
  }

  .back-top:hover,
  .back-top:active {
    transform: none;
  }
}
</style>
