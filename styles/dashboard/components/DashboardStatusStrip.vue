<!--
  DashboardStatusStrip - dashboard 风格页脚状态条
  ------------------------------------------------------------
  监控台式的页脚：左侧版权 + 作者，右侧构建信息与风格画廊
  入口；最前的状态灯为呼吸动画装饰（reduced-motion 下关闭）。
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
      <NuxtLink class="strip-link" :to="localePath('/styles')">
        {{ t('styles.gallery.title') }}
      </NuxtLink>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
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

@media (prefers-reduced-motion: reduce) {
  .strip-dot {
    animation: none;
  }

  .strip-link {
    transition: none;
  }
}
</style>
