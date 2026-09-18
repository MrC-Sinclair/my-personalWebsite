<!--
  TerminalFooter - terminal 风格页脚状态行
  ------------------------------------------------------------
  仿终端/vim 底部状态行：左侧版权与构建信息（全部走 i18n 的
  footer.* key），右侧回顶部锚点链接（^ 命令样式，hover 反色）。
  含安全区域内边距适配刘海屏（不依赖过渡层全局工具类）。
-->
<template>
  <footer class="status">
    <p class="info">
      <span class="info-sep" aria-hidden="true">──&nbsp;</span>
      <span>{{ t('footer.copyright') }}&nbsp;{{ t('footer.author') }}</span>
      <span class="info-sep" aria-hidden="true">&nbsp;·&nbsp;</span>
      <span>{{ t('footer.builtWith') }}</span>
    </p>

    <a class="top" href="#top">
      <span class="top-cmd" aria-hidden="true">^&nbsp;</span>
      <span>{{ t('common.backToTop') }}</span>
    </a>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 16px;
  min-height: 44px;
  padding: 6px var(--space);
  padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
  background: var(--c-surface);
  border-top: var(--border-w) solid var(--c-border);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.info {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  margin: 0;
  min-width: 0;
  overflow-wrap: break-word;
}

.info-sep {
  color: var(--c-border);
}

/* 回顶部：^ 命令样式，hover 磷光绿反色（瞬时） */
.top {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 10px;
  margin-left: auto;
  color: var(--c-muted);
  text-decoration: none;
  border: var(--border-w) solid transparent;
}

.top:hover {
  color: var(--c-on-accent);
  background: var(--c-text);
  border-color: var(--c-text);
}

.top:active {
  transform: var(--press-transform);
}

.top:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}
</style>
