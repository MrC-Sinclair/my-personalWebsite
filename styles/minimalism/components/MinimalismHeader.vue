<!--
  MinimalismHeader - minimalism 风格的吸顶导航头
  ------------------------------------------------------------
  三要素：站点标识（点击回顶部）+ 页内锚点（关于 / 项目 /
  文章 / 联系，原生 <a href="#id">，平滑滚动由全局 CSS 提供）
  + 风格画廊入口（localePath 包裹）。桌面端单行；窄屏回退为
  两行（标识 + 画廊一行，锚点横向滚动一行）。链接反馈克制：
  下划线由透明渐显为强调色。safe-top 适配刘海屏。
-->
<template>
  <header class="hd safe-top">
    <div class="hd-inner">
      <a class="brand" href="#top">
        <span class="brand-dot" aria-hidden="true"/>
        <span class="brand-name">{{ t('home.name') }}</span>
      </a>

      <!-- 页面唯一的 nav 地标，无需 aria-label 区分 -->
      <nav class="hd-nav">
        <a class="hd-link" href="#about">{{ t('nav.about') }}</a>
        <a class="hd-link" href="#projects">{{ t('nav.projects') }}</a>
        <a class="hd-link" href="#posts">{{ t('nav.blog') }}</a>
        <a class="hd-link" href="#contact">{{ t('nav.contact') }}</a>
      </nav>

      <NuxtLink class="hd-gallery" :to="localePath('/styles')">
        {{ t('styles.gallery.title') }}
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* —— 吸顶条：纸面同色 + hairline 底线（悬浮干扰降到最低） —— */
.hd {
  position: sticky;
  top: 0;
  z-index: 30; /* 风格内局部层级：高于内容，低于遮罩语义层 */
  background: var(--c-bg);
  border-bottom: var(--border-w) solid var(--c-border);
}

.hd-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0 16px;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 12px var(--space);
}

/* —— 站点标识：指示点 + 站名，点击回顶部 —— */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--c-text);
  text-decoration: none;
  transition: color var(--transition);
}

.brand:hover {
  color: var(--c-accent);
}

.brand:active {
  transform: var(--press-transform);
}

/* 唯一的强调色指示点（简单几何形状） */
.brand-dot {
  flex: none;
  width: 8px;
  height: 8px;
  background: var(--c-accent);
  border-radius: 50%;
}

/* —— 页内锚点：下划线由透明渐显为强调色（克制的反馈） —— */
.hd-nav {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
  min-width: 0;
}

.hd-link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 12px;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-decoration: underline;
  text-decoration-color: transparent;
  text-decoration-thickness: 1px;
  text-underline-offset: 6px;
  white-space: nowrap;
  transition:
    color var(--transition),
    text-decoration-color var(--transition);
}

.hd-link:hover {
  color: var(--c-text);
  text-decoration-color: var(--c-accent);
}

.hd-link:active {
  transform: var(--press-transform);
}

/* —— 风格画廊入口：唯一带边框的胶囊（导航终点标记） —— */
.hd-gallery {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 16px;
  font-size: var(--fs-small);
  color: var(--c-text);
  text-decoration: none;
  white-space: nowrap;
  border: var(--border-w) solid var(--c-border);
  border-radius: 999px;
  transition:
    color var(--transition),
    border-color var(--transition),
    background var(--transition);
}

.hd-gallery:hover {
  color: var(--c-accent);
  border-color: var(--c-accent);
  background: var(--c-surface);
}

.hd-gallery:active {
  transform: var(--press-transform);
}

/* —— 窄屏回退：两行布局（标识 + 画廊 / 锚点横向滚动行） —— */
@media (max-width: 767px) {
  .hd-inner {
    grid-template-columns: 1fr auto;
    gap: 0 12px;
    padding: 10px var(--space) 6px;
  }

  .hd-nav {
    grid-column: 1 / -1;
    justify-content: flex-start;
    padding-bottom: 4px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .hd-nav::-webkit-scrollbar {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand,
  .hd-link,
  .hd-gallery {
    transition: none;
  }

  .brand:active,
  .hd-link:active,
  .hd-gallery:active {
    transform: none;
  }
}
</style>
