<!--
  DashboardSidebar - dashboard 风格侧边栏
  ------------------------------------------------------------
  桌面端（≥1024px）：固定宽度侧栏，站点标识 + 页内锚点导航 +
  「风格画廊」入口，sticky 全高。
  窄屏：收起为吸顶顶部条（品牌行 + 横向滚动锚点 chips），
  信息密度签名保留。
  滚动激活态复用共享层 useActiveSection（观察 [data-section]
  元素、区块跨越视口中部「阅读线」时激活，observer 清理在其
  内部完成），为当前区块的锚点项添加激活态。
-->
<template>
  <aside class="side">
    <!-- 站点标识 + 风格画廊入口 -->
    <div class="side-brand">
      <div class="side-id">
        <span class="side-dot" aria-hidden="true"/>
        <div class="side-id-text">
          <NuxtLink class="side-name" :to="localePath('/')">{{ t('home.name') }}</NuxtLink>
          <p class="side-tagline">{{ t('home.tagline') }}</p>
        </div>
      </div>
      <NuxtLink class="side-gallery" :to="localePath('/styles')">
        <span class="side-gallery-label">{{ t('styles.gallery.title') }}</span>
        <span class="side-gallery-arrow" aria-hidden="true">→</span>
      </NuxtLink>
    </div>

    <!-- 页内锚点导航（含滚动激活态） -->
    <nav class="side-nav">
      <ul class="side-list">
        <li v-for="section in sections" :key="section.id" class="side-item">
          <NuxtLink
            class="side-link"
            :class="{ 'is-active': section.id === activeId }"
            :to="{ hash: `#${section.id}` }"
          >
            <span class="side-tick" aria-hidden="true"/>
            <span class="side-linktext">{{ section.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
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
.side {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: var(--space);
  padding: var(--space);
  background: var(--c-bg);
  border-bottom: var(--border-w) solid var(--c-border);
}

/* —— 站点标识 —— */
.side-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap);
}

.side-id {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

/* 呼吸状态灯（装饰） */
.side-dot {
  flex: none;
  width: 8px;
  height: 8px;
  background: var(--c-accent);
  border-radius: 50%;
  animation: dot-pulse 2.4s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

.side-id-text {
  min-width: 0;
}

.side-name {
  display: inline-block;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
  text-decoration: none;
  transition: color var(--transition);
}

.side-name:hover {
  color: var(--c-accent);
}

.side-tagline {
  display: none;
  overflow: hidden;
  margin: 2px 0 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* —— 风格画廊入口 —— */
.side-gallery {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 12px;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-decoration: none;
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  transition:
    color var(--transition),
    border-color var(--transition),
    transform var(--transition);
}

.side-gallery:hover {
  color: var(--c-on-accent);
  border-color: var(--c-accent);
  background: var(--c-accent);
}

.side-gallery:active {
  transform: var(--press-transform);
}

.side-gallery-arrow {
  font-family: var(--font-mono);
}

/* —— 锚点导航 —— */
.side-list {
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin: 0;
  padding: 0 0 2px;
  overflow-x: auto;
  list-style: none;
  scrollbar-width: thin;
}

.side-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 12px;
  font-size: var(--fs-base);
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  transition:
    color var(--transition),
    border-color var(--transition),
    background var(--transition);
}

/* 激活指示条（桌面端竖条 / 窄屏 chips 复用同一边框色变化） */
.side-tick {
  flex: none;
  width: 2px;
  height: 14px;
  background: transparent;
  transition: background var(--transition);
}

.side-link:hover {
  color: var(--c-text);
  border-color: color-mix(in srgb, var(--c-accent) 55%, var(--c-border));
}

.side-link:active {
  transform: var(--press-transform);
}

.side-link.is-active {
  color: var(--c-accent);
  border-color: var(--c-accent);
  background: color-mix(in srgb, var(--c-accent) 10%, transparent);
}

.side-link.is-active .side-tick {
  background: var(--c-accent);
}

/* —— 桌面端：固定宽度侧栏 —— */
@media (min-width: 1024px) {
  .side {
    height: 100vh;
    overflow-y: auto;
    border-right: var(--border-w) solid var(--c-border);
    border-bottom: none;
  }

  .side-brand {
    flex-direction: column;
    align-items: stretch;
    padding-bottom: var(--space);
    border-bottom: var(--border-w) solid var(--c-border);
  }

  .side-tagline {
    display: block;
    white-space: normal;
  }

  .side-gallery {
    justify-content: space-between;
    margin-top: var(--space);
  }

  .side-nav {
    flex: 1;
  }

  .side-list {
    flex-direction: column;
    gap: 2px;
    overflow: visible;
  }

  .side-item + .side-item {
    margin-top: 2px;
  }

  .side-link {
    justify-content: flex-start;
    border-color: transparent;
  }

  .side-link:hover {
    background: color-mix(in srgb, var(--c-accent) 8%, transparent);
  }

  .side-link.is-active {
    background: color-mix(in srgb, var(--c-accent) 12%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .side-dot {
    animation: none;
  }

  .side-name,
  .side-gallery,
  .side-link,
  .side-tick {
    transition: none;
  }

  .side-link:active,
  .side-gallery:active {
    transform: none;
  }
}
</style>
