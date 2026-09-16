<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismDeskHeader - 拟物风格导航头部
  ------------------------------------------------------------
  吸顶「木质菜单条」：胡桃木纹横杆（两端黄铜螺栓）+ 皮革缝线
  标签页内锚点 + 黄铜铭牌站点标识 + 「风格画廊」黄铜入口
  （localePath('/styles')）。
  滚动激活态复用共享层 useActiveSection（观察 [data-section]
  元素、区块跨越视口中部「阅读线」时激活，observer 清理在其
  内部完成，SSR 初始为空双方一致）；滚动激活属视图侧状态。
-->
<template>
  <header class="hd">
    <span class="hd-bolt hd-bolt--l" aria-hidden="true" />
    <span class="hd-bolt hd-bolt--r" aria-hidden="true" />

    <div class="hd-inner">
      <!-- 站点标识：黄铜铭牌（回顶锚点） -->
      <a class="brand" href="#top">
        <span class="brand-plate">
          <span class="brand-rivet" aria-hidden="true" />
          {{ t('home.name') }}
          <span class="brand-rivet" aria-hidden="true" />
        </span>
      </a>

      <!-- 页内锚点：皮革缝线标签 -->
      <nav class="hd-nav">
        <a
          v-for="item in anchors"
          :key="item.id"
          class="hd-link"
          :class="{ 'is-active': item.id === activeId }"
          :href="`#${item.id}`"
        >
          {{ item.label }}
        </a>
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
 * @file 拟物风格的站点导航头部组件
 * @description 木纹菜单条 + 皮革锚点标签 + 黄铜铭牌；滚动激活态属视图侧状态。
 */
import { useActiveSection } from '~/composables/useActiveSection'

const { t } = useI18n()
const localePath = useLocalePath()

/** 页内锚点（id 与首页各区块的 id/data-section 对应，label 随语言更新） */
const anchors = computed(() => [
  { id: 'about', label: t('nav.about') },
  { id: 'projects', label: t('nav.projects') },
  { id: 'posts', label: t('nav.blog') },
  { id: 'contact', label: t('nav.contact') },
])

// 滚动激活态走共享层 useActiveSection：观察 [data-section] 元素、
// 区块跨越视口中部「阅读线」时激活，observer 清理在其内部完成
const { activeId } = useActiveSection()
</script>

<style scoped>
.hd {
  position: sticky;
  top: 0;
  z-index: 30;
  /* 胡桃木横杆：竖向木纹条纹 + 顶部高光 + 底部落影 */
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

/* —— 页内锚点：皮革缝线标签（窄屏横向滚动） —— */
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

/* 激活态：皮革标签被按进木杆（内凹行程） */
.hd-link.is-active {
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

/* —— 窄屏：收紧间距，锚点导航横向滚动 —— */
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
