<!--
  Web2GlossySiteHeader - Web 2.0 光泽风格的站点导航头部
  ------------------------------------------------------------
  粘性光泽顶栏：浅蓝渐变条 + 底部白高光线 + 三色渐变饰条。
  内容 = 站点标识（凝胶字母牌 + 站名）+ 页内锚点胶囊导航
  + 「UI 风格画廊」入口（NuxtLink，localePath 包裹）。
  移动端：锚点导航折叠为可横向滑动的胶囊条（触控目标 ≥ 40px）。
-->
<template>
  <header class="site-header">
    <div class="site-header__bar">
      <a href="#top" class="brand">
        <span class="brand__tile" aria-hidden="true">{{ logoInitial }}</span>
        <span class="brand__name">{{ t('home.name') }}</span>
      </a>

      <nav class="nav" aria-label="anchor">
        <a v-for="item in anchors" :key="item.href" :href="item.href" class="nav__pill">
          {{ item.label }}
        </a>
      </nav>

      <Web2GlossyGelButton :to="localePath('/styles')" variant="orange" class="site-header__gallery">
        {{ t('styles.gallery.title') }}
      </Web2GlossyGelButton>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * @file Web 2.0 光泽风格的站点导航头部组件
 * @description 锚点指向本页各区块（依赖全局 scroll-behavior: smooth 与
 *              scroll-margin-top）；画廊入口为站内路由，走 localePath。
 */
// styles/ 下组件不走自动导入，引用同风格组件必须显式 import
import Web2GlossyGelButton from './Web2GlossyGelButton.vue'

const { t } = useI18n()
const localePath = useLocalePath()

/** 站点标识字母牌取站名首字符 */
const logoInitial = computed(() => t('home.name').charAt(0))

/** 页内锚点导航（文案全部走 i18n） */
const anchors = computed(() => [
  { label: t('nav.about'), href: '#about' },
  { label: t('nav.projects'), href: '#projects' },
  { label: t('nav.blog'), href: '#blog' },
  { label: t('nav.contact'), href: '#contact' },
])
</script>

<style scoped>
/* —— 粘性光泽顶栏 —— */
.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
  border-bottom: 1px solid var(--c-border);
  background: linear-gradient(180deg, #fdfeff 0%, #eaf3fd 55%, #d8eafc 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.9),
    0 6px 18px rgb(23 74 128 / 0.12);
}

/* 底部三色渐变饰条（蓝 → 浅蓝 → 橙），Web 2.0 渐变条签名 */
.site-header::after {
  content: '';
  display: block;
  height: 3px;
  background: linear-gradient(90deg, #2b72c6 0%, #58a6f5 38%, #9cc7ef 62%, #f0a24a 85%, #bf4d00 100%);
}

.site-header__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px var(--gap);
  max-width: var(--page-w);
  margin-inline: auto;
  padding: 10px clamp(16px, 4vw, 32px);
}

/* —— 站点标识 —— */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--c-text);
  text-decoration: none;
  transition: filter var(--transition);
}

.brand:hover {
  filter: brightness(1.08);
}

.brand:active {
  transform: var(--press-transform);
}

.brand:focus-visible {
  outline: 3px solid rgb(30 111 217 / 0.55);
  outline-offset: 2px;
  border-radius: 8px;
}

/* 凝胶字母牌 */
.brand__tile {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  overflow: hidden;
  border: 1px solid #14417e;
  border-radius: 12px;
  color: var(--c-on-accent);
  font-family: var(--font-head);
  font-size: 19px;
  font-weight: 800;
  text-shadow: 0 1px 1px rgb(9 34 64 / 0.45);
  background: linear-gradient(180deg, #4f9cf0 0%, #2b72c6 52%, #1d5fae 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.6),
    0 2px 5px rgb(23 74 128 / 0.3);
}

/* 字母牌顶部高光 */
.brand__tile::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.5) 0%, rgb(255 255 255 / 0) 58%);
  pointer-events: none;
}

.brand__name {
  font-family: var(--font-head);
  font-size: 1.0625rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

/* —— 锚点胶囊导航 —— */
.nav {
  display: flex;
  flex: 1;
  gap: 6px;
  justify-content: flex-end;
  order: 2;
  min-width: 0;
}

.nav__pill {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 40px;
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--c-text);
  font-family: var(--font-head);
  font-size: 0.9375rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background var(--transition),
    border-color var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

/* hover：胶囊浮起为亮面凝胶 */
.nav__pill:hover {
  border-color: var(--c-border);
  color: #1a5fc0;
  background: linear-gradient(180deg, #ffffff 0%, #e7f1fc 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    0 2px 6px rgb(23 74 128 / 0.18);
}

.nav__pill:active {
  transform: var(--press-transform);
  box-shadow: inset 0 2px 5px rgb(74 107 138 / 0.3);
}

.nav__pill:focus-visible {
  outline: 3px solid rgb(30 111 217 / 0.55);
  outline-offset: 2px;
}

/* 画廊入口在移动端收窄文字留白 */
.site-header__gallery {
  order: 1;
  margin-left: auto;
}

/* —— 窄屏：品牌 + 画廊一行，锚点成横向滑动胶囊条 —— */
@media (max-width: 720px) {
  .nav {
    flex: 1 0 100%;
    order: 3;
    justify-content: flex-start;
    padding-bottom: 4px;
    /* 横向滑动，隐藏滚动条保持光泽条干净 */
    overflow-x: auto;
    scrollbar-width: none;
  }

  .nav::-webkit-scrollbar {
    display: none;
  }
}
</style>
