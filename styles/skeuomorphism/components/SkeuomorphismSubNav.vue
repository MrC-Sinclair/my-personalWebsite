<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismSubNav - 拟物风格子页的路由导航
  ------------------------------------------------------------
  与首页 SkeuomorphismDeskHeader 的区别有两处：
  · 链接语义：首页是 #about / #posts —— **页内锚点**；
    本组件是 /style/skeuomorphism/about —— **路由**。子页之间没有可
    滚动的页内区块，锚点在子页上无处可去，两者不能混用。
  · 激活来源：首页靠 useActiveSection 观察滚动位置；子页没有滚动区块
    可观察，改用路由匹配（aria-current='page'）。

  外观与首页那根木杆菜单条完全一致：两端黄铜螺栓、黄铜铭牌站点标识、
  皮革缝线标签条目、黄铜画廊按钮。当前子页把首页滚动激活态那套
  「皮革标签被按进木杆」的内凹行程固定下来——拟物只有凸起/按下两态。
-->
<template>
  <header class="hd">
    <span class="hd-bolt hd-bolt--l" aria-hidden="true" />
    <span class="hd-bolt hd-bolt--r" aria-hidden="true" />

    <div class="hd-inner">
      <!-- 站点标识：黄铜铭牌（回风格首页，路由而非 #top 锚点） -->
      <NuxtLink class="brand" :to="localePath('/style/skeuomorphism')">
        <span class="brand-plate">
          <span class="brand-rivet" aria-hidden="true" />
          {{ t('home.name') }}
          <span class="brand-rivet" aria-hidden="true" />
        </span>
      </NuxtLink>

      <!-- 子页路由：皮革缝线标签 -->
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

      <!-- 风格画廊入口：黄铜按钮 -->
      <NuxtLink class="hd-gallery" :to="localePath('/styles')">
        <span class="hd-gallery-rivet" aria-hidden="true" />
        {{ t('styles.gallery.title') }}
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * @file 拟物风格子页导航组件
 * @description 木杆菜单条改为子页路由链接；激活态由路由匹配决定，
 *              不再依赖滚动观察。
 */
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/skeuomorphism/about', label: t('nav.about') },
  { path: '/style/skeuomorphism/projects', label: t('nav.projects') },
  { path: '/style/skeuomorphism/blog', label: t('nav.blog') },
  { path: '/style/skeuomorphism/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
/* 胡桃木横杆：竖向木纹条纹 + 顶部高光 + 底部落影 */
.hd {
  position: sticky;
  top: 0;
  z-index: 30;
  background:
    repeating-linear-gradient(
      90deg,
      rgb(0 0 0 / 0.12) 0 2px,
      transparent 2px 7px,
      rgb(0 0 0 / 0.05) 7px 10px,
      transparent 10px 17px
    ),
    linear-gradient(180deg, #6d4726 0%, #5b391c 55%, #492c14 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 240 210 / 0.18),
    inset 0 -3px 8px rgb(0 0 0 / 0.5),
    0 6px 16px rgb(10 4 0 / 0.55);
}

/* 杆身两端的黄铜螺栓 */
.hd-bolt {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f0dca6 0%, #c39a4c 52%, #6e4c1a 100%);
  box-shadow:
    inset 0 -1px 2px rgb(0 0 0 / 0.55),
    0 1px 1px rgb(255 240 200 / 0.35);
  transform: translateY(-50%);
}

.hd-bolt--l {
  left: 12px;
}

.hd-bolt--r {
  right: 12px;
}

.hd-inner {
  display: flex;
  align-items: center;
  gap: var(--gap);
  width: min(100% - 2 * var(--space), var(--page-w));
  min-height: 64px;
  margin-inline: auto;
  padding-inline: 28px;
}

/* —— 站点标识：黄铜铭牌 + 铆钉 —— */
.brand {
  display: inline-flex;
  flex: none;
  min-height: 40px;
  text-decoration: none;
}

.brand-plate {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-on-accent);
  border: 1px solid rgb(0 0 0 / 0.55);
  border-radius: var(--radius-sm);
  /* 黄铜拉丝：多段灰阶金渐变 + 细高光 */
  background:
    repeating-linear-gradient(105deg, rgb(255 255 255 / 0.07) 0 1px, transparent 1px 3px),
    linear-gradient(180deg, #dcb56b 0%, #bd9040 46%, #97682b 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.55),
    inset 0 -1px 0 rgb(0 0 0 / 0.4),
    0 2px 5px rgb(10 4 0 / 0.5);
  transition: filter var(--transition), transform var(--transition);
}

.brand:hover .brand-plate {
  filter: brightness(1.1);
}

.brand:active .brand-plate {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

/* 铭牌上的迷你铆钉 */
.brand-rivet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f6e7ba 0%, #a67c34 60%, #59400f 100%);
  box-shadow: inset 0 -1px 1px rgb(0 0 0 / 0.5);
}

/* —— 子页路由：皮革缝线标签（窄屏横向滚动） —— */
.hd-nav {
  display: flex;
  flex: 1;
  gap: 10px;
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
  padding: 8px 18px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #ecd9b4;
  white-space: nowrap;
  text-decoration: none;
  border: 1px solid rgb(0 0 0 / 0.55);
  border-radius: var(--radius-sm);
  /* 皮革：深棕底 + 噪点感 + 双向 inset */
  background:
    radial-gradient(circle at 22% 32%, rgb(255 255 255 / 0.06) 1px, transparent 1.8px),
    radial-gradient(circle at 68% 62%, rgb(0 0 0 / 0.14) 1.2px, transparent 2px),
    linear-gradient(180deg, #6b4223 0%, #5a3617 100%);
  background-size: 9px 9px, 11px 11px, 100% 100%;
  box-shadow:
    inset 0 1px 0 rgb(255 240 210 / 0.16),
    inset 0 -2px 4px rgb(0 0 0 / 0.4),
    0 2px 4px rgb(10 4 0 / 0.5);
  transition:
    color var(--transition),
    box-shadow var(--transition),
    transform var(--transition),
    filter var(--transition);
}

.hd-link:hover {
  color: #fbf2dd;
  filter: brightness(1.12);
}

.hd-link:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

/* 当前子页：皮革标签被按进木杆（与首页滚动激活态同款内凹行程） */
.hd-link[aria-current='page'] {
  color: #fbf2dd;
  box-shadow:
    inset 0 3px 6px rgb(0 0 0 / 0.55),
    inset 0 -1px 0 rgb(255 240 210 / 0.12);
}

/* —— 风格画廊入口：黄铜按钮 —— */
.hd-gallery {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 16px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--c-on-accent);
  text-decoration: none;
  border: 1px solid rgb(0 0 0 / 0.55);
  border-radius: var(--radius-sm);
  background:
    repeating-linear-gradient(105deg, rgb(255 255 255 / 0.06) 0 1px, transparent 1px 3px),
    linear-gradient(180deg, #e0bc72 0%, #bd9040 48%, #91632a 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.6),
    inset 0 -2px 4px rgb(0 0 0 / 0.35),
    0 3px 7px rgb(10 4 0 / 0.55);
  transition:
    filter var(--transition),
    transform var(--transition),
    box-shadow var(--transition);
}

.hd-gallery:hover {
  filter: brightness(1.1);
}

.hd-gallery:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

.hd-gallery-rivet {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f6e7ba 0%, #a67c34 60%, #59400f 100%);
  box-shadow: inset 0 -1px 1px rgb(0 0 0 / 0.5);
}

/* —— 窄屏：收紧间距，路由导航横向滚动 —— */
@media (max-width: 767px) {
  .hd-inner {
    gap: 10px;
    padding-inline: 32px;
  }

  .hd-gallery {
    padding: 8px 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-plate,
  .hd-link,
  .hd-gallery {
    transition: none;
  }

  .brand:active .brand-plate,
  .hd-link:active,
  .hd-gallery:active {
    transform: none;
  }
}
</style>
