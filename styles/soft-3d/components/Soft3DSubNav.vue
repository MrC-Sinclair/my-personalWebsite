<!--
  Soft3DSubNav - soft-3d 风格子页的路由导航
  ------------------------------------------------------------
  与首页 Soft3DFloatNav 的区别只在链接语义：
  · 首页导航是 #about / #projects —— **页内锚点**（还需 sections prop）
  · 本组件是 /style/soft-3d/about —— **路由**（自带链接清单）
  子页之间没有可滚动的页内区块，锚点在子页上无处可去，两者不能混用。

  视觉沿用首页那颗漂浮玻璃胶囊：站点标识是受光小球 + 站名，
  条目是悬浮小胶囊（hover 上抬 2px），画廊入口是糖果渐变胶囊。
  当前子页用「糖果渐变实底」标出——soft-3d 里「选中」就是
  这颗物体被点亮，而不是换个描边。
-->
<template>
  <header class="float-nav-wrap">
    <nav class="float-nav" :aria-label="t('common.subNav')">
      <NuxtLink class="float-nav-brand" :to="localePath('/style/soft-3d')">
        <Soft3DOrb :size="34" variant="violet" float :duration="6"/>
        <span class="float-nav-name">{{ t('home.name') }}</span>
      </NuxtLink>

      <ul class="float-nav-list">
        <li v-for="item in links" :key="item.path">
          <NuxtLink
            class="float-nav-link"
            :to="localePath(item.path)"
            :aria-current="isActive(item.path) ? 'page' : undefined"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>

      <NuxtLink class="float-nav-gallery" :to="localePath('/styles')">
        {{ t('styles.gallery.title') }}
        <span class="float-nav-gallery-arrow" aria-hidden="true">→</span>
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import Soft3DOrb from './Soft3DOrb.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/soft-3d/about', label: t('nav.about') },
  { path: '/style/soft-3d/projects', label: t('nav.projects') },
  { path: '/style/soft-3d/blog', label: t('nav.blog') },
  { path: '/style/soft-3d/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
/* —— 吸顶漂浮胶囊（与首页同源） —— */
.float-nav-wrap {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  justify-content: center;
  padding: 14px 12px 0;
  pointer-events: none;
}

.float-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: calc(100vw - 20px);
  padding: 8px 12px;
  pointer-events: auto;
  background: color-mix(in srgb, var(--c-surface) 74%, transparent);
  backdrop-filter: blur(16px);
  border: var(--border-w) solid var(--c-border);
  border-radius: 999px;
  box-shadow: var(--shadow);
}

/* —— 站点标识：点击回风格首页 —— */
.float-nav-brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 4px 8px 4px 4px;
  border-radius: 999px;
  text-decoration: none;
  transition: background var(--transition), transform var(--transition);
}

.float-nav-brand:hover {
  background: color-mix(in srgb, var(--c-accent) 14%, transparent);
  transform: translateY(-2px);
}

.float-nav-brand:active {
  transform: var(--press-transform);
}

.float-nav-name {
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
  white-space: nowrap;
}

/* —— 子页路由条目 —— */
.float-nav-list {
  display: flex;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
  scrollbar-width: none;
}

.float-nav-list::-webkit-scrollbar {
  display: none;
}

/* 小胶囊：≥40px 触控目标 + 悬浮上抬 */
.float-nav-link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 14px;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  border-radius: 999px;
  transition: color var(--transition), background var(--transition), transform var(--transition),
    box-shadow var(--transition);
}

.float-nav-link:hover {
  color: var(--c-text);
  background: color-mix(in srgb, var(--c-accent) 16%, transparent);
  transform: translateY(-2px);
}

.float-nav-link:active {
  transform: var(--press-transform);
}

/* 当前页：物体被点亮（糖果渐变实底，与画廊入口同材质但更小） */
.float-nav-link[aria-current='page'] {
  color: var(--c-on-accent);
  background: linear-gradient(135deg, #7c3aed, #db2777);
  box-shadow:
    0 10px 20px rgb(124 58 237 / 0.4),
    inset 0 1px 3px rgb(255 255 255 / 0.35);
}

/* —— 风格画廊入口：糖果渐变胶囊 —— */
.float-nav-gallery {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 16px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-on-accent);
  text-decoration: none;
  white-space: nowrap;
  background: linear-gradient(135deg, #7c3aed, #db2777);
  border: var(--border-w) solid rgb(255 255 255 / 0.28);
  border-radius: 999px;
  box-shadow:
    0 10px 20px rgb(124 58 237 / 0.4),
    inset 0 1px 3px rgb(255 255 255 / 0.35);
  transition: transform var(--transition), box-shadow var(--transition), filter var(--transition);
}

.float-nav-gallery:hover {
  transform: translateY(-2px);
  filter: brightness(1.08);
  box-shadow:
    0 16px 28px rgb(124 58 237 / 0.5),
    inset 0 1px 3px rgb(255 255 255 / 0.35);
}

.float-nav-gallery:active {
  transform: var(--press-transform);
}

.float-nav-gallery-arrow {
  transition: transform var(--transition);
}

.float-nav-gallery:hover .float-nav-gallery-arrow {
  transform: translateX(3px);
}

/* 键盘可见焦点环 */
.float-nav :focus-visible {
  outline: 2px solid var(--c-accent-2);
  outline-offset: 3px;
}

/* 窄屏：名称收起、画廊入口缩短，胶囊两行排布 */
@media (max-width: 640px) {
  .float-nav-name {
    display: none;
  }

  .float-nav-gallery {
    padding: 8px 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .float-nav-brand,
  .float-nav-link,
  .float-nav-gallery,
  .float-nav-gallery-arrow {
    transition: none;
  }

  .float-nav-brand:hover,
  .float-nav-link:hover,
  .float-nav-gallery:hover,
  .float-nav-gallery:hover .float-nav-gallery-arrow {
    transform: none;
  }
}
</style>
