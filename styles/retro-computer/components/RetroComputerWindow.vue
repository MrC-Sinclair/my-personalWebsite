<!--
  RetroComputerWindow - 复古电脑风格的经典窗口框架
  ------------------------------------------------------------
  95 式窗口：灰色窗体 + 双 border 立体边框（外圈深 / 内圈亮）+
  硬边投影；标题栏激活时为深蓝渐变 + 白字，失活时为灰底灰字；
  右上角「─ □ ✕」控制钮为纯装饰刻画（aria-hidden）。
  点击窗口任意处 / 键盘聚焦标题按钮都会触发 activate 事件，
  由父级负责高亮与置顶（本组件只上报，不持有全局状态）。
  底部可选状态条（statusText）以凹陷槽展示。
-->
<template>
  <section
    :id="windowId"
    class="rc-win"
    :class="{ 'rc-win--active': active }"
    :data-section="windowId"
    tabindex="-1"
    @click="emit('activate')"
    @focusin="emit('activate')"
  >
    <div class="rc-win__frame">
      <header class="rc-win__titlebar">
        <span v-if="icon" class="rc-win__icon">
          <RetroComputerPixelIcon :variant="icon" />
        </span>
        <component :is="`h${headingLevel}`" class="rc-win__heading">
          <button type="button" class="rc-win__title" @click.stop="emit('activate')">
            {{ title }}
          </button>
        </component>
        <span class="rc-win__controls" aria-hidden="true">
          <span class="rc-win__ctl"><i class="rc-win__ctl-min"/></span>
          <span class="rc-win__ctl"><i class="rc-win__ctl-max"/></span>
          <span class="rc-win__ctl"><i class="rc-win__ctl-x"/></span>
        </span>
      </header>

      <div class="rc-win__body">
        <slot />
      </div>

      <footer v-if="statusText" class="rc-win__status">{{ statusText }}</footer>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * @file 复古电脑风格的窗口框架组件
 * @description 只负责窗口的表现（边框 / 标题栏 / 激活态 / 状态条），
 *              激活逻辑由父级（页面）统一管理；内容与状态条文案全部来自插槽与 props。
 */
import type { RetroPixelIconVariant } from './RetroComputerPixelIcon.vue'
import RetroComputerPixelIcon from './RetroComputerPixelIcon.vue'

withDefaults(
  defineProps<{
    /** 窗口 DOM id（同时用作页内锚点与 data-section 标注） */
    windowId: string
    /** 标题栏文字（i18n 文案） */
    title: string
    /** 标题栏像素图标变体 */
    icon?: RetroPixelIconVariant
    /** 是否为当前激活窗口（深蓝标题栏 + 置顶） */
    active?: boolean
    /** 标题的 heading 级别（欢迎窗口用 1 作为页面主标题，其余窗口用 2） */
    headingLevel?: 1 | 2 | 3
    /** 底部状态条文字（缺省不渲染状态条） */
    statusText?: string
  }>(),
  {
    icon: undefined,
    active: false,
    headingLevel: 2,
    statusText: undefined,
  },
)

const emit = defineEmits<{ (e: 'activate'): void }>()
</script>

<style scoped>
/* —— 窗口根：激活窗口置顶 —— */
.rc-win {
  position: relative;
  min-width: 0;
}

.rc-win--active {
  z-index: 5;
}

/* 窗口聚焦时的键盘可见性（点线框画在边框内） */
.rc-win:focus-visible {
  outline: none;
}

.rc-win:focus-visible .rc-win__frame {
  outline: 2px dotted var(--c-text);
  outline-offset: -6px;
}

/* —— 窗体：双 border 立体边框（外圈左上亮 / 右下深，
      box-shadow 内圈左上白 / 右下灰）+ 硬边投影 —— */
.rc-win__frame {
  background: var(--c-surface);
  border: var(--border-w) solid;
  border-color: #dfdfdf #0a0a0a #0a0a0a #dfdfdf;
  box-shadow:
    inset 1px 1px 0 0 #ffffff,
    inset -1px -1px 0 0 var(--c-border),
    var(--shadow);
}

/* —— 标题栏 —— */
.rc-win__titlebar {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 2px 3px 2px 8px;
  background: var(--c-surface);
  border-bottom: var(--border-w) solid;
  border-color: #dfdfdf #0a0a0a #0a0a0a #dfdfdf;
  color: var(--c-muted);
}

/* 激活窗口：经典深蓝渐变标题栏 + 白字 */
.rc-win--active .rc-win__titlebar {
  background: linear-gradient(90deg, var(--c-accent), var(--c-accent-2));
  color: var(--c-on-accent);
}

.rc-win__icon {
  display: inline-flex;
  flex: none;
}

/* 标题按钮：占满剩余宽度，标题过长省略 */
.rc-win__heading {
  display: flex;
  flex: 1;
  min-width: 0;
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-base);
}

.rc-win__title {
  flex: 1;
  min-width: 0;
  min-height: 40px;
  padding: 4px 8px;
  overflow: hidden;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 700;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.rc-win__title:hover {
  background: rgb(0 0 0 / 0.08);
}

.rc-win--active .rc-win__title:hover {
  background: rgb(255 255 255 / 0.18);
}

.rc-win__title:focus-visible {
  outline: 2px dotted currentcolor;
  outline-offset: -4px;
}

/* —— 窗口控制钮：纯装饰刻画（─ □ ✕），不承载交互 —— */
.rc-win__controls {
  display: inline-flex;
  flex: none;
  gap: 3px;
  cursor: default;
}

.rc-win__ctl {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 16px;
  background: var(--c-surface);
  border: var(--border-w) solid;
  border-color: #0a0a0a #dfdfdf #dfdfdf #0a0a0a;
  box-shadow: inset 1px 1px 0 0 var(--c-border);
}

/* 最小化：一条短横杠 */
.rc-win__ctl-min {
  width: 8px;
  height: 2px;
  margin-top: 7px;
  background: currentcolor;
}

/* 最大化：顶部加粗的方框 */
.rc-win__ctl-max {
  width: 8px;
  height: 7px;
  border: var(--border-w) solid currentcolor;
  border-top-width: 2px;
}

/* 关闭：两条旋转 45° 的短杠组成 ✕ */
.rc-win__ctl-x {
  position: relative;
  width: 10px;
  height: 10px;
}

.rc-win__ctl-x::before,
.rc-win__ctl-x::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 11px;
  height: 2px;
  background: currentcolor;
}

.rc-win__ctl-x::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.rc-win__ctl-x::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

/* —— 内容区 —— */
.rc-win__body {
  padding: var(--space);
  color: var(--c-text);
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
}

/* —— 状态条：上边界为凹槽（深上 / 亮下）—— */
.rc-win__status {
  padding: 5px 10px;
  border-top: var(--border-w) solid;
  border-color: var(--c-border);
  box-shadow: inset 0 1px 0 0 #ffffff;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: var(--fs-small);
}
</style>
