<!--
  Web2GlossySectionHead - Web 2.0 光泽风格的区块标题
  ------------------------------------------------------------
  结构：凝胶徽章胶囊 + 渐变光泽大标题 + 高光胶囊下划线条。
  支持 default（浅色区块用：蓝色渐变标题）与 light（深蓝大色块
  区块用：白色光泽标题）两种主题。
-->
<template>
  <div class="sect-head" :class="[`sect-head--${theme}`, { 'sect-head--center': align === 'center' }]">
    <span v-if="badge" class="sect-head__badge">{{ badge }}</span>
    <h2 :id="headId" class="sect-head__title">{{ title }}</h2>
    <span class="sect-head__shine" aria-hidden="true"/>
  </div>
</template>

<script setup lang="ts">
/**
 * @file Web 2.0 光泽风格的区块标题组件
 * @description 暴露 id 供区块 aria-labelledby 引用；theme=light 用于深蓝色带区块。
 */
const props = withDefaults(
  defineProps<{
    /** 徽章文案（胶囊胶囊上的小字） */
    badge?: string
    /** 标题文案 */
    title: string
    /** 标题 id（供区块 aria-labelledby 使用） */
    id?: string
    /** 排列方向 */
    align?: 'left' | 'center'
    /** 主题：default 浅色区块 / light 深蓝色带 */
    theme?: 'default' | 'light'
  }>(),
  {
    badge: undefined,
    id: undefined,
    align: 'left',
    theme: 'default',
  },
)

const headId = computed(() => props.id)
</script>

<style scoped>
.sect-head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: var(--space);
}

.sect-head--center {
  align-items: center;
  text-align: center;
}

/* —— 徽章胶囊 —— */
.sect-head__badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 4px 16px;
  overflow: hidden;
  border: 1px solid #14417e;
  border-radius: var(--radius-sm);
  color: var(--c-on-accent);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.1em;
  background: linear-gradient(180deg, #2b72c6 0%, #1d5fae 55%, #174a8f 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.5),
    0 2px 6px rgb(23 74 128 / 0.3);
}

/* 徽章顶部高光 */
.sect-head__badge::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.4) 0%, rgb(255 255 255 / 0) 60%);
  pointer-events: none;
}

/* —— 渐变光泽标题 ——
   渐变起端原为 #2b82e9，在浅色区块上明度偏高，导致大标题看起来
   比正文还淡、层级倒置；整体加深一档（起端对白底约 5:1），
   既恢复层级又保留 Web 2.0 的蓝色渐变质感 */
.sect-head__title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(1.75rem, 3.8vw, 2.75rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0.01em;
  background: linear-gradient(180deg, #1c6cc8 0%, #175ca8 55%, #0f3560 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

/* —— 高光胶囊下划线条 —— */
.sect-head__shine {
  position: relative;
  width: 96px;
  height: 10px;
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, #58a6f5 0%, #1d5fae 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.6),
    0 3px 6px rgb(23 74 128 / 0.35);
}

/* 下划线条上的白色高光线 */
.sect-head__shine::before {
  content: '';
  position: absolute;
  inset: 1px 8px auto 8px;
  height: 3px;
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 0.8);
}

/* —— light 主题：用于深蓝色带区块 —— */
.sect-head--light .sect-head__badge {
  border-color: #8a3c08;
  background: linear-gradient(180deg, #d97a1c 0%, #bf5a10 55%, #a84a0c 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.45),
    0 2px 6px rgb(9 34 64 / 0.4);
}

.sect-head--light .sect-head__title {
  background: linear-gradient(180deg, #ffffff 0%, #e8f2fd 55%, #cfe3f8 100%);
  background-clip: text;
  -webkit-background-clip: text;
}

.sect-head--light .sect-head__shine {
  background: linear-gradient(180deg, #ffffff 0%, #b8d6f4 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.8),
    0 3px 8px rgb(9 34 64 / 0.45);
}
</style>
