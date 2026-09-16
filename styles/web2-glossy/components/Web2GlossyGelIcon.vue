<!--
  Web2GlossyGelIcon - Web 2.0 光泽风格的纯 CSS「3D 小图标」
  ------------------------------------------------------------
  蓝色凝胶圆角方块底座（渐变 + 顶部高光 + 倒角亮边 + Drop Shadow），
  内部用纯 CSS 几何绘制四类符号，模拟 Web 2.0 时代的小立体图标：
  - window：浏览器窗口（前端）
  - layers：层叠数据（后端）
  - orbit ：轨道圆环（DevOps）
  - spark ：四角星光（工具）
  纯装饰元素，aria-hidden，不承载语义。
-->
<template>
  <span class="gel-icon" :class="`gel-icon--${variant}`" aria-hidden="true">
    <span class="gel-icon__glyph"/>
  </span>
</template>

<script setup lang="ts">
/**
 * @file Web 2.0 光泽风格的纯 CSS 立体小图标
 * @description variant 决定底座内绘制的几何符号，全部由渐变/边框/伪元素实现。
 */
export type GelIconVariant = 'window' | 'layers' | 'orbit' | 'spark'

withDefaults(
  defineProps<{
    /** 图标符号变体 */
    variant?: GelIconVariant
  }>(),
  {
    variant: 'spark',
  },
)
</script>

<style scoped>
/* —— 凝胶底座 —— */
.gel-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 46px;
  height: 46px;
  overflow: hidden;
  border: 1px solid #14417e;
  border-radius: 14px;
  background: linear-gradient(180deg, #4f9cf0 0%, #2b72c6 52%, #1d5fae 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.65),
    inset 0 -2px 4px rgb(9 34 64 / 0.3),
    0 3px 6px rgb(23 74 128 / 0.3);
}

/* 底座顶部半条白色高光 */
.gel-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 0.55) 0%,
    rgb(255 255 255 / 0.14) 42%,
    rgb(255 255 255 / 0) 62%
  );
  pointer-events: none;
}

/* —— 符号层 —— */
.gel-icon__glyph {
  position: relative;
  display: block;
}

/* window：浏览器窗口（顶栏 + 内容区） */
.gel-icon--window .gel-icon__glyph {
  width: 24px;
  height: 20px;
  border: 2px solid rgb(255 255 255 / 0.95);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgb(9 34 64 / 0.35);
}

.gel-icon--window .gel-icon__glyph::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 6px;
  border-radius: 2px 2px 0 0;
  background: rgb(255 255 255 / 0.95);
}

/* layers：三层层叠数据（中条 + 上下两条投影条） */
.gel-icon--layers .gel-icon__glyph {
  width: 22px;
  height: 6px;
  border-radius: 3px;
  background: rgb(255 255 255 / 0.95);
  box-shadow:
    0 -8px 0 rgb(255 255 255 / 0.7),
    0 8px 0 rgb(255 255 255 / 0.45);
}

/* orbit：轨道圆环 + 卫星点 */
.gel-icon--orbit .gel-icon__glyph {
  width: 22px;
  height: 22px;
  border: 3px solid rgb(255 255 255 / 0.95);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgb(9 34 64 / 0.35);
}

.gel-icon--orbit .gel-icon__glyph::after {
  content: '';
  position: absolute;
  top: -7px;
  right: -7px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffd28a;
  box-shadow: 0 1px 2px rgb(9 34 64 / 0.4);
}

/* spark：四角星光 */
.gel-icon--spark .gel-icon__glyph {
  width: 24px;
  height: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #ffe6bd 100%);
  clip-path: polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%);
  filter: drop-shadow(0 2px 2px rgb(9 34 64 / 0.35));
}
</style>
