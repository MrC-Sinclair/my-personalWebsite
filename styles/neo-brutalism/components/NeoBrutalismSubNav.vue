<!--
  NeoBrutalismSubNav - neo-brutalism 风格子页的路由导航
  ------------------------------------------------------------
  与首页 NeoBrutalismTopBar 的区别只在链接语义：
  · 首页顶栏是 #about / #works —— **页内锚点**
  · 本组件是 /style/neo-brutalism/about —— **路由**
  子页之间没有可滚动的页内区块，锚点在子页上无处可去。

  视觉沿用首页顶栏：纸面底 + 加粗下缘线、站点标识是黑底反白块、
  条目是等宽字标签 hover 反白、画廊入口是海报黄实心钮（硬影抬起）。
  当前子页用「海报黄实底 + 描边」盖住，等于首页里贴一张选中的贴纸。
-->
<template>
  <header class="topbar">
    <div class="topbar-inner">
      <NuxtLink class="brand" :to="localePath('/style/neo-brutalism')">
        <span class="brand-mark" aria-hidden="true"/>
        {{ t('home.name') }}
      </NuxtLink>

      <nav class="anchors" :aria-label="t('common.subNav')">
        <NuxtLink
          v-for="item in links"
          :key="item.path"
          class="anchor"
          :to="localePath(item.path)"
          :aria-current="isActive(item.path) ? 'page' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <NuxtLink class="gallery-btn" :to="localePath('/styles')">
        {{ t('styles.galleryLink') }}
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/neo-brutalism/about', label: t('nav.about') },
  { path: '/style/neo-brutalism/projects', label: t('nav.projects') },
  { path: '/style/neo-brutalism/blog', label: t('nav.blog') },
  { path: '/style/neo-brutalism/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
/* —— 吸顶条：纸面底 + 加粗下缘线（与首页顶栏同源） —— */
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

/* —— 站点标识：黑底反白块，hover 抬起（点击回风格首页） —— */
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

/* —— 子页路由条目：等宽字标签 —— */
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

/* 当前页：海报黄实底 + 描边（贴纸被选中） */
.anchor[aria-current='page'] {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-border);
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
