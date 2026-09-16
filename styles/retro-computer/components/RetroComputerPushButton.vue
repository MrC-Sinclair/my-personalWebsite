<!--
  RetroComputerPushButton - 复古电脑风格的 95 式立体按钮
  ------------------------------------------------------------
  经典凸起立体边框（外圈左上亮 / 右下深 + 内圈左上白 / 右下灰），
  按下时翻转为凹陷边框（不位移，靠边框翻转表达按压）。
  有 href 渲染为 <a>（支持外链 external），否则渲染为 <button>。
-->
<template>
  <a
    v-if="href"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    class="rc-btn"
  >
    <slot />
  </a>
  <button v-else type="button" class="rc-btn">
    <slot />
  </button>
</template>

<script setup lang="ts">
/**
 * @file 复古电脑风格的立体按钮
 * @description 通用按压件：锚点跳转 / 外链 / 普通按钮三种形态共用一套
 *              95 式立体边框与按压反馈（瞬时状态切换，见 --transition: none）。
 */
withDefaults(
  defineProps<{
    /** 跳转地址：页内锚点或外部链接；缺省渲染为 button */
    href?: string
    /** 是否外部链接（新窗口打开 + noopener） */
    external?: boolean
  }>(),
  {
    href: undefined,
    external: false,
  },
)
</script>

<style scoped>
/* —— 凸起立体按钮 —— */
.rc-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 18px;
  background: var(--c-surface);
  border: var(--border-w) solid;
  border-color: #dfdfdf #0a0a0a #0a0a0a #dfdfdf;
  box-shadow:
    inset 1px 1px 0 0 #ffffff,
    inset -1px -1px 0 0 var(--c-border);
  color: var(--c-text);
  font-family: var(--font-body);
  font-size: var(--fs-base);
  font-weight: 700;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
}

/* 悬停：底色轻微提亮（瞬时切换） */
.rc-btn:hover {
  background: #cbcbcb;
}

/* 按下：翻转为凹陷边框（press-transform 为 none，不位移） */
.rc-btn:active {
  border-color: #0a0a0a #dfdfdf #dfdfdf #0a0a0a;
  box-shadow:
    inset 1px 1px 0 0 var(--c-border),
    inset -1px -1px 0 0 #ffffff;
  background: #b8b8b8;
}

/* 键盘焦点：95 式点线框 */
.rc-btn:focus-visible {
  outline: 2px dotted var(--c-text);
  outline-offset: -4px;
}
</style>
