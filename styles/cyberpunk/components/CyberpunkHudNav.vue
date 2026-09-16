<!--
  CyberpunkHudNav - cyberpunk 风格顶部 HUD 导航
  ------------------------------------------------------------
  吸顶的「街头终端」导航条：左侧站点标识（闪烁信号块 + 等宽
  发光站名），右侧页内锚点（原生 <a href="#...">，hover 时
  前缀 ">" 点亮 + 霓虹辉光）与「风格画廊」入口（切角按钮）。
  窄屏时锚点行横向滚动（两端渐隐提示可滑），触控目标 ≥40px，
  底部一条青→粉霓虹渐变线贯穿全宽。
-->
<template>
  <header class="hud-top safe-top">
    <nav class="hud" :aria-label="t('common.mobileNav')">
      <!-- 站点标识：信号块 + 站名（点击回页顶） -->
      <a class="brand" href="#home">
        <span class="brand-sigil" aria-hidden="true"/>
        <span class="brand-text">{{ t('home.name') }}</span>
      </a>

      <!-- 页内锚点：窄屏横向滚动 -->
      <div class="links-scroll">
        <ul class="links">
          <li v-for="item in anchors" :key="item.id">
            <a class="link" :href="`#${item.id}`">
              <span class="link-prefix" aria-hidden="true">></span>{{ item.label }}
            </a>
          </li>
        </ul>
      </div>

      <!-- 风格画廊入口（对外路由，走 localePath） -->
      <NuxtLink class="gallery" :to="localePath('/styles')">
        {{ t('styles.gallery.enter') }}
      </NuxtLink>
    </nav>

    <!-- 底部霓虹渐变线 -->
    <div class="neon-line" aria-hidden="true"/>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

/** 页内锚点清单（label 随语言更新） */
const anchors = computed(() => [
  { id: 'about', label: t('nav.about') },
  { id: 'projects', label: t('nav.projects') },
  { id: 'posts', label: t('nav.blog') },
  { id: 'contact', label: t('nav.contact') },
])
</script>

<style scoped>
/* —— 吸顶容器：半透深色 + 背景模糊，压住滚动内容 —— */
.hud-top {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgb(5 1 13 / 0.86);
  backdrop-filter: blur(10px) saturate(1.2);
  -webkit-backdrop-filter: blur(10px) saturate(1.2);
}

@supports not (backdrop-filter: blur(1px)) {
  .hud-top {
    background: rgb(5 1 13 / 0.96);
  }
}

.hud {
  display: flex;
  align-items: center;
  gap: var(--gap);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 6px var(--gap);
}

/* —— 站点标识：闪烁信号块 + 等宽发光站名 —— */
.brand {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  text-decoration: none;
  transition:
    opacity var(--transition),
    transform var(--transition);
}

.brand:hover {
  opacity: 0.85;
}

.brand:active {
  transform: var(--press-transform);
}

/* 信号块：斜切菱形，青色辉光脉冲（街机待机呼吸灯） */
.brand-sigil {
  width: 12px;
  height: 12px;
  background: var(--c-accent);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  box-shadow: 0 0 10px rgb(34 211 238 / 0.8);
  animation: sigil-pulse 2.2s ease-in-out infinite;
}

@keyframes sigil-pulse {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 10px rgb(34 211 238 / 0.8);
  }

  50% {
    opacity: 0.45;
    box-shadow: 0 0 4px rgb(34 211 238 / 0.4);
  }
}

.brand-text {
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-accent);
  text-shadow: 0 0 8px rgb(34 211 238 / 0.55);
  white-space: nowrap;
}

/* —— 锚点行：窄屏横向滚动，两端渐隐提示可滑 —— */
.links-scroll {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  mask-image: linear-gradient(90deg, transparent, #000 10px, #000 calc(100% - 10px), transparent);
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent,
    #000 10px,
    #000 calc(100% - 10px),
    transparent
  );
}

.links-scroll::-webkit-scrollbar {
  display: none;
}

.links {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 锚点条目：">" 前缀默认半隐，hover 点亮并泛光 */
.link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 14px;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  transition:
    color var(--transition),
    text-shadow var(--transition),
    background var(--transition),
    transform var(--transition);
}

.link-prefix {
  margin-right: 2px;
  color: var(--c-accent-2);
  opacity: 0;
  transform: translateX(-4px);
  transition:
    opacity var(--transition),
    transform var(--transition);
}

.link:hover {
  color: var(--c-text);
  text-shadow: 0 0 10px rgb(34 211 238 / 0.5);
}

.link:hover .link-prefix {
  opacity: 1;
  transform: translateX(0);
}

.link:active {
  transform: var(--press-transform);
}

/* —— 画廊入口：粉边切角按钮（hover 粉色填充 + 辉光） —— */
.gallery {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 40px;
  padding: 8px 18px;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  color: var(--c-accent-2);
  text-decoration: none;
  white-space: nowrap;
  background: rgb(255 45 149 / 0.08);
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  box-shadow: inset 0 0 0 var(--border-w) rgb(255 45 149 / 0.55);
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.gallery:hover {
  color: var(--c-on-accent);
  background: var(--c-accent-2);
  box-shadow:
    inset 0 0 0 var(--border-w) var(--c-accent-2),
    0 0 16px rgb(255 45 149 / 0.5);
}

.gallery:active {
  transform: var(--press-transform);
}

/* —— 底部霓虹渐变线（青 → 紫边缘 → 粉） —— */
.neon-line {
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--c-accent),
    color-mix(in srgb, var(--c-accent) 40%, var(--c-accent-2)) 55%,
    var(--c-accent-2)
  );
  box-shadow: 0 0 12px rgb(34 211 238 / 0.45);
}

/* 窄屏：锚点行靠左滚动，画廊入口保持可见 */
@media (max-width: 640px) {
  .hud {
    gap: 8px;
  }

  .links {
    justify-content: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand,
  .brand-sigil,
  .link,
  .link-prefix,
  .gallery {
    transition: none;
    animation: none;
  }

  .brand:active,
  .link:active,
  .gallery:active {
    transform: none;
  }

  .link-prefix {
    transform: none;
  }
}
</style>
