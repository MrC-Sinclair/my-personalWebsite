<!--
  MinimalismSubNav - minimalism 风格子页的吸顶导航
  ------------------------------------------------------------
  与首页 MinimalismHeader 的区别只有一处，但很关键：
  · 首页导航的链接是 #about / #projects —— **页内锚点**
  · 本组件的链接是 /style/minimalism/about —— **路由**
  子页之间是路由跳转，页内锚点在子页上无处可滚，两种语义不能混用。

  视觉沿用首页导航的语言：纸面同色吸顶条 + hairline 底线、
  站点标识带唯一的强调色圆点、链接反馈是「下划线由透明渐显」，
  画廊入口仍是唯一带边框的胶囊。子页多一项：当前页以强调色标出
  （minimalism 不靠色块，只靠字色与下划线——克制的表达）。
-->
<template>
  <header class="hd safe-top">
    <div class="hd-inner">
      <NuxtLink class="brand" :to="localePath('/style/minimalism')">
        <span class="brand-dot" aria-hidden="true"/>
        <span class="brand-name">{{ t('home.name') }}</span>
      </NuxtLink>

      <nav class="hd-nav" :aria-label="t('common.subNav')">
        <NuxtLink
          v-for="item in links"
          :key="item.path"
          class="hd-link"
          :to="localePath(item.path)"
          :aria-current="isActive(item.path) ? 'page' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <NuxtLink class="hd-gallery" :to="localePath('/styles')">
        {{ t('styles.gallery.title') }}
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
  { path: '/style/minimalism/about', label: t('nav.about') },
  { path: '/style/minimalism/projects', label: t('nav.projects') },
  { path: '/style/minimalism/blog', label: t('nav.blog') },
  { path: '/style/minimalism/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
/* —— 吸顶条：与首页同源（纸面同色 + hairline 底线） —— */
.hd {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--c-bg);
  border-bottom: var(--border-w) solid var(--c-border);
}

.hd-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0 16px;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 12px var(--space);
}

/* —— 站点标识：点击回风格首页（不再是回顶部） —— */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
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

.brand-dot {
  flex: none;
  width: 8px;
  height: 8px;
  background: var(--c-accent);
  border-radius: 50%;
}

/* —— 子页路由链接：下划线由透明渐显 —— */
.hd-nav {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
  min-width: 0;
}

.hd-link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 12px;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-decoration: underline;
  text-decoration-color: transparent;
  text-decoration-thickness: 1px;
  text-underline-offset: 6px;
  white-space: nowrap;
  transition:
    color var(--transition),
    text-decoration-color var(--transition);
}

.hd-link:hover {
  color: var(--c-text);
  text-decoration-color: var(--c-accent);
}

.hd-link:active {
  transform: var(--press-transform);
}

/* 当前页：唯一用强调色标出的链接（不加背景，保持克制） */
.hd-link[aria-current='page'] {
  color: var(--c-accent);
  text-decoration-color: var(--c-accent);
}

/* —— 风格画廊入口：唯一带边框的胶囊 —— */
.hd-gallery {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 16px;
  font-size: var(--fs-small);
  color: var(--c-text);
  text-decoration: none;
  white-space: nowrap;
  border: var(--border-w) solid var(--c-border);
  border-radius: 999px;
  transition:
    color var(--transition),
    border-color var(--transition),
    background var(--transition);
}

.hd-gallery:hover {
  color: var(--c-accent);
  border-color: var(--c-accent);
  background: var(--c-surface);
}

.hd-gallery:active {
  transform: var(--press-transform);
}

/* —— 窄屏回退：两行布局（与首页一致） —— */
@media (max-width: 767px) {
  .hd-inner {
    grid-template-columns: 1fr auto;
    gap: 0 12px;
    padding: 10px var(--space) 6px;
  }

  .hd-nav {
    grid-column: 1 / -1;
    justify-content: flex-start;
    padding-bottom: 4px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .hd-nav::-webkit-scrollbar {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand,
  .hd-link,
  .hd-gallery {
    transition: none;
  }

  .brand:active,
  .hd-link:active,
  .hd-gallery:active {
    transform: none;
  }
}
</style>
