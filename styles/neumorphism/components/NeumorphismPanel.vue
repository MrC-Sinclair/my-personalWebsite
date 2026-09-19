<!--
  NeumorphismPanel - neumorphism 风格通用凸起面板
  ------------------------------------------------------------
  每个内容区块 = 一整块从材料里凸起的面板（同色底 + 双向
  凸起阴影，无边框）。头部为标题 + 可选引导语，主体为内容
  插槽。id / data-section 等属性通过 fallthrough 落在根元素上，
  供页内锚点与滚动监听使用。

  标题层级由 level 决定：首页五个面板是同一页下的并列区块，用 h2；
  子页只有一个面板，用 h1（否则整页没有一级标题）。
-->
<template>
  <section class="panel">
    <header class="panel-head">
      <component :is="headingTag" class="panel-title">{{ title }}</component>
      <p v-if="lead" class="panel-lead">{{ lead }}</p>
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** 面板标题 */
  title: string
  /** 面板标题下方的引导语（可选） */
  lead?: string
  /** 标题层级：首页并列区块用 2，子页唯一面板用 1（默认 2） */
  level?: 1 | 2
}>()

const headingTag = computed(() => (props.level === 1 ? 'h1' : 'h2'))
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
