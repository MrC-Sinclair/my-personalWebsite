<!--
  Web2GlossySiteFooter - Web 2.0 光泽风格的站点页脚
  ------------------------------------------------------------
  深蓝渐变色带页脚：白色光泽文字 + 凝胶「回到顶部」按钮。
  底部适配刘海屏安全区域（env(safe-area-inset-bottom)）。
  不显示年份（避免 SSR/客户端日期不一致导致水合风险）。
-->
<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__brand">
        <span class="site-footer__logo" aria-hidden="true">{{ logoInitial }}</span>
        <span class="site-footer__name">{{ t('home.name') }}</span>
      </div>

      <p class="site-footer__meta">© {{ t('footer.copyright') }} · {{ t('footer.author') }}</p>
      <p class="site-footer__meta">{{ t('footer.builtWith') }}</p>

      <Web2GlossyGelButton href="#top" variant="ghost" class="site-footer__top">
        {{ t('common.backToTop') }}
      </Web2GlossyGelButton>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * @file Web 2.0 光泽风格的站点页脚组件
 * @description 版权与构建信息文案全部走 i18n；回到顶部按钮指向页首锚点 #top。
 */
// styles/ 下组件不走自动导入，引用同风格组件必须显式 import
import Web2GlossyGelButton from './Web2GlossyGelButton.vue'

const { t } = useI18n()

/** 页脚字母牌取站名首字符 */
const logoInitial = computed(() => t('home.name').charAt(0))
</script>

<style scoped>
/* —— 深蓝渐变色带 —— */
.site-footer {
  border-top: 2px solid rgb(255 255 255 / 0.4);
  background: linear-gradient(180deg, #174a8f 0%, #123c6e 62%, #0e3159 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.18);
}

.site-footer__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: var(--page-w);
  margin-inline: auto;
  padding: 36px clamp(16px, 4vw, 32px) calc(30px + env(safe-area-inset-bottom));
  text-align: center;
}

/* —— 品牌区 —— */
.site-footer__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.site-footer__logo {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.4);
  border-radius: 11px;
  color: #ffffff;
  font-family: var(--font-head);
  font-size: 18px;
  font-weight: 800;
  text-shadow: 0 1px 1px rgb(9 34 64 / 0.6);
  background: linear-gradient(180deg, #4f9cf0 0%, #2b72c6 52%, #1d5fae 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.5),
    0 2px 6px rgb(9 34 64 / 0.5);
}

/* 字母牌顶部高光 */
.site-footer__logo::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.5) 0%, rgb(255 255 255 / 0) 58%);
  pointer-events: none;
}

.site-footer__name {
  color: #ffffff;
  font-family: var(--font-head);
  font-size: 1.125rem;
  font-weight: 800;
  text-shadow: 0 1px 2px rgb(9 34 64 / 0.5);
}

/* —— 元信息 —— */
.site-footer__meta {
  margin: 0;
  color: rgb(232 242 253 / 0.88);
  font-size: var(--fs-small);
}

/* —— 回到顶部 —— */
.site-footer__top {
  margin-top: 8px;
}
</style>
