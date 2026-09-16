<!--
  ClaymorphismBlobField - claymorphism 风格漂浮装饰层
  ------------------------------------------------------------
  英雄区背后的漂浮黏土球装饰：全部由纯 CSS 绘制（径向渐变
  高光 + 同色系彩色投影），大小 / 颜色 / 浮动周期 / 延迟各异，
  营造「软黏土球飘在 Pastel 天空里」的氛围。
  纯装饰（aria-hidden），reduced-motion 下全部静止。
-->
<template>
  <div class="field" aria-hidden="true">
    <span class="ball ball-pink"/>
    <span class="ball ball-mint"/>
    <span class="ball ball-butter"/>
    <span class="ball ball-lilac"/>
    <span class="ball ball-blue"/>
    <span class="ball ball-peach"/>
    <span class="ball ball-tiny-a"/>
    <span class="ball ball-tiny-b"/>
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

/* —— 各色黏土球：Pastel 色板（风格签名装饰色） —— */
.ball-pink {
  --ball-color: #f7a8c8;
  --ball-shadow: rgb(215 100 150 / 0.35);
  --ball-shadow-soft: rgb(215 100 150 / 0.18);
  top: 12%;
  left: 6%;
  width: 88px;
  height: 88px;
  --bob-time: 6.5s;
}

.ball-mint {
  --ball-color: #8fddb7;
  --ball-shadow: rgb(90 175 135 / 0.35);
  --ball-shadow-soft: rgb(90 175 135 / 0.18);
  top: 58%;
  left: 10%;
  width: 56px;
  height: 56px;
  --bob-time: 8s;
  --bob-delay: 0.6s;
}

.ball-butter {
  --ball-color: #ffd97a;
  --ball-shadow: rgb(215 170 70 / 0.35);
  --ball-shadow-soft: rgb(215 170 70 / 0.18);
  top: 20%;
  right: 8%;
  width: 104px;
  height: 104px;
  --bob-time: 7.5s;
  --bob-delay: 0.3s;
}

.ball-lilac {
  --ball-color: #c3a6f5;
  --ball-shadow: rgb(140 100 200 / 0.35);
  --ball-shadow-soft: rgb(140 100 200 / 0.18);
  top: 66%;
  right: 14%;
  width: 72px;
  height: 72px;
  --bob-time: 6s;
  --bob-delay: 1s;
}

.ball-blue {
  --ball-color: #93c2f5;
  --ball-shadow: rgb(80 130 200 / 0.35);
  --ball-shadow-soft: rgb(80 130 200 / 0.18);
  top: 42%;
  left: 20%;
  width: 40px;
  height: 40px;
  --bob-time: 9s;
  --bob-delay: 0.4s;
}

.ball-peach {
  --ball-color: #ffb99a;
  --ball-shadow: rgb(215 120 80 / 0.35);
  --ball-shadow-soft: rgb(215 120 80 / 0.18);
  top: 8%;
  right: 30%;
  width: 34px;
  height: 34px;
  --bob-time: 7s;
  --bob-delay: 1.4s;
}

/* 小圆点：填补大球之间的空隙 */
.ball-tiny-a {
  --ball-color: #e2d4ff;
  --ball-shadow: rgb(150 110 210 / 0.3);
  --ball-shadow-soft: rgb(150 110 210 / 0.15);
  bottom: 12%;
  left: 30%;
  width: 18px;
  height: 18px;
  --bob-time: 5.5s;
  --bob-delay: 0.8s;
}

.ball-tiny-b {
  --ball-color: #ffd7e8;
  --ball-shadow: rgb(215 100 150 / 0.3);
  --ball-shadow-soft: rgb(215 100 150 / 0.15);
  bottom: 20%;
  right: 34%;
  width: 22px;
  height: 22px;
  --bob-time: 6.8s;
  --bob-delay: 1.8s;
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

/* reduced-motion：装饰球全部静止（位置不变，仅去掉动画） */
@media (prefers-reduced-motion: reduce) {
  .ball {
    animation: none;
  }
}
</style>
