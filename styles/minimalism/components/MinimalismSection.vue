<!--
  MinimalismSection - minimalism 风格的通用区块骨架
  ------------------------------------------------------------
  「定义式分栏」区块：左侧为区块头（eyebrow 小标 + 大而轻的
  标题 + 可选描述 / 附注插槽），右侧为区块内容插槽。桌面端
  头部随滚动吸附（sticky），窄屏回退为上下堆叠——回退的是
  布局不是设计。区块顶部一条 hairline 细线是秩序感的来源。
  id / data-section / class 通过 fallthrough 透传到 section 根元素。
-->
<template>
  <section class="sec">
    <div class="sec-grid">
      <header class="sec-head">
        <p v-if="eyebrow" class="sec-eyebrow">{{ eyebrow }}</p>
        <h2 class="sec-title">{{ title }}</h2>
        <p v-if="desc" class="sec-desc">{{ desc }}</p>
        <div v-if="$slots.aside" class="sec-aside">
          <slot name="aside" />
        </div>
      </header>
      <div class="sec-body">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  /** 区块头上方的小号标签（i18n） */
  eyebrow?: string
  /** 区块标题（i18n） */
  title: string
  /** 区块描述（i18n，可选） */
  desc?: string
}>()
</script>

<style scoped>
/* —— 区块：顶部 hairline 分隔线 + 大留白 —— */
.sec {
  border-top: var(--border-w) solid var(--c-border);
}

.sec-grid {
  display: grid;
  gap: var(--gap);
}

/* —— 区块头：eyebrow 小标 + 大而轻的标题 —— */
.sec-eyebrow {
  margin: 0;
  font-size: var(--fs-small);
  letter-spacing: 0.16em;
  color: var(--c-muted);
}

.sec-title {
  margin: 10px 0 0;
  font-family: var(--font-head);
  font-size: clamp(28px, 4vw, var(--fs-head));
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--c-text);
}

.sec-desc {
  max-width: 36ch;
  margin: 14px 0 0;
  color: var(--c-muted);
}

.sec-aside {
  margin-top: 18px;
}

.sec-body {
  min-width: 0;
}

/* —— 桌面端：定义式分栏（头 5 : 内容 7），头部吸附 —— */
@media (min-width: 900px) {
  .sec-grid {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: var(--space) clamp(32px, 6vw, 80px);
  }

  .sec-head {
    position: sticky;
    top: 88px;
    align-self: start;
  }
}
</style>
