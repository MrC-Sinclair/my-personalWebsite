<!--
  TerminalSubNav - terminal 风格子页的路由导航
  ------------------------------------------------------------
  与首页的 .skip-nav（页内锚点降级通道）区分：
  · 首页 skip-nav 的链接是 #sec-xxx，指向**页内区块**；
  · 本组件是子页导航，链接是 /style/terminal/xxx，指向**路由**。
  两者是子页化之后必须分开的两种导航语义，不能混用。

  视觉上仍是终端风味：等宽字体、提示符前缀、无圆角、1px 磷光描边。
  形态与首页 skip-nav 的区别是它常驻可见（子页没有终端输入框，
  导航必须一直可达，不能藏在 focus-within 后面）。
-->
<template>
  <nav class="subnav" :aria-label="t('common.navigation')">
    <a
      class="subnav__home"
      :href="localePath('/style/terminal')"
    >
      <span class="prompt" aria-hidden="true">cd</span>
      <span>~</span>
    </a>

    <ul class="subnav__list">
      <li v-for="item in links" :key="item.path">
        <a
          class="subnav__link"
          :href="localePath(item.path)"
          :aria-current="isActive(item.path) ? 'page' : undefined"
        >
          <span class="prompt" aria-hidden="true">./</span>
          <span>{{ item.label }}</span>
        </a>
      </li>
    </ul>

    <a class="subnav__styles" :href="localePath('/styles')">
      <span aria-hidden="true">↗</span>
      <span>{{ t('styles.galleryLink') }}</span>
    </a>
  </nav>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/terminal/about', label: t('nav.about') },
  { path: '/style/terminal/projects', label: t('nav.projects') },
  { path: '/style/terminal/blog', label: t('nav.blog') },
  { path: '/style/terminal/contact', label: t('nav.contact') },
])

/** 当前子页高亮（含尾部斜杠归一化：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}
</script>

<style scoped>
/* —— 子页导航：常驻可见的终端命令行 —— */
.subnav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
  padding: 8px var(--space);
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  background: var(--c-bg);
  border-bottom: var(--border-w) solid var(--c-border);
}

/* 返回首页：cd ~ 的命令样式 */
.subnav__home {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  min-height: 40px;
  padding: 6px 12px;
  color: var(--c-on-accent);
  background: var(--c-accent-2);
  border: var(--border-w) solid var(--c-accent-2);
  text-decoration: none;
  transition: background-color var(--transition), border-color var(--transition);
}

.subnav__home:hover {
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.subnav__home:active {
  transform: var(--press-transform);
}

.subnav__home .prompt {
  color: var(--c-on-accent);
}

.subnav__list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.subnav__link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 10px;
  color: var(--c-accent);
  text-decoration: none;
  border: var(--border-w) solid transparent;
  transition: color var(--transition), border-color var(--transition);
}

.subnav__link:hover {
  color: var(--c-accent-2);
  border-color: color-mix(in srgb, var(--c-accent-2) 45%, transparent);
}

.subnav__link:active {
  transform: var(--press-transform);
}

.subnav__link .prompt {
  color: var(--c-muted);
  user-select: none;
}

/* 当前页：琥珀底反色（终端里「选中行」的观感） */
.subnav__link[aria-current='page'] {
  color: var(--c-on-accent);
  background: var(--c-accent);
}

.subnav__link[aria-current='page'] .prompt {
  color: var(--c-on-accent);
}

/* 画廊入口：推到最右 */
.subnav__styles {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  min-height: 40px;
  margin-left: auto;
  padding: 6px 10px;
  color: var(--c-muted);
  text-decoration: none;
  border: var(--border-w) solid color-mix(in srgb, var(--c-muted) 35%, transparent);
  transition: color var(--transition), border-color var(--transition);
}

.subnav__styles:hover {
  color: var(--c-accent);
  border-color: color-mix(in srgb, var(--c-accent) 45%, transparent);
}

.subnav__home:focus-visible,
.subnav__link:focus-visible,
.subnav__styles:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* —— 动效降级 —— */
@media (prefers-reduced-motion: reduce) {
  .subnav__home,
  .subnav__link,
  .subnav__styles {
    transition: none;
  }
}
</style>
