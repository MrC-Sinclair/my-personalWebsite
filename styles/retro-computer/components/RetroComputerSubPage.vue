<!--
  RetroComputerSubPage - 复古电脑风格子页的统一外壳
  ------------------------------------------------------------
  桌面隐喻下的子页 = **桌面上只开着一个窗口**：菜单栏 + 一个最大化
  的窗口（标题栏带 h1）+ 任务栏上对应的一个凹陷按钮 + CRT 覆盖层。
  抽成外壳后子页只写窗口内容。

  与首页的差别两处：
  · 窗口数：首页五个窗口宽窄悬殊、上下错位地搁在桌面上（7:5 / 5:7
    交替）——那是「一屏多任务」的节奏；子页只有一个主题，窗口满宽
    铺开，再摆错位会把正文压窄。
  · 标题层级：窗口标题固定 h1。首页只有欢迎窗口用 h1（人名即页面
    主标题），子页没有欢迎窗口，标题必须升为 h1，否则整页没有一级
    标题。

  用法：
    <RetroComputerSubPage
      window-id="win-blog"
      :title="t('blog.title')"
      icon="doc"
      :status-text="String(posts.length)"
    >
      …窗口内容…
    </RetroComputerSubPage>

  这是 retro-computer 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div id="top" class="rc-desktop">
    <RetroComputerSubNav />

    <main class="rc-screen">
      <div class="rc-screen__inner">
        <RetroComputerWindow
          :window-id="windowId"
          :title="title"
          :heading-level="1"
          :icon="icon"
          active
          :status-text="statusText"
          class="rc-pos-window"
        >
          <slot />
        </RetroComputerWindow>
      </div>
    </main>

    <RetroComputerTaskbar :windows="taskbarWindows" :active-id="windowId" />

    <!-- CRT 覆盖层：扫描线 + 暗角 + 扫描亮带（纯装饰） -->
    <div class="rc-crt" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import type { RetroPixelIconVariant } from './RetroComputerPixelIcon.vue'
import type { RetroTaskbarWindow } from './RetroComputerTaskbar.vue'
import RetroComputerSubNav from './RetroComputerSubNav.vue'
import RetroComputerTaskbar from './RetroComputerTaskbar.vue'
import RetroComputerWindow from './RetroComputerWindow.vue'

const props = defineProps<{
  /** 窗口 DOM id（同时是任务栏按钮的锚点目标） */
  windowId: string
  /** 窗口标题栏文字（本页唯一的 h1，i18n） */
  title: string
  /** 标题栏像素图标变体 */
  icon?: RetroPixelIconVariant
  /** 底部状态条文字（缺省不渲染状态条） */
  statusText?: string
}>()

/** 任务栏只有一个窗口按钮：子页就是「只开着一个窗口」的桌面 */
const taskbarWindows = computed<RetroTaskbarWindow[]>(() => [
  { id: props.windowId, label: props.title, icon: props.icon ?? 'floppy' },
])

// 滚动进入视口的区块动画（共享层行为，SSG 友好）
useScrollReveal()
</script>

<style scoped>
/* ============ 桌面：青绿底 + 2px 棋盘点阵（低分辨率抖动纹理）============ */
.rc-desktop {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--c-bg);
  background-image: conic-gradient(
    rgb(255 255 255 / 0.05) 25%,
    transparent 0 50%,
    rgb(255 255 255 / 0.05) 0 75%,
    transparent 0
  );
  background-size: 4px 4px;
}

/* —— 屏幕区域：为固定菜单条 / 任务栏让位（含刘海安全区）—— */
.rc-screen {
  flex: 1;
  width: 100%;
  padding: calc(56px + env(safe-area-inset-top, 0px)) var(--space)
    calc(64px + env(safe-area-inset-bottom, 0px));
}

.rc-screen__inner {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: calc(var(--gap) * 1.5);
  align-items: start;
  max-width: var(--page-w);
  margin: 0 auto;
}

/* 子页只有一个窗口：满宽铺开（首页的错位摆放不适用于单窗口） */
.rc-pos-window {
  grid-column: 1 / -1;
}

/* ============ CRT 覆盖层：扫描线 + 暗角 + 扫描亮带 ============ */
.rc-crt {
  position: fixed;
  inset: 0;
  z-index: 90;
  pointer-events: none;
  background:
    repeating-linear-gradient(0deg, rgb(0 0 0 / 0.12) 0 1px, transparent 1px 3px),
    radial-gradient(120% 90% at 50% 50%, transparent 62%, rgb(0 0 0 / 0.24) 100%);
}

/* 扫描亮带：缓慢下移，pointer-events none，不挡交互 */
.rc-crt::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 18%;
  background: linear-gradient(180deg, transparent, rgb(255 255 255 / 0.06), transparent);
  animation: rc-sweep 8s linear infinite;
}

@keyframes rc-sweep {
  from {
    transform: translateY(-40vh);
  }

  to {
    transform: translateY(120vh);
  }
}

/* reduced-motion：关闭扫描亮带动画（静态扫描线纹理保留） */
@media (prefers-reduced-motion: reduce) {
  .rc-crt::after {
    display: none;
  }
}
</style>
