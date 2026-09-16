<!--
  Web2GlossyGelButton - Web 2.0 光泽风格的「凝胶按钮」
  ------------------------------------------------------------
  本风格最核心的交互元素：纵向渐变 + 1px 倒角亮边 + 顶部内高光
  + 半条白色高光 + 外部 Drop Shadow；hover 时斜向光泽扫过，
  active 时按钮下沉、高光收起（经典果冻按压反馈）。

  - 传入 to 时渲染 NuxtLink（站内路由，保留预取/右键能力）
  - 否则渲染 <a>：页内锚点（external=false）或外链（external=true，
  - 新窗口 + noopener）
  触控目标 ≥ 44px；文字对比度按渐变最亮停靠点校验 ≥ 4.5:1。
-->
<template>
  <NuxtLink v-if="to" :to="to" class="gel-btn" :class="[variantClass, sizeClass]">
    <slot />
  </NuxtLink>
  <a
    v-else
    :href="href"
    class="gel-btn"
    :class="[variantClass, sizeClass]"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
/**
 * @file Web 2.0 光泽风格的凝胶按钮组件
 * @description 支持三种变体（primary 深蓝凝胶 / orange 橙色凝胶 / ghost 亮面玻璃）
 *              与两档尺寸；站内路由走 NuxtLink，锚点与外链走原生 <a>。
 */
const props = withDefaults(
  defineProps<{
    /** 站内路由地址（传入后渲染 NuxtLink，由调用方用 localePath 包裹） */
    to?: string
    /** 原生跳转地址（页内锚点或外部链接） */
    href?: string
    /** 是否为外部链接（新窗口打开并加 rel="noopener noreferrer"） */
    external?: boolean
    /** 视觉变体 */
    variant?: 'primary' | 'orange' | 'ghost'
    /** 尺寸档位 */
    size?: 'md' | 'lg'
  }>(),
  {
    to: undefined,
    href: undefined,
    external: false,
    variant: 'primary',
    size: 'md',
  },
)

const variantClass = computed(() => `gel-btn--${props.variant}`)
const sizeClass = computed(() => `gel-btn--${props.size}`)
</script>

<style scoped>
/* —— 凝胶按钮基座：渐变 + 倒角亮边 + 顶部内高光 + Drop Shadow —— */
.gel-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 24px;
  overflow: hidden;
  border: 1px solid #14417e;
  border-radius: var(--radius-sm);
  color: var(--c-on-accent);
  font-family: var(--font-head);
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.02em;
  text-decoration: none;
  text-shadow: 0 1px 1px rgb(9 34 64 / 0.45);
  cursor: pointer;
  background: linear-gradient(180deg, #1d5fae 0%, #164c8f 52%, #123f78 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.55),
    inset 0 -1px 2px rgb(0 0 0 / 0.25),
    0 3px 6px rgb(23 74 128 / 0.3),
    0 8px 18px rgb(23 74 128 / 0.22);
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    filter var(--transition);
}

/* 顶部半条白色高光：最亮区域集中在顶部边缘，随高度快速衰减，
   保证中部文字区域的实际底色仍满足对比度要求 */
.gel-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 0.4) 0%,
    rgb(255 255 255 / 0.12) 38%,
    rgb(255 255 255 / 0) 60%
  );
  pointer-events: none;
}

/* hover 斜向光泽扫过 */
.gel-btn::after {
  content: '';
  position: absolute;
  top: -25%;
  bottom: -25%;
  left: -32%;
  width: 34%;
  background: linear-gradient(90deg, rgb(255 255 255 / 0), rgb(255 255 255 / 0.42), rgb(255 255 255 / 0));
  transform: skewX(-20deg) translateX(-160%);
  transition: transform 520ms ease;
  pointer-events: none;
}

.gel-btn:hover::after {
  transform: skewX(-20deg) translateX(460%);
}

.gel-btn:hover {
  filter: brightness(1.07);
}

/* 按下：凝胶被按瘪——下沉 + 高光收起 + 内凹阴影 */
.gel-btn:active {
  transform: var(--press-transform);
  box-shadow:
    inset 0 2px 8px rgb(9 34 64 / 0.55),
    inset 0 1px 0 rgb(255 255 255 / 0.2),
    0 1px 2px rgb(23 74 128 / 0.25);
}

.gel-btn:focus-visible {
  outline: 3px solid rgb(30 111 217 / 0.55);
  outline-offset: 2px;
}

/* —— 变体：橙色凝胶（RSS 徽章色，白字对比度 ≥ 4.5:1） —— */
.gel-btn--orange {
  border-color: #8a3c08;
  background: linear-gradient(180deg, #b85310 0%, #a84a0c 52%, #8f3e08 100%);
  text-shadow: 0 1px 1px rgb(80 32 0 / 0.5);
}

.gel-btn--orange::before {
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 0.26) 0%,
    rgb(255 255 255 / 0.07) 38%,
    rgb(255 255 255 / 0) 60%
  );
}

/* —— 变体：亮面玻璃（浅色底 + 深蓝字，用于深色区域或次要操作） —— */
.gel-btn--ghost {
  border-color: var(--c-border);
  color: #1a5fc0;
  text-shadow: none;
  background: linear-gradient(180deg, #ffffff 0%, #eaf3fd 55%, #d9eafc 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    0 3px 6px rgb(23 74 128 / 0.18),
    0 8px 18px rgb(23 74 128 / 0.14);
}

.gel-btn--ghost::before {
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 0.95) 0%,
    rgb(255 255 255 / 0.35) 40%,
    rgb(255 255 255 / 0) 62%
  );
}

.gel-btn--ghost:hover {
  filter: none;
  background: linear-gradient(180deg, #ffffff 0%, #e2eefc 55%, #cde3f8 100%);
}

.gel-btn--ghost:active {
  box-shadow:
    inset 0 2px 8px rgb(74 107 138 / 0.35),
    0 1px 2px rgb(23 74 128 / 0.15);
}

.gel-btn--ghost:focus-visible {
  outline-color: rgb(30 111 217 / 0.65);
}

/* —— 尺寸 —— */
.gel-btn--lg {
  min-height: 52px;
  padding: 13px 30px;
  font-size: 1.0625rem;
}
</style>
