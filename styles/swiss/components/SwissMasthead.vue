<!--
  SwissMasthead - swiss 风格顶部导航
  ------------------------------------------------------------
  「网格条目式」导航：整条导航是一张被黑色细则线切分的网格，
  每个条目是一个格子（编号 + 标签），站点标识占据最宽的一格。
  页内跳转用原生锚点 <a href="#id">（平滑滚动由全局提供），
  画廊入口与语言切换是仅有的两个路由出口（NuxtLink）。
  语言切换占据画廊右侧那一格：灰字、无强调箭头，比画廊低一级
  （行为来自共享层 useLocaleSwitch，外观只是又一个细则线条目）。
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
// 语言切换行为走共享层（composables 自动导入，无需 import）
const { targetPath, targetLabel } = useLocaleSwitch()

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

/* 移动端优先：站点标识整行 + 锚点 2×2 网格 + 画廊与语言切换共占末行 */
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
  padding: 12px 16px;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  color: var(--c-text);
  text-decoration: none;
  letter-spacing: 0.08em;
  border-top: var(--border-w) solid var(--c-border);
  transition: color var(--transition);
}

/* 移动端 2 列网格：右列格子（第 3、5、7 个子元素）加左线，
   左列（第 2、4、6 个）不加；品牌格独占整行，
   画廊与语言切换写死占末行左右两格（自动放置会把最后一格撑成整行） */
.mast-brand {
  grid-column: 1 / -1;
}

.mast-gallery {
  grid-column: 1 / 2;
}

/* 语言切换：画廊右侧的安静格子——灰字、无强调箭头，
   命中区靠 min-width/min-height（.mast-cell 已给 48px）撑满整格 */
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

/* 站点标识：加粗、紧凑字距 */
.mast-brand {
  min-height: 52px;
  border-top: none;
}

.brand-name {
  font-size: 18px;
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

  /* 桌面端七格单行：取消移动端的整行独占与末行两格 */
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
