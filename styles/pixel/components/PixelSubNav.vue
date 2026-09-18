<!--
  PixelSubNav - pixel 风格子页的路由导航
  ------------------------------------------------------------
  与首页 PixelHudBar 的区别有两处：
  · 链接语义：首页是 #about / #projects —— **页内锚点**；
    本组件是 /style/pixel/about —— **路由**。子页之间没有可滚动的
    页内区块，锚点在子页上无处可去，两者不能混用。
  · 激活来源：首页菜单项无激活态（锚点靠滚动说话）；子页必须用
    路由匹配（aria-current='page'），否则用户不知道自己在哪一栏。

  视觉沿用首页那根吸顶 HUD 条：▶ 光标 + 站点标识 + 菜单项 + 画廊
  入口。当前子页是「菜单项常亮为金黄底 + 深色字」，即首页 hover 时
  的色块反转被固定下来——像素风的选中态只能是硬色块，没有渐变。
-->
<template>
  <header class="hud">
    <div class="hud-inner">
      <!-- 站点标识：回风格首页（路由，不是 #top 锚点） -->
      <NuxtLink class="hud-brand" :to="localePath('/style/pixel')">
        <span class="hud-cursor" aria-hidden="true">▶</span>
        <span class="hud-name">{{ t('home.name') }}</span>
      </NuxtLink>

      <nav class="hud-menu" :aria-label="t('common.subNav')">
        <NuxtLink
          v-for="item in links"
          :key="item.path"
          class="hud-item"
          :to="localePath(item.path)"
          :aria-current="isActive(item.path) ? 'page' : undefined"
        >
          <span class="hud-cursor" aria-hidden="true">▶</span>
          {{ item.label }}
        </NuxtLink>
        <NuxtLink class="hud-item hud-item--accent" :to="localePath('/styles')">
          <span class="hud-cursor" aria-hidden="true">▶</span>
          {{ t('styles.gallery.title') }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/pixel/about', label: t('nav.about') },
  { path: '/style/pixel/projects', label: t('nav.projects') },
  { path: '/style/pixel/blog', label: t('nav.blog') },
  { path: '/style/pixel/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
/* —— 吸顶 HUD 条（与首页同源） —— */
.hud {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--c-surface);
  border-bottom: var(--border-w) solid var(--c-border);
}

.hud-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 16px;
  max-width: var(--page-w);
  margin-inline: auto;
  padding: 8px var(--space);
}

/* 站点标识：金黄 + 硬偏移文字阴影 */
.hud-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  text-decoration: none;
}

.hud-name {
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-accent);
  text-shadow: 2px 2px 0 var(--c-border);
}

.hud-cursor {
  font-size: var(--fs-small);
  color: var(--c-accent-2);
}

.hud-menu {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

/* 菜单项：默认透明边框占位，hover 色块反转（金黄底 + 深色字） */
.hud-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 6px 10px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-text);
  text-decoration: none;
  border: 2px solid transparent;
}

.hud-item .hud-cursor {
  color: var(--c-accent-2);
}

.hud-item:hover {
  background: var(--c-accent);
  color: var(--c-on-accent);
  border-color: var(--c-border);
}

.hud-item:hover .hud-cursor {
  color: var(--c-on-accent);
}

.hud-item:active {
  transform: var(--press-transform);
}

/* 当前子页：把 hover 的色块反转固定下来（像素风没有渐变选中态） */
.hud-item[aria-current='page'] {
  background: var(--c-accent);
  color: var(--c-on-accent);
  border-color: var(--c-border);
}

.hud-item[aria-current='page'] .hud-cursor {
  color: var(--c-on-accent);
}

/* 风格画廊入口：草绿底强调项（与首页同一配色分工） */
.hud-item--accent {
  background: var(--c-accent-2);
  color: var(--c-on-accent);
  border-color: var(--c-border);
}

.hud-item--accent .hud-cursor {
  color: var(--c-on-accent);
}

.hud-item--accent:hover {
  background: var(--c-accent);
}

.hud-brand:focus-visible,
.hud-item:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* 窄屏：菜单换行铺满，标识独占一行（与首页 HUD 一致） */
@media (max-width: 639px) {
  .hud-menu {
    width: 100%;
    margin-left: 0;
  }
}
</style>
