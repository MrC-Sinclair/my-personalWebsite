<!--
  DashboardStatusStrip - dashboard 风格页脚状态条
  ------------------------------------------------------------
  监控台式的页脚：左侧版权 + 作者，右侧构建信息、语言切换与风格画廊
  入口（语言切换的行为来自共享层 useLocaleSwitch）；最前的状态灯为
  呼吸动画装饰（reduced-motion 下关闭）。
  附 safe-bottom 适配刘海屏安全区域。
-->
<template>
  <footer class="strip safe-bottom">
    <p class="strip-item">
      <span class="strip-dot" aria-hidden="true"/>
      {{ t('footer.copyright') }} © {{ t('footer.author') }}
    </p>
    <div class="strip-right">
      <p class="strip-item strip-muted">{{ t('footer.builtWith') }}</p>

      <!-- 语言切换：比画廊入口安静一档的紧凑控件（行为走共享层 useLocaleSwitch） -->
      <NuxtLink class="strip-lang" :to="targetPath" :aria-label="t('common.language')">
        {{ targetLabel }}
      </NuxtLink>

      <NuxtLink class="strip-link" :to="localePath('/styles')">
        {{ t('styles.gallery.title') }}
      </NuxtLink>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
// 语言切换行为走共享层，外观由本风格决定
const { targetPath, targetLabel } = useLocaleSwitch()
</script>

<style scoped>
.strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap);
  margin-top: var(--space);
  padding: var(--space);
  border-top: var(--border-w) solid var(--c-border);
}

.strip-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.strip-muted {
  font-family: var(--font-body);
}

/* 呼吸状态灯（装饰） */
.strip-dot {
  flex: none;
  width: 8px;
  height: 8px;
  background: var(--c-accent-2);
  border-radius: 50%;
  animation: strip-pulse 2.4s ease-in-out infinite;
}

@keyframes strip-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

.strip-right {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--gap);
}

/* 风格画廊入口：≥40px 触控目标 + hover 点亮 */
.strip-link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 12px;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-decoration: none;
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  transition:
    color var(--transition),
    border-color var(--transition),
    background var(--transition);
}

.strip-link:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

/* 语言切换：与画廊入口同族的紧凑控件，但只描边不填底（次级动作） */
.strip-lang {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  min-width: 40px;
  padding: 8px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  border: var(--border-w) dashed var(--c-border);
  border-radius: var(--radius-sm);
  transition:
    color var(--transition),
    border-color var(--transition),
    background var(--transition),
    transform var(--transition);
}

.strip-lang:hover {
  color: var(--c-accent);
  border-color: var(--c-accent);
  background: color-mix(in srgb, var(--c-accent) 10%, transparent);
}

.strip-lang:active {
  transform: var(--press-transform);
}

.strip-lang:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .strip-dot {
    animation: none;
  }

  .strip-link,
  .strip-lang {
    transition: none;
  }

  .strip-lang:active {
    transform: none;
  }
}
</style>
