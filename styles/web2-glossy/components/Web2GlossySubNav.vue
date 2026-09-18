<!--
  Web2GlossySubNav - web2-glossy 风格子页的路由导航
  ------------------------------------------------------------
  与首页 Web2GlossySiteHeader 的区别只在链接语义：
  · 首页顶栏是 #about / #projects —— **页内锚点**
  · 本组件是 /style/web2-glossy/about —— **路由**
  子页之间没有可滚动的页内区块，锚点在子页上无处可去，两者不能混用。

  视觉沿用首页顶栏：浅蓝渐变条 + 底部白高光线 + 三色渐变饰条，
  站点标识是凝胶字母牌 + 站名，条目是胶囊，画廊入口是橙色凝胶按钮。
  当前子页用「蓝色实底胶囊」标出——Web 2.0 里选中态就是实心高光。
-->
<template>
  <header class="site-header">
    <div class="site-header__bar">
      <NuxtLink :to="localePath('/style/web2-glossy')" class="brand">
        <span class="brand__tile" aria-hidden="true">{{ logoInitial }}</span>
        <span class="brand__name">{{ t('home.name') }}</span>
      </NuxtLink>

      <nav class="nav" :aria-label="t('common.subNav')">
        <NuxtLink
          v-for="item in links"
          :key="item.path"
          class="nav__pill"
          :to="localePath(item.path)"
          :aria-current="isActive(item.path) ? 'page' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <Web2GlossyGelButton :to="localePath('/styles')" variant="orange" class="site-header__gallery">
        {{ t('styles.gallery.title') }}
      </Web2GlossyGelButton>
    </div>
  </header>
</template>

<script setup lang="ts">
// styles/ 下组件不走自动导入，引用同风格组件必须显式 import
import Web2GlossyGelButton from './Web2GlossyGelButton.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/** 站点标识字母牌取站名首字符 */
const logoInitial = computed(() => t('home.name').charAt(0))

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/web2-glossy/about', label: t('nav.about') },
  { path: '/style/web2-glossy/projects', label: t('nav.projects') },
  { path: '/style/web2-glossy/blog', label: t('nav.blog') },
  { path: '/style/web2-glossy/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
/* —— 粘性光泽顶栏（与首页同源） —— */
.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
}

.site-header__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px var(--gap);
  max-width: var(--page-w);
  margin-inline: auto;
  padding: 10px clamp(16px, 4vw, 32px);
  background: linear-gradient(180deg, #e8f4ff 0%, #cfe6fb 100%);
  border-bottom: 1px solid rgb(255 255 255 / 0.9);
  box-shadow: 0 2px 6px rgb(23 74 128 / 0.12);
}

/* 底部三色渐变饰条 */
.site-header__bar::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 3px;
  background: linear-gradient(90deg, #58a6f5 0%, #6fc0f0 50%, #d97a1c 100%);
}

.site-header {
  position: sticky;
}

/* —— 站点标识：凝胶字母牌 + 站名（点击回风格首页） —— */
.brand {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  text-decoration: none;
}

.brand__tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-family: var(--font-head);
  font-size: 1.0625rem;
  font-weight: 800;
  color: #ffffff;
  border: 1px solid #14417e;
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, #7cb8f7 0%, #2b82e9 55%, #1d5fae 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.55),
    0 2px 5px rgb(23 74 128 / 0.3);
}

.brand__name {
  font-family: var(--font-head);
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--c-text);
  white-space: nowrap;
}

/* —— 子页路由胶囊 —— */
.nav {
  display: flex;
  flex: 1 1 auto;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav::-webkit-scrollbar {
  display: none;
}

.nav__pill {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 40px;
  padding: 6px 16px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 999px;
  transition:
    color var(--transition),
    background var(--transition),
    border-color var(--transition);
}

.nav__pill:hover {
  color: #ffffff;
  background: linear-gradient(180deg, #58a6f5 0%, #1d5fae 100%);
  border-color: #14417e;
}

.nav__pill:active {
  transform: var(--press-transform);
}

/* 当前页：蓝色实底胶囊（Web 2.0 的选中 = 实心高光） */
.nav__pill[aria-current='page'] {
  color: #ffffff;
  background: linear-gradient(180deg, #58a6f5 0%, #1d5fae 100%);
  border-color: #14417e;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.5);
}

/* —— 画廊入口 —— */
.site-header__gallery {
  flex: none;
}

/* 窄屏：胶囊行折到第二行横滑 */
@media (max-width: 767px) {
  .nav {
    order: 3;
    flex-basis: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav__pill {
    transition: none;
  }

  .nav__pill:active {
    transform: none;
  }
}
</style>
