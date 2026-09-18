<!--
  DashboardSubNav - dashboard 风格子页的路由导航
  ------------------------------------------------------------
  与首页 DashboardSidebar 的区别有两处：
  · 链接语义：首页是 #overview / #posts —— **页内锚点**；
    本组件是 /style/dashboard/about —— **路由**。子页之间没有可滚动的
    页内区块，锚点在子页上无处可去，两者不能混用。
  · 激活来源：首页靠 useActiveSection 观察滚动位置；子页没有滚动区块
    可观察，改用路由匹配（aria-current='page'）。

  外形沿用首页那根侧栏（桌面 248px 固定列 / 窄屏收起为吸顶条）：
  呼吸状态灯站点标识、风格画廊入口、圆角 chips 条目。当前子页的
  激活态与首页滚动激活态同一套观感（强调色边框 + 淡底 + 点亮刻度条）。
-->
<template>
  <aside class="side">
    <!-- 站点标识 + 风格画廊入口 -->
    <div class="side-brand">
      <div class="side-id">
        <span class="side-dot" aria-hidden="true" />
        <div class="side-id-text">
          <NuxtLink class="side-name" :to="localePath('/style/dashboard')">
            {{ t('home.name') }}
          </NuxtLink>
          <p class="side-tagline">{{ t('home.tagline') }}</p>
        </div>
      </div>
      <NuxtLink class="side-gallery" :to="localePath('/styles')">
        <span class="side-gallery-label">{{ t('styles.gallery.title') }}</span>
        <span class="side-gallery-arrow" aria-hidden="true">→</span>
      </NuxtLink>
    </div>

    <!-- 子页路由导航（含当前页激活态） -->
    <nav class="side-nav" :aria-label="t('common.subNav')">
      <ul class="side-list">
        <li v-for="item in links" :key="item.path" class="side-item">
          <NuxtLink
            class="side-link"
            :to="localePath(item.path)"
            :aria-current="isActive(item.path) ? 'page' : undefined"
          >
            <span class="side-tick" aria-hidden="true" />
            <span class="side-linktext">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/dashboard/about', label: t('nav.about') },
  { path: '/style/dashboard/projects', label: t('nav.projects') },
  { path: '/style/dashboard/blog', label: t('nav.blog') },
  { path: '/style/dashboard/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
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

/* —— 路由导航 —— */
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

/* 当前页：与首页滚动激活态同一套观感 */
.side-link[aria-current='page'] {
  color: var(--c-accent);
  border-color: var(--c-accent);
  background: color-mix(in srgb, var(--c-accent) 10%, transparent);
}

.side-link[aria-current='page'] .side-tick {
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
