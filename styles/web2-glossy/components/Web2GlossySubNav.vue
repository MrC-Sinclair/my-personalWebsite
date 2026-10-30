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
  画廊按钮左边多一枚语言切换小胶囊（次要动作，行为来自共享层 useLocaleSwitch）。
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
// styles/ 下组件不走自动导入，引用同风格组件必须显式 import
import Web2GlossyGelButton from './Web2GlossyGelButton.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
// 语言切换行为走共享层（composables 自动导入，无需 import）
const { targetPath, targetLabel } = useLocaleSwitch()

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
  padding: 12px clamp(16px, 4vw, 32px);
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
  background: linear-gradient(90deg, #3f8fd8 0%, #6fc0f0 50%, #d97a1c 100%);
}

.site-header {
  position: sticky;
}

/* —— 站点标识：凝胶字母牌 + 站名（点击回风格首页） —— */
.brand {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 12px;
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
  /* 17px 差一点点到不了 18px 的大字号门槛；提到 18px 后按 3:1 判定，
     白字压磁贴蓝 3.65:1 即达标，不必把磁贴压得更深 */
  font-size: 1.125rem;
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
  gap: 8px;
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
  padding: 8px 16px;
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
  background: linear-gradient(180deg, #3f8fd8 0%, #1d5fae 100%);
  border-color: #14417e;
}

.nav__pill:active {
  transform: var(--press-transform);
}

/* 当前页：蓝色实底胶囊（Web 2.0 的选中 = 实心高光） */
.nav__pill[aria-current='page'] {
  color: #ffffff;
  background: linear-gradient(180deg, #3f8fd8 0%, #1d5fae 100%);
  border-color: #14417e;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.5);
}

/* —— 右侧动作组：语言切换 + 画廊入口 ——
   组内允许换行：极窄屏时小胶囊折到画廊按钮下方，而不是把整行顶宽 */
.site-header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
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
  padding: 4px 16px;
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

/* 窄屏：胶囊行折到第二行横滑 */
@media (max-width: 767px) {
  .nav {
    order: 3;
    flex-basis: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav__pill,
  .site-header__lang {
    transition: none;
  }

  .nav__pill:active,
  .site-header__lang:active {
    transform: none;
  }
}
</style>
