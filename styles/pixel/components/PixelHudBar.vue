<!--
  PixelHudBar - pixel 风格游戏菜单条（导航头部）
  ------------------------------------------------------------
  老游戏主菜单的样子：站点标识（▶ 光标 + 站点名，点击回顶部）
  + 页内锚点菜单项（原生 <a href="#区块id">，hover 色块反转）
  + 风格画廊入口（站内路由，localePath 包裹，草绿底强调项）。
  吸顶显示，移动端菜单项自动换行（HUD 签名保留）。
-->
<template>
  <header class="hud">
    <div class="hud-inner">
      <!-- 站点标识：回顶部原生锚点 -->
      <a href="#top" class="hud-brand">
        <span class="hud-cursor" aria-hidden="true">▶</span>
        <span class="hud-name">{{ t('home.name') }}</span>
      </a>

      <!-- 页内锚点 + 风格画廊入口 -->
      <nav class="hud-menu">
        <a v-for="item in sections" :key="item.id" :href="'#' + item.id" class="hud-item">
          <span class="hud-cursor" aria-hidden="true">▶</span>
          {{ item.label }}
        </a>
        <NuxtLink :to="localePath('/styles')" class="hud-item hud-item--accent">
          <span class="hud-cursor" aria-hidden="true">▶</span>
          {{ t('styles.gallery.enter') }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  /** 页内锚点导航项（id = 区块锚点，label = i18n 文案） */
  sections: { id: string; label: string }[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
.hud {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--c-surface);
  border-bottom: var(--border-w) solid var(--c-border);
}

.hud-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 16px;
  max-width: var(--page-w);
  margin-inline: auto;
  padding: 8px var(--space);
}

/* 站点标识：金黄 + 硬偏移文字阴影 */
.hud-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  text-decoration: none;
}

.hud-name {
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-accent);
  text-shadow: 2px 2px 0 var(--c-border);
}

.hud-cursor {
  font-size: var(--fs-small);
  color: var(--c-accent-2);
}

.hud-menu {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

/* 菜单项：默认透明边框占位，hover 色块反转（金黄底 + 深色字） */
.hud-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 6px 10px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-text);
  text-decoration: none;
  border: 2px solid transparent;
}

.hud-item .hud-cursor {
  color: var(--c-accent-2);
}

.hud-item:hover {
  background: var(--c-accent);
  color: var(--c-on-accent);
  border-color: var(--c-border);
}

.hud-item:hover .hud-cursor {
  color: var(--c-on-accent);
}

.hud-item:active {
  transform: var(--press-transform);
}

/* 风格画廊入口：草绿底的强调菜单项 */
.hud-item--accent {
  background: var(--c-accent-2);
  color: var(--c-on-accent);
  border-color: var(--c-border);
}

.hud-item--accent .hud-cursor {
  color: var(--c-on-accent);
}

.hud-item--accent:hover {
  background: var(--c-accent);
}

.hud-brand:focus-visible,
.hud-item:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* 窄屏：菜单换行铺满，标识独占一行（HUD 签名保留） */
@media (max-width: 639px) {
  .hud-menu {
    width: 100%;
    margin-left: 0;
  }
}
</style>
