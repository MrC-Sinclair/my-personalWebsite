<!--
  RetroComputerMenuBar - 复古电脑风格的顶部菜单条
  ------------------------------------------------------------
  桌面隐喻的「系统菜单栏」：固定在视口顶部，左侧为站点标识
  （四色旗帜 + 站点名），中间为页内锚点菜单（悬停即深蓝反白，
  像真实菜单项的选中高亮），右侧为「风格画廊」入口 + 系统时钟。
  时钟为客户端专属：SSR 首帧不渲染，onMounted 起定时器，
  onUnmounted 成对清理；窄屏隐藏中间锚点菜单（回退布局不回退设计）。
-->
<template>
  <header class="rc-menubar">
    <div class="rc-menubar__inner">
      <a href="#top" class="rc-menubar__brand">
        <RetroComputerPixelIcon variant="flag" />
        <strong class="rc-menubar__brand-name">{{ t('home.name') }}</strong>
      </a>

      <nav class="rc-menubar__nav">
        <a href="#win-about" class="rc-menubar__item">{{ t('nav.about') }}</a>
        <a href="#win-projects" class="rc-menubar__item">{{ t('nav.projects') }}</a>
        <a href="#win-blog" class="rc-menubar__item">{{ t('nav.blog') }}</a>
        <a href="#win-contact" class="rc-menubar__item">{{ t('nav.contact') }}</a>
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
/**
 * @file 复古电脑风格的顶部菜单条
 * @description 站点标识与导航锚点；「风格画廊」入口经 useLocalePath
 *              包裹（不写死路径）；时钟定时器在 onUnmounted 清理。
 */
// styles/ 下组件不走自动导入，引用同风格组件必须显式 import
import RetroComputerPixelIcon from './RetroComputerPixelIcon.vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()

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

.rc-menubar__brand-name {
  font-family: var(--font-head);
  font-size: var(--fs-base);
}

/* —— 页内锚点菜单：窄屏隐藏（回退布局，不回退设计）—— */
.rc-menubar__nav {
  display: flex;
  align-items: stretch;
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

@media (max-width: 899px) {
  .rc-menubar__nav {
    display: none;
  }
}

@media (max-width: 479px) {
  .rc-menubar__brand,
  .rc-menubar__item {
    padding: 0 10px;
  }
}
</style>
