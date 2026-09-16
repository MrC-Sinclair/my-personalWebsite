<!--
  MetroSectionLabel - Tile 分组标签
  ------------------------------------------------------------
  开始屏幕式的分组标题：强调色小方块 + 宽字距标题 + 可选数量角标。
  id 会透传到根元素 h2 上，供 section 的 aria-labelledby 引用。
-->
<template>
  <h2 class="label">
    <span class="label__mark" aria-hidden="true"/>
    <span class="label__text">{{ title }}</span>
    <span v-if="typeof count === 'number'" class="label__count">{{ String(count).padStart(2, '0') }}</span>
  </h2>
</template>

<script setup lang="ts">
defineProps<{
  /** 分组标题（传 t() 的结果） */
  title: string
  /** 可选数量角标（如项目数），走 String.padStart 显示为 02 位 */
  count?: number
}>()
</script>

<style scoped>
.label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 calc(var(--gap) * 2);
}

/* 强调色小方块：Metro 分组标记 */
.label__mark {
  flex: none;
  width: 14px;
  height: 14px;
  background: var(--c-accent);
}

.label__text {
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-text);
}

/* 数量角标：等宽字体，信息版面的「读数」感 */
.label__count {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}
</style>
