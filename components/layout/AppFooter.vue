<!--
  AppFooter - 全局页脚组件

  显示版权信息、社交媒体图标链接和技术栈说明。
  适配刘海屏设备的安全区域。
  微信图标点击弹出二维码 Popover。

  内容：
  - 版权信息（动态年份 + 作者名）
  - 社交媒体图标链接（GitHub / Twitter / LinkedIn）带 Tooltip 提示
  - 微信图标带 Popover（二维码 + 微信号 + 复制按钮）
  - "Built with Nuxt" 技术栈说明

  依赖：
  - useAppInfo() 提供 siteConfig（作者名、社交链接）
  - useI18n() 提供国际化文案

  使用场景：layouts/default.vue 全局布局
-->
<template>
  <footer
    class="bg-surface-light-alt dark:bg-surface-dark-alt safe-bottom border-border-light dark:border-border-dark border-t"
  >
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div class="text-text-secondary-light dark:text-text-secondary-dark text-sm">
          &copy; {{ currentYear }} {{ siteConfig.author }}. {{ t('footer.copyright') }}
        </div>

        <div class="flex items-center gap-2">
          <template v-for="link in socialLinks" :key="link.name">
            <UTooltip v-if="link.url" :text="link.name">
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 duration-fast flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:scale-110"
                :aria-label="link.name"
              >
                <UIcon :name="link.icon" class="h-5 w-5" />
              </a>
            </UTooltip>

            <UPopover v-else :ui="{ width: 'w-auto' }">
              <button
                class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 duration-fast flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:scale-110"
                :aria-label="t('contact.wechatQrTip')"
              >
                <UIcon :name="link.icon" class="h-5 w-5" />
              </button>

              <template #content>
                <div
                  class="border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark w-56 rounded-xl border p-4 shadow-lg"
                >
                  <div class="flex flex-col items-center gap-3">
                    <NuxtImg
                      v-if="link.qrCode"
                      :src="link.qrCode"
                      :alt="link.name"
                      width="176"
                      fit="contain"
                      class="rounded-lg"
                      loading="lazy"
                    />
                    <div
                      class="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-light-alt dark:bg-surface-dark-alt px-3 py-1.5"
                    >
                      <span
                        class="text-text-secondary-light dark:text-text-secondary-dark text-xs"
                      >
                        {{ t('contact.wechatId') }}:
                      </span>
                      <span
                        class="text-text-primary-light dark:text-text-primary-dark text-xs font-medium"
                      >
                        {{ link.value }}
                      </span>
                      <UTooltip :text="copyTooltip" :open="copyTooltipOpen">
                        <button
                          class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-600 dark:hover:text-primary-400 duration-fast ml-0.5 flex h-6 w-6 items-center justify-center rounded transition-colors"
                          :aria-label="t('contact.copyWechatId')"
                          @click.stop="copyWechatId(link.value ?? '')"
                        >
                          <UIcon
                            :name="copySuccess ? 'i-heroicons-check' : 'i-heroicons-clipboard-document'"
                            class="h-3.5 w-3.5"
                          />
                        </button>
                      </UTooltip>
                    </div>
                  </div>
                </div>
              </template>
            </UPopover>
          </template>
        </div>

        <div class="text-text-secondary-light dark:text-text-secondary-dark text-sm">
          {{ t('footer.builtWith') }}
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { siteConfig, socialLinks } = useAppInfo()
const { t } = useI18n()

const currentYear = new Date().getFullYear()
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
</script>
