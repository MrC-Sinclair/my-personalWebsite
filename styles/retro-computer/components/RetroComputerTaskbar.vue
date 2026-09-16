<!--
  RetroComputerTaskbar - 复古电脑风格的底部任务栏（页脚）
  ------------------------------------------------------------
  桌面隐喻的「任务栏」：固定在视口底部，左侧为开始按钮
  （四色旗帜 + 回到顶部），中间为各窗口的任务按钮（原生锚点
  跳转，激活窗口呈凹陷态），右侧为系统托盘（版权信息）。
  窄屏精简：开始按钮只留旗帜图标、任务按钮只留图标、托盘隐藏
  （回退布局不回退设计：立体边框与凹陷激活态全部保留）。
-->
<template>
  <footer class="rc-taskbar">
    <div class="rc-taskbar__inner">
      <a href="#top" class="rc-taskbar__start">
        <RetroComputerPixelIcon variant="flag" />
        <span class="rc-taskbar__start-label">{{ t('common.backToTop') }}</span>
      </a>

      <span class="rc-taskbar__divider" aria-hidden="true"/>

      <div class="rc-taskbar__windows">
        <a
          v-for="win in windows"
          :key="win.id"
          :href="`#${win.id}`"
          class="rc-taskbar__win"
          :class="{ 'rc-taskbar__win--active': win.id === activeId }"
          :aria-label="win.label"
          :aria-current="win.id === activeId ? 'true' : undefined"
        >
          <RetroComputerPixelIcon :variant="win.icon" />
          <span class="rc-taskbar__win-label">{{ win.label }}</span>
        </a>
      </div>

      <span class="rc-taskbar__tray">{{ t('footer.copyright') }} · {{ t('footer.author') }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * @file 复古电脑风格的底部任务栏（本风格页脚）
 * @description 任务按钮用原生锚点跳转到对应窗口（页内跳转不走路由）；
 *              图标按钮（窄屏只显示图标时）靠 aria-label 保持可读。
 */
import type { RetroPixelIconVariant } from './RetroComputerPixelIcon.vue'
import RetroComputerPixelIcon from './RetroComputerPixelIcon.vue'

/** 任务按钮数据：窗口锚点 id + 标题文案 + 图标 */
export interface RetroTaskbarWindow {
  id: string
  label: string
  icon: RetroPixelIconVariant
}

defineProps<{
  /** 窗口清单（由页面根据 i18n 生成） */
  windows: RetroTaskbarWindow[]
  /** 当前激活窗口 id（对应按钮呈凹陷态） */
  activeId: string
}>()

const { t } = useI18n()
</script>

<style scoped>
/* —— 任务栏：固定底部，顶边为「亮外线 + 亮内线」的凸起收边 —— */
.rc-taskbar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 60;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: var(--c-surface);
  border-top: var(--border-w) solid #dfdfdf;
  box-shadow: inset 0 1px 0 0 #ffffff;
}

.rc-taskbar__inner {
  display: flex;
  align-items: stretch;
  gap: 4px;
  height: 48px;
  padding: 0 6px;
}

/* —— 开始按钮 —— */
.rc-taskbar__start {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  background: var(--c-surface);
  border: var(--border-w) solid;
  border-color: #dfdfdf #0a0a0a #0a0a0a #dfdfdf;
  box-shadow:
    inset 1px 1px 0 0 #ffffff,
    inset -1px -1px 0 0 var(--c-border);
  color: var(--c-text);
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.rc-taskbar__start:hover {
  background: #cbcbcb;
}

.rc-taskbar__start:active {
  border-color: #0a0a0a #dfdfdf #dfdfdf #0a0a0a;
  box-shadow:
    inset 1px 1px 0 0 var(--c-border),
    inset -1px -1px 0 0 #ffffff;
}

.rc-taskbar__start:focus-visible,
.rc-taskbar__win:focus-visible {
  outline: 2px dotted var(--c-text);
  outline-offset: -4px;
}

/* —— 分隔凹槽：左深右亮的竖向刻线 —— */
.rc-taskbar__divider {
  align-self: stretch;
  margin: 8px 2px;
  border-left: var(--border-w) solid var(--c-border);
  border-right: var(--border-w) solid #ffffff;
}

/* —— 任务按钮组 —— */
.rc-taskbar__windows {
  display: flex;
  align-items: stretch;
  gap: 4px;
  min-width: 0;
}

.rc-taskbar__win {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 40px;
  padding: 0 12px;
  background: var(--c-surface);
  border: var(--border-w) solid;
  border-color: #dfdfdf #0a0a0a #0a0a0a #dfdfdf;
  box-shadow:
    inset 1px 1px 0 0 #ffffff,
    inset -1px -1px 0 0 var(--c-border);
  color: var(--c-text);
  font-family: var(--font-body);
  font-size: var(--fs-small);
  text-decoration: none;
  cursor: pointer;
}

.rc-taskbar__win:hover {
  background: #cbcbcb;
}

/* 激活窗口的任务按钮：凹陷 + 加粗（像被按住不放） */
.rc-taskbar__win--active,
.rc-taskbar__win--active:hover {
  border-color: #0a0a0a #dfdfdf #dfdfdf #0a0a0a;
  box-shadow:
    inset 1px 1px 0 0 var(--c-border),
    inset -1px -1px 0 0 #ffffff;
  background: #b8b8b8;
  font-weight: 700;
}

.rc-taskbar__win-label {
  overflow: hidden;
  max-width: 140px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* —— 系统托盘：白色凹陷显示区 —— */
.rc-taskbar__tray {
  display: inline-flex;
  align-items: center;
  align-self: center;
  margin-left: auto;
  padding: 4px 10px;
  background: #ffffff;
  border: var(--border-w) solid;
  border-color: var(--c-border) #ffffff #ffffff var(--c-border);
  box-shadow: inset 1px 1px 0 0 #0a0a0a;
  color: var(--c-text);
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  white-space: nowrap;
}

/* —— 窄屏精简：图标优先，托盘退场 —— */
@media (max-width: 899px) {
  .rc-taskbar__tray {
    display: none;
  }
}

@media (max-width: 599px) {
  .rc-taskbar__start-label,
  .rc-taskbar__win-label {
    display: none;
  }

  .rc-taskbar__win {
    justify-content: center;
    padding: 0;
  }
}
</style>
