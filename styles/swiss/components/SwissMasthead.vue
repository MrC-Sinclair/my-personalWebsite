<!--
  SwissMasthead - swiss 风格顶部导航
  ------------------------------------------------------------
  「网格条目式」导航：整条导航是一张被黑色细则线切分的网格，
  每个条目是一个格子（编号 + 标签），站点标识占据最宽的一格。
  页内跳转用原生锚点 <a href="#id">（平滑滚动由全局提供），
  画廊入口是唯一的外部路由（NuxtLink + localePath）。
  交互反馈：hover 时强调色（瑞士红）下划线从左向右生长。
-->
<template>
  <header class="mast">
    <nav class="mast-grid">
      <!-- 站点标识：回到页首 -->
      <a class="mast-cell mast-brand" href="#top">
        <span class="brand-name">{{ t('home.name') }}</span>
      </a>

      <!-- 页内锚点条目 -->
      <a
        v-for="(item, i) in anchorItems"
        :key="item.href"
        class="mast-cell"
        :href="item.href"
      >
        <span class="cell-no" aria-hidden="true">{{ pad(i + 1) }}</span>
        <span class="cell-label">{{ item.label }}</span>
      </a>

      <!-- 风格画廊入口（对外路由，NuxtLink 包裹） -->
      <NuxtLink class="mast-cell mast-gallery" :to="localePath('/styles')">
        <span class="cell-no cell-no--accent" aria-hidden="true">↗</span>
        <span class="cell-label">{{ t('styles.gallery.title') }}</span>
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

/** 页内锚点条目（label 随语言更新） */
const anchorItems = computed(() => [
  { href: '#about', label: t('nav.about') },
  { href: '#projects', label: t('nav.projects') },
  { href: '#posts', label: t('nav.blog') },
  { href: '#contact', label: t('nav.contact') },
])

/** 编号格式化：补零到两位（纯展示用途） */
function pad(n: number): string {
  return String(n).padStart(2, '0')
}
</script>

<style scoped>
/* 顶条：红色顶条 + 白底 + 黑色底规则线
   移动端不做吸顶（多行网格占屏过高），桌面端吸顶 */
.mast {
  position: relative;
  z-index: 20;
  background: var(--c-bg);
  border-top: 4px solid var(--c-accent);
  border-bottom: calc(var(--border-w) * 2) solid var(--c-border);
}

/* 移动端优先：站点标识整行 + 锚点 2×2 网格 + 画廊整行 */
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

/* 移动端 2 列网格：右列格子（第 3、5 个子元素）加左线，
   左列（第 2、4 个）不加；品牌格与画廊格独占整行，同样无线 */
.mast-brand,
.mast-gallery {
  grid-column: 1 / -1;
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

/* —— 桌面端：一行六格的网格条目，吸顶 —— */
@media (min-width: 768px) {
  .mast {
    position: sticky;
    top: 0;
  }

  .mast-grid {
    grid-template-columns: minmax(200px, 1.6fr) repeat(4, minmax(0, 1fr)) minmax(150px, 1.2fr);
  }

  .mast-cell {
    min-height: 56px;
    border-top: none;
  }

  /* 桌面端六格单行：取消移动端的整行独占 */
  .mast-brand,
  .mast-gallery {
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
