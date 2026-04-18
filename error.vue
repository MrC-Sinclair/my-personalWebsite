<!--
  全局错误页面 - 处理 404/500 等 HTTP 错误

  展示错误状态码和错误信息，提供返回首页按钮。

  Props：
  - error: NuxtError - Nuxt 错误对象，包含 statusCode 和 statusMessage

  使用场景：Nuxt 自动捕获路由错误和运行时错误时渲染
-->
<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
    <h1 class="text-primary-500 mb-4 text-8xl font-bold">
      {{ error?.statusCode || 404 }}
    </h1>
    <p class="text-text-secondary-light dark:text-text-secondary-dark mb-8 text-xl">
      {{ error?.statusMessage || t('common.notFound') }}
    </p>
    <UButton :to="localePath('/')" variant="solid" size="lg">
      {{ t('common.goHome') }}
    </UButton>
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
})
</script>
