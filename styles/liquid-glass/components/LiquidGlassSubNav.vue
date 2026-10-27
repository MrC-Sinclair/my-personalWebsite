<!--
  LiquidGlassSubNav - liquid-glass 风格子页的路由导航
  ------------------------------------------------------------
  与首页 LiquidGlassNav 的区别只在链接语义：
  · 首页导航是 #about / #projects —— **页内锚点**
  · 本组件是 /style/liquid-glass/about —— **路由**
  子页之间没有可滚动的页内区块，锚点在子页上无处可去，两者不能混用。

  视觉沿用首页那颗玻璃胶囊：半透填充 + 折射微染色 + 描边 + 内高光
  + 22px 背景模糊，窄屏锚点行横向滚动并两端渐隐，画廊入口左侧另有
  一条折射语言切换小胶囊（行为走共享层 useLocaleSwitch）。当前子页用
  强调色胶囊标出（玻璃风格里「高亮」= 一层更实的强调色透光）。
-->
<template>
  <header class="nav-wrap safe-top">
    <nav class="nav glass pill" :aria-label="t('common.subNav')">
      <NuxtLink class="brand" :to="localePath('/style/liquid-glass')">
        <span class="brand-orb" aria-hidden="true"/>
        <span class="brand-name">{{ t('home.name') }}</span>
      </NuxtLink>

      <div class="links-scroll">
        <ul class="links">
          <li v-for="item in links" :key="item.path">
            <NuxtLink
              class="link"
              :to="localePath(item.path)"
              :aria-current="isActive(item.path) ? 'page' : undefined"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- 语言切换：折射小胶囊（行为来自共享层 useLocaleSwitch） -->
      <NuxtLink class="lang" :to="targetPath" :aria-label="t('common.language')">
        {{ targetLabel }}
      </NuxtLink>

      <NuxtLink class="gallery" :to="localePath('/styles')">
        {{ t('styles.galleryLink') }}
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
  { path: '/style/liquid-glass/about', label: t('nav.about') },
  { path: '/style/liquid-glass/projects', label: t('nav.projects') },
  { path: '/style/liquid-glass/blog', label: t('nav.blog') },
  { path: '/style/liquid-glass/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
/* 外层负责吸顶与水平留白；胶囊本体是玻璃 */
.nav-wrap {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 14px var(--gap) 6px;
}

/* —— 玻璃胶囊配方（与首页导航同源，改动脉络见 LiquidGlassNav） —— */
.glass {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--gap);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 6px 10px 6px 18px;
  background: var(--lg-depth), var(--lg-fill);
  border: var(--border-w) solid var(--c-border);
  border-radius: 999px;
  box-shadow: 0 0.5px 1px rgb(0 0 0 / 0.12), 0 4px 14px rgb(4 2 18 / 0.24);
  backdrop-filter: blur(var(--lg-blur)) saturate(1.3) brightness(1.04) contrast(1.14);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(1.3) brightness(1.04) contrast(1.14);
}

/* 镜面高光环 */
.glass::after {
  position: absolute;
  inset: 0;
  padding: var(--lg-spec-w);
  border-radius: inherit;
  pointer-events: none;
  content: '';
  background: var(--lg-spec);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

/* 顶部泛光 */
.glass::before {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  content: '';
  background: var(--lg-luster);
}

/* 不支持 backdrop-filter 的环境：提高填充不透明度保底可读 */
@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: rgb(22 16 56 / 0.92);
  }
}

/* 站点标识：光点 + 站名（点击回风格首页） */
.brand {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  color: var(--c-text);
  text-decoration: none;
  transition: opacity var(--transition);
}

.brand:hover {
  opacity: 0.85;
}

.brand:active {
  transform: var(--press-transform);
}

/* 标识光点：小玻璃珠（径向高光 + 强调色透光） */
.brand-orb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 28%, rgb(255 255 255 / 0.9), transparent 46%),
    linear-gradient(140deg, var(--c-accent), var(--c-accent-2));
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.35),
    0 0 12px rgb(94 227 255 / 0.45);
}

.brand-name {
  font-weight: 600;
  font-size: var(--fs-base);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* 链接行：窄屏横向滚动，两端渐隐遮罩暗示可滑动 */
.links-scroll {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  mask-image: linear-gradient(90deg, transparent, #000 12px, #000 calc(100% - 12px), transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 12px, #000 calc(100% - 12px), transparent);
}

.links-scroll::-webkit-scrollbar {
  display: none;
}

.links {
  display: flex;
  gap: 2px;
  justify-content: flex-end;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 子页路由链接：透明玻璃条目，hover 泛起淡光 */
.link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 14px;
  font-size: var(--fs-base);
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  border-radius: 999px;
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition);
}

.link:hover {
  color: var(--c-text);
  background: rgb(255 255 255 / 0.1);
  box-shadow: inset 0 1px 0 var(--lg-bevel);
}

.link:active {
  transform: var(--press-transform);
}

/* 当前页：强调色透光胶囊（玻璃里「选中」的观感） */
.link[aria-current='page'] {
  color: var(--c-on-accent);
  background: linear-gradient(140deg, rgb(94 227 255 / 0.85), rgb(167 139 255 / 0.85));
  box-shadow:
    inset 0 1px 0 var(--lg-bevel-solid),
    0 0 16px rgb(94 227 255 / 0.35);
}

/* 语言切换：无描边的折射胶囊（比画廊的强调色描边低一级） */
.lang {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  min-width: 40px;
  padding: 8px 12px;
  font-size: var(--fs-base);
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  background: var(--c-surface);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--c-text) 12%, transparent);
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition);
}

.lang:hover,
.lang:focus-visible {
  color: var(--c-text);
  background: color-mix(in srgb, var(--c-text) 12%, transparent);
}

.lang:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.lang:active {
  transform: var(--press-transform);
}

/* 画廊入口：强调色描边玻璃小胶囊 */
.gallery {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 40px;
  padding: 8px 16px;
  font-size: var(--fs-base);
  color: var(--c-accent);
  text-decoration: none;
  white-space: nowrap;
  background: rgb(94 227 255 / 0.1);
  border: var(--border-w) solid rgb(94 227 255 / 0.4);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 var(--lg-bevel);
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.gallery:hover {
  color: var(--c-on-accent);
  background: linear-gradient(140deg, var(--c-accent), var(--c-accent-2));
  box-shadow:
    inset 0 1px 0 var(--lg-bevel-solid),
    0 0 18px rgb(94 227 255 / 0.35);
}

.gallery:active {
  transform: var(--press-transform);
}

/* 窄屏：链接行改为左起横向滚动 */
@media (max-width: 640px) {
  /* 两侧留白与条目间距收紧，为语言切换让出 320 宽的位 */
  .nav-wrap {
    padding-right: 12px;
    padding-left: 12px;
  }

  .glass {
    gap: 6px;
    padding-right: 8px;
    padding-left: 14px;
    /* 锚点带改独占一行（见下方 .links-scroll 的 order） */
    flex-wrap: wrap;
  }

  /* 锚点带不能和站名 + 语言 + 画廊抢同一行：挤窄后一次只露一小截，
     键盘 Tab 过去会停在可视区外（浏览器不会替 overflow 带滚进视野，已实测） */
  .links-scroll {
    order: 3;
    flex: 1 1 100%;
  }

  .links {
    justify-content: flex-start;
  }

  /* 站名不参与收缩：压力交给锚点那条横向滚动带（它本来就是 overflow-x: auto）。
     早先这里写 flex: 0 1 auto + 截断，实测 390 宽就把站名削成「Si…」；
     命中区塌到 23px 那个红线问题用 min-width 兜住就够，不必牺牲站名 */
  .brand {
    gap: 8px;
    flex: none;
    min-width: 40px;
  }

  .brand-orb {
    flex: none;
  }

  .brand-name {
    font-size: var(--fs-small);
  }

  .lang,
  .gallery {
    font-size: var(--fs-small);
  }

  .lang {
    padding: 8px 10px;
  }

  .gallery {
    padding: 8px 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand,
  .link,
  .lang,
  .gallery {
    transition: none;
  }

  .brand:active,
  .link:active,
  .lang:active,
  .gallery:active {
    transform: none;
  }
}
</style>
