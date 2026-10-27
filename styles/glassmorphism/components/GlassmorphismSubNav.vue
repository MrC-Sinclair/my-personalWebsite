<!--
  GlassmorphismSubNav - glassmorphism 风格子页的路由导航
  ------------------------------------------------------------
  与首页 GlassmorphismNav 的区别有两处：
  · 链接语义：首页是 #about / #posts —— **页内锚点**；
    本组件是 /style/glassmorphism/about —— **路由**。子页之间没有
    可滚动的页内区块，锚点在子页上无处可去，两者不能混用。
  · 激活来源：首页锚点没有激活态（滚动位置自己会说话）；子页用
    路由匹配（aria-current='page'），否则用户不知道自己在哪一栏。

  视觉沿用首页那颗「浮在彩色渐变上的磨砂玻璃胶囊」：发光圆点站点
  标识 + 胶囊条目 + 极光渐变画廊按钮，画廊按钮左侧另有一条磨砂语言
  切换小胶囊（行为走共享层 useLocaleSwitch）。当前子页把首页 hover 时
  的「亮起玻璃底」固定下来——玻璃没有底色块，选中只能靠磨砂底变亮。
-->
<template>
  <header class="nav-wrap">
    <nav class="nav-capsule">
      <!-- 品牌区：回风格首页（路由，不是 #top 锚点） -->
      <NuxtLink class="brand" :to="localePath('/style/glassmorphism')">
        <span class="brand-dot" aria-hidden="true" />
        <span class="brand-name">{{ t('home.name') }}</span>
      </NuxtLink>

      <!-- 子页路由（窄屏横向滚动） -->
      <ul class="anchors">
        <li v-for="item in links" :key="item.path">
          <NuxtLink
            class="anchor"
            :to="localePath(item.path)"
            :aria-current="isActive(item.path) ? 'page' : undefined"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>

      <!-- 语言切换：磨砂小胶囊（行为来自共享层 useLocaleSwitch） -->
      <NuxtLink class="lang" :to="targetPath" :aria-label="t('common.language')">
        {{ targetLabel }}
      </NuxtLink>

      <!-- 风格画廊入口 -->
      <NuxtLink class="gallery-pill" :to="localePath('/styles')">
        {{ t('styles.gallery.enter') }}
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
// 切换行为走共享层，外观由本风格决定
const { targetPath, targetLabel } = useLocaleSwitch()

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/glassmorphism/about', label: t('nav.about') },
  { path: '/style/glassmorphism/projects', label: t('nav.projects') },
  { path: '/style/glassmorphism/blog', label: t('nav.blog') },
  { path: '/style/glassmorphism/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
/* 外层只负责居中悬浮，不裁剪（避免裁掉投影） */
.nav-wrap {
  position: fixed;
  top: 14px;
  right: 0;
  left: 0;
  z-index: 40;
  display: flex;
  justify-content: center;
  padding: 0 12px;
  pointer-events: none;
}

/* 玻璃胶囊本体：强磨砂（导航浮在彩色渐变之上，blur 稍高） */
.nav-capsule {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  max-width: 980px;
  min-height: 56px;
  padding: 6px 10px 6px 18px;
  pointer-events: auto;
  background: rgb(255 255 255 / 0.5);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  backdrop-filter: blur(24px) saturate(180%);
  border: var(--border-w) solid var(--c-border);
  border-radius: 999px;
  box-shadow: var(--shadow), var(--gm-edge);
}

/* 镜面高光环（与首页导航同源，理由见 tokens.css --gm-spec） */
.nav-capsule::after {
  position: absolute;
  inset: 0;
  padding: var(--gm-spec-w);
  border-radius: inherit;
  pointer-events: none;
  content: '';
  background: var(--gm-spec);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

/* 品牌区：发光圆点 + 名称（触控目标 ≥ 40px） */
.brand {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 4px 8px 4px 0;
  font-weight: 700;
  color: var(--c-text);
  text-decoration: none;
  transition: opacity var(--transition);
}

.brand:hover {
  opacity: 0.75;
}

.brand-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--deco);
  box-shadow: 0 0 14px rgb(139 92 246 / 0.8);
}

/* 路由行：窄屏横向滚动 */
.anchors {
  display: flex;
  flex: 1 1 auto;
  gap: 2px;
  min-width: 0;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  list-style: none;
  scrollbar-width: none;
}

.anchors::-webkit-scrollbar {
  display: none;
}

.anchor {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 14px;
  font-size: var(--fs-small);
  font-weight: 600;
  white-space: nowrap;
  color: var(--c-muted);
  text-decoration: none;
  border-radius: 999px;
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition);
}

/* 交互反馈：hover 亮起玻璃底；键盘 focus 同样可见 */
.anchor:hover,
.anchor:focus-visible {
  color: var(--c-text);
  background: rgb(255 255 255 / 0.65);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.7);
}

.anchor:active {
  transform: var(--press-transform);
}

/* 当前子页：把 hover 的「亮起玻璃底」固定下来 */
.anchor[aria-current='page'] {
  color: var(--c-text);
  background: rgb(255 255 255 / 0.75);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.7);
}

/* 语言切换：磨砂小胶囊——复用胶囊自身的透光材质，不另加一层 blur */
.lang {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  min-width: 40px;
  padding: 6px 12px;
  font-size: var(--fs-small);
  font-weight: 600;
  white-space: nowrap;
  color: var(--c-muted);
  text-decoration: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--c-on-accent) 45%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--c-on-accent) 70%, transparent);
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition);
}

.lang:hover,
.lang:focus-visible {
  color: var(--c-text);
  background: color-mix(in srgb, var(--c-on-accent) 78%, transparent);
}

.lang:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.lang:active {
  transform: var(--press-transform);
}

/* 风格画廊入口：极光渐变胶囊按钮（签名 Glow） */
.gallery-pill {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 40px;
  padding: 8px 18px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-on-accent);
  text-decoration: none;
  background-image: linear-gradient(120deg, #6d28d9 0%, #8b5cf6 55%, #db2777 100%);
  border-radius: 999px;
  box-shadow: 0 6px 18px rgb(139 92 246 / 0.4);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.gallery-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgb(139 92 246 / 0.55);
}

.gallery-pill:active {
  transform: var(--press-transform);
}

/* 窄屏：胶囊内路由横向滚动，画廊按钮压缩文案间距 */
@media (max-width: 640px) {
  .nav-capsule {
    gap: 4px;
    padding-left: 12px;
    /* 锚点带改独占一行（见下方 .anchors 的 order） */
    flex-wrap: wrap;
  }

  .lang {
    padding: 6px 9px;
  }

  /* 锚点带不能和三个动作件抢一行：被挤窄后 248px 的导航只露一小截，
     键盘 Tab 过去会停在可视区外（浏览器不会替 overflow 带滚进视野，已实测） */
  .anchors {
    order: 3;
    flex: 1 1 100%;
  }

  /* 站名不参与收缩：压力交给锚点那条横向滚动带（它本来就是 overflow-x: auto）。
     早先这里写 flex: 0 1 auto + 截断，实测 390 宽就把站名削成「Si…」；
     命中区塌到 23px 那个红线问题用 min-width 兜住就够，不必牺牲站名 */
  .brand {
    flex: none;
    min-width: 40px;
  }

  .brand-dot {
    flex: none;
  }

  .brand-name {
    font-size: var(--fs-small);
    white-space: nowrap;
  }

  .gallery-pill {
    padding: 8px 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand,
  .anchor,
  .lang,
  .gallery-pill {
    transition: none;
  }

  .anchor:active,
  .lang:active,
  .gallery-pill:active {
    transform: none;
  }

  .gallery-pill:hover {
    transform: none;
  }
}
</style>
