<!--
  RetroComputerSubNav - 复古电脑风格子页的路由导航
  ------------------------------------------------------------
  与首页 RetroComputerMenuBar 的区别有三处：
  · 链接语义：首页是 #win-about / #win-posts —— **页内锚点**；
    本组件是 /style/retro-computer/about —— **路由**。子页只有一个窗口，
    锚点在子页上无处可去，两者不能混用。
  · 激活来源：首页菜单项无激活态（页面滚动自己会说话）；子页用路由
    匹配（aria-current='page'），否则用户不知道自己在哪一栏。
  · 窄屏不隐藏菜单：首页窄屏靠底部任务栏的窗口按钮跳转，子页没有
    第二个窗口可跳，隐藏菜单等于窄屏无法换页——改为横向滚动。

  视觉沿用首页那根系统菜单栏：固定顶部、四色旗帜站点标识、悬停
  深蓝反白的菜单项、右侧画廊入口 + 系统时钟。当前子页把首页 hover
  时的深蓝反白固定下来（95 式的选中态就是反白，没有别的选项）。
-->
<template>
  <header class="rc-menubar">
    <div class="rc-menubar__inner">
      <NuxtLink class="rc-menubar__brand" :to="localePath('/style/retro-computer')">
        <RetroComputerPixelIcon variant="flag" />
        <strong class="rc-menubar__brand-name">{{ t('home.name') }}</strong>
      </NuxtLink>

      <nav class="rc-menubar__nav" :aria-label="t('common.subNav')">
        <NuxtLink
          v-for="item in links"
          :key="item.path"
          class="rc-menubar__item"
          :to="localePath(item.path)"
          :aria-current="isActive(item.path) ? 'page' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="rc-menubar__right">
        <NuxtLink :to="localePath('/styles')" class="rc-menubar__item">
          {{ t('styles.gallery.title') }}
        </NuxtLink>
        <span v-if="clock" class="rc-menubar__clock">{{ clock }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import RetroComputerPixelIcon from './RetroComputerPixelIcon.vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/** 子页链接清单（label 走已有 i18n key，不新增文案） */
const links = computed(() => [
  { path: '/style/retro-computer/about', label: t('nav.about') },
  { path: '/style/retro-computer/projects', label: t('nav.projects') },
  { path: '/style/retro-computer/blog', label: t('nav.blog') },
  { path: '/style/retro-computer/contact', label: t('nav.contact') },
])

/** 当前子页高亮（归一化尾部斜杠：/blog 与 /blog/ 视为同一页） */
function isActive(path: string): boolean {
  const current = route.path.replace(/\/$/, '')
  const target = localePath(path).replace(/\/$/, '')
  return current === target
}

/** 系统时钟（HH:mm）：初始为空，SSR 首帧与客户端首帧一致 */
const clock = ref('')
let clockTimer: ReturnType<typeof setInterval> | null = null

/** 按当前语言格式化当前时间（纯客户端执行） */
function tick() {
  clock.value = new Date().toLocaleTimeString(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  tick()
  clockTimer = setInterval(tick, 10_000)
})

onUnmounted(() => {
  if (clockTimer) {
    clearInterval(clockTimer)
    clockTimer = null
  }
})
</script>

<style scoped>
/* —— 菜单条：固定顶部，底边为「亮内线 + 深外线」的凸起收边 —— */
.rc-menubar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 60;
  padding-top: env(safe-area-inset-top, 0px);
  background: var(--c-surface);
  border-bottom: var(--border-w) solid #0a0a0a;
  box-shadow: inset 0 -2px 0 0 #ffffff;
}

.rc-menubar__inner {
  display: flex;
  align-items: stretch;
  height: 48px;
  max-width: var(--page-w);
  margin: 0 auto;
}

/* —— 菜单项通用：整条高度可点（≥40px 触控目标）—— */
.rc-menubar__brand,
.rc-menubar__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  color: var(--c-text);
  font-family: var(--font-body);
  font-size: var(--fs-base);
  text-decoration: none;
  cursor: pointer;
}

/* 菜单选中高亮：深蓝底白字（瞬时切换） */
.rc-menubar__brand:hover,
.rc-menubar__item:hover {
  background: var(--c-accent);
  color: var(--c-on-accent);
}

.rc-menubar__brand:focus-visible,
.rc-menubar__item:focus-visible {
  outline: 2px dotted var(--c-text);
  outline-offset: -4px;
}

/* 当前子页：把 hover 的深蓝反白固定下来（95 式只有反白这一种选中态） */
.rc-menubar__item[aria-current='page'] {
  background: var(--c-accent);
  color: var(--c-on-accent);
}

.rc-menubar__brand-name {
  font-family: var(--font-head);
  font-size: var(--fs-base);
}

/* —— 子页路由菜单：窄屏改为横向滚动（不隐藏，否则无法换页）—— */
.rc-menubar__nav {
  display: flex;
  align-items: stretch;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.rc-menubar__nav::-webkit-scrollbar {
  display: none;
}

.rc-menubar__nav .rc-menubar__item {
  flex: none;
  white-space: nowrap;
}

/* —— 右侧：画廊入口 + 时钟 —— */
.rc-menubar__right {
  display: flex;
  align-items: stretch;
  margin-left: auto;
}

/* 时钟：白色凹陷托盘（像菜单栏里的时钟显示区） */
.rc-menubar__clock {
  display: inline-flex;
  align-items: center;
  align-self: center;
  margin-left: 8px;
  padding: 4px 10px;
  background: #ffffff;
  border: var(--border-w) solid;
  border-color: var(--c-border) #ffffff #ffffff var(--c-border);
  box-shadow: inset 1px 1px 0 0 #0a0a0a;
  color: var(--c-text);
  font-family: var(--font-mono);
  font-size: var(--fs-small);
}

@media (max-width: 479px) {
  .rc-menubar__brand,
  .rc-menubar__item {
    padding: 0 10px;
  }

  /* 极窄屏先把时钟收掉，给路由菜单腾出横向空间 */
  .rc-menubar__clock {
    display: none;
  }
}
</style>
