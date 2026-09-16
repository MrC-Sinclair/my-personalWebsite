<!--
  ClaymorphismTopNav - claymorphism 风格顶部胶囊导航
  ------------------------------------------------------------
  圆滚滚的黏土胶囊吸顶导航：站点标识（黏土小球 + 站名）+
  页内锚点胶囊 + 「风格画廊」入口胶囊。
  窄屏：胶囊自动换行，锚点横向滚动，触控目标均 ≥ 40px。
  滚动激活态复用共享层 useActiveSection（观察 [data-section]
  元素、区块跨越视口中部「阅读线」时激活，observer 清理在其
  内部完成），当前区块对应的锚点胶囊呈「按下内凹」激活态。
  所有路由链接走 useLocalePath 包裹，页内跳转用原生锚点
  （全局 smooth scroll + scroll-margin-top 兜底）。
-->
<template>
  <header class="nav-wrap">
    <div class="nav-capsule">
      <!-- 站点标识：回首页 -->
      <NuxtLink class="brand" :to="localePath('/')">
        <span class="brand-ball" aria-hidden="true"/>
        <span class="brand-name">{{ t('home.name') }}</span>
      </NuxtLink>

      <!-- 页内锚点导航（含滚动激活态） -->
      <nav class="anchors">
        <ul class="anchor-list">
          <li v-for="section in sections" :key="section.id">
            <NuxtLink
              class="anchor-pill"
              :class="{ 'is-active': section.id === activeId }"
              :to="{ hash: `#${section.id}` }"
            >
              {{ section.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- 风格画廊入口 -->
      <NuxtLink class="gallery-pill" :to="localePath('/styles')">
        <span class="gallery-dot" aria-hidden="true"/>
        {{ t('styles.gallery.title') }}
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useActiveSection } from '~/composables/useActiveSection'

defineProps<{
  /** 页内锚点区块：id 为区块锚点，label 为 i18n 文案 */
  sections: Array<{ id: string; label: string }>
}>()

const { t } = useI18n()
const localePath = useLocalePath()

// 滚动激活态走共享层 useActiveSection：观察 [data-section] 元素、
// 区块跨越视口中部「阅读线」时激活，observer 清理在其内部完成
const { activeId } = useActiveSection()
</script>

<style scoped>
/* 吸顶悬浮：胶囊本身是一大块黏土 */
.nav-wrap {
  position: sticky;
  top: 12px;
  z-index: 30;
  padding: 0 var(--gap);
}

.nav-capsule {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px var(--gap);
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 10px 14px;
  background: var(--c-surface);
  border-radius: 999px;
  box-shadow: var(--shadow);
}

/* —— 站点标识 —— */
.brand {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 4px 10px 4px 4px;
  text-decoration: none;
  border-radius: 999px;
  transition: transform var(--transition);
}

/* 黏土品牌小球（3D 图标感） */
.brand-ball {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--deco), var(--c-accent);
  box-shadow:
    0 6px 10px rgb(125 63 201 / 0.35),
    inset 0 -4px 8px rgb(90 40 150 / 0.25);
  transition: transform var(--transition);
}

.brand-name {
  font-size: var(--fs-base);
  font-weight: 800;
  color: var(--c-text);
  white-space: nowrap;
}

/* hover：小球 Q 弹放大；active：整颗压扁 */
.brand:hover .brand-ball {
  transform: scale(1.12);
}

.brand:active {
  transform: var(--press-transform);
}

/* —— 页内锚点（窄屏横向滚动） —— */
.anchors {
  flex: 1 1 auto;
  min-width: 0;
}

.anchor-list {
  display: flex;
  gap: 6px;
  margin: 0;
  padding: 0 4px;
  overflow-x: auto;
  list-style: none;
  scrollbar-width: thin;
}

.anchor-pill {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 16px;
  font-size: var(--fs-base);
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  border-radius: 999px;
  box-shadow: inset 0 2px 6px rgb(125 63 201 / 0.08);
  transition:
    color var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

/* 凹陷轨道里的胶囊：hover 浮起、active 按下、激活态内凹着色 */
.anchor-pill:hover {
  color: var(--c-text);
  background: var(--c-surface);
  box-shadow:
    0 6px 10px rgb(150 90 210 / 0.2),
    inset 0 4px 8px rgb(255 255 255 / 0.7);
}

.anchor-pill:active {
  transform: var(--press-transform);
}

.anchor-pill.is-active {
  color: var(--c-on-accent);
  background: var(--c-accent);
  box-shadow:
    0 6px 12px rgb(125 63 201 / 0.35),
    inset 0 3px 6px rgb(255 255 255 / 0.35),
    inset 0 -4px 8px rgb(90 40 150 / 0.25);
}

/* —— 风格画廊入口（粉黏土胶囊） —— */
.gallery-pill {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 6px 18px;
  font-size: var(--fs-base);
  font-weight: 700;
  color: #8c2f60;
  text-decoration: none;
  white-space: nowrap;
  background: #ffd7e8;
  border-radius: 999px;
  box-shadow:
    0 8px 14px rgb(215 100 150 / 0.3),
    inset 0 5px 9px rgb(255 255 255 / 0.75),
    inset 0 -5px 8px rgb(215 100 150 / 0.22);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.gallery-pill:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 20px rgb(215 100 150 / 0.35),
    inset 0 5px 9px rgb(255 255 255 / 0.75),
    inset 0 -5px 8px rgb(215 100 150 / 0.22);
}

.gallery-pill:active {
  transform: var(--press-transform);
  box-shadow:
    0 4px 8px rgb(215 100 150 / 0.3),
    inset 0 4px 8px rgb(255 255 255 / 0.6),
    inset 0 -5px 9px rgb(215 100 150 / 0.3);
}

/* 胶囊上的小装饰点 */
.gallery-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--deco), #e0609e;
}

/* 窄屏：画廊入口文字收紧（触控目标仍 ≥ 40px） */
@media (max-width: 480px) {
  .gallery-pill {
    padding: 6px 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand,
  .brand-ball,
  .anchor-pill,
  .gallery-pill {
    transition: none;
  }

  .brand:active,
  .anchor-pill:active,
  .gallery-pill:active,
  .gallery-pill:hover {
    transform: none;
  }
}
</style>
