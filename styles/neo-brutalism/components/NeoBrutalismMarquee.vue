<!--
  NeoBrutalismMarquee - neo-brutalism 风格滚动横幅（跑马灯胶带）
  ------------------------------------------------------------
  黑底横幅微微歪斜地贴在首屏与正文之间，等宽字标语横向无限
  滚动，星星分隔符用海报黄点亮。纯装饰元素（aria-hidden），
  动画为纯 CSS，prefers-reduced-motion 下静止。
  内容 = t('home.tagline') 重复三遍 × 两组（无缝循环）。
-->
<template>
  <div class="marquee" aria-hidden="true">
    <div class="tape">
      <span v-for="n in 2" :key="n" class="tape-chunk">
        <span v-for="m in 3" :key="m" class="tape-item">
          {{ t('home.tagline') }}<span class="star">★</span>
        </span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.marquee {
  overflow: hidden;
  background: var(--c-text);
  border: var(--border-w) solid var(--c-border);
  box-shadow: var(--shadow);
  /* 歪斜张贴的胶带感（装饰） */
  transform: rotate(-1deg);
}

.tape {
  display: flex;
  width: max-content;
  animation: nb-marquee 28s linear infinite;
}

.tape-chunk {
  display: flex;
  flex: none;
}

.tape-item {
  padding: 10px 0;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--c-bg);
  white-space: nowrap;
}

.star {
  padding: 0 20px;
  color: var(--c-accent);
}

@keyframes nb-marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tape {
    animation: none;
  }
}
</style>
