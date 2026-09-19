<!--
  SciFiHudSubNav - sci-fi-hud 风格子页的路由导航
  ------------------------------------------------------------
  与首页 SciFiHudTopBar 的区别有两处：
  · 链接语义：首页是 #about / #posts —— **页内锚点**；
    本组件是 /style/sci-fi-hud/about —— **路由**。子页之间没有可滚动
    的页内区块，锚点在子页上无处可去，两者不能混用。
  · 激活来源：首页通道项无激活态（滚动位置自己会说话）；子页必须用
    路由匹配（aria-current='page'），否则用户不知道自己在哪一栏。

  视觉沿用首页那根驾驶舱主控条：菱形信号徽标 + 站点标识 + 呼吸状态灯
  + 通道项（带指示刻度）+ 画廊入口 + 下缘刻度尺。当前子页把首页
  hover 时的「刻度点亮 + 文字转亮 + 淡信号底」固定下来。
-->
<template>
  <header class="topbar">
    <div class="topbar-inner">
      <!-- 站点标识 + 系统状态灯（灯为装饰） -->
      <NuxtLink class="ident" :to="localePath('/style/sci-fi-hud')">
        <span class="ident-gem" aria-hidden="true" />
        <span class="ident-name">{{ siteName }}</span>
        <span class="ident-dot" aria-hidden="true" />
      </NuxtLink>

      <!-- 子页路由通道 -->
      <nav class="channels" :aria-label="t('common.subNav')">
        <NuxtLink
          v-for="item in links"
          :key="item.path"
          class="channel"
          :to="localePath(item.path)"
          :aria-current="isActive(item.path) ? 'page' : undefined"
        >
          <span class="channel-tick" aria-hidden="true" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- 风格画廊入口 -->
      <NuxtLink class="gallery" :to="localePath('/styles')">
        {{ t('styles.gallery.title') }}<span class="gallery-glyph" aria-hidden="true">↗</span>
      </NuxtLink>
    </div>

    <!-- 下缘刻度尺（纯装饰） -->
    <div class="topbar-ruler" aria-hidden="true" />
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/** 站点名（与首页同源：共享层 siteConfig） */
const { siteConfig } = useAppInfo()
const siteName = computed(() => siteConfig.value.name)

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/sci-fi-hud/about', label: t('nav.about') },
  { path: '/style/sci-fi-hud/projects', label: t('nav.projects') },
  { path: '/style/sci-fi-hud/blog', label: t('nav.blog') },
  { path: '/style/sci-fi-hud/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
/* —— 主控条：吸顶 + 座舱底色（与首页同源） —— */
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  background: color-mix(in srgb, var(--c-bg) 88%, transparent);
  border-bottom: var(--border-w) solid var(--c-border);
  backdrop-filter: blur(8px);
}

.topbar-inner {
  display: flex;
  align-items: center;
  gap: var(--gap);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 8px var(--gap);
}

/* —— 站点标识 —— */
.ident {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  text-decoration: none;
}

/* 标识徽标：菱形信号块 */
.ident-gem {
  width: 12px;
  height: 12px;
  background: var(--c-accent);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  box-shadow: var(--shadow-press);
}

.ident-name {
  font-family: var(--font-head);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-text);
  white-space: nowrap;
}

/* 状态灯：呼吸闪烁（装饰） */
.ident-dot {
  width: 7px;
  height: 7px;
  background: var(--c-accent);
  border-radius: 50%;
  box-shadow: 0 0 6px rgb(74 240 198 / 0.9);
  animation: ident-pulse 2.2s ease-in-out infinite;
}

@keyframes ident-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.25;
  }
}

/* —— 路由通道：窄屏横向滚动 —— */
.channels {
  display: flex;
  flex: 1 1 auto;
  gap: 2px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.channels::-webkit-scrollbar {
  display: none;
}

.channel {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  transition:
    color var(--transition),
    background var(--transition);
}

/* 通道前指示刻度：hover / 当前页点亮 */
.channel-tick {
  width: 3px;
  height: 12px;
  background: var(--c-border);
  transition: background var(--transition);
}

.channel:hover {
  color: var(--c-text);
  background: color-mix(in srgb, var(--c-accent) 8%, transparent);
}

.channel:hover .channel-tick,
.channel:focus-visible .channel-tick {
  background: var(--c-accent);
}

.channel:active {
  transform: var(--press-transform);
}

/* 当前子页：把 hover 的三件套（刻度亮 + 字亮 + 淡信号底）固定下来 */
.channel[aria-current='page'] {
  color: var(--c-text);
  background: color-mix(in srgb, var(--c-accent) 10%, transparent);
}

.channel[aria-current='page'] .channel-tick {
  background: var(--c-accent);
}

/* —— 画廊入口 —— */
.gallery {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  min-height: 40px;
  padding: 8px 12px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  color: var(--c-accent);
  text-decoration: none;
  white-space: nowrap;
  border: var(--border-w) solid color-mix(in srgb, var(--c-accent) 45%, transparent);
  transition:
    color var(--transition),
    background var(--transition),
    border-color var(--transition);
}

.gallery:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.gallery:active {
  transform: var(--press-transform);
}

.gallery-glyph {
  font-family: var(--font-mono);
}

/* 下缘刻度尺：细密刻度整幅排布（装饰） */
.topbar-ruler {
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    color-mix(in srgb, var(--c-accent) 40%, transparent) 0 1px,
    transparent 1px 12px
  );
}

@media (max-width: 640px) {
  .ident-name {
    max-width: 30vw;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ident-dot {
    animation: none;
  }

  .channel,
  .gallery {
    transition: none;
  }

  .channel:active,
  .gallery:active {
    transform: none;
  }
}
</style>
