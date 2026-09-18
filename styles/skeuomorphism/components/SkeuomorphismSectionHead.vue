<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismSectionHead - 拟物风格区块标题
  ------------------------------------------------------------
  「钉在桌面上的区块题签」：斜贴的黄铜小铭牌（双铆钉、蚀刻
  徽章文字）+ 雕刻在木桌上的象牙大标题 + 缝线分隔线。
  id prop 供父级 aria-labelledby 指向标题。
-->
<template>
  <div class="head">
    <span class="head-plate">
      <span class="head-rivet" aria-hidden="true" />
      {{ badge }}
      <span class="head-rivet" aria-hidden="true" />
    </span>
    <h2 :id="id" class="head-title">{{ title }}</h2>
    <span class="head-rule" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
/**
 * @file 拟物风格的区块标题组件
 * @description 黄铜铭牌徽章 + 雕刻大标题 + 缝线分隔线的区块题签。
 */
defineProps<{
  /** 徽章文字（黄铜铭牌上的小字，如「关于」） */
  badge: string
  /** 区块标题（雕刻在桌面上的大字） */
  title: string
  /** 标题元素 id（供父级 aria-labelledby 使用） */
  id?: string
}>()
</script>

<style scoped>
.head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: calc(var(--gap) * 1.5);
}

/* —— 黄铜小铭牌徽章（斜贴，像钉上去的） —— */
.head-plate {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 14px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--c-on-accent);
  border: 1px solid rgb(0 0 0 / 0.55);
  border-radius: var(--radius-sm);
  background:
    repeating-linear-gradient(105deg, rgb(255 255 255 / 0.07) 0 1px, transparent 1px 3px),
    linear-gradient(180deg, #e0bc72 0%, #bd9040 48%, #91632a 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.6),
    inset 0 -1px 0 rgb(0 0 0 / 0.4),
    0 3px 6px rgb(10 4 0 / 0.55);
  transform: rotate(-1.6deg);
}

.head-rivet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f6e7ba 0%, #a67c34 60%, #59400f 100%);
  box-shadow: inset 0 -1px 1px rgb(0 0 0 / 0.5);
}

/* —— 雕刻在桌面上的大标题 —— */
.head-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(30px, 5vw, 52px);
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: break-word;
  color: #f3e7c9;
  /* 雕刻：文字上吃阴影、下缘高光，像刻进木头 */
  text-shadow:
    0 -1px 0 rgb(0 0 0 / 0.72),
    0 1px 0 rgb(255 240 210 / 0.14);
}

/* —— 缝线分隔线：两端淡出的针脚 —— */
.head-rule {
  width: min(220px, 60%);
  height: 2px;
  background: repeating-linear-gradient(
    90deg,
    rgb(243 234 215 / 0.4) 0 8px,
    transparent 8px 16px
  );
  mask-image: linear-gradient(90deg, #000 40%, transparent);
  -webkit-mask-image: linear-gradient(90deg, #000 40%, transparent);
}
</style>
