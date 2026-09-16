<!--
  LiquidGlassNav - liquid-glass 风格的透明悬浮导航
  ------------------------------------------------------------
  漂浮在场景上方的玻璃胶囊导航（sticky 吸顶）：左侧站点标识
  （光点 + 站名），右侧页内锚点（原生 <a href="#...">，全局
  已有平滑滚动与锚点偏移补偿）与「风格画廊」外跳入口。
  窄屏时锚点行横向滚动（两端渐隐遮罩提示可滑），玻璃质感
  与触控目标（≥40px）在移动端完整保留。
-->
<template>
  <header class="nav-wrap safe-top">
    <nav class="nav glass" :aria-label="t('common.mobileNav')">
      <a class="brand" href="#home">
        <span class="brand-orb" aria-hidden="true"/>
        <span class="brand-name">{{ t('home.name') }}</span>
      </a>

      <div class="links-scroll">
        <ul class="links">
          <li><a class="link" href="#about">{{ t('nav.about') }}</a></li>
          <li><a class="link" href="#projects">{{ t('nav.projects') }}</a></li>
          <li><a class="link" href="#posts">{{ t('nav.blog') }}</a></li>
          <li><a class="link" href="#contact">{{ t('nav.contact') }}</a></li>
        </ul>
      </div>

      <NuxtLink class="gallery" :to="localePath('/styles')">
        {{ t('styles.gallery.enter') }}
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* 外层负责吸顶与水平留白；胶囊本体是玻璃 */
.nav-wrap {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 14px var(--gap) 6px;
}

/* —— 玻璃胶囊配方：半透填充 + 折射微染色 + 半透描边 + 内高光 + 背景模糊 —— */
.glass {
  display: flex;
  align-items: center;
  gap: var(--gap);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 6px 10px 6px 18px;
  background:
    linear-gradient(90deg, rgb(167 139 255 / 0.09), rgb(94 227 255 / 0.06) 50%, rgb(255 122 184 / 0.09)),
    var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: 999px;
  box-shadow:
    var(--shadow),
    inset 0 1px 0 rgb(255 255 255 / 0.3);
  backdrop-filter: blur(22px) saturate(1.35);
  -webkit-backdrop-filter: blur(22px) saturate(1.35);
}

/* 不支持 backdrop-filter 的环境：提高填充不透明度保底可读 */
@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: rgb(22 16 56 / 0.92);
  }
}

/* 站点标识：光点 + 站名（点击回页顶） */
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

/* 锚点行：窄屏横向滚动，两端渐隐遮罩暗示可滑动 */
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

/* 页内锚点：透明玻璃条目，hover 泛起淡光 */
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
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.25);
}

.link:active {
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
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.28);
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
    inset 0 1px 0 rgb(255 255 255 / 0.5),
    0 0 18px rgb(94 227 255 / 0.35);
}

.gallery:active {
  transform: var(--press-transform);
}

/* 窄屏：画廊入口退化为紧凑胶囊，锚点行横向滚动 */
@media (max-width: 640px) {
  .glass {
    gap: 8px;
    padding-left: 14px;
  }

  .links {
    justify-content: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand,
  .link,
  .gallery {
    transition: none;
  }

  .brand:active,
  .link:active,
  .gallery:active {
    transform: none;
  }
}
</style>
