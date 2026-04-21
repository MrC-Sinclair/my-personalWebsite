<!--
  联系页面 - 联系表单和社交链接

  内容区域：
  - 联系表单：姓名 + 邮箱 + 留言内容（提交到 Formspree）
  - 社交链接：GitHub / Twitter / LinkedIn / 微信

  数据获取：
  - useAppInfo() 提供 siteConfig（社交链接）

  路由：/contact
-->
<template>
  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="scroll-reveal scroll-reveal-up mb-12 text-center">
      <h1
        class="text-text-primary-light dark:text-text-primary-dark mb-4 text-3xl font-bold sm:text-4xl"
      >
        {{ t('contact.title') }}
      </h1>
      <p class="text-text-secondary-light dark:text-text-secondary-dark text-lg">
        {{ t('contact.description') }}
      </p>
    </header>

    <div class="grid gap-12 md:grid-cols-2">
      <div class="scroll-reveal scroll-reveal-left">
        <ContactForm />
      </div>

      <div class="scroll-reveal scroll-reveal-right">
        <h2 class="text-text-primary-light dark:text-text-primary-dark mb-6 text-xl font-bold">
          {{ t('contact.socialLinks') }}
        </h2>
        <div class="space-y-4">
          <a
            :href="siteConfig.social.github"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-surface-light dark:bg-surface-dark flex items-center gap-3 rounded-xl p-4 shadow-sm transition-all duration-250 hover:-translate-y-0.5 hover:shadow-md"
          >
            <UIcon name="i-simple-icons-github" class="h-6 w-6" />
            <span>GitHub</span>
          </a>
          <a
            :href="siteConfig.social.twitter"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-surface-light dark:bg-surface-dark flex items-center gap-3 rounded-xl p-4 shadow-sm transition-all duration-250 hover:-translate-y-0.5 hover:shadow-md"
          >
            <UIcon name="i-simple-icons-x" class="h-6 w-6" />
            <span>Twitter / X</span>
          </a>
          <a
            :href="siteConfig.social.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-surface-light dark:bg-surface-dark flex items-center gap-3 rounded-xl p-4 shadow-sm transition-all duration-250 hover:-translate-y-0.5 hover:shadow-md"
          >
            <UIcon name="i-simple-icons-linkedin" class="h-6 w-6" />
            <span>LinkedIn</span>
          </a>
          <div
            class="bg-surface-light dark:bg-surface-dark flex items-center gap-3 rounded-xl p-4 shadow-sm"
          >
            <UIcon name="i-simple-icons-wechat" class="h-6 w-6" />
            <span>{{ siteConfig.social.wechat }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { siteConfig } = useAppInfo()
useScrollReveal()

useHead({
  title: t('contact.title'),
})
</script>
