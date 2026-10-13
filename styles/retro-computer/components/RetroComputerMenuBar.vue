<!--
  RetroComputerMenuBar - 复古电脑风格的顶部菜单条
  ------------------------------------------------------------
  桌面隐喻的「系统菜单栏」：固定在视口顶部，左侧为站点标识
  （四色旗帜 + 站点名），中间为页内锚点菜单（悬停即深蓝反白，
  像真实菜单项的选中高亮），右侧为「风格画廊」入口 + 系统时钟，
  画廊左边再挂一枚语言切换小芯片（行为走共享层 useLocaleSwitch）。
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
        <!-- 语言切换：凹陷托盘小芯片，比画廊入口低一级 -->
        <NuxtLink class="rc-menubar__lang" :to="targetPath" :aria-label="t('common.language')">
          {{ targetLabel }}
        </NuxtLink>
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
// 语言切换行为走共享层，外观由本风格决定
const { targetPath, targetLabel } = useLocaleSwitch()

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

/* —— 右侧：语言切换 + 画廊入口 + 时钟 —— */
.rc-menubar__right {
  display: flex;
  align-items: stretch;
  margin-left: auto;
}

/* 语言切换：8-bit 凸起小按钮，比画廊那条菜单项低一级 ——
   常态是 muted 等宽小字，hover 只把底色提亮，不像菜单项整块反白 */
.rc-menubar__lang {
  display: inline-flex;
  align-self: center;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  min-width: 40px;
  padding: 0 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  border: var(--border-w) solid;
  border-color: #ffffff var(--c-border) var(--c-border) #ffffff;
  box-shadow:
    inset 1px 1px 0 0 #ffffff,
    inset -1px -1px 0 0 var(--c-border);
}

.rc-menubar__lang:hover {
  color: var(--c-text);
  background: color-mix(in srgb, var(--c-on-accent) 45%, var(--c-surface));
}

/* 按压：95 系不位移，靠描边凹凸翻转（凸起 → 凹陷，--shadow-press 即凹陷配方） */
.rc-menubar__lang:active {
  color: var(--c-accent);
  border-color: var(--c-border) #ffffff #ffffff var(--c-border);
  box-shadow: var(--shadow-press);
}

.rc-menubar__lang:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
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

  /* 极窄屏先收掉时钟，再截短站名（菜单条定高 48px 不能换行，
     不给语言芯片腾位置就会横向溢出；站名只截断不隐藏，保留可读名） */
  .rc-menubar__clock {
    display: none;
  }

  .rc-menubar__brand-name {
    max-width: 18vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
