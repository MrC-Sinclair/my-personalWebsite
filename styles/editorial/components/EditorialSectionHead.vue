<!--
  EditorialSectionHead - editorial 风格的区块刊头
  ------------------------------------------------------------
  杂志「栏目头」：顶部双细线（2px 粗线 + 1px 细线的印刷
  双规线）+ 编号（01/02/03，等宽小字）+ 巨大衬线栏目标题
  + 右侧注释式小字（页边注）。全站区块的编号与分隔节奏
  由它统一提供。
-->
<template>
  <header class="head">
    <div class="rule" aria-hidden="true"/>
    <div class="row">
      <span class="no" aria-hidden="true">{{ no }}</span>
      <h2 class="title">{{ title }}</h2>
      <p v-if="note" class="note">{{ note }}</p>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  /** 区块编号（如 '01'，纯装饰） */
  no: string
  /** 栏目标题（i18n 文案） */
  title: string
  /** 注释式小字（页边注，i18n 文案，可选） */
  note?: string
}>()
</script>

<style scoped>
.head {
  /* 本组件内的印刷墨色（由契约变量派生，非新增 token） */
  --ink-strong: color-mix(in srgb, var(--c-text) 82%, transparent);
  --ink-soft: color-mix(in srgb, var(--c-text) 32%, transparent);
}

/* 印刷双规线：3px 粗线 + 1px 细线 */
.rule {
  border-top: 3px solid var(--ink-strong);
}

.rule::after {
  display: block;
  height: 1px;
  margin-top: 2px;
  content: '';
  background: var(--ink-soft);
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px var(--gap);
  padding-top: 14px;
}

/* 编号：等宽小字 + 刊头红 */
.no {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.14em;
  color: var(--c-accent);
}

/* 栏目标题：巨大衬线字 */
.title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(30px, 4.4vw, 52px);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.01em;
  color: var(--c-text);
  overflow-wrap: break-word;
}

/* 注释式小字：右对齐页边注 */
.note {
  max-width: 44ch;
  margin: 0 0 4px auto;
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
  line-height: 1.7;
  text-align: right;
  color: var(--c-muted);
}

/* 窄屏：页边注退到标题下方左对齐（回退布局不回退设计） */
@media (max-width: 640px) {
  .note {
    flex-basis: 100%;
    margin: 4px 0 0;
    text-align: left;
  }
}
</style>
