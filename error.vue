<!--
  全局错误页面 - 处理 404 / 500 等 HTTP 错误

  自包含原则（阶段 3 起）：过渡层删除后，本页不再引用 AppHeader /
  AppFooter / MobileNavBar / UButton —— 那些组件已随过渡层移除。
  配色与排版全部写在下方 scoped <style>，暗色走 prefers-color-scheme，
  不依赖任何运行时主题模块。

  Props：error: NuxtError（含 statusCode / statusMessage）
-->
<template>
  <div class="err">
    <main class="err__main">
      <p class="err__code">{{ error?.statusCode || 404 }}</p>
      <h1 class="err__msg">{{ error?.statusMessage || t('common.notFound') }}</h1>
      <NuxtLink class="err__home" :to="localePath('/')">{{ t('common.goHome') }}</NuxtLink>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()
const localePath = useLocalePath()

useHead({
  title: `${props.error?.statusCode || 404} - ${props.error?.statusMessage || ''}`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>

<style scoped>
.err {
  --bg: #ffffff;
  --text: #1e293b;
  --muted: #64748b;
  --accent: #4f46e5;

  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  color: var(--text);
  text-align: center;
  background: var(--bg);
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    'PingFang SC',
    'Microsoft YaHei',
    sans-serif;
}

@media (prefers-color-scheme: dark) {
  .err {
    --bg: #0b1120;
    --text: #f1f5f9;
    --muted: #94a3b8;
    --accent: #818cf8;
  }
}

.err__main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.err__code {
  font-size: clamp(72px, 16vw, 140px);
  font-weight: 800;
  line-height: 1;
  color: var(--accent);
}

.err__msg {
  max-width: 40ch;
  font-size: 1.15rem;
  font-weight: 500;
  color: var(--muted);
}

.err__home {
  min-height: 44px;
  padding: 12px 24px;
  margin-top: 8px;
  font-weight: 600;
  color: #ffffff;
  background: var(--accent);
  border-radius: 9999px;
  transition: opacity 150ms ease;
}

.err__home:hover {
  opacity: 0.88;
}
</style>
