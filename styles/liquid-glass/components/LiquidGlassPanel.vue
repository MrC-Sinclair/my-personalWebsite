<!--
  LiquidGlassPanel - liquid-glass 风格的玻璃主板区块外壳
  ------------------------------------------------------------
  通用玻璃面板：eyebrow + 标题（可带 meta 计数）+ 默认插槽。
  承载玻璃签名配方（半透填充 / 折射微染色 / 半透描边 / 上缘
  高光弧 / 顶部镜面高光 / 深投影 + 内高光 / backdrop-blur）。
  注意：reveal 动画类不要加在本组件根元素上（避免 opacity
  过渡期间 backdrop-filter 采样失效造成闪烁），应加在插槽内
  的内容元素上。
-->
<template>
  <section class="panel glass">
    <span class="sheen" aria-hidden="true"/>
    <header class="head">
      <p class="eyebrow">{{ eyebrow }}</p>
      <div class="title-row">
        <h2 class="title">{{ title }}</h2>
        <span v-if="meta" class="meta">{{ meta }}</span>
      </div>
    </header>
    <div class="body">
      <slot/>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  /** 面板眉标（小字引导，如栏目归属） */
  eyebrow: string
  /** 面板标题 */
  title: string
  /** 可选的计数/说明徽标（如条目数量） */
  meta?: string
}>()
</script>

<style scoped>
/* —— 玻璃配方（面板级，模糊半径 16px） —— */
.glass {
  position: relative;
  overflow: hidden;
  padding: clamp(22px, 3.4vw, 36px);
  background:
    linear-gradient(115deg, rgb(167 139 255 / 0.08), rgb(94 227 255 / 0.04) 48%, rgb(255 122 184 / 0.08)),
    linear-gradient(180deg, rgb(255 255 255 / 0.09), rgb(255 255 255 / 0.04));
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  box-shadow:
    var(--shadow),
    inset 0 1px 0 rgb(255 255 255 / 0.3),
    inset 0 -1px 0 rgb(255 255 255 / 0.05);
  backdrop-filter: blur(16px) saturate(1.35);
  -webkit-backdrop-filter: blur(16px) saturate(1.35);
}

@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: rgb(24 17 60 / 0.94);
  }
}

/* 上缘高光弧（--deco） */
.glass::after {
  position: absolute;
  top: 0;
  right: 12%;
  left: 12%;
  height: 1px;
  content: '';
  background: var(--deco);
}

/* 顶部镜面高光 */
.glass::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: radial-gradient(110% 50% at 50% 0%, rgb(255 255 255 / 0.16), transparent 60%);
}

/* 折射光带：hover 时扫过（默认低透明度静置） */
.sheen {
  position: absolute;
  top: -30%;
  bottom: -30%;
  left: -40%;
  width: 30%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.07), transparent);
  transform: rotate(14deg);
  transition: left 1.1s cubic-bezier(0.45, 0, 0.2, 1), opacity var(--transition);
  opacity: 0;
}

.panel:hover .sheen {
  left: 116%;
  opacity: 1;
}

.head {
  position: relative;
  margin-bottom: var(--space);
}

.eyebrow {
  margin: 0 0 4px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.2em;
  color: var(--c-accent);
}

.title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 12px;
}

.title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(24px, 3.4vw, 34px);
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--c-text);
}

/* 计数徽标：小玻璃胶囊 */
.meta {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent);
  background: rgb(94 227 255 / 0.1);
  border: var(--border-w) solid rgb(94 227 255 / 0.35);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.25);
}

.body {
  position: relative;
}

@media (prefers-reduced-motion: reduce) {
  .sheen {
    transition: none;
  }

  .panel:hover .sheen {
    left: -40%;
    opacity: 0;
  }
}
</style>
