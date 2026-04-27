<!--
  MobileToc - 移动端文章目录浮动按钮组件

  在移动端（lg 断点以下）以浮动按钮形式展示，
  点击后弹出目录面板，方便用户跳转文章章节。

  Props：
  - toc: { links: TocLink[] } - 目录数据对象

  交互：
  - 右下角固定悬浮按钮（仅 lg 以下显示），位于 MobileNavBar 上方
  - 点击按钮弹出目录面板
  - 点击目录项跳转并自动关闭面板
  - 点击面板外部区域关闭面板

  依赖：
  - useI18n() 提供国际化文案
-->
<template>
  <div v-if="toc && toc.links.length > 0" class="lg:hidden">
    <Transition
      enter-active-class="transition-opacity duration-fast ease-out"
      leave-active-class="transition-opacity duration-fast ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isPanelOpen"
        class="z-overlay fixed inset-0 bg-black/50"
        @click="isPanelOpen = false"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-normal ease-out"
      leave-active-class="transition-transform duration-normal ease-in"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="isPanelOpen"
        class="bg-surface-light dark:bg-surface-dark z-modal fixed right-0 bottom-0 left-0 max-h-[60vh] overflow-y-auto rounded-t-2xl shadow-2xl"
      >
        <div
          class="border-border-light dark:border-border-dark sticky top-0 flex items-center justify-between border-b px-5 py-4"
        >
          <h4 class="text-text-primary-light dark:text-text-primary-dark text-base font-semibold">
            {{ t('blog.toc') }}
          </h4>
          <UTooltip :text="t('common.closeMenu')">
            <button
              class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 duration-fast flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              :aria-label="t('common.closeMenu')"
              @click="isPanelOpen = false"
            >
              <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
            </button>
          </UTooltip>
        </div>
        <nav class="px-5 py-3">
          <ul class="space-y-1">
            <li v-for="link in toc.links" :key="link.id">
              <a
                :href="`#${link.id}`"
                class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 duration-fast block rounded-lg px-3 py-2.5 text-sm transition-colors"
                :class="{ 'pl-6': link.depth === 3 }"
                @click="isPanelOpen = false"
              >
                {{ link.text }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </Transition>

    <UTooltip :text="t('blog.toc')">
      <button
        class="bg-primary-500 hover:bg-primary-600 z-dropdown duration-fast fixed right-5 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-colors"
        :class="isPanelOpen ? 'bottom-5' : 'bottom-24 md:bottom-5'"
        :aria-label="t('blog.toc')"
        @click="isPanelOpen = !isPanelOpen"
      >
        <UIcon name="i-heroicons-list-bullet" class="h-6 w-6" />
      </button>
    </UTooltip>
  </div>
</template>

<script setup lang="ts">
interface TocLink {
  id: string
  text: string
  depth: number
}

defineProps<{
  toc: { links: TocLink[] }
}>()

const { t } = useI18n()
const isPanelOpen = ref(false)
</script>
