<!--
  HeroSection - 首页英雄区/首屏组件

  展示个人简介、欢迎语和主要行动按钮（CTA），
  包含渐变背景装饰效果，是用户进入网站的第一视觉焦点。

  内容：
  - 欢迎语（home.greeting）
  - 姓名/昵称（home.name）
  - 个人标签（home.tagline）
  - 简介描述（home.description）
  - CTA 按钮：查看博客 / 查看项目

  依赖：
  - useI18n() 提供国际化文案
  - useLocalePath() 处理国际化路由
  - useScrollReveal() 滚动进入动画

  使用场景：pages/index.vue 首屏区域
-->
<template>
  <section class="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
    <div
      class="from-primary-500/10 to-primary-600/5 absolute inset-0 bg-gradient-to-br via-transparent"
    />

    <div class="relative mx-auto max-w-4xl text-center">
      <p
        class="text-primary-500 scroll-reveal scroll-reveal-up scroll-reveal-delay-1 mb-4 text-lg font-medium"
      >
        {{ t('home.greeting') }}
      </p>
      <h1
        class="text-text-primary-light dark:text-text-primary-dark scroll-reveal scroll-reveal-up scroll-reveal-delay-2 mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl"
      >
        {{ t('home.name') }}
      </h1>
      <p
        class="text-primary-400 scroll-reveal scroll-reveal-up scroll-reveal-delay-3 mb-4 text-xl font-semibold sm:text-2xl"
      >
        {{ t('home.tagline') }}
      </p>
      <p
        class="text-text-secondary-light dark:text-text-secondary-dark scroll-reveal scroll-reveal-up scroll-reveal-delay-4 mx-auto mb-10 max-w-2xl text-lg"
      >
        {{ t('home.description') }}
      </p>

      <div
        class="scroll-reveal scroll-reveal-up scroll-reveal-delay-5 flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        <UButton :to="localePath('/blog')" variant="solid" size="xl">
          {{ t('home.viewBlog') }}
        </UButton>
        <UButton :to="localePath('/projects')" variant="outline" size="xl">
          {{ t('home.viewProjects') }}
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
useScrollReveal()
</script>
