<!--
  Y2KSectionHead - y2k 风格区块标题
  ------------------------------------------------------------
  「金属铭牌」式区块头：彩虹渐变徽章胶囊 + 铬金属渐变大标题
  （background-clip: text）+ 带中心星芒的渐变分隔线。
  支持外部传入 class（如 head--right）切换右对齐。
-->
<template>
  <div class="head">
    <p v-if="badge" class="head-badge">
      <span class="head-badge-star" aria-hidden="true">✦</span>
      {{ badge }}
    </p>
    <h2 :id="id" class="head-title">{{ title }}</h2>
    <span class="head-line" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
/**
 * @file Y2K 风格的区块标题组件
 * @description 彩虹徽章 + 铬字标题 + 星芒分隔线的区块头。
 */
withDefaults(
  defineProps<{
    /** h2 的 id（供区块 aria-labelledby 引用） */
    id?: string
    /** 徽章文案（i18n 文案） */
    badge?: string
    /** 标题文案（i18n 文案） */
    title: string
  }>(),
  {
    id: undefined,
    badge: undefined,
  },
)
</script>

<style scoped>
.head {
  display: grid;
  gap: 10px;
  justify-items: start;
  margin-bottom: calc(var(--space) * 1.25);
}

/* 右对齐变体（父级透传 class，制造左右交错的非对称版式） */
.head--right {
  justify-items: end;
  text-align: right;
}

/* —— 徽章：彩虹描边胶囊 —— */
.head-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 5px 14px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--c-muted);
  border: var(--border-w) solid transparent;
  border-radius: 999px;
  background:
    linear-gradient(var(--c-bg) 0%, var(--c-surface) 100%) padding-box,
    linear-gradient(90deg, #ff5ce1, #8b7bff, #45e3ff) border-box;
}

.head-badge-star {
  color: var(--c-accent-2);
}

/* —— 铬金属标题 —— */
.head-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(28px, 4.5vw, 46px);
  font-weight: 900;
  line-height: 1.12;
  overflow-wrap: break-word;
  background: linear-gradient(180deg, #ffffff 0%, #ccd6f6 38%, #6e7db1 56%, #aeb9e8 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  filter: drop-shadow(0 8px 16px rgb(4 0 38 / 0.6));
}

/* —— 分隔线：渐变细线 + 中心星芒 —— */
.head-line {
  position: relative;
  display: block;
  width: min(320px, 72%);
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgb(255 92 225 / 0.8), rgb(139 123 255 / 0.8), rgb(69 227 255 / 0.8), transparent);
}

.head--right .head-line {
  background: linear-gradient(270deg, rgb(255 92 225 / 0.8), rgb(139 123 255 / 0.8), rgb(69 227 255 / 0.8), transparent);
}

.head-line::after {
  content: '✦';
  position: absolute;
  top: 50%;
  left: 28px;
  font-size: 12px;
  line-height: 1;
  color: rgb(190 235 255 / 0.9);
  transform: translateY(-50%);
  text-shadow: 0 0 10px rgb(69 227 255 / 0.9);
}
</style>
