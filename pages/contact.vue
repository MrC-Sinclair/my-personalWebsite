<!--
  联系页面 - 联系表单和社交链接

  内容区域：
  - 联系表单：姓名 + 邮箱 + 留言内容（提交到 Web3Forms）
  - 社交链接：GitHub / Twitter / LinkedIn / 微信（可展开二维码+复制微信号）

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

            <div v-else class="overflow-hidden rounded-xl shadow-sm">
              <button
                class="bg-surface-light dark:bg-surface-dark duration-normal flex w-full items-center gap-3 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                :aria-expanded="wechatExpanded"
                :aria-label="t('contact.wechatQrTip')"
                @click="wechatExpanded = !wechatExpanded"
              >
                <UIcon :name="link.icon" class="h-6 w-6" />
                <span class="flex-1">{{ link.name }}</span>
                <UIcon
                  :name="wechatExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                  class="text-text-secondary-light dark:text-text-secondary-dark duration-normal h-5 w-5 transition-transform"
                />
              </button>

              <div
                class="bg-surface-light dark:bg-surface-dark duration-normal grid overflow-hidden transition-all"
                :class="
                  wechatExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                "
              >
                <div class="overflow-hidden">
                  <div class="border-border-light dark:border-border-dark border-t px-4 pt-5 pb-4">
                    <div class="flex flex-col items-center gap-4">
                      <NuxtImg
                        :src="link.qrCode"
                        :alt="link.name"
                        width="200"
                        fit="contain"
                        class="rounded-lg"
                        loading="lazy"
                      />
                      <div
                        class="bg-surface-light-alt dark:bg-surface-dark-alt flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2"
                      >
                        <span
                          class="text-text-secondary-light dark:text-text-secondary-dark text-sm"
                        >
                          {{ t('contact.wechatId') }}:
                        </span>
                        <span
                          class="text-text-primary-light dark:text-text-primary-dark text-sm font-medium"
                        >
                          {{ link.value }}
                        </span>
                        <UTooltip :text="copyTooltip" :open="copyTooltipOpen">
                          <button
                            class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-600 dark:hover:text-primary-400 duration-fast ml-1 flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                            :aria-label="t('contact.copyWechatId')"
                            @click.stop="copyWechatId(link.value ?? '')"
                          >
                            <UIcon
                              :name="
                                copySuccess ? 'i-heroicons-check' : 'i-heroicons-clipboard-document'
                              "
                              class="h-4 w-4"
                            />
                          </button>
                        </UTooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

const wechatExpanded = ref(false)
const copySuccess = ref(false)
const copyTooltipOpen = ref(false)

const copyTooltip = computed(() =>
  copySuccess.value ? t('contact.copied') : t('contact.copyWechatId'),
)

async function copyWechatId(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    copySuccess.value = true
    copyTooltipOpen.value = true
    setTimeout(() => {
      copySuccess.value = false
      copyTooltipOpen.value = false
    }, 2000)
  } catch {
    copySuccess.value = false
  }
}

useHead({
  title: t('contact.title'),
  meta: [
    { name: 'description', content: t('contact.description') },
    { property: 'og:title', content: t('contact.title') },
    { property: 'og:description', content: t('contact.description') },
  ],
})
</script>
