<!--
  NeumorphismFooter - neumorphism 风格页脚
  ------------------------------------------------------------
  压进材料里的凹槽条：版权 + 作者 + 构建信息 + 风格画廊入口，
  右侧为凸起圆形「回到顶部」按钮（原生锚点 #top，按下凹进）。
  底部适配刘海屏安全区域；呼吸圆点为装饰动画（reduced-motion
  下关闭）。
-->
<template>
  <footer class="footer">
    <div class="footer-inner">
      <p class="footer-line">
        <span class="footer-dot" aria-hidden="true"/>
        {{ t('footer.copyright') }} © {{ t('footer.author') }}
      </p>

      <p class="footer-built">{{ t('footer.builtWith') }}</p>

      <div class="footer-actions">
        <NuxtLink class="footer-gallery" :to="localePath('/styles')">
          {{ t('styles.gallery.title') }}
        </NuxtLink>

        <a class="to-top" href="#top" :aria-label="t('common.backToTop')">
          <span aria-hidden="true">↑</span>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
.footer {
  padding: 8px max(18px, env(safe-area-inset-right)) calc(28px + env(safe-area-inset-bottom))
    max(18px, env(safe-area-inset-left));
}

/* —— 凹槽条：整条压进材料里 —— */
.footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 18px 26px;
  background: var(--c-bg);
  border-radius: var(--radius);
  box-shadow: inset 4px 4px 10px #a3b1c6, inset -4px -4px 10px #ffffff;
}

.footer-line {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-text);
}

/* 呼吸圆点（装饰） */
.footer-dot {
  flex: none;
  width: 8px;
  height: 8px;
  background: var(--deco);
  border-radius: 50%;
  box-shadow: 1px 1px 3px #a3b1c6;
  animation: dot-pulse 2.4s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

.footer-built {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.footer-actions {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}

/* 画廊入口：文字凸起小件 */
.footer-gallery {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 14px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-accent);
  text-decoration: none;
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: 3px 3px 7px #a3b1c6, -3px -3px 7px #ffffff;
  transition:
    box-shadow var(--transition),
    color var(--transition);
}

.footer-gallery:hover {
  color: var(--c-text);
  box-shadow: 5px 5px 10px #a3b1c6, -5px -5px 10px #ffffff;
}

.footer-gallery:active {
  color: var(--c-accent);
  box-shadow: var(--shadow-press);
}

.footer-gallery:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

/* —— 回到顶部：凸起圆形按钮 —— */
.to-top {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 18px;
  font-weight: 700;
  color: var(--c-accent);
  text-decoration: none;
  background: var(--c-bg);
  border-radius: 50%;
  box-shadow: 5px 5px 10px #a3b1c6, -5px -5px 10px #ffffff;
  transition:
    box-shadow var(--transition),
    color var(--transition);
}

.to-top:hover {
  color: var(--c-text);
  box-shadow: 6px 6px 13px #a3b1c6, -6px -6px 13px #ffffff;
}

.to-top:active {
  color: var(--c-accent);
  box-shadow: var(--shadow-press);
}

.to-top:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .footer-inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer-dot {
    animation: none;
  }

  .footer-gallery,
  .to-top {
    transition: none;
  }
}
</style>
