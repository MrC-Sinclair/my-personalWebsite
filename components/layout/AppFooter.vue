<template>
  <footer class="bg-surface-light-alt dark:bg-surface-dark-alt border-t border-gray-200 dark:border-gray-700">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div class="text-text-secondary-light dark:text-text-secondary-dark text-sm">
          &copy; {{ currentYear }} {{ siteConfig.author }}. {{ t('footer.copyright') }}
        </div>

        <div class="flex items-center gap-4">
          <a
            :href="siteConfig.social.github"
            target="_blank"
            rel="noopener noreferrer"
            class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 transition-colors duration-150"
            aria-label="GitHub"
          >
            <UIcon name="i-simple-icons-github" class="h-5 w-5" />
          </a>
          <a
            :href="siteConfig.social.twitter"
            target="_blank"
            rel="noopener noreferrer"
            class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 transition-colors duration-150"
            aria-label="Twitter"
          >
            <UIcon name="i-simple-icons-x" class="h-5 w-5" />
          </a>
          <a
            :href="siteConfig.social.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 transition-colors duration-150"
            aria-label="LinkedIn"
          >
            <UIcon name="i-simple-icons-linkedin" class="h-5 w-5" />
          </a>
        </div>

        <div class="text-text-secondary-light dark:text-text-secondary-dark text-sm">
          {{ t('footer.builtWith') }}
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { siteConfig } = useAppInfo()
const { t } = useI18n()

const currentYear = new Date().getFullYear()
</script>
