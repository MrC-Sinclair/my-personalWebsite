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
/* —— 玻璃配方（面板级，模糊半径 22px） ——
   二次迭代要点：上一次的配方在实测中「偏温和」——板内几乎看不到折射，
   原因有三，逐一在此修正：
   1) 折射染色太淡（0.04~0.08）：拉到 0.1~0.24，玻璃内部才有可辨的彩色
      光路；同时叠加一层 160deg 的「液面反光」，模拟缓慢流动的液膜
   2) 只做了上下内高光：补上左右两侧的 inset 边缘光，玻璃才有「厚度」
   3) 缺色散：真实玻璃边缘会把光拆成冷暖两道细线，用 1px 的半透射
      box-shadow 在左右各描一道（青 / 洋红），是廉价但有效的色散暗示
   另外把 backdrop-blur 从 16px 提到 22px 并加了微对比度——模糊越大，
   背景的高频焦散纹理被揉得越开，板内波纹越明显。 */
.glass {
  position: relative;
  overflow: hidden;
  padding: clamp(22px, 3.4vw, 36px);
  background:
    linear-gradient(
      160deg,
      rgb(255 255 255 / 0.16) 0%,
      rgb(255 255 255 / 0.03) 26%,
      rgb(255 255 255 / 0.07) 58%,
      rgb(255 255 255 / 0.02) 100%
    ),
    linear-gradient(115deg, rgb(167 139 255 / 0.16), rgb(94 227 255 / 0.08) 46%, rgb(255 122 184 / 0.15)),
    linear-gradient(180deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.04));
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  box-shadow:
    var(--shadow),
    /* 上缘强高光 + 下缘弱反光：玻璃的主要厚度来源 */
    inset 0 1px 0 rgb(255 255 255 / 0.42),
    inset 0 -1px 0 rgb(255 255 255 / 0.08),
    /* 左右边缘光：让玻璃的两侧也有转折，不再像一张平贴的纸 */
    inset 1px 0 0 rgb(255 255 255 / 0.14),
    inset -1px 0 0 rgb(255 255 255 / 0.1),
    /* 色散：外扩 1px 的冷暖细线（青 / 洋红） */
    1px 0 0 rgb(94 227 255 / 0.18),
    -1px 0 0 rgb(255 122 184 / 0.14);
  backdrop-filter: blur(22px) saturate(1.55) brightness(1.06) contrast(1.05);
  -webkit-backdrop-filter: blur(22px) saturate(1.55) brightness(1.06) contrast(1.05);
}

@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: rgb(24 17 60 / 0.94);
  }
}

/* 上缘高光弧（--deco）：加粗到 2px 并提高亮度——玻璃的「壳」主要靠这条 */
.glass::after {
  position: absolute;
  top: 0;
  right: 10%;
  left: 10%;
  height: 2px;
  content: '';
  background: var(--deco);
  opacity: 0.95;
}

/* 顶部镜面高光 + 弧形液面反光
   两层叠加：顶部大范围镜面反射（光源在上方）+ 一道斜向的液膜亮弧，
   后者是「液态」而不是「亚克力板」的关键——液面反光是弯的、不对称的。 */
.glass::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background:
    radial-gradient(38% 62% at 18% 4%, rgb(255 255 255 / 0.22), transparent 62%),
    radial-gradient(26% 44% at 84% 2%, rgb(167 139 255 / 0.16), transparent 60%),
    radial-gradient(120% 46% at 50% 0%, rgb(255 255 255 / 0.18), transparent 58%);
}

/* 折射光带：hover 时扫过（默认低透明度静置）
   二次迭代：默认态不再是完全隐形。玻璃在静态下也该有一道常驻的折射
   亮带（真实玻璃总有一道固定的高光），hover 时再放大并扫过。 */
.sheen {
  position: absolute;
  top: -30%;
  bottom: -30%;
  left: -40%;
  width: 34%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.1), transparent);
  transform: rotate(14deg);
  transition: left 1.1s cubic-bezier(0.45, 0, 0.2, 1), opacity var(--transition);
  opacity: 0.55;
}

.sheen::after {
  position: absolute;
  inset: 0;
  content: '';
  background: linear-gradient(90deg, transparent, rgb(94 227 255 / 0.12), transparent);
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
    opacity: 0.5;
  }

  .panel:hover .sheen {
    left: -40%;
    opacity: 0.5;
  }
}
</style>
