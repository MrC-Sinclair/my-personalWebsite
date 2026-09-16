<!--
  EditorialColophon - editorial 风格的版权栏（页脚）
  ------------------------------------------------------------
  杂志末页的「版权页」：顶部印刷双规线之下，一行小字排开
  ——版权与作者 / 构建信息 / 风格画廊入口（localePath 包裹）
  与回到封面锚点。附 safe-bottom 适配刘海屏安全区域。
-->
<template>
  <footer class="colophon safe-bottom">
    <div class="inner">
      <div class="rule" aria-hidden="true"/>
      <div class="row">
        <p class="item">© {{ t('footer.copyright') }} · {{ t('footer.author') }}</p>
        <p class="item muted">{{ t('footer.builtWith') }}</p>
        <div class="links">
          <NuxtLink class="link" :to="localePath('/styles')">
            {{ t('styles.gallery.title') }}
          </NuxtLink>
          <a class="link" href="#home">
            {{ t('common.backToTop') }}<span class="up" aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
.colophon {
  --ink-strong: color-mix(in srgb, var(--c-text) 82%, transparent);
  --ink-soft: color-mix(in srgb, var(--c-text) 32%, transparent);
}

.inner {
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 0 var(--space) calc(var(--space) * 1.2);
}

/* 印刷双规线（与刊头/区块刊头同构） */
.rule {
  border-top: 3px solid var(--ink-strong);
}

.rule::after {
  display: block;
  height: 1px;
  margin-top: 2px;
  content: '';
  background: var(--ink-soft);
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px var(--gap);
  padding-top: 18px;
}

.item {
  margin: 0;
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
  color: var(--c-muted);
}

.item.muted {
  color: color-mix(in srgb, var(--c-muted) 78%, transparent);
}

.links {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px var(--gap);
}

/* 页脚链接：下划线划入 + 墨色转红 */
.link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: var(--c-text);
  text-decoration: none;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 1px;
  transition:
    color var(--transition),
    background-size var(--transition);
}

.link:hover {
  color: var(--c-accent);
  background-size: 100% 1px;
}

.link:active {
  transform: var(--press-transform);
}

.up {
  font-family: var(--font-mono);
  transition: transform var(--transition);
}

.link:hover .up {
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .link,
  .up {
    transition: none;
  }

  .link:active,
  .link:hover .up {
    transform: none;
  }
}
</style>
