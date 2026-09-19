<!--
  SwissSectionHead - swiss 风格区块标题
  ------------------------------------------------------------
  每个内容区块的开头：一条加粗的黑色规则线 + 红色编号 +
  超大左对齐标题 + 右对齐的补充信息（小号宽字距）。
  编号 / 标题 / 信息三者构成非对称的三栏，是全页统一的
  「区块坐标系」。标题带 id，供外层 section 的 aria-labelledby 引用。

  标题层级由 level 决定：首页四个区块是同一页下的并列章节，用 h2；
  子页只有一个区块，用 h1（否则整页没有一级标题）。
-->
<template>
  <header class="sec-head">
    <span class="sec-no" aria-hidden="true">{{ pad(no) }}</span>
    <component :is="headingTag" :id="headId" class="sec-title">{{ title }}</component>
    <span v-if="meta" class="sec-meta">{{ meta }}</span>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** 区块序号（从 1 开始，展示时补零） */
  no: number
  /** 区块标题（i18n 文案，由调用方传入） */
  title: string
  /** 标题元素的 id（供 aria-labelledby 引用） */
  headId: string
  /** 右对齐补充信息（计数 / 说明，i18n 文案，可省略） */
  meta?: string
  /** 标题层级：首页并列区块用 2，子页唯一区块用 1（默认 2） */
  level?: 1 | 2
}>()

const headingTag = computed(() => (props.level === 1 ? 'h1' : 'h2'))

/** 编号格式化：补零到两位 */
function pad(n: number): string {
  return String(n).padStart(2, '0')
}
</script>

<style scoped>
.sec-head {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: end;
  gap: 12px var(--gap);
  padding-top: 14px;
  /* 区块以加粗规则线开场：线的粗细本身构成层级 */
  border-top: calc(var(--border-w) * 3) solid var(--c-border);
}

/* 编号：红色小号宽字距 */
.sec-no {
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-accent);
  letter-spacing: 0.14em;
  font-variant-numeric: tabular-nums;
}

/* 标题：超大、左对齐、紧凑字距、大写（中文不受影响） */
.sec-title {
  margin: 0;
  grid-column: 2;
  font-family: var(--font-head);
  font-size: clamp(30px, 4.5vw, 52px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--c-text);
  overflow-wrap: break-word;
}

/* 补充信息：独占下一行（移动端），右对齐 */
.sec-meta {
  grid-column: 1 / -1;
  justify-self: end;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

/* —— 桌面端：编号 | 标题 | 信息 同一行的非对称三栏 —— */
@media (min-width: 768px) {
  .sec-head {
    grid-template-columns: auto 1fr auto;
  }

  .sec-title {
    grid-column: 2;
  }

  .sec-meta {
    grid-column: 3;
    justify-self: end;
    align-self: end;
  }
}
</style>
