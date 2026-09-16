<!--
  CyberpunkFooter - cyberpunk 风格页脚「离线状态条」
  ------------------------------------------------------------
  页脚：顶部青→粉霓虹渐变分隔线（发光），下方左侧版权 +
  作者（等宽小字 + 闪烁状态灯装饰），右侧构建信息与风格
  画廊入口（切角按钮，localePath 跳转）。附 safe-bottom
  适配刘海屏安全区域。
-->
<template>
  <footer class="foot safe-bottom">
    <div class="foot-line" aria-hidden="true"/>

    <div class="foot-body">
      <p class="foot-item">
        <span class="status-dot" aria-hidden="true"/>
        {{ t('footer.copyright') }} © {{ t('footer.author') }}
      </p>

      <div class="foot-right">
        <p class="foot-item foot-muted">{{ t('footer.builtWith') }}</p>
        <NuxtLink class="foot-link" :to="localePath('/styles')">
          {{ t('styles.gallery.title') }}
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* 顶部霓虹分隔线 */
.foot-line {
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--c-accent-2),
    color-mix(in srgb, var(--c-accent) 40%, var(--c-accent-2)) 45%,
    var(--c-accent)
  );
  box-shadow: 0 0 12px rgb(255 45 149 / 0.45);
}

.foot-body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: var(--space) var(--gap);
}

.foot-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.foot-muted {
  font-family: var(--font-body);
}

/* 状态灯：粉色呼吸（装饰） */
.status-dot {
  flex: none;
  width: 8px;
  height: 8px;
  background: var(--c-accent-2);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  box-shadow: 0 0 8px rgb(255 45 149 / 0.8);
  animation: dot-pulse 2.4s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

.foot-right {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--gap);
}

/* 画廊入口：切角描边按钮（hover 青色填充 + 辉光） */
.foot-link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 16px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  color: var(--c-accent);
  text-decoration: none;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  box-shadow: inset 0 0 0 var(--border-w) rgb(34 211 238 / 0.5);
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.foot-link:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
  box-shadow:
    inset 0 0 0 var(--border-w) var(--c-accent),
    0 0 16px rgb(34 211 238 / 0.5);
}

.foot-link:active {
  transform: var(--press-transform);
}

@media (prefers-reduced-motion: reduce) {
  .status-dot {
    animation: none;
  }

  .foot-link {
    transition: none;
  }

  .foot-link:active {
    transform: none;
  }
}
</style>
