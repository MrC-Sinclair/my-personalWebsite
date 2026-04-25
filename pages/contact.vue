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
          <template v-for="link in socialLinks" :key="link.name">
            <a
              v-if="link.url"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="bg-surface-light dark:bg-surface-dark duration-normal flex items-center gap-3 rounded-xl p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <UIcon :name="link.icon" class="h-6 w-6" />
              <span>{{ link.name }}</span>
            </a>
            <div
              v-else
              class="bg-surface-light dark:bg-surface-dark duration-normal flex items-center gap-3 rounded-xl p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <UIcon :name="link.icon" class="h-6 w-6" />
              <span>{{ link.value || link.name }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { socialLinks } = useAppInfo()
useScrollReveal()

useHead({
  title: t('contact.title'),
  meta: [
    { name: 'description', content: t('contact.description') },
    { property: 'og:title', content: t('contact.title') },
    { property: 'og:description', content: t('contact.description') },
  ],
})
</script>
