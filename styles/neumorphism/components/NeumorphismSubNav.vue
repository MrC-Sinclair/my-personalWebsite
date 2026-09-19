<!--
  NeumorphismSubNav - neumorphism 风格子页的路由导航
  ------------------------------------------------------------
  与首页 NeumorphismTopBar 的区别有两处：
  · 链接语义：首页是 #about / #posts —— **页内锚点**；
    本组件是 /style/neumorphism/about —— **路由**。子页之间没有可
    滚动的页内区块，锚点在子页上无处可去，两者不能混用。
  · 激活来源：首页靠 useActiveSection 观察滚动位置；子页没有滚动区块
    可观察，改用路由匹配（aria-current='page'）。

  视觉沿用首页那块「凸起薄板」：材料小圆点站点标识、凸起胶囊条目、
  画廊入口。当前子页的激活态与首页滚动激活态同一套——**压进材料里**
  （inset 阴影）。新拟态只有凸起/凹陷两态，选中就是被按下去。
-->
<template>
  <header class="topbar">
    <!-- 站点标识：回风格首页（路由，不是 #top 锚点） -->
    <NuxtLink class="brand" :to="localePath('/style/neumorphism')">
      <span class="brand-dot" aria-hidden="true" />
      <span class="brand-name">{{ t('home.name') }}</span>
    </NuxtLink>

    <!-- 子页路由胶囊 -->
    <nav class="anchor-nav" :aria-label="t('common.subNav')">
      <ul class="anchor-list">
        <li v-for="item in links" :key="item.path" class="anchor-item">
          <NuxtLink
            class="anchor-chip"
            :to="localePath(item.path)"
            :aria-current="isActive(item.path) ? 'page' : undefined"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <NuxtLink class="gallery-btn" :to="localePath('/styles')">
      {{ t('styles.gallery.title') }}
    </NuxtLink>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/neumorphism/about', label: t('nav.about') },
  { path: '/style/neumorphism/projects', label: t('nav.projects') },
  { path: '/style/neumorphism/blog', label: t('nav.blog') },
  { path: '/style/neumorphism/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
/* —— 凸起薄板：同色底 + 单向下柔阴影，浮在材料上方 —— */
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 18px;
  padding: 12px max(18px, env(safe-area-inset-right)) 12px max(18px, env(safe-area-inset-left));
  padding-top: max(12px, env(safe-area-inset-top));
  background: var(--c-bg);
  box-shadow: 0 8px 18px rgb(163 177 198 / 0.55);
}

/* —— 站点标识 —— */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  text-decoration: none;
}

/* 材料上的凸起小圆点（渐变装饰） */
.brand-dot {
  flex: none;
  width: 12px;
  height: 12px;
  background: var(--deco);
  border-radius: 50%;
  box-shadow: 2px 2px 4px #a3b1c6, -2px -2px 4px #ffffff;
}

.brand-name {
  overflow: hidden;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 1px 1px 1px rgb(255 255 255 / 0.9);
}

/* —— 子页路由胶囊 —— */
.anchor-nav {
  flex: 1 1 100%;
  order: 3;
  min-width: 0;
}

.anchor-list {
  display: flex;
  gap: 12px;
  margin: 0;
  padding: 4px 4px 10px;
  overflow-x: auto;
  list-style: none;
  /* 预留空间让凸起胶囊的阴影不被滚动容器裁切 */
  scrollbar-width: thin;
}

.anchor-chip {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 18px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: 4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff;
  transition:
    box-shadow var(--transition),
    color var(--transition);
}

.anchor-chip:hover {
  color: var(--c-accent);
  box-shadow: 5px 5px 10px #a3b1c6, -5px -5px 10px #ffffff;
}

.anchor-chip:active {
  color: var(--c-accent);
  box-shadow: var(--shadow-press);
}

/* 当前子页 = 压进材料里（本风格的激活签名，与首页滚动激活态同源） */
.anchor-chip[aria-current='page'] {
  color: var(--c-accent);
  box-shadow: var(--shadow-press);
}

.anchor-chip:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

/* —— 风格画廊入口 —— */
.gallery-btn {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 40px;
  margin-left: auto;
  padding: 8px 16px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-accent);
  text-decoration: none;
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: 4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff;
  transition:
    box-shadow var(--transition),
    color var(--transition);
}

.gallery-btn:hover {
  color: var(--c-text);
  box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff;
}

.gallery-btn:active {
  color: var(--c-accent);
  box-shadow: var(--shadow-press);
}

.gallery-btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

/* —— 桌面端：标识 / 路由 / 画廊 同一行，路由居中 —— */
@media (min-width: 900px) {
  .topbar {
    flex-wrap: nowrap;
  }

  .anchor-nav {
    order: 0;
    flex: 1 1 auto;
    display: flex;
    justify-content: center;
  }

  .gallery-btn {
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .anchor-chip,
  .gallery-btn {
    transition: none;
  }
}
</style>
