<!--
  Y2KSubNav - y2k 风格子页的路由导航
  ------------------------------------------------------------
  与首页 Y2KSiteHeader 的区别有两处：
  · 链接语义：首页是 #about / #projects —— **页内锚点**；
    本组件是 /style/y2k/about —— **路由**。子页之间没有可滚动的
    页内区块，锚点在子页上无处可去，两者不能混用。
  · 激活来源：首页靠 useActiveSection 观察滚动位置；子页没有滚动
    区块可观察，改用路由匹配（aria-current='page'）。

  视觉沿用首页那根「透明塑料 + 铬边」吸顶条：铬球站点标识、
  底部彩虹高光线、胶囊条目、品红辉光画廊入口。当前子页是
  「塑料胶囊点亮」（与首页滚动激活态同一套观感）。
-->
<template>
  <header class="hd">
    <div class="hd-inner">
      <NuxtLink class="brand" :to="localePath('/style/y2k')">
        <span class="brand-orb" aria-hidden="true"/>
        <span class="brand-name">{{ t('home.name') }}</span>
      </NuxtLink>

      <nav class="hd-nav" :aria-label="t('common.subNav')">
        <NuxtLink
          v-for="item in links"
          :key="item.path"
          class="hd-link"
          :to="localePath(item.path)"
          :aria-current="isActive(item.path) ? 'page' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <NuxtLink class="hd-gallery" :to="localePath('/styles')">
        <span class="hd-gallery-star" aria-hidden="true">✦</span>
        {{ t('styles.gallery.title') }}
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/y2k/about', label: t('nav.about') },
  { path: '/style/y2k/projects', label: t('nav.projects') },
  { path: '/style/y2k/blog', label: t('nav.blog') },
  { path: '/style/y2k/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
/* —— 吸顶条：透明塑料 + 底部铬边（与首页同源） —— */
.hd {
  position: sticky;
  top: 0;
  z-index: 30;
  background: linear-gradient(180deg, rgb(23 16 72 / 0.92) 0%, rgb(23 16 72 / 0.62) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 底部铬边 + 彩虹高光线 */
.hd::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgb(255 92 225 / 0.7) 18%,
    rgb(139 123 255 / 0.85) 50%,
    rgb(69 227 255 / 0.7) 82%,
    transparent 100%
  );
}

.hd-inner {
  display: flex;
  align-items: center;
  gap: var(--gap);
  width: min(100% - 2 * var(--space), var(--page-w));
  min-height: 64px;
  margin-inline: auto;
}

/* —— 站点标识：铬球 + 铬字（点击回风格首页） —— */
.brand {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  text-decoration: none;
}

.brand-orb {
  flex: none;
  width: 26px;
  height: 26px;
  border: 1px solid rgb(255 255 255 / 0.55);
  border-radius: 50%;
  background: radial-gradient(
    120% 120% at 32% 26%,
    #ffffff 0%,
    #c3cdf2 30%,
    #6a76b8 58%,
    #2c3468 82%,
    #171048 100%
  );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.9),
    0 0 12px rgb(139 123 255 / 0.55);
}

.brand-name {
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 900;
  letter-spacing: 0.04em;
  background: linear-gradient(180deg, #ffffff 0%, #c7d3f2 42%, #6e7db1 58%, #aeb9e8 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  transition: filter var(--transition);
}

.brand:hover .brand-orb {
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.9),
    0 0 18px rgb(255 92 225 / 0.65);
}

.brand:hover .brand-name {
  filter: brightness(1.25);
}

/* —— 子页路由胶囊（窄屏横向滚动） —— */
.hd-nav {
  display: flex;
  flex: 1;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.hd-nav::-webkit-scrollbar {
  display: none;
}

.hd-link {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 40px;
  padding: 6px 16px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-muted);
  white-space: nowrap;
  text-decoration: none;
  border: var(--border-w) solid transparent;
  border-radius: 999px;
  transition:
    color var(--transition),
    border-color var(--transition),
    background var(--transition),
    box-shadow var(--transition);
}

.hd-link:hover {
  color: var(--c-text);
  border-color: rgb(190 200 255 / 0.5);
  background: rgb(255 255 255 / 0.08);
}

.hd-link:active {
  transform: var(--press-transform);
}

/* 当前页：塑料胶囊点亮（与首页滚动激活态同款） */
.hd-link[aria-current='page'] {
  color: var(--c-on-accent);
  border-color: rgb(255 255 255 / 0.65);
  background: linear-gradient(180deg, #dfe6ff 0%, #98a5dd 55%, #7683c4 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.9),
    0 0 14px rgb(139 123 255 / 0.45);
}

/* —— 风格画廊入口（品红辉光塑料胶囊） —— */
.hd-gallery {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 16px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-text);
  text-decoration: none;
  border: var(--border-w) solid rgb(255 92 225 / 0.6);
  border-radius: 999px;
  background: linear-gradient(180deg, rgb(255 92 225 / 0.28) 0%, rgb(139 123 255 / 0.16) 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.45),
    0 0 14px rgb(255 92 225 / 0.3);
  transition:
    box-shadow var(--transition),
    transform var(--transition),
    background var(--transition);
}

.hd-gallery:hover {
  background: linear-gradient(180deg, rgb(255 92 225 / 0.44) 0%, rgb(139 123 255 / 0.3) 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.6),
    0 0 22px rgb(255 92 225 / 0.55);
}

.hd-gallery:active {
  transform: var(--press-transform);
}

.hd-gallery-star {
  color: var(--c-accent-2);
}

/* —— 窄屏：画廊入口收为星形胶囊 —— */
@media (max-width: 767px) {
  .hd-inner {
    gap: 10px;
  }

  .hd-gallery {
    padding: 8px 12px;
  }
}

@media (min-width: 768px) {
  .hd-gallery-star {
    animation: star-spin 6s linear infinite;
  }

  @keyframes star-spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-name,
  .hd-link,
  .hd-gallery {
    transition: none;
  }

  .hd-gallery-star {
    animation: none;
  }

  .hd-link:active,
  .hd-gallery:active {
    transform: none;
  }
}
</style>
