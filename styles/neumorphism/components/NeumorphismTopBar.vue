<!--
  NeumorphismTopBar - neumorphism 风格顶部导航条
  ------------------------------------------------------------
  一块浮在同色材料上方的凸起薄板：站点标识 + 页内锚点胶囊 +
  「风格画廊」入口。锚点胶囊为凸起小件，当前区块的胶囊呈
  「压进材料」的内凹态（本风格的激活签名）。
  滚动激活态复用共享层 useActiveSection（观察 [data-section]
  元素、区块跨越视口中部「阅读线」时激活，observer 清理在其
  内部完成）。
  移动端锚点行横向滚动；顶部适配刘海屏安全区域。
-->
<template>
  <header class="topbar">
    <!-- 站点标识 + 风格画廊入口 -->
    <div class="brand">
      <span class="brand-dot" aria-hidden="true"/>
      <span class="brand-name">{{ t('home.name') }}</span>
    </div>

    <!-- 页内锚点（原生锚点 + 滚动激活态） -->
    <nav class="anchor-nav">
      <ul class="anchor-list">
        <li v-for="section in sections" :key="section.id" class="anchor-item">
          <a
            class="anchor-chip"
            :class="{ 'is-active': section.id === activeId }"
            :href="`#${section.id}`"
            :aria-current="section.id === activeId ? 'true' : undefined"
          >
            {{ section.label }}
          </a>
        </li>
      </ul>
    </nav>

    <NuxtLink class="gallery-btn" :to="localePath('/styles')">
      {{ t('styles.gallery.title') }}
    </NuxtLink>
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
/* —— 凸起薄板：同色底 + 单向下柔阴影，浮在材料上方 —— */
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 18px;
  padding: 12px max(18px, env(safe-area-inset-right)) 12px max(18px, env(safe-area-inset-left));
  padding-top: max(12px, env(safe-area-inset-top));
  background: var(--c-bg);
  box-shadow: 0 8px 18px rgb(163 177 198 / 0.55);
}

/* —— 站点标识 —— */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

/* 材料上的凸起小圆点（渐变装饰） */
.brand-dot {
  flex: none;
  width: 12px;
  height: 12px;
  background: var(--deco);
  border-radius: 50%;
  box-shadow: 2px 2px 4px #a3b1c6, -2px -2px 4px #ffffff;
}

.brand-name {
  overflow: hidden;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 1px 1px 1px rgb(255 255 255 / 0.9);
}

/* —— 页内锚点胶囊 —— */
.anchor-nav {
  flex: 1 1 100%;
  order: 3;
  min-width: 0;
}

.anchor-list {
  display: flex;
  gap: 12px;
  margin: 0;
  padding: 4px 4px 10px;
  overflow-x: auto;
  list-style: none;
  /* 预留空间让凸起胶囊的阴影不被滚动容器裁切 */
  scrollbar-width: thin;
}

.anchor-chip {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 18px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: 4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff;
  transition:
    box-shadow var(--transition),
    color var(--transition);
}

.anchor-chip:hover {
  color: var(--c-accent);
  box-shadow: 5px 5px 10px #a3b1c6, -5px -5px 10px #ffffff;
}

/* 激活态 = 压进材料里（本风格的激活签名） */
.anchor-chip:active,
.anchor-chip.is-active {
  color: var(--c-accent);
  box-shadow: var(--shadow-press);
}

.anchor-chip:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

/* —— 风格画廊入口 —— */
.gallery-btn {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 40px;
  margin-left: auto;
  padding: 8px 16px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-accent);
  text-decoration: none;
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: 4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff;
  transition:
    box-shadow var(--transition),
    color var(--transition);
}

.gallery-btn:hover {
  color: var(--c-text);
  box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff;
}

.gallery-btn:active {
  color: var(--c-accent);
  box-shadow: var(--shadow-press);
}

.gallery-btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

/* —— 桌面端：标识 / 锚点 / 画廊 同一行，锚点居中 —— */
@media (min-width: 900px) {
  .topbar {
    flex-wrap: nowrap;
  }

  .anchor-nav {
    order: 0;
    flex: 1 1 auto;
    display: flex;
    justify-content: center;
  }

  .gallery-btn {
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .anchor-chip,
  .gallery-btn {
    transition: none;
  }
}
</style>
