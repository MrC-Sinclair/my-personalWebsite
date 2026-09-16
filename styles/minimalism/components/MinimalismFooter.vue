<!--
  MinimalismFooter - minimalism 风格页脚
  ------------------------------------------------------------
  极简页脚：一条 hairline 细线之下，版权 + 构建说明 + 风格
  画廊入口（localePath 包裹）三行排开，无任何装饰元素。
  safe-bottom 适配刘海屏安全区域。
-->
<template>
  <footer class="ft safe-bottom">
    <div class="ft-inner">
      <p class="ft-line">{{ t('footer.copyright') }} © {{ t('footer.author') }}</p>
      <p class="ft-line ft-muted">{{ t('footer.builtWith') }}</p>
      <NuxtLink class="ft-gallery" :to="localePath('/styles')">
        {{ t('styles.gallery.title') }}
      </NuxtLink>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* —— 页脚：hairline 上边线 + 安静的三行 —— */
.ft {
  border-top: var(--border-w) solid var(--c-border);
}

.ft-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 24px;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 24px var(--space) 32px;
}

.ft-line {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.ft-muted {
  font-size: var(--fs-small);
}

/* —— 风格画廊入口：与头部同一枚胶囊语法，首尾呼应 —— */
.ft-gallery {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 16px;
  font-size: var(--fs-small);
  color: var(--c-text);
  text-decoration: none;
  border: var(--border-w) solid var(--c-border);
  border-radius: 999px;
  transition:
    color var(--transition),
    border-color var(--transition),
    background var(--transition);
}

.ft-gallery:hover {
  color: var(--c-accent);
  border-color: var(--c-accent);
  background: var(--c-surface);
}

.ft-gallery:active {
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .ft-gallery {
    transition: none;
  }

  .ft-gallery:active {
    transform: none;
  }
}
</style>
