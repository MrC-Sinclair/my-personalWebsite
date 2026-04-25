<!--
  AppFooter - 全局页脚组件

  显示版权信息、社交媒体图标链接和技术栈说明。
  适配刘海屏设备的安全区域。

  内容：
  - 版权信息（动态年份 + 作者名）
  - 社交媒体图标链接（GitHub / Twitter / LinkedIn）带 Tooltip 提示
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
            <UTooltip v-else :text="link.value || link.name">
              <span
                class="text-text-secondary-light dark:text-text-secondary-dark duration-fast hover:text-primary-500 flex h-10 w-10 cursor-default items-center justify-center rounded-lg transition-all hover:scale-110"
                :aria-label="link.name"
              >
                <UIcon :name="link.icon" class="h-5 w-5" />
              </span>
            </UTooltip>
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
</script>
