<!--
  ClaymorphismSectionHead - claymorphism 风格区块标题
  ------------------------------------------------------------
  圆滚滚的区块头：眉题做成小颗黏土胶囊（色随 tone 轮换），
  主标题厚重大字，右侧可挂一颗圆形黏土计数徽章（真实统计）。

  标题层级由 level 决定：首页五个区块是同一页下的并列章节，用 h2；
  子页只有一个区块，用 h1（否则整页没有一级标题）。
-->
<template>
  <div class="head">
    <p class="eyebrow" :class="`tone-${tone}`">{{ eyebrow }}</p>
    <div class="row">
      <component :is="headingTag" class="title">{{ title }}</component>
      <span v-if="count !== undefined" class="count">{{ count }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** 眉题（小黏土胶囊文案） */
    eyebrow: string
    /** 主标题 */
    title: string
    /** 圆形计数徽章数值（可选，真实统计） */
    count?: number
    /** 眉题胶囊色相：粉 / 薄荷 / 奶油 / 丁香 / 天蓝 */
    tone?: 'pink' | 'mint' | 'butter' | 'lilac' | 'blue'
    /** 标题层级：首页并列区块用 2，子页唯一区块用 1（默认 2） */
    level?: 1 | 2
  }>(),
  {
    count: undefined,
    tone: 'lilac',
    level: 2,
  },
)

const headingTag = computed(() => (props.level === 1 ? 'h1' : 'h2'))
</script>

<style scoped>
.head {
  margin-bottom: var(--space);
}

/* 眉题：小黏土胶囊，色相随 tone 轮换（Pastel 大色块对撞） */
.eyebrow {
  display: inline-block;
  margin: 0 0 12px;
  padding: 5px 16px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--tone-text);
  background: var(--tone-bg);
  border-radius: 999px;
  box-shadow:
    0 5px 9px var(--tone-shadow),
    inset 0 3px 5px rgb(255 255 255 / 0.55),
    inset 0 -3px 5px var(--tone-inset);
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}

.title {
  margin: 0;
  font-size: clamp(26px, 4.4vw, 40px);
  font-weight: 800;
  line-height: 1.2;
  color: var(--c-text);
}

/* 计数徽章：圆滚滚的黏土小球，数字居中 */
.count {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0 10px;
  font-size: var(--fs-base);
  font-weight: 800;
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-radius: 999px;
  box-shadow:
    0 6px 10px rgb(125 63 201 / 0.35),
    inset 0 4px 7px rgb(255 255 255 / 0.4),
    inset 0 -4px 6px rgb(90 40 150 / 0.25);
}

/* —— Pastel 色相（风格签名装饰色，仅承担眉题胶囊，不承担正文） —— */
.tone-pink {
  --tone-bg: #ffd7e8;
  --tone-text: #8c2f60;
  --tone-shadow: rgb(215 100 150 / 0.3);
  --tone-inset: rgb(215 100 150 / 0.22);
}

.tone-mint {
  --tone-bg: #c9f2dd;
  --tone-text: #1d6a45;
  --tone-shadow: rgb(90 175 135 / 0.3);
  --tone-inset: rgb(70 145 105 / 0.22);
}

.tone-butter {
  --tone-bg: #fff1c2;
  --tone-text: #7a5410;
  --tone-shadow: rgb(215 170 70 / 0.3);
  --tone-inset: rgb(190 140 40 / 0.22);
}

.tone-lilac {
  --tone-bg: #e2d4ff;
  --tone-text: #5b2fa8;
  --tone-shadow: rgb(140 100 200 / 0.3);
  --tone-inset: rgb(120 80 185 / 0.22);
}

.tone-blue {
  --tone-bg: #d4e6ff;
  --tone-text: #1d4e8c;
  --tone-shadow: rgb(80 130 200 / 0.3);
  --tone-inset: rgb(60 105 175 / 0.22);
}
</style>
