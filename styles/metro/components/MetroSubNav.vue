<!--
  MetroSubNav - Metro 风格子页的路由导航
  ------------------------------------------------------------
  与首页 MetroSiteHeader 的区别：
  · 链接语义：首页是 #about / #projects… 页内锚点；本组件是
    /style/metro/about … 路由。子页只有一个纵向版面，锚点无处可去，
    两者不能混用。
  · 激活来源：首页的锚点链接无激活态（页面滚动自己会说话）；子页
    用路由匹配（aria-current='page'），否则用户不知道自己在哪一栏。
  · 窄屏不隐藏：首页窄屏靠画廊 Tile 仍存在；子页没有别的入口，隐藏
    导航等于窄屏无法换页——本组件窄屏把横向链接收进一行溢出滚动。

  视觉沿用首页那根顶部栏：站点标识 + 大写字母间距的链接 + 橙色画廊
  入口。当前子页把首页 hover 时的「底部强调条」固定下来（Metro 文本
  链接的选中态就是这条强调条）。
-->
<template>
  <header class="subnav">
    <div class="subnav__inner">
      <NuxtLink class="subnav__brand" :to="localePath('/style/metro')">
        {{ t('home.name') }}
      </NuxtLink>

      <nav class="subnav__nav" :aria-label="t('common.subNav')">
        <NuxtLink
          v-for="item in links"
          :key="item.path"
          class="subnav__link"
          :to="localePath(item.path)"
          :aria-current="isActive(item.path) ? 'page' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <MetroTile :to="localePath('/styles')" variant="orange" class="subnav__gallery">
        <span>{{ t('styles.gallery.enter') }}</span>
        <span aria-hidden="true">→</span>
      </MetroTile>
    </div>
  </header>
</template>

<script setup lang="ts">
import MetroTile from './MetroTile.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/metro/about', label: t('nav.about') },
  { path: '/style/metro/projects', label: t('nav.projects') },
  { path: '/style/metro/blog', label: t('nav.blog') },
  { path: '/style/metro/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
.subnav {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--c-bg);
  border-bottom: var(--border-w) solid var(--c-border);
}

.subnav__inner {
  display: flex;
  align-items: center;
  gap: clamp(14px, 3vw, 28px);
  max-width: var(--page-w);
  margin-inline: auto;
  padding: 10px clamp(16px, 4vw, 40px);
}

/* 站点标识：全大写宽字距的强 Typography */
.subnav__brand {
  display: inline-flex;
  align-items: center;
  flex: none;
  min-height: 40px;
  font-family: var(--font-head);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-text);
  text-decoration: none;
  transition: color var(--transition);
}

.subnav__brand:hover {
  color: var(--c-accent);
}

.subnav__nav {
  display: flex;
  gap: clamp(12px, 2vw, 24px);
  margin-left: auto;
  overflow-x: auto;
  scrollbar-width: none;
}

.subnav__nav::-webkit-scrollbar {
  display: none;
}

/* 锚点链接：小字号大写 + hover 底部强调条（Metro 文本链接范式） */
.subnav__link {
  display: inline-flex;
  align-items: center;
  flex: none;
  min-height: 40px;
  font-size: var(--fs-small);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-muted);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition:
    color var(--transition),
    border-color var(--transition);
}

.subnav__link:hover {
  color: var(--c-text);
  border-bottom-color: var(--c-accent);
}

.subnav__link:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}

/* 当前子页：把 hover 的底部强调条固定下来 */
.subnav__link[aria-current='page'] {
  color: var(--c-text);
  border-bottom-color: var(--c-accent);
}

/* 画廊入口：压扁成小条 Tile（复用 MetroTile 的色块/倾斜签名） */
.subnav__gallery {
  flex: none;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 14px;
  font-size: var(--fs-small);
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .subnav__gallery {
    margin-left: auto;
  }
}
</style>
