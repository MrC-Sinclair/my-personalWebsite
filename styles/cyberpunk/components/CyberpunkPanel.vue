<!--
  CyberpunkPanel - cyberpunk 风格通用切角面板
  ------------------------------------------------------------
  所有内容区块的承载容器：「双层切角」面板——外层 clip-path
  + 霓虹渐变充当发光描边，内层内缩 1px 形成边线，叠加 CRT
  扫描线纹理（--deco）。标题条悬挂在面板顶部（左端斜切色块
  + 等宽眉标 + 大标题 + 右侧等宽 meta 注记）。
  tone 属性切换面板强调色：cyan（青）/ magenta（粉）/
  violet（青粉混合紫）；flip 属性镜像切角方向（右上/左下
  ↔ 左上/右下），供页面拼出错落的霓虹招牌轮廓。
  id 与 data-section 等属性透传到根元素，供页内锚点与共享
  层滚动定位使用。
-->
<template>
  <section class="panel" :class="[`tone-${tone}`, { flip }]">
    <div class="panel-in">
      <header class="panel-head">
        <span class="head-notch" aria-hidden="true"/>
        <div class="head-text">
          <p v-if="eyebrow" class="head-eyebrow">{{ eyebrow }}</p>
          <h2 class="head-title">{{ title }}</h2>
        </div>
        <span v-if="meta" class="head-meta">{{ meta }}</span>
      </header>

      <div class="panel-body">
        <slot/>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 面板主标题（i18n 文案） */
    title: string
    /** 面板眉标（小字前缀，可选） */
    eyebrow?: string
    /** 右上角等宽注记（如数量），可选 */
    meta?: string
    /** 强调色档位：cyan 青 / magenta 粉 / violet 紫 */
    tone?: 'cyan' | 'magenta' | 'violet'
    /** 镜像切角方向（默认右上 + 左下切角） */
    flip?: boolean
  }>(),
  {
    eyebrow: '',
    meta: '',
    tone: 'cyan',
    flip: false,
  },
)
</script>

<style scoped>
/* —— 外层：切角轮廓 + 霓虹渐变充当描边 —— */
.panel {
  --panel-tone: var(--c-accent);
  position: relative;
  padding: 1px;
  background: linear-gradient(
    120deg,
    var(--panel-tone),
    transparent 32%,
    transparent 68%,
    color-mix(in srgb, var(--panel-tone) 55%, var(--c-accent-2))
  );
  clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));
}

/* 镜像切角：左上 + 右下 */
.panel.flip {
  clip-path: polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px);
}

.tone-magenta {
  --panel-tone: var(--c-accent-2);
}

.tone-violet {
  --panel-tone: color-mix(in srgb, var(--c-accent) 48%, var(--c-accent-2));
}

/* —— 内层：内缩 1px 形成边线 + 深色面板底 + 扫描线 —— */
.panel-in {
  position: relative;
  overflow: hidden;
  padding: 0 var(--space) var(--space);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--panel-tone) 7%, transparent), transparent 42%),
    var(--c-surface);
  clip-path: polygon(0 0, calc(100% - 23px) 0, 100% 23px, 100% 100%, 23px 100%, 0 calc(100% - 23px));
}

.flip .panel-in {
  clip-path: polygon(23px 0, 100% 0, 100% calc(100% - 23px), calc(100% - 23px) 100%, 0 100%, 0 23px);
}

/* CRT 扫描线覆盖（--deco 契约变量） */
.panel-in::after {
  position: absolute;
  inset: 0;
  content: '';
  pointer-events: none;
  background: var(--deco);
}

/* —— 悬挂标题条：负外边距凸出面板顶部 —— */
.panel-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 calc(-1 * var(--space)) var(--space);
  padding: 12px var(--space);
  border-bottom: var(--border-w) solid color-mix(in srgb, var(--panel-tone) 40%, var(--c-border));
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--panel-tone) 16%, transparent),
    transparent 72%
  );
}

/* 标题条左端斜切色块（HUD 指示器） */
.head-notch {
  flex: none;
  width: 14px;
  height: 14px;
  background: var(--panel-tone);
  clip-path: polygon(0 0, 100% 0, 100% 60%, 60% 100%, 0 100%);
  box-shadow: 0 0 10px var(--panel-tone);
}

.head-text {
  flex: 1 1 auto;
  min-width: 0;
}

.head-eyebrow {
  margin: 0 0 2px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.24em;
  color: var(--c-accent-2);
}

.head-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--c-text);
  text-shadow: 0 0 12px color-mix(in srgb, var(--panel-tone) 60%, transparent);
  overflow-wrap: break-word;
}

.head-meta {
  flex: none;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--panel-tone);
}
</style>
