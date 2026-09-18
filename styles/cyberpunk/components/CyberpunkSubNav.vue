<!--
  CyberpunkSubNav - cyberpunk 风格子页的路由导航
  ------------------------------------------------------------
  与首页 CyberpunkHudNav 的区别只在链接语义：
  · 首页导航是 #about / #projects —— **页内锚点**
  · 本组件是 /style/cyberpunk/about —— **路由**
  子页之间没有可滚动的页内区块，锚点在子页上无处可去，两者不能混用。

  视觉沿用首页那台「街头终端」：半透深底 + 背景模糊、信号块呼吸灯、
  等宽发光站名、条目带 ">" 前缀（hover 点亮）、画廊入口是粉边切角钮，
  底部贯穿一条青→粉霓虹渐变线。当前子页的前缀常亮并换粉字——
  HUD 里「当前页」就是这一行被点亮。
-->
<template>
  <header class="hud-top safe-top">
    <nav class="hud" :aria-label="t('common.subNav')">
      <NuxtLink class="brand" :to="localePath('/style/cyberpunk')">
        <span class="brand-sigil" aria-hidden="true"/>
        <span class="brand-text">{{ t('home.name') }}</span>
      </NuxtLink>

      <div class="links-scroll">
        <ul class="links">
          <li v-for="item in links" :key="item.path">
            <NuxtLink
              class="link"
              :to="localePath(item.path)"
              :aria-current="isActive(item.path) ? 'page' : undefined"
            >
              <span class="link-prefix" aria-hidden="true">></span>{{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <NuxtLink class="gallery" :to="localePath('/styles')">
        {{ t('styles.galleryLink') }}
      </NuxtLink>
    </nav>

    <!-- 底部霓虹渐变线 -->
    <div class="neon-line" aria-hidden="true"/>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/cyberpunk/about', label: t('nav.about') },
  { path: '/style/cyberpunk/projects', label: t('nav.projects') },
  { path: '/style/cyberpunk/blog', label: t('nav.blog') },
  { path: '/style/cyberpunk/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
/* —— 吸顶容器：半透深色 + 背景模糊（与首页同源） —— */
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

/* —— 链接行：窄屏横向滚动，两端渐隐提示可滑 —— */
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

/* 条目：">" 前缀默认半隐，hover 点亮并泛光 */
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

/* 当前页：这一行被点亮（前缀常亮 + 粉字 + 霓虹底） */
.link[aria-current='page'] {
  color: var(--c-accent-2);
  background: rgb(255 45 149 / 0.12);
  text-shadow: 0 0 10px rgb(255 45 149 / 0.55);
}

.link[aria-current='page'] .link-prefix {
  opacity: 1;
  transform: translateX(0);
}

/* —— 画廊入口：粉边切角按钮 —— */
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

/* 窄屏：链接行靠左滚动，画廊入口保持可见 */
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
