<!--
  ClaymorphismFooter - claymorphism 风格页脚
  ------------------------------------------------------------
  一大块圆滚滚的黏土页脚：品牌小球 + 版权 / 作者 + 构建
  信息 + 风格画廊入口 + 回到顶部胶囊。safe-bottom 适配
  刘海屏安全区域。
-->
<template>
  <footer class="footer safe-bottom">
    <div class="footer-inner">
      <div class="brand-row">
        <span class="brand-ball" aria-hidden="true"/>
        <p class="copyright">
          {{ t('footer.copyright') }} © {{ t('footer.author') }}
        </p>
      </div>

      <div class="link-row">
        <p class="built">{{ t('footer.builtWith') }}</p>
        <NuxtLink class="gallery" :to="localePath('/styles')">
          {{ t('styles.gallery.title') }}
        </NuxtLink>
        <NuxtLink class="top-pill" :to="{ hash: '#top' }">
          ↑ {{ t('common.backToTop') }}
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* 黏土页脚：大圆角厚板 */
.footer {
  padding: 0 var(--gap) var(--space);
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px var(--gap);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 20px 26px;
  background: var(--c-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.brand-row {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

/* 品牌小球（与导航同款 3D 图标感） */
.brand-ball {
  width: 30px;
  height: 30px;
  background: var(--deco), var(--c-accent);
  border-radius: 50%;
  box-shadow:
    0 5px 9px rgb(125 63 201 / 0.35),
    inset 0 -4px 7px rgb(90 40 150 / 0.25);
}

.copyright {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
}

.link-row {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px var(--gap);
}

.built {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* 画廊入口：粉黏土胶囊 */
.gallery {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 18px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: #8c2f60;
  text-decoration: none;
  background: #ffd7e8;
  border-radius: 999px;
  box-shadow:
    0 8px 14px rgb(215 100 150 / 0.3),
    inset 0 5px 9px rgb(255 255 255 / 0.75),
    inset 0 -5px 8px rgb(215 100 150 / 0.22);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.gallery:hover {
  transform: translateY(-2px);
}

.gallery:active {
  transform: var(--press-transform);
}

/* 回到顶部：紫黏土胶囊 */
.top-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 6px 18px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-on-accent);
  text-decoration: none;
  background: var(--c-accent);
  border-radius: 999px;
  box-shadow:
    0 8px 14px rgb(125 63 201 / 0.32),
    inset 0 4px 7px rgb(255 255 255 / 0.4),
    inset 0 -4px 6px rgb(90 40 150 / 0.25);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.top-pill:hover {
  transform: translateY(-2px);
}

.top-pill:active {
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .gallery,
  .top-pill {
    transition: none;
  }

  .gallery:hover,
  .gallery:active,
  .top-pill:hover,
  .top-pill:active {
    transform: none;
  }
}
</style>
