<!--
  Y2KChromeButton - y2k 风格金属铬按钮
  ------------------------------------------------------------
  按渲染目标自动选择标签：
  - 传 to（站内路由）→ NuxtLink
  - 传 href（页内锚点 / 外链）→ 原生 <a>（external 时补 target/rel）
  - 都不传 → <button type="button">
  质感签名：多段银蓝「铬」渐变 + 顶部白色 inset 高光 + 蓝紫辉光
  投影；variant="plastic" 时切换为半透明塑料气泡按钮。
  交互：hover 辉光增强 + 上浮 + 高光斜扫；active 内凹下沉。
-->
<template>
  <NuxtLink v-if="to" class="y2k-btn" :class="`y2k-btn--${variant}`" :to="to">
    <slot />
  </NuxtLink>
  <a
    v-else-if="href"
    class="y2k-btn"
    :class="`y2k-btn--${variant}`"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
  >
    <slot />
  </a>
  <button v-else type="button" class="y2k-btn" :class="`y2k-btn--${variant}`">
    <slot />
  </button>
</template>

<script setup lang="ts">
/**
 * @file Y2K 风格的铬金属/塑料按钮组件
 * @description 千禧年 3D 按钮质感：铬渐变、白高光、辉光投影。
 */
withDefaults(
  defineProps<{
    /** 站内路由目标（渲染为 NuxtLink） */
    to?: string
    /** 页内锚点或外部链接（渲染为原生 a） */
    href?: string
    /** 外链时启用 target="_blank" + rel="noopener" */
    external?: boolean
    /** chrome = 金属铬（默认）；plastic = 半透明塑料气泡 */
    variant?: 'chrome' | 'plastic'
  }>(),
  {
    to: undefined,
    href: undefined,
    external: false,
    variant: 'chrome',
  },
)
</script>

<style scoped>
.y2k-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 44px;
  padding: 10px 24px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  border: var(--border-w) solid rgb(255 255 255 / 0.65);
  border-radius: 999px;
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    filter var(--transition);
}

/* —— 金属铬：多段灰白蓝过渡（硬金属质感） —— */
.y2k-btn--chrome {
  color: var(--c-on-accent);
  background: linear-gradient(
    180deg,
    #f8faff 0%,
    #ccd6f6 34%,
    #8e9ad0 50%,
    #5f6cae 60%,
    #aeb9e8 84%,
    #e7ecff 100%
  );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    inset 0 -3px 6px rgb(24 16 84 / 0.4),
    0 10px 24px rgb(110 90 255 / 0.4);
}

/* —— 半透明塑料气泡 —— */
.y2k-btn--plastic {
  color: var(--c-text);
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 0.3) 0%,
    rgb(255 255 255 / 0.08) 46%,
    rgb(139 123 255 / 0.22) 100%
  );
  border-color: rgb(190 200 255 / 0.55);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.55),
    0 8px 22px rgb(5 0 42 / 0.45);
}

/* hover：辉光增强 + 上浮 */
.y2k-btn--chrome:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    inset 0 -3px 6px rgb(24 16 84 / 0.4),
    0 16px 34px rgb(139 92 255 / 0.55);
}

.y2k-btn--plastic:hover {
  transform: translateY(-2px);
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 0.42) 0%,
    rgb(255 255 255 / 0.14) 46%,
    rgb(139 123 255 / 0.32) 100%
  );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.7),
    0 14px 30px rgb(139 92 255 / 0.4);
}

/* active：塑料被按瘪（内凹 + 下沉） */
.y2k-btn:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

/* 高光斜扫（hover 划过一次） */
.y2k-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 32%, rgb(255 255 255 / 0.5) 48%, transparent 62%);
  transform: translateX(-130%);
  transition: transform 520ms ease;
  pointer-events: none;
}

.y2k-btn:hover::after {
  transform: translateX(130%);
}

@media (prefers-reduced-motion: reduce) {
  .y2k-btn,
  .y2k-btn::after {
    transition: none;
  }

  .y2k-btn::after {
    display: none;
  }

  .y2k-btn:hover,
  .y2k-btn:active {
    transform: none;
  }
}
</style>
