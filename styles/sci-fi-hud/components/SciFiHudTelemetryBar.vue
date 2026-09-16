<!--
  SciFiHudTelemetryBar - sci-fi-hud 风格底部遥测状态条（页脚）
  ------------------------------------------------------------
  左侧：状态灯（装饰）+ 版权 + 作者；中部：装饰性遥测读数
  （纯装饰拉丁缩写，aria-hidden，不承载业务文案）；右侧：
  构建信息 + 风格画廊入口（localePath 包裹）。
  附 safe-bottom 适配刘海屏安全区域，上缘刻度尺装饰。
-->
<template>
  <footer class="telemetry safe-bottom">
    <!-- 上缘刻度尺（纯装饰） -->
    <div class="telemetry-ruler" aria-hidden="true"/>

    <div class="telemetry-body">
      <p class="item">
        <span class="status-dot" aria-hidden="true"/>
        {{ t('footer.copyright') }} © {{ t('footer.author') }}
      </p>

      <!-- 装饰性遥测读数（不承载业务文案） -->
      <p class="item deco-readout" aria-hidden="true">
        SYS NOMINAL<span class="sep">·</span>LINK STABLE<span class="sep">·</span>GRID 48
      </p>

      <div class="right">
        <p class="item muted">{{ t('footer.builtWith') }}</p>
        <NuxtLink class="gallery" :to="localePath('/styles')">
          {{ t('styles.gallery.title') }}<span class="gallery-glyph" aria-hidden="true">↗</span>
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
/* —— 状态条 —— */
.telemetry {
  border-top: var(--border-w) solid var(--c-border);
  background: color-mix(in srgb, var(--c-bg) 85%, var(--c-surface));
}

/* 上缘刻度尺（装饰） */
.telemetry-ruler {
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    color-mix(in srgb, var(--c-accent) 36%, transparent) 0 1px,
    transparent 1px 12px
  );
}

.telemetry-body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: var(--space) var(--gap);
}

.item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.04em;
  color: var(--c-text);
}

.item.muted {
  color: var(--c-muted);
}

/* 状态灯：呼吸（装饰，reduced-motion 停止） */
.status-dot {
  flex: none;
  width: 7px;
  height: 7px;
  background: var(--c-accent);
  border-radius: 50%;
  box-shadow: 0 0 6px rgb(74 240 198 / 0.9);
  animation: dot-pulse 2.2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.25;
  }
}

/* 装饰读数：暗化 + 分隔点 */
.deco-readout {
  color: color-mix(in srgb, var(--c-muted) 78%, transparent);
}

.sep {
  margin: 0 6px;
  color: color-mix(in srgb, var(--c-accent) 55%, transparent);
}

.right {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--gap);
}

/* 画廊入口：描边按钮，hover 信号色填充 */
.gallery {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 40px;
  padding: 8px 14px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  color: var(--c-accent);
  text-decoration: none;
  border: var(--border-w) solid color-mix(in srgb, var(--c-accent) 45%, transparent);
  transition:
    color var(--transition),
    background var(--transition),
    border-color var(--transition);
}

.gallery:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.gallery:active {
  transform: var(--press-transform);
}

.gallery-glyph {
  font-family: var(--font-mono);
}

@media (prefers-reduced-motion: reduce) {
  .status-dot {
    animation: none;
  }

  .gallery {
    transition: none;
  }

  .gallery:active {
    transform: none;
  }
}
</style>
