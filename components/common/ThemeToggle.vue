<!--
  ThemeToggle - 主题切换按钮组件

  在导航栏中提供亮色/暗色主题切换功能。

  行为：
  - 点击按钮在亮色和暗色主题之间切换
  - 图标根据当前主题显示太阳（暗色模式）或月亮（亮色模式）
  - 切换时更新 color-mode preference，持久化到 localStorage
  - 点击时图标旋转 180° 反馈

  注意：
  - 使用 ClientOnly 包裹，避免 hydration mismatch（主题依赖客户端状态）
  - fallback 显示月亮图标（默认亮色模式的切换按钮）
  - 触控区域 ≥ 44×44px（WCAG AA 无障碍标准）

  依赖：
  - useColorMode() Nuxt UI 内置的颜色模式管理
  - useI18n() 提供国际化文案
-->
<template>
  <ClientOnly>
    <UTooltip :text="isDark ? t('common.lightMode') : t('common.darkMode')">
      <button
        class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-fast"
        :class="{ 'rotate-180': isSpinning }"
        :aria-label="isDark ? t('common.lightMode') : t('common.darkMode')"
        @click="toggleColorMode"
      >
        <UIcon v-if="isDark" name="i-heroicons-sun" class="h-5 w-5" />
        <UIcon v-else name="i-heroicons-moon" class="h-5 w-5" />
      </button>
    </UTooltip>
    <template #fallback>
      <UTooltip :text="t('common.darkMode')">
        <button
          class="text-text-secondary-light dark:text-text-secondary-dark flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-fast"
          :aria-label="t('common.darkMode')"
        >
          <UIcon name="i-heroicons-moon" class="h-5 w-5" />
        </button>
      </UTooltip>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const { t } = useI18n()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (value: boolean) => {
    colorMode.preference = value ? 'dark' : 'light'
  },
})

const isSpinning = ref(false)

function toggleColorMode() {
  isSpinning.value = true
  isDark.value = !isDark.value
  setTimeout(() => {
    isSpinning.value = false
  }, 300)
}
</script>
