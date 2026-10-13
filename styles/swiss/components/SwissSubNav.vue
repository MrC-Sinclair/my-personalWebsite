<!--
  SwissSubNav - swiss 风格子页的路由导航
  ------------------------------------------------------------
  与首页 SwissMasthead 的区别有两处：
  · 链接语义：首页是 #about / #projects —— **页内锚点**；
    本组件是 /style/swiss/about —— **路由**。子页之间没有可滚动的
    页内区块，锚点在子页上无处可去，两者不能混用。
  · 激活来源：首页锚点条目没有激活态（滚动位置自己会说话）；子页
    必须用路由匹配（aria-current='page'），否则用户不知道在哪一栏。

  视觉沿用首页那张「被黑色细则线切分的网格」：编号 + 标签的条目格、
  站点标识占最宽一格、画廊入口是强调色箭头格。当前子页把首页
  hover 时的红色下划线常亮（scaleX(1)）+ 文字转红——瑞士风的选中态
  只能用「线的生长」表达，没有底色块。
  语言切换是画廊右侧那格安静条目（灰字无箭头，行为来自共享层 useLocaleSwitch）。
-->
<template>
  <header class="mast">
    <nav class="mast-grid">
      <!-- 站点标识：回风格首页（路由，不是 #top 锚点） -->
      <NuxtLink class="mast-cell mast-brand" :to="localePath('/style/swiss')">
        <span class="brand-name">{{ t('home.name') }}</span>
      </NuxtLink>

      <!-- 子页路由条目 -->
      <NuxtLink
        v-for="(item, i) in links"
        :key="item.path"
        class="mast-cell"
        :to="localePath(item.path)"
        :aria-current="isActive(item.path) ? 'page' : undefined"
      >
        <span class="cell-no" aria-hidden="true">{{ pad(i + 1) }}</span>
        <span class="cell-label">{{ item.label }}</span>
      </NuxtLink>

      <!-- 风格画廊入口（对外路由） -->
      <NuxtLink class="mast-cell mast-gallery" :to="localePath('/styles')">
        <span class="cell-no cell-no--accent" aria-hidden="true">↗</span>
        <span class="cell-label">{{ t('styles.gallery.title') }}</span>
      </NuxtLink>

      <!-- 语言切换：画廊右侧的安静格子（行为走共享层） -->
      <NuxtLink class="mast-cell mast-lang" :to="targetPath" :aria-label="t('common.language')">
        <span class="cell-label">{{ targetLabel }}</span>
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
// 语言切换行为走共享层（composables 自动导入，无需 import）
const { targetPath, targetLabel } = useLocaleSwitch()

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/swiss/about', label: t('nav.about') },
  { path: '/style/swiss/projects', label: t('nav.projects') },
  { path: '/style/swiss/blog', label: t('nav.blog') },
  { path: '/style/swiss/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}

/** 编号格式化：补零到两位（纯展示用途） */
function pad(n: number): string {
  return String(n).padStart(2, '0')
}
</script>

<style scoped>
/* 顶条：红色顶条 + 白底 + 黑色底规则线（与首页同源） */
.mast {
  position: relative;
  z-index: 20;
  background: var(--c-bg);
  border-top: 4px solid var(--c-accent);
  border-bottom: calc(var(--border-w) * 2) solid var(--c-border);
}

/* 移动端优先：站点标识整行 + 条目 2×2 网格 + 画廊与语言切换共占末行 */
.mast-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.mast-cell {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 10px 16px;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  color: var(--c-text);
  text-decoration: none;
  letter-spacing: 0.08em;
  border-top: var(--border-w) solid var(--c-border);
  transition: color var(--transition);
}

/* 站点标识独占整行；画廊与语言切换写死占末行左右两格——
   位置若交给自动放置，最后一格会被撑成整行（右列格子：第 3、5、7 个） */
.mast-brand {
  grid-column: 1 / -1;
  border-left: none;
}

.mast-gallery {
  grid-column: 1 / 2;
}

/* 语言切换：画廊右侧的安静格子——灰字、无强调箭头 */
.mast-lang {
  grid-column: 2 / 3;
  min-width: 40px;
  color: var(--c-muted);
}

.mast-lang:hover {
  color: var(--c-text);
}

/* 焦点环走内描边：格子彼此贴边，外扩的环会盖住邻居的细则线 */
.mast-lang:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -4px;
}

.mast-cell:nth-child(odd) {
  border-left: var(--border-w) solid var(--c-border);
}

.mast-cell.mast-brand,
.mast-cell.mast-gallery {
  border-left: none;
}

/* 强调色下划线：从左向右生长（瑞士风的交互反馈） */
.mast-cell::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3px;
  content: '';
  background: var(--c-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition);
}

.mast-cell:hover::after,
.mast-cell:focus-visible::after {
  transform: scaleX(1);
}

.mast-cell:active {
  color: var(--c-accent);
}

/* 当前子页：把 hover 的下划线固定下来 + 文字转红（没有底色块） */
.mast-cell[aria-current='page'] {
  color: var(--c-accent);
}

.mast-cell[aria-current='page']::after {
  transform: scaleX(1);
}

/* 站点标识：加粗、紧凑字距 */
.mast-brand {
  min-height: 52px;
  border-top: none;
}

.brand-name {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.cell-no {
  flex: none;
  font-size: var(--fs-small);
  color: var(--c-muted);
  font-variant-numeric: tabular-nums;
}

.cell-no--accent {
  color: var(--c-accent);
}

.cell-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* —— 桌面端：一行七格的网格条目，吸顶 —— */
@media (min-width: 768px) {
  .mast {
    position: sticky;
    top: 0;
  }

  .mast-grid {
    grid-template-columns: minmax(180px, 1.6fr) repeat(4, minmax(0, 1fr)) minmax(120px, 1fr) 90px;
  }

  .mast-cell {
    min-height: 56px;
    border-top: none;
  }

  .mast-brand,
  .mast-gallery,
  .mast-lang {
    grid-column: auto;
  }

  .mast-cell:not(:first-child) {
    border-left: var(--border-w) solid var(--c-border);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mast-cell,
  .mast-cell::after {
    transition: none;
  }
}
</style>
