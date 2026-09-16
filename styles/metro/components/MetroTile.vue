<!--
  MetroTile - Metro 风格通用 Tile 外壳
  ------------------------------------------------------------
  「信息版面」的基本单元：扁平纯色色块、锐利直角、无阴影无纹理。
  通过 props 决定形态与交互形态：
  - span:    尺寸跨度（sm=1x1 / wide=2x1 / large=2x2 / full=横跨整行）
  - variant: Metro 经典色块（cobalt/violet/purple/green/teal/orange/magenta/red/neutral）
  - to:      站内路由（NuxtLink，需先用 useLocalePath 包裹）
  - href:    链接地址（http 开头新窗口打开；# 开头为页内原生锚点）
  - button:  渲染为按钮（配合 click 事件，如复制微信号、展开二维码）
  交互签名：hover 轻微倾斜 + 提亮，active 按压缩小；
  prefers-reduced-motion 下关闭位移与倾斜，仅保留提亮反馈。
  白字色块的色值均已校验对比度 ≥ 4.5:1（亮色块配近黑字）。
-->
<template>
  <NuxtLink v-if="to" :to="to" :aria-label="ariaLabel" class="tile tile--action" :class="[spanClass, variantClass]">
    <slot />
  </NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    :aria-label="ariaLabel"
    class="tile tile--action"
    :class="[spanClass, variantClass]"
  >
    <slot />
  </a>
  <button
    v-else-if="button"
    type="button"
    :aria-label="ariaLabel"
    class="tile tile--action"
    :class="[spanClass, variantClass]"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
  <div v-else class="tile" :class="[spanClass, variantClass]">
    <slot />
  </div>
</template>

<script lang="ts">
/** Tile 尺寸跨度：sm=1x1、wide=2x1、large=2x2、full=横跨整行 */
export type MetroTileSpan = 'sm' | 'wide' | 'large' | 'full'

/** Metro 经典色块变体 */
export type MetroTileVariant =
  | 'cobalt'
  | 'violet'
  | 'purple'
  | 'green'
  | 'teal'
  | 'orange'
  | 'magenta'
  | 'red'
  | 'neutral'
</script>

<script setup lang="ts">
const props = defineProps<{
  /** 尺寸跨度，默认 1x1 */
  span?: MetroTileSpan
  /** 色块变体，默认中性灰面 */
  variant?: MetroTileVariant
  /** 站内路由地址（useLocalePath 包裹后传入） */
  to?: string
  /** 链接地址（外部 http 链接新窗口打开；# 开头为页内锚点） */
  href?: string
  /** 渲染为按钮（配合 click 事件） */
  button?: boolean
  /** 无障碍名称（传 t() 的结果） */
  ariaLabel?: string
}>()

const emit = defineEmits<{ click: [event: MouseEvent] }>()

/** 是否外部链接（决定新窗口打开与 rel） */
const isExternal = computed(() => /^https?:\/\//.test(props.href ?? ''))

/** 跨度类名（默认 sm 不加类） */
const spanClass = computed(() => (props.span && props.span !== 'sm' ? `tile--${props.span}` : ''))

/** 色块类名（默认中性面不加类） */
const variantClass = computed(() => (props.variant && props.variant !== 'neutral' ? `tile--${props.variant}` : ''))
</script>

<style scoped>
.tile {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  padding: 18px;
  overflow: hidden;
  font: inherit;
  text-align: left;
  text-decoration: none;
  color: var(--c-text);
  background: var(--c-surface);
  border: none;
  /* 同时携带 opacity：与共享层 scroll-reveal 的进入动画兼容 */
  transition:
    transform var(--transition),
    filter var(--transition),
    opacity var(--transition);
}

/* hover：所有 Tile 提亮（版面「活着」的底噪反馈） */
.tile:hover {
  filter: brightness(1.09);
}

/* 交互型 Tile：hover 轻微倾斜 + active 按压缩小（Windows Phone 手势隐喻） */
.tile--action {
  cursor: pointer;
}

.tile--action:hover {
  transform: perspective(640px) rotateX(1.8deg) rotateY(-2.6deg);
}

.tile--action:active {
  transform: var(--press-transform);
}

.tile:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 3px;
}

/* —— 尺寸跨度 —— */
.tile--wide {
  grid-column: span 2;
}

.tile--large {
  grid-column: span 2;
  grid-row: span 2;
}

.tile--full {
  grid-column: 1 / -1;
}

/* —— Metro 经典色块：白字色块对比度均 ≥ 4.5:1 —— */
.tile--cobalt {
  background: #0050ef;
  color: #ffffff;
}

.tile--violet {
  background: #6a00ff;
  color: #ffffff;
}

.tile--purple {
  background: #aa00ff;
  color: #ffffff;
}

.tile--green {
  background: #008a00;
  color: #ffffff;
}

.tile--magenta {
  background: #d80073;
  color: #ffffff;
}

.tile--red {
  background: #e51400;
  color: #ffffff;
}

/* 亮色块：配近黑字（橙/青上的白字对比度不足，换深色字性质） */
.tile--teal {
  background: #00aba9;
  color: #1a1a1a;
}

.tile--orange {
  background: #f09609;
  color: #1a1a1a;
}

@media (max-width: 768px) {
  .tile {
    padding: 14px;
  }
}

/* —— 动效敏感用户：关闭倾斜与按压位移，保留提亮（非运动反馈） —— */
@media (prefers-reduced-motion: reduce) {
  .tile {
    transition: filter var(--transition);
  }

  .tile--action:hover,
  .tile--action:active {
    transform: none;
  }
}
</style>
