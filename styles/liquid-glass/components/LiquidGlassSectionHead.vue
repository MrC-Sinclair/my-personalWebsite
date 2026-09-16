<!--
  LiquidGlassSectionHead - liquid-glass 风格的悬浮区块标题
  ------------------------------------------------------------
  「松散玻璃片」区块（精选项目 / 最新文章）使用的悬浮标题：
  不包玻璃面板，直接漂浮在场景上——眉标发光小字 + 大标题
  + 右侧计数玻璃胶囊，与玻璃卡片形成「文字悬空、玻璃承载」
  的层叠对比（本风格的排版轴之一）。
-->
<template>
  <div class="head">
    <div class="text">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h2 class="title">{{ title }}</h2>
    </div>
    <span v-if="meta" class="meta">{{ meta }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 眉标（栏目归属小字） */
  eyebrow: string
  /** 区块标题 */
  title: string
  /** 可选计数徽标 */
  meta?: string
}>()
</script>

<style scoped>
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--gap);
  margin-bottom: calc(var(--space) + 4px);
}

.eyebrow {
  margin: 0 0 4px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.2em;
  color: var(--c-accent);
  text-shadow: 0 0 14px rgb(94 227 255 / 0.45);
}

.title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--c-text);
  text-shadow: 0 2px 22px rgb(4 2 18 / 0.6);
}

/* 计数徽标：悬浮的小玻璃胶囊
   （不加 backdrop-filter：本组件根元素承载 scroll-reveal 的
   opacity 过渡，过渡期间会成为 backdrop 根，内嵌模糊会闪烁） */
.meta {
  display: inline-flex;
  align-items: center;
  margin-bottom: 6px;
  padding: 6px 14px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-text);
  background: rgb(255 255 255 / 0.12);
  border: var(--border-w) solid var(--c-border);
  border-radius: 999px;
  box-shadow:
    0 8px 20px rgb(4 2 18 / 0.3),
    inset 0 1px 0 rgb(255 255 255 / 0.3);
}
</style>
