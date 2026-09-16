<!--
  GlassmorphismNav - glassmorphism 风格的透明胶囊导航
  ------------------------------------------------------------
  固定悬浮在页面顶部的「玻璃胶囊」：品牌标识（点击回到页顶）
  + 页内锚点（原生锚点跳转，走全局平滑滚动）+ 「风格画廊」
  入口（localePath('/styles')，不写死路径）。
  移动端：胶囊近似全宽，锚点行横向滚动；全部交互目标 ≥ 40px。
-->
<template>
  <header class="nav-wrap">
    <nav class="nav-capsule">
      <!-- 品牌区：发光圆点 + 站点名称，点击回页顶 -->
      <a class="brand" href="#top">
        <span class="brand-dot" aria-hidden="true"/>
        <span class="brand-name">{{ t('home.name') }}</span>
      </a>

      <!-- 页内锚点（窄屏横向滚动） -->
      <ul class="anchors">
        <li v-for="item in sections" :key="item.id">
          <a class="anchor" :href="`#${item.id}`">{{ item.label }}</a>
        </li>
      </ul>

      <!-- 风格画廊入口 -->
      <NuxtLink class="gallery-pill" :to="localePath('/styles')">
        {{ t('styles.gallery.enter') }}
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
/** 锚点导航项：id 为页内区块 id，label 随语言更新 */
interface NavSection {
  id: string
  label: string
}

defineProps<{
  /** 页内锚点清单（由页面组件传入，文案走 i18n） */
  sections: NavSection[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()
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
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  max-width: 980px;
  min-height: 56px;
  padding: 6px 10px 6px 18px;
  pointer-events: auto;
  background: rgb(255 255 255 / 0.5);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  backdrop-filter: blur(24px) saturate(160%);
  border: var(--border-w) solid var(--c-border);
  border-radius: 999px;
  box-shadow: var(--shadow);
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

/* 锚点行：窄屏横向滚动 */
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

/* 窄屏：胶囊内锚点横向滚动，画廊按钮压缩文案间距 */
@media (max-width: 640px) {
  .nav-capsule {
    gap: 4px;
    padding-left: 12px;
  }

  .brand-name {
    font-size: var(--fs-small);
  }

  .gallery-pill {
    padding: 8px 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand,
  .anchor,
  .gallery-pill {
    transition: none;
  }

  .anchor:active,
  .gallery-pill:active {
    transform: none;
  }

  .gallery-pill:hover {
    transform: none;
  }
}
</style>
