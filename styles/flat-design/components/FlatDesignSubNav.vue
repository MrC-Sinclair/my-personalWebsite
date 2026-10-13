<!--
  FlatDesignSubNav - 扁平化风格子页的路由导航
  ------------------------------------------------------------
  与首页 FlatDesignHeader 的区别：
  · 链接语义：首页是 #about / #projects… 页内锚点；本组件是
    /style/flat-design/about … 路由。子页只有一个纵向版面，锚点无处可去，
    两者不能混用。
  · 激活来源：首页的锚点链接无激活态（页面滚动自己会说话）；子页
    用路由匹配（aria-current='page'），否则用户不知道自己在哪一栏。

  视觉沿用首页那根顶部栏：黄色几何方块站点标识 + 文字链接 + 画廊入口
  + 一条语言切换扁平色块（行为走共享层 useLocaleSwitch）。
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

      <!-- 右侧动作组：语言切换 + 画廊入口（成组换行，不撑出横向滚动） -->
      <div class="fd-subnav__actions">
        <!-- 语言切换：扁平浅灰小色块，比强调蓝的画廊文字链低一级 -->
        <NuxtLink class="fd-subnav__lang" :to="targetPath" :aria-label="t('common.language')">
          {{ targetLabel }}
        </NuxtLink>

        <NuxtLink :to="localePath('/styles')" class="fd-subnav__gallery">
          {{ t('styles.gallery.enter') }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
// 切换行为走共享层，外观由本风格决定
const { targetPath, targetLabel } = useLocaleSwitch()

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
  /* 320 宽（en）下品牌与画廊按钮两个 flex:none 的块自己就超过视口，
     溢出 32px。给一条退路，放不下就换行而不是撑出横向滚动。 */
  flex-wrap: wrap;
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
  min-height: 40px;
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
  justify-content: center;
  min-height: 40px;
  /* 两字标签只有 31px 宽，兜到 40px 才有可点的横向命中区 */
  min-width: 40px;
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

/* 右侧动作组：语言切换 + 画廊入口 */
.fd-subnav__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: clamp(10px, 2vw, 22px);
  min-width: 0;
}

/* 语言切换：扁平浅灰小色块（比画廊的强调蓝文字链低一级） */
.fd-subnav__lang {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  min-height: 40px;
  min-width: 40px;
  padding: 0 10px;
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  transition:
    color var(--transition),
    background var(--transition);
}

.fd-subnav__lang:hover {
  color: var(--c-text);
  background: var(--c-border);
}

/* 扁平签名：按压只换色，不做位移 */
.fd-subnav__lang:active {
  color: var(--c-on-accent);
  background: var(--c-accent);
}

.fd-subnav__lang:focus-visible {
  outline: 3px solid var(--c-accent);
  outline-offset: 2px;
}

/* 画廊入口：纯文字链接（与首页一致） */
.fd-subnav__gallery {
  flex: none;
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  /* 同上：三个字在窄一号的回退字体下只有 37px 宽，命中区下限不该依赖字形 */
  min-width: 40px;
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
  /* 窄屏把动作组整体推到右端（原先是画廊入口自己贴右） */
  .fd-subnav__actions {
    margin-left: auto;
  }
}
</style>
