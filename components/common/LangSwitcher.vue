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
