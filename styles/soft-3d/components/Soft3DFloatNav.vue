<!--
  Soft3DFloatNav - soft-3d 风格漂浮胶囊导航
  ------------------------------------------------------------
  一颗悬浮在页面顶端的玻璃质感胶囊：站点标识（小球 + 名称）
  + 页内锚点（原生 <a href="#id>，交给全局 smooth 滚动）
  + 「风格画廊」入口（localePath 包裹的渐变胶囊）。
  窄屏胶囊自动换行、锚点横向滚动，物体感阴影与圆角保留。
-->
<template>
  <header class="float-nav-wrap">
    <nav class="float-nav">
      <!-- 站点标识：返回站点首页（过渡层路由，业务跳转） -->
      <NuxtLink class="float-nav-brand" :to="localePath('/')">
        <Soft3DOrb :size="34" variant="violet" float :duration="6" />
        <span class="float-nav-name">{{ t('home.name') }}</span>
      </NuxtLink>

      <!-- 页内锚点 -->
      <ul class="float-nav-list">
        <li v-for="section in sections" :key="section.id">
          <a class="float-nav-link" :href="`#${section.id}`">{{ section.label }}</a>
        </li>
      </ul>

      <!-- 风格画廊入口 -->
      <NuxtLink class="float-nav-gallery" :to="localePath('/styles')">
        {{ t('styles.gallery.title') }}
        <span class="float-nav-gallery-arrow" aria-hidden="true">→</span>
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import Soft3DOrb from './Soft3DOrb.vue'

defineProps<{
  /** 页内锚点区块：id 为区块锚点，label 为 i18n 文案 */
  sections: Array<{ id: string; label: string }>
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
.float-nav-wrap {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  justify-content: center;
  padding: 14px 12px 0;
  pointer-events: none;
}

/* —— 胶囊主体：玻璃面 + 受光边 + 柔影 —— */
.float-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: calc(100vw - 20px);
  padding: 8px 12px;
  pointer-events: auto;
  background: color-mix(in srgb, var(--c-surface) 74%, transparent);
  backdrop-filter: blur(16px);
  border: var(--border-w) solid var(--c-border);
  border-radius: 999px;
  box-shadow: var(--shadow);
}

/* —— 站点标识 —— */
.float-nav-brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 4px 8px 4px 4px;
  border-radius: 999px;
  text-decoration: none;
  transition: background var(--transition), transform var(--transition);
}

.float-nav-brand:hover {
  background: color-mix(in srgb, var(--c-accent) 14%, transparent);
  transform: translateY(-2px);
}

.float-nav-brand:active {
  transform: var(--press-transform);
}

.float-nav-name {
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
  white-space: nowrap;
}

/* —— 锚点列表 —— */
.float-nav-list {
  display: flex;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
  scrollbar-width: none;
}

.float-nav-list::-webkit-scrollbar {
  display: none;
}

/* 锚点小胶囊：≥40px 触控目标 + 悬浮上抬 */
.float-nav-link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 14px;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  border-radius: 999px;
  transition: color var(--transition), background var(--transition), transform var(--transition),
    box-shadow var(--transition);
}

.float-nav-link:hover {
  color: var(--c-text);
  background: color-mix(in srgb, var(--c-accent) 16%, transparent);
  transform: translateY(-2px);
}

.float-nav-link:active {
  transform: var(--press-transform);
}

/* —— 风格画廊入口：糖果渐变胶囊 —— */
.float-nav-gallery {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 16px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-on-accent);
  text-decoration: none;
  white-space: nowrap;
  background: linear-gradient(135deg, #7c3aed, #db2777);
  border: var(--border-w) solid rgb(255 255 255 / 0.28);
  border-radius: 999px;
  box-shadow:
    0 10px 20px rgb(124 58 237 / 0.4),
    inset 0 1px 3px rgb(255 255 255 / 0.35);
  transition: transform var(--transition), box-shadow var(--transition), filter var(--transition);
}

.float-nav-gallery:hover {
  transform: translateY(-2px);
  filter: brightness(1.08);
  box-shadow:
    0 16px 28px rgb(124 58 237 / 0.5),
    inset 0 1px 3px rgb(255 255 255 / 0.35);
}

.float-nav-gallery:active {
  transform: var(--press-transform);
}

.float-nav-gallery-arrow {
  transition: transform var(--transition);
}

.float-nav-gallery:hover .float-nav-gallery-arrow {
  transform: translateX(3px);
}

/* 键盘可见焦点环 */
.float-nav :focus-visible {
  outline: 2px solid var(--c-accent-2);
  outline-offset: 3px;
}

/* 窄屏：名称收起、画廊入口缩短，胶囊两行排布 */
@media (max-width: 640px) {
  .float-nav-name {
    display: none;
  }

  .float-nav-gallery {
    padding: 8px 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .float-nav-brand,
  .float-nav-link,
  .float-nav-gallery,
  .float-nav-gallery-arrow {
    transition: none;
  }

  .float-nav-brand:hover,
  .float-nav-link:hover,
  .float-nav-gallery:hover {
    transform: none;
  }

  .float-nav-brand:active,
  .float-nav-link:active,
  .float-nav-gallery:active {
    transform: none;
  }
}
</style>
