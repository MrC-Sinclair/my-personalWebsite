<!--
  NeumorphismPanel - neumorphism 风格通用凸起面板
  ------------------------------------------------------------
  每个内容区块 = 一整块从材料里凸起的面板（同色底 + 双向
  凸起阴影，无边框）。头部为标题 + 可选引导语，主体为内容
  插槽。id / data-section 等属性通过 fallthrough 落在根元素上，
  供页内锚点与滚动监听使用。
-->
<template>
  <section class="panel">
    <header class="panel-head">
      <h2 class="panel-title">{{ title }}</h2>
      <p v-if="lead" class="panel-lead">{{ lead }}</p>
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  /** 面板标题 */
  title: string
  /** 面板标题下方的引导语（可选） */
  lead?: string
}>()
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  padding: calc(var(--space) + 4px) var(--space);
  background: var(--c-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.panel-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.panel-title {
  margin: 0;
  font-size: var(--fs-title);
  font-weight: 700;
  color: var(--c-text);
  text-shadow: 1px 1px 1px rgb(255 255 255 / 0.9);
}

.panel-lead {
  margin: 0;
  color: var(--c-muted);
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}
</style>
