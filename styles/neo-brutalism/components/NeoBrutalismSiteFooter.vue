<!--
  NeoBrutalismSiteFooter - neo-brutalism 风格页脚
  ------------------------------------------------------------
  与联系看板同色的黑幕收尾：顶部一条海报黄粗杠分隔，
  左侧版权与作者、中间构建信息，右侧风格画廊入口与
  「回到顶部」锚点按钮；底部一行描边空心大字作海报落款。
  safe-bottom 适配刘海屏安全区域。
-->
<template>
  <footer class="foot safe-bottom">
    <p class="giant" aria-hidden="true">{{ t('home.name') }}</p>

    <div class="row">
      <p class="item">
        <span class="dot" aria-hidden="true"/>
        {{ t('footer.copyright') }} © {{ t('footer.author') }}
      </p>
      <p class="item">{{ t('footer.builtWith') }}</p>
      <div class="actions">
        <NuxtLink class="chip is-fill" :to="localePath('/styles')">
          {{ t('styles.gallery.title') }}
        </NuxtLink>
        <a class="chip" href="#hero">{{ t('common.backToTop') }}</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
.foot {
  overflow: hidden;
  padding: 40px var(--space) 32px;
  background: var(--c-text);
  color: var(--c-bg);
  border-top: calc(var(--border-w) * 2) solid var(--c-accent);
}

/* —— 描边空心落款大字 —— */
.giant {
  margin: 0 0 28px;
  font-family: var(--font-head);
  font-size: clamp(44px, 9vw, 120px);
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: transparent;
  white-space: nowrap;
  -webkit-text-stroke: 2px var(--c-bg);
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap);
  max-width: var(--page-w);
  margin: 0 auto;
}

.item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.06em;
}

/* 装饰小方块（海报黄） */
.dot {
  flex: none;
  width: 10px;
  height: 10px;
  background: var(--c-accent);
}

.actions {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* —— 按钮：黄实心 / 黑描边两种 —— */
.chip {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 10px 16px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--c-bg);
  border: var(--border-w) solid var(--c-bg);
  transition:
    color var(--transition),
    background var(--transition),
    border-color var(--transition),
    transform var(--transition),
    box-shadow var(--transition);
}

.chip.is-fill {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.chip:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.chip:active {
  transform: var(--press-transform);
}

.chip:focus-visible {
  outline: var(--border-w) solid var(--c-accent-2);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .foot {
    padding: 32px 16px 24px;
  }

  .giant {
    margin-bottom: 20px;
  }

  .row {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chip {
    transition: none;
  }

  .chip:active {
    transform: none;
  }
}
</style>
