<!--
  MetroSiteHeader - Metro 风格顶部栏
  ------------------------------------------------------------
  站点标识（回顶部原生锚点）+ 页内锚点导航 + 风格画廊小 Tile 入口。
  本风格是单页纵向信息版面，移动端收起锚点导航（无需抽屉菜单），
  所有区块随页面自然滚动到达。
-->
<template>
  <header class="hdr">
    <div class="hdr__inner">
      <a href="#top" class="hdr__brand">{{ t('home.name') }}</a>

      <!-- 页内锚点导航：原生锚点跳转，标签走 i18n -->
      <nav class="hdr__nav">
        <a v-for="item in navLinks" :key="item.href" :href="item.href" class="hdr__link">
          {{ item.label }}
        </a>
      </nav>

      <!-- 风格画廊入口：站内路由，localePath 包裹 -->
      <MetroTile :to="localePath('/styles')" variant="orange" class="hdr__gallery">
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

/** 页内锚点导航项 */
const navLinks = computed(() => [
  { label: t('nav.about'), href: '#about' },
  { label: t('nav.projects'), href: '#projects' },
  { label: t('nav.blog'), href: '#blog' },
  { label: t('nav.contact'), href: '#contact' },
])
</script>

<style scoped>
.hdr {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--c-bg);
  border-bottom: var(--border-w) solid var(--c-border);
}

.hdr__inner {
  display: flex;
  align-items: center;
  gap: clamp(14px, 3vw, 28px);
  max-width: var(--page-w);
  margin-inline: auto;
  padding: 10px clamp(16px, 4vw, 40px);
}

/* 站点标识：全大写宽字距的强 Typography */
.hdr__brand {
  display: inline-flex;
  align-items: center;
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

.hdr__brand:hover {
  color: var(--c-accent);
}

.hdr__nav {
  display: flex;
  gap: clamp(12px, 2vw, 24px);
  margin-left: auto;
}

/* 锚点链接：小字号大写 + hover 底部强调条（Metro 文本链接范式） */
.hdr__link {
  display: inline-flex;
  align-items: center;
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

.hdr__link:hover {
  color: var(--c-text);
  border-bottom-color: var(--c-accent);
}

/* 画廊入口：压扁成小条 Tile（复用 MetroTile 的色块/倾斜签名） */
.hdr__gallery {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 14px;
  font-size: var(--fs-small);
  font-weight: 600;
  white-space: nowrap;
}

.hdr__brand:focus-visible,
.hdr__link:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}

/* 移动端：收起锚点导航，画廊入口顶到右侧 */
@media (max-width: 768px) {
  .hdr__nav {
    display: none;
  }

  .hdr__gallery {
    margin-left: auto;
  }
}
</style>
