<!--
  FlatDesignSubNav - 扁平化风格子页的路由导航
  ------------------------------------------------------------
  与首页 FlatDesignHeader 的区别：
  · 链接语义：首页是 #about / #projects… 页内锚点；本组件是
    /style/flat-design/about … 路由。子页只有一个纵向版面，锚点无处可去，
    两者不能混用。
  · 激活来源：首页的锚点链接无激活态（页面滚动自己会说话）；子页
    用路由匹配（aria-current='page'），否则用户不知道自己在哪一栏。

  视觉沿用首页那根顶部栏：黄色几何方块站点标识 + 文字链接 + 画廊入口。
  当前子页把首页 hover 时的「强调色 + 底部色条」固定下来（扁平化只有
  纯颜色反馈，选中即用强调蓝色表达）。
-->
<template>
  <header class="fd-subnav">
    <div class="fd-subnav__inner">
      <NuxtLink class="fd-subnav__brand" :to="localePath('/style/flat-design')">
        <span class="fd-subnav__mark" aria-hidden="true" />
        <span class="fd-subnav__name">{{ t('home.name') }}</span>
      </NuxtLink>

      <nav class="fd-subnav__nav" :aria-label="t('common.subNav')">
        <NuxtLink
          v-for="item in links"
          :key="item.path"
          class="fd-subnav__link"
          :to="localePath(item.path)"
          :aria-current="isActive(item.path) ? 'page' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <NuxtLink :to="localePath('/styles')" class="fd-subnav__gallery">
        {{ t('styles.gallery.enter') }}
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
  { path: '/style/flat-design/about', label: t('nav.about') },
  { path: '/style/flat-design/projects', label: t('nav.projects') },
  { path: '/style/flat-design/blog', label: t('nav.blog') },
  { path: '/style/flat-design/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
.fd-subnav {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--c-surface);
  border-bottom: 3px solid var(--c-accent);
}

.fd-subnav__inner {
  display: flex;
  align-items: center;
  gap: clamp(14px, 3vw, 28px);
  max-width: var(--page-w);
  margin-inline: auto;
  padding: 12px clamp(16px, 4vw, 40px);
}

/* 站点标识：黄色几何方块 + 站名 */
.fd-subnav__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex: none;
  text-decoration: none;
  color: var(--c-text);
}

.fd-subnav__mark {
  width: 14px;
  height: 14px;
  background: var(--deco);
  border-radius: var(--radius-sm);
}

.fd-subnav__name {
  font-family: var(--font-head);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.fd-subnav__nav {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(10px, 2vw, 22px);
  margin-left: auto;
}

/* 路由链接：大写字距文字链接，hover 强调色 + 底部色条 */
.fd-subnav__link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-muted);
  text-decoration: none;
  border-bottom: 3px solid transparent;
  transition:
    color var(--transition),
    border-color var(--transition);
}

.fd-subnav__link:hover {
  color: var(--c-accent);
  border-bottom-color: var(--c-accent);
}

.fd-subnav__link:focus-visible {
  outline: 3px solid var(--c-accent);
  outline-offset: 2px;
}

/* 当前子页：把 hover 的强调色 + 底部色条固定下来 */
.fd-subnav__link[aria-current='page'] {
  color: var(--c-accent);
  border-bottom-color: var(--c-accent);
}

/* 画廊入口：纯文字链接（与首页一致） */
.fd-subnav__gallery {
  flex: none;
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-accent);
  text-decoration: none;
  transition: color var(--transition);
}

.fd-subnav__gallery:hover {
  color: #1b5a86;
}

@media (max-width: 640px) {
  .fd-subnav__gallery {
    margin-left: auto;
  }
}
</style>
