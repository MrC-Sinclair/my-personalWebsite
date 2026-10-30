<!--
  LiquidGlassPanel - liquid-glass 风格的玻璃主板区块外壳
  ------------------------------------------------------------
  通用玻璃面板：eyebrow + 标题（可带 meta 计数）+ 默认插槽。
  承载玻璃签名配方：单层中性填充 / backdrop-blur 折射 / 极淡
  轮廓描边 / 镜面高光环 / 折射环 / 顶部泛光 / 分层轻投影。

  三次迭代：配方从「十几层叠加」收敛为「四件事」——
  填充（--lg-fill，一层）、镜面环（--lg-spec）、折射环
  （--lg-refract）、模糊（--lg-blur）。旧版在这里叠了 3 层填充
  渐变 + 3 个径向高光 + 高光弧 + 6 条 inset/外扩描边，结果是
  半透明白互相叠加把板子搅成发灰的亚克力。iOS 的玻璃板内几乎
  纯净，质感集中在边缘一圈，所以这里把中间区域让给背景，
  只保留边缘的光学层级。

  注意：reveal 动画类不要加在本组件根元素上（避免 opacity
  过渡期间 backdrop-filter 采样失效造成闪烁），应加在插槽内
  的内容元素上。
-->
<template>
  <section class="panel glass">
    <span class="lens" aria-hidden="true"/>
    <span class="sheen" aria-hidden="true"/>
    <header class="head">
      <p class="eyebrow">{{ eyebrow }}</p>
      <div class="title-row">
        <component :is="headingTag" class="title">{{ title }}</component>
        <span v-if="meta" class="meta">{{ meta }}</span>
      </div>
    </header>
    <div class="body">
      <slot/>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** 面板眉标（小字引导，如栏目归属） */
    eyebrow: string
    /** 面板标题 */
    title: string
    /** 可选的计数/说明徽标（如条目数量） */
    meta?: string
    /** 标题层级：子页唯一面板用 1，首页并列面板用 2（默认 2） */
    level?: 1 | 2
  }>(),
  {
    meta: '',
    level: 2,
  },
)

const headingTag = computed(() => (props.level === 1 ? 'h1' : 'h2'))
</script>

<style scoped>
/* —— 玻璃本体 ——
   只有一层填充：颜色全部来自被折射的背景，多一层白就多一分灰。
   saturate 从旧版的 1.55 降到 1.2——把背景的彩色放大只会让板子发腻，
   iOS 的玻璃是中性偏冷的，它提亮、但不加浓。 */
.glass {
  position: relative;
  overflow: hidden;
  padding: clamp(24px, 3.4vw, 36px);
  background: var(--lg-depth), var(--lg-fill);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  backdrop-filter: blur(var(--lg-blur)) saturate(1.3) brightness(1.04) contrast(1.14);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(1.3) brightness(1.04) contrast(1.14);
}

@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: rgb(24 17 60 / 0.94);
  }
}

/* —— 镜面高光环（specular）：玻璃质感的主要来源 ——
   用 mask-composite 挖出一条 1.2px 的环带，环上跑 --lg-spec 渐变：
   顶部 0.78（正对光源）→ 两侧 0.12（掠射）→ 底部 0.26（环境回光）。
   这条「亮度沿轮廓连续变化」的高光是玻璃与塑料的分界；旧版用的是
   inset 0 1px 0 —— 等宽等亮，正是廉价玻璃拟态的招牌破绽。
   环画在内容之上（::after 的绘制顺序在后），玻璃表面的反光本就该
   盖在内容上方，而它只占最外一圈，不影响文字。 */
.glass::after {
  position: absolute;
  inset: 0;
  padding: var(--lg-spec-w);
  border-radius: inherit;
  pointer-events: none;
  content: '';
  background: var(--lg-spec);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

/* 顶部镜面泛光：光源在正上方的一抹柔光。
   旧版这里叠了 3 个径向（0.18~0.24）把板子搅灰，现在只留一抹 0.11。 */
.glass::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: var(--lg-luster);
}

/* —— 折射环：透镜边缘把背景「拉进来」的增厚 ——
   15px 宽的环带跑 --lg-refract（冷紫 → 青，取自背景光斑主色，
   是「被折射的环境色」而不是装饰色，所以 0.1 封顶）。
   内缘用子元素再叠一道 6px 的窄环做出浓→淡的阶梯，避免 mask
   挖出的硬边在板内留下一道可见的圈。 */
.lens {
  position: absolute;
  inset: 0;
  padding: var(--lg-refract-w);
  border-radius: inherit;
  pointer-events: none;
  /* —— 边缘透镜：真实的折射，而不是画上去的色环 ——
     板内主体用 20~24px 的模糊，而边缘这一圈只用 6px：同一片背景
     在边缘处明显更「实」、更亮、更浓，读起来就是透镜边缘把背景
     拉近放大后的样子——这是 iOS 液态玻璃最核心的一处光学特征，
     也是 CSS 能对「折射」做出的最接近的近似。
     （mask 会把 backdrop-filter 的结果一起裁成环带，所以只在
     边缘生效，不会让整块板变清晰。） */
  backdrop-filter: blur(6px) saturate(1.7) brightness(1.15) contrast(1.1);
  -webkit-backdrop-filter: blur(6px) saturate(1.7) brightness(1.15) contrast(1.1);
  background: var(--lg-refract);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

.lens::after {
  position: absolute;
  inset: 0;
  padding: 8px;
  border-radius: inherit;
  content: '';
  background: var(--lg-refract);
  opacity: 0.6;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

/* 折射光带：默认隐形，hover 才扫过。
   旧版让它在静态下常驻 0.55——一块永远挂着的斜向亮条是玻璃拟态的
   套路痕迹，iOS 的玻璃静止时是干净的。 */
.sheen {
  position: absolute;
  top: -30%;
  bottom: -30%;
  left: -40%;
  width: 34%;
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
  font-size: clamp(24px, 3.4vw, 32px);
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
  background: rgb(94 227 255 / 0.08);
  border: var(--border-w) solid rgb(94 227 255 / 0.3);
  border-radius: 999px;
}

.body {
  position: relative;
}

@media (prefers-reduced-motion: reduce) {
  .sheen {
    transition: none;
    opacity: 0;
  }

  .panel:hover .sheen {
    left: -40%;
    opacity: 0;
  }
}
</style>
