<!--
  Soft3DSectionHead - soft-3d 风格区块标题
  ------------------------------------------------------------
  「漂浮的导览牌」：一颗悬浮小球 + 眉题胶囊 + 大标题 +
  可选描述。小球默认漂浮并可与区块配色联动（variant）。
-->
<template>
  <div class="section-head">
    <div class="section-head-orb">
      <Soft3DOrb :size="52" :variant="variant" float :duration="6.5" />
    </div>
    <div class="section-head-text">
      <p v-if="eyebrow" class="section-head-eyebrow">{{ eyebrow }}</p>
      <component :is="headingTag" class="section-head-title">{{ title }}</component>
      <p v-if="description" class="section-head-desc">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Soft3DOrb from './Soft3DOrb.vue'

const props = withDefaults(
  defineProps<{
    /** 眉题（可选，i18n 文案） */
    eyebrow?: string
    /** 区块标题（i18n 文案） */
    title: string
    /** 区块描述（可选，i18n 文案） */
    description?: string
    /** 标题小球配色 */
    variant?: 'violet' | 'cyan' | 'pink' | 'mint' | 'sun'
    /** 标题层级：子页把它当页头时用 1（否则整页没有一级标题），首页区块用 2 */
    level?: 1 | 2
  }>(),
  {
    eyebrow: '',
    description: '',
    variant: 'violet',
    level: 2,
  },
)

/** 子页整页只有一个主题标题，必须升为 h1；首页 hero 已有 h1，区块维持 h2 */
const headingTag = computed(() => (props.level === 1 ? 'h1' : 'h2'))
</script>

<style scoped>
.section-head {
  display: flex;
  align-items: flex-start;
  gap: var(--gap);
}

/* 小球略上浮，制造「悬停在标题上方」的空间感 */
.section-head-orb {
  margin-top: -10px;
}

.section-head-text {
  min-width: 0;
}

/* —— 眉题：小胶囊 —— */
.section-head-eyebrow {
  display: inline-block;
  margin: 0 0 10px;
  padding: 4px 14px;
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
  color: var(--c-accent);
  background: color-mix(in srgb, var(--c-accent) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-accent) 36%, transparent);
  border-radius: 999px;
  box-shadow: inset 0 1px 2px rgb(255 255 255 / 0.18);
}

.section-head-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(28px, 4.2vw, 42px);
  font-weight: 800;
  line-height: 1.18;
  color: var(--c-text);
  overflow-wrap: break-word;
}

.section-head-desc {
  max-width: 62ch;
  margin: 8px 0 0;
  font-size: var(--fs-base);
  color: var(--c-muted);
}

/* 窄屏小球缩小并回位，保证标题排版空间 */
@media (max-width: 640px) {
  .section-head-orb {
    margin-top: 2px;
  }
}
</style>
