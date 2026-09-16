<!--
  EditorialMasthead - editorial 风格的刊头导航
  ------------------------------------------------------------
  杂志「刊头」吸顶导航：左侧站点标识（№ 记号 + 衬线站名，
  点击回封面），中部页内锚点（01–04 编号 + 无衬线小字，
  原生 <a href="#...">，全局已有平滑滚动与锚点偏移补偿），
  右侧「风格画廊」入口（localePath 包裹）。底部压印刷双规
  线；窄屏锚点行折行横滑（两端渐隐提示可滑）。
-->
<template>
  <header class="mast safe-top">
    <div class="inner">
      <a class="brand" href="#home">
        <span class="brand-mark" aria-hidden="true">№</span>
        <span class="brand-name">{{ t('home.name') }}</span>
      </a>

      <nav class="anchors-scroll" :aria-label="t('common.mobileNav')">
        <ul class="anchors">
          <li v-for="item in anchorItems" :key="item.href">
            <a class="anchor" :href="item.href">
              <span class="anchor-no" aria-hidden="true">{{ item.no }}</span>
              <span class="anchor-label">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <NuxtLink class="gallery" :to="localePath('/styles')">
        {{ t('styles.gallery.enter') }}
      </NuxtLink>
    </div>
    <div class="rule" aria-hidden="true"/>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

/** 页内锚点（编号 + i18n 文案，原生锚点跳转） */
const anchorItems = computed(() => [
  { no: '01', href: '#about', label: t('nav.about') },
  { no: '02', href: '#projects', label: t('nav.projects') },
  { no: '03', href: '#posts', label: t('nav.blog') },
  { no: '04', href: '#contact', label: t('nav.contact') },
])
</script>

<style scoped>
.mast {
  --ink-strong: color-mix(in srgb, var(--c-text) 82%, transparent);
  --ink-soft: color-mix(in srgb, var(--c-text) 32%, transparent);

  position: sticky;
  top: 0;
  z-index: 30;
  background: color-mix(in srgb, var(--c-bg) 90%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px var(--gap);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 10px var(--space);
}

/* 站点标识：№ 记号 + 衬线站名 */
.brand {
  display: inline-flex;
  flex: none;
  align-items: baseline;
  gap: 8px;
  min-height: 40px;
  color: var(--c-text);
  text-decoration: none;
  transition: color var(--transition);
}

.brand:hover {
  color: var(--c-accent);
}

.brand:active {
  transform: var(--press-transform);
}

.brand-mark {
  font-family: var(--font-head);
  font-size: 19px;
  font-style: italic;
  line-height: 1;
  color: var(--c-accent);
}

.brand-name {
  font-family: var(--font-head);
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* 锚点行：窄屏横向滚动 + 两端渐隐提示 */
.anchors-scroll {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  mask-image: linear-gradient(90deg, transparent, #000 10px, #000 calc(100% - 10px), transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 10px, #000 calc(100% - 10px), transparent);
}

.anchors-scroll::-webkit-scrollbar {
  display: none;
}

.anchors {
  display: flex;
  justify-content: flex-end;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 锚点：编号（红）+ 小字标签，悬停时下划线从左划入 */
.anchor {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 8px 13px;
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 13px 100%;
  background-size: 0% 1px;
  transition:
    color var(--transition),
    background-size var(--transition);
}

.anchor-no {
  font-family: var(--font-mono);
  color: var(--c-accent);
  letter-spacing: 0.14em;
}

.anchor:hover {
  color: var(--c-text);
  background-size: calc(100% - 26px) 1px;
}

.anchor:active {
  transform: var(--press-transform);
}

/* 画廊入口：印刷「铅字按钮」——直角描边框 */
.gallery {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 40px;
  margin-left: auto;
  padding: 8px 16px;
  font-size: var(--fs-small);
  letter-spacing: 0.12em;
  color: var(--c-text);
  text-decoration: none;
  white-space: nowrap;
  border: var(--border-w) solid var(--ink-strong);
  transition:
    color var(--transition),
    background var(--transition),
    border-color var(--transition);
}

.gallery:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.gallery:active {
  transform: var(--press-transform);
}

/* 底部印刷双规线（与区块刊头同构） */
.rule {
  border-top: 2px solid var(--ink-strong);
}

.rule::after {
  display: block;
  height: 1px;
  margin-top: 3px;
  content: '';
  background: var(--ink-soft);
}

/* 窄屏：锚点行折到第二行横滑，画廊入口贴右 */
@media (max-width: 820px) {
  .inner {
    padding-top: 6px;
    padding-bottom: 6px;
  }

  .anchors {
    justify-content: flex-start;
  }

  .anchors-scroll {
    flex-basis: 100%;
    order: 3;
  }

  .gallery {
    margin-left: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand,
  .anchor,
  .gallery {
    transition: none;
  }

  .brand:active,
  .anchor:active,
  .gallery:active {
    transform: none;
  }
}
</style>
