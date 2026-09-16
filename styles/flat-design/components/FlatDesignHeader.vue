<!--
  FlatDesignHeader - 扁平化风格顶部导航条
  ------------------------------------------------------------
  纯色深蓝灰导航条（sticky）：几何方形站点标识 + 页内锚点导航 +
  风格画廊扁平按钮。本风格是单页纵向色带结构，窄屏收起锚点导航
  （区块随页面自然滚动到达）；交互反馈只有颜色变化（扁平签名）。
-->
<template>
  <header class="hdr">
    <div class="hdr__inner">
      <!-- 站点标识：黄色几何方块 + 站名，点击回页首（原生锚点） -->
      <a href="#top" class="hdr__brand">
        <span class="hdr__mark" aria-hidden="true"/>
        <span class="hdr__name">{{ t('home.name') }}</span>
      </a>

      <!-- 页内锚点导航：原生锚点跳转，标签走 i18n -->
      <nav class="hdr__nav">
        <a v-for="item in navLinks" :key="item.href" :href="item.href" class="hdr__link">
          {{ item.label }}
        </a>
      </nav>

      <!-- 风格画廊入口：站内路由，localePath 包裹 -->
      <NuxtLink :to="localePath('/styles')" class="hdr__gallery">
        {{ t('styles.gallery.enter') }}
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
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
  background: var(--c-text);
}

.hdr__inner {
  display: flex;
  align-items: center;
  gap: clamp(14px, 3vw, 28px);
  max-width: var(--page-w);
  margin-inline: auto;
  padding: 10px clamp(16px, 4vw, 40px);
}

/* 站点标识：黄色几何方块（本风格的「几何代替图标」签名） */
.hdr__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  transition: color var(--transition);
}

.hdr__mark {
  width: 14px;
  height: 14px;
  background: var(--deco);
  border-radius: var(--radius-sm);
}

.hdr__brand:hover {
  color: var(--deco);
}

/* 锚点链接：浅白文字，hover 提亮 + 淡色底（纯颜色反馈） */
.hdr__link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 10px;
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.1em;
  color: rgb(255 255 255 / 0.75);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition:
    color var(--transition),
    background var(--transition);
}

.hdr__link:hover {
  color: #ffffff;
  background: rgb(255 255 255 / 0.12);
}

/* 画廊入口：强调蓝扁平按钮，hover 加深 */
.hdr__gallery {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  margin-left: auto;
  padding: 0 16px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-on-accent);
  text-decoration: none;
  white-space: nowrap;
  background: var(--c-accent);
  border-radius: var(--radius);
  transition: background var(--transition);
}

.hdr__gallery:hover {
  background: #1b5a86;
}

.hdr__gallery:active {
  background: #174e74;
}

.hdr__brand:focus-visible,
.hdr__link:focus-visible,
.hdr__gallery:focus-visible {
  outline: 3px solid var(--deco);
  outline-offset: 2px;
}

/* 移动端：收起锚点导航（区块随滚动到达），画廊入口顶到右侧 */
@media (max-width: 768px) {
  .hdr__nav {
    display: none;
  }

  .hdr__gallery {
    margin-left: auto;
  }
}
</style>
