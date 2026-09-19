<!--
  ClaymorphismSubNav - claymorphism 风格子页的路由导航
  ------------------------------------------------------------
  与首页 ClaymorphismTopNav 的区别有两处：
  · 链接语义：首页是 #about / #projects —— **页内锚点**；
    本组件是 /style/claymorphism/about —— **路由**。子页之间没有可
    滚动的页内区块，锚点在子页上无处可去，两者不能混用。
  · 激活来源：首页靠 useActiveSection 观察滚动位置；子页没有滚动区块
    可观察，改用路由匹配（aria-current='page'）。

  视觉沿用首页那颗黏土胶囊条：黏土小球站点标识、凹陷轨道里的胶囊
  条目、粉黏土画廊胶囊。当前子页把首页滚动激活态那套「内凹着色」
  固定下来——黏土风只有按压/浮起两种状态，选中就是「被按下」。
-->
<template>
  <header class="nav-wrap">
    <div class="nav-capsule">
      <!-- 站点标识：回风格首页（路由，不是首页根路径） -->
      <NuxtLink class="brand" :to="localePath('/style/claymorphism')">
        <span class="brand-ball" aria-hidden="true" />
        <span class="brand-name">{{ t('home.name') }}</span>
      </NuxtLink>

      <!-- 子页路由胶囊 -->
      <nav class="anchors" :aria-label="t('common.subNav')">
        <ul class="anchor-list">
          <li v-for="item in links" :key="item.path">
            <NuxtLink
              class="anchor-pill"
              :to="localePath(item.path)"
              :aria-current="isActive(item.path) ? 'page' : undefined"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- 风格画廊入口 -->
      <NuxtLink class="gallery-pill" :to="localePath('/styles')">
        <span class="gallery-dot" aria-hidden="true" />
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
  { path: '/style/claymorphism/about', label: t('nav.about') },
  { path: '/style/claymorphism/projects', label: t('nav.projects') },
  { path: '/style/claymorphism/blog', label: t('nav.blog') },
  { path: '/style/claymorphism/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
/* 吸顶悬浮：胶囊本身是一大块黏土 */
.nav-wrap {
  position: sticky;
  top: 12px;
  z-index: 30;
  padding: 0 var(--gap);
}

.nav-capsule {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px var(--gap);
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 10px 14px;
  background: var(--c-surface);
  border-radius: 999px;
  box-shadow: var(--shadow);
}

/* —— 站点标识 —— */
.brand {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 4px 10px 4px 4px;
  text-decoration: none;
  border-radius: 999px;
  transition: transform var(--transition);
}

/* 黏土品牌小球（3D 图标感） */
.brand-ball {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--deco), var(--c-accent);
  box-shadow:
    0 6px 10px rgb(125 63 201 / 0.35),
    inset 0 -4px 8px rgb(90 40 150 / 0.25);
  transition: transform var(--transition);
}

.brand-name {
  font-size: var(--fs-base);
  font-weight: 800;
  color: var(--c-text);
  white-space: nowrap;
}

.brand:hover .brand-ball {
  transform: scale(1.12);
}

.brand:active {
  transform: var(--press-transform);
}

/* —— 子页路由胶囊（窄屏横向滚动） —— */
.anchors {
  flex: 1 1 auto;
  min-width: 0;
}

.anchor-list {
  display: flex;
  gap: 6px;
  margin: 0;
  padding: 0 4px;
  overflow-x: auto;
  list-style: none;
  scrollbar-width: thin;
}

.anchor-pill {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 16px;
  font-size: var(--fs-base);
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  border-radius: 999px;
  box-shadow: inset 0 2px 6px rgb(125 63 201 / 0.08);
  transition:
    color var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.anchor-pill:hover {
  color: var(--c-text);
  background: var(--c-surface);
  box-shadow:
    0 6px 10px rgb(150 90 210 / 0.2),
    inset 0 4px 8px rgb(255 255 255 / 0.7);
}

.anchor-pill:active {
  transform: var(--press-transform);
}

/* 当前子页：与首页滚动激活态同款的「内凹着色」胶囊 */
.anchor-pill[aria-current='page'] {
  color: var(--c-on-accent);
  background: var(--c-accent);
  box-shadow:
    0 6px 12px rgb(125 63 201 / 0.35),
    inset 0 3px 6px rgb(255 255 255 / 0.35),
    inset 0 -4px 8px rgb(90 40 150 / 0.25);
}

/* —— 风格画廊入口（粉黏土胶囊） —— */
.gallery-pill {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 6px 18px;
  font-size: var(--fs-base);
  font-weight: 700;
  color: #8c2f60;
  text-decoration: none;
  white-space: nowrap;
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

.gallery-pill:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 20px rgb(215 100 150 / 0.35),
    inset 0 5px 9px rgb(255 255 255 / 0.75),
    inset 0 -5px 8px rgb(215 100 150 / 0.22);
}

.gallery-pill:active {
  transform: var(--press-transform);
  box-shadow:
    0 4px 8px rgb(215 100 150 / 0.3),
    inset 0 4px 8px rgb(255 255 255 / 0.6),
    inset 0 -5px 9px rgb(215 100 150 / 0.3);
}

/* 胶囊上的小装饰点 */
.gallery-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--deco), #e0609e;
}

/* 窄屏：画廊入口文字收紧（触控目标仍 ≥ 40px） */
@media (max-width: 480px) {
  .gallery-pill {
    padding: 6px 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand,
  .brand-ball,
  .anchor-pill,
  .gallery-pill {
    transition: none;
  }

  .brand:active,
  .anchor-pill:active,
  .gallery-pill:active,
  .gallery-pill:hover {
    transform: none;
  }
}
</style>
