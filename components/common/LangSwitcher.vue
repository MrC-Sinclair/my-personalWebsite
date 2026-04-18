<!--
  LangSwitcher - 语言切换按钮组件

  在导航栏中提供中英文切换功能，点击循环切换可用语言。

  行为：
  - 点击按钮切换到下一个可用语言（如 中文 → English → 中文）
  - 自动跳转到对应语言版本的页面路径

  注意：
  - 使用 ClientOnly 包裹，避免 hydration mismatch
  - 依赖 @nuxtjs/i18n 的 useI18n 和 useSwitchLocalePath

  依赖：
  - useI18n() 提供当前语言和可用语言列表
  - useSwitchLocalePath() 生成切换语言后的路径
-->
<template>
  <ClientOnly>
    <button
      class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 transition-colors duration-150"
      :aria-label="t('common.language')"
      @click="toggleLocale"
    >
      <UIcon name="i-heroicons-language" class="h-5 w-5" />
    </button>
  </ClientOnly>
</template>

<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const { t } = useI18n()

const localeItems = computed(() =>
  (locales.value as Array<{ code: string; name: string }>).map((loc) => ({
    code: loc.code,
    name: loc.name,
  })),
)

function toggleLocale() {
  const currentIndex = localeItems.value.findIndex((item) => item.code === locale.value)
  const nextIndex = (currentIndex + 1) % localeItems.value.length
  const nextLocale = localeItems.value[nextIndex].code
  navigateTo(switchLocalePath(nextLocale))
}
</script>
