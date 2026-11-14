<!--
  ClaymorphismBlobField - claymorphism 风格漂浮装饰层
  ------------------------------------------------------------
  评审诊断原首屏「糖果色球太多太散，五种颜色齐上」：这里从
  8 颗 / 6 色收敛到 3 颗，配色定为一个主色（lilac 紫）+ 两个
  点缀（butter 黄 / mint 绿），并按大中小三档 + 透明度递降做
  前后景深，全部退到内容背后，不再与内容抢注意力。
  纯 CSS 绘制（径向渐变高光 + 同色系彩色投影），纯装饰
  （aria-hidden），reduced-motion 下静止。
-->
<template>
  <div class="field" aria-hidden="true">
    <span class="ball ball-lilac"/>
    <span class="ball ball-butter"/>
    <span class="ball ball-mint"/>
  </div>
</template>

<style scoped>
/* 装饰层：铺满父容器，不响应任何指针事件 */
.field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

/* 黏土球基础配方：径向渐变高光（--deco）+ 同色系彩色投影 */
.ball {
  position: absolute;
  display: block;
  border-radius: 50%;
  background: var(--deco), var(--ball-color);
  box-shadow:
    0 14px 24px var(--ball-shadow),
    0 4px 8px var(--ball-shadow-soft);
  animation: bob var(--bob-time, 7s) ease-in-out var(--bob-delay, 0s) infinite alternate;
}

/* —— 前景大球：主色紫，画面右上，不压住中央内容卡 —— */
.ball-lilac {
  --ball-color: #c3a6f5;
  --ball-shadow: rgb(140 100 200 / 0.35);
  --ball-shadow-soft: rgb(140 100 200 / 0.18);
  top: 10%;
  right: 7%;
  width: 132px;
  height: 132px;
  opacity: 0.9;
  --bob-time: 7s;
}

/* —— 中景点缀：暖黄，左侧偏下 —— */
.ball-butter {
  --ball-color: #ffd97a;
  --ball-shadow: rgb(215 170 70 / 0.35);
  --ball-shadow-soft: rgb(215 170 70 / 0.18);
  bottom: 16%;
  left: 6%;
  width: 76px;
  height: 76px;
  opacity: 0.62;
  --bob-time: 8.5s;
  --bob-delay: 0.5s;
}

/* —— 远景点缀：薄荷，右下，最小最淡 —— */
.ball-mint {
  --ball-color: #8fddb7;
  --ball-shadow: rgb(90 175 135 / 0.35);
  --ball-shadow-soft: rgb(90 175 135 / 0.18);
  bottom: 10%;
  right: 12%;
  width: 44px;
  height: 44px;
  opacity: 0.42;
  --bob-time: 9.5s;
  --bob-delay: 1.2s;
}

/* 浮动：上下轻漂（alternate 往返，无跳变） */
@keyframes bob {
  from {
    transform: translateY(-10px);
  }

  to {
    transform: translateY(16px);
  }
}

/* 窄屏：球再退一档景深，给内容留出完整宽度 */
@media (max-width: 640px) {
  .ball-lilac {
    width: 96px;
    height: 96px;
    opacity: 0.5;
  }

  .ball-butter {
    width: 56px;
    height: 56px;
    opacity: 0.38;
  }

  .ball-mint {
    width: 32px;
    height: 32px;
    opacity: 0.28;
  }
}

/* reduced-motion：装饰球全部静止（位置不变，仅去掉动画） */
@media (prefers-reduced-motion: reduce) {
  .ball {
    animation: none;
  }
}
</style>
