<!--
  NeoBrutalismTopBar - neo-brutalism 风格顶部导航条
  ------------------------------------------------------------
  吸顶导航：左侧黑底反白的站点标识（点击回站点首页），
  中部是页内锚点（原生 <a href="#id">，平滑滚动由全局 CSS 负责），
  右侧「风格画廊」入口（海报黄按钮）。
  窄屏时锚点横向滚动，触控目标全部 ≥ 40px。
-->
<template>
  <header class="topbar">
    <div class="topbar-inner">
      <NuxtLink class="brand" :to="localePath('/')">
        <span class="brand-mark" aria-hidden="true"/>
        {{ t('home.name') }}
      </NuxtLink>

      <nav class="anchors">
        <a v-for="item in anchors" :key="item.id" class="anchor" :href="`#${item.id}`">
          {{ item.label }}
        </a>
      </nav>

      <NuxtLink class="gallery-btn" :to="localePath('/styles')">
        {{ t('styles.gallery.enter') }}
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

/** 页内锚点清单（label 随语言更新） */
const anchors = computed(() => [
  { id: 'about', label: t('about.title') },
  { id: 'works', label: t('home.featuredProjects') },
  { id: 'posts', label: t('home.latestPosts') },
  { id: 'contact', label: t('nav.contact') },
])
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--c-bg);
  border-bottom: calc(var(--border-w) + 1px) solid var(--c-border);
}

.topbar-inner {
  display: flex;
  align-items: center;
  gap: var(--gap);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 10px var(--space);
}

/* —— 站点标识：黑底反白块，hover 时抬起 —— */
.brand {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 6px 12px;
  font-family: var(--font-head);
  font-size: 15px;
  font-weight: 900;
  color: var(--c-bg);
  text-decoration: none;
  text-transform: uppercase;
  background: var(--c-text);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.brand-mark {
  flex: none;
  width: 10px;
  height: 10px;
  background: var(--c-accent);
}

.brand:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--c-accent);
}

.brand:active {
  transform: var(--press-transform);
}

/* —— 页内锚点：等宽字标签，hover 时反白 —— */
.anchors {
  display: flex;
  flex: 1;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.anchors::-webkit-scrollbar {
  display: none;
}

.anchor {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 40px;
  padding: 8px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-text);
  text-decoration: none;
  border: var(--border-w) solid transparent;
  transition:
    background var(--transition),
    border-color var(--transition);
}

.anchor:hover {
  background: var(--c-accent);
  border-color: var(--c-border);
}

.anchor:active {
  transform: var(--press-transform);
}

/* —— 风格画廊入口：海报黄实心按钮 —— */
.gallery-btn {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 40px;
  padding: 8px 14px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 900;
  color: var(--c-on-accent);
  text-decoration: none;
  background: var(--c-accent);
  border: var(--border-w) solid var(--c-border);
  box-shadow: var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.gallery-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 8px 8px 0 var(--c-border);
}

.gallery-btn:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

/* —— 键盘焦点：电光蓝描边 —— */
.brand:focus-visible,
.anchor:focus-visible,
.gallery-btn:focus-visible {
  outline: var(--border-w) solid var(--c-accent-2);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .topbar-inner {
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 16px;
  }

  .anchors {
    order: 3;
    flex-basis: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand,
  .anchor,
  .gallery-btn {
    transition: none;
  }

  .brand:hover,
  .gallery-btn:hover {
    transform: none;
  }

  .brand:active,
  .anchor:active,
  .gallery-btn:active {
    transform: none;
  }
}
</style>
