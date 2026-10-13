<!--
  Web2GlossySiteHeader - Web 2.0 光泽风格的站点导航头部
  ------------------------------------------------------------
  粘性光泽顶栏：浅蓝渐变条 + 底部白高光线 + 三色渐变饰条。
  内容 = 站点标识（凝胶字母牌 + 站名）+ 页内锚点胶囊导航
  + 右侧动作组（语言切换小胶囊 + 「UI 风格画廊」橙色凝胶按钮，
  画廊走 localePath、语言切换走共享层 useLocaleSwitch 的 targetPath）。
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

      <!-- 右侧动作组：语言切换（次要小胶囊）+ 画廊入口（主凝胶按钮） -->
      <div class="site-header__actions">
        <NuxtLink class="site-header__lang" :to="targetPath" :aria-label="t('common.language')">
          {{ targetLabel }}
        </NuxtLink>

        <Web2GlossyGelButton
          :to="localePath('/styles')"
          variant="orange"
          class="site-header__gallery"
        >
          {{ t('styles.gallery.title') }}
        </Web2GlossyGelButton>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * @file Web 2.0 光泽风格的站点导航头部组件
 * @description 锚点指向本页各区块（依赖全局 scroll-behavior: smooth 与
 *              scroll-margin-top）；画廊入口为站内路由，走 localePath；
 *              语言切换走共享层 useLocaleSwitch（自动导入）。
 */
// styles/ 下组件不走自动导入，引用同风格组件必须显式 import
import Web2GlossyGelButton from './Web2GlossyGelButton.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const { targetPath, targetLabel } = useLocaleSwitch()

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
  /* 字母牌是 38×38，会把整条链接的命中区定在 38px；补到 40 与 Web2GlossySubNav 的 .brand 一致 */
  min-height: 40px;
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

/* —— 右侧动作组：语言切换 + 画廊入口 ——
   原先 margin-left:auto 挂在画廊按钮上，现在移交给整组：
   组内允许换行，极窄屏时小胶囊折到画廊按钮下方，而不是把整行顶宽 */
.site-header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  order: 1;
  margin-left: auto;
}

.site-header__gallery {
  flex: none;
}

/* —— 语言切换：光泽小胶囊（次要动作，比橙色凝胶按钮安静一级） —— */
.site-header__lang {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  min-width: 40px;
  padding: 4px 14px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  /* 顶亮底深的凝胶渐变只用 token 的两档底色，不引入新色值 */
  background: linear-gradient(180deg, var(--c-surface) 0%, var(--c-bg) 100%);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--c-surface) 90%, transparent);
  transition:
    color var(--transition),
    border-color var(--transition),
    background var(--transition),
    box-shadow var(--transition);
}

/* hover：文字升到正文色（--c-accent 压浅蓝底只有 3.9:1，只做描边不做字色） */
.site-header__lang:hover {
  color: var(--c-text);
  border-color: var(--c-accent);
}

.site-header__lang:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

.site-header__lang:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
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
