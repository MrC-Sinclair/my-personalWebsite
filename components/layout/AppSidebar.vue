<!--
  AppSidebar - 侧边栏导航组件

  桌面端（lg 断点以上）固定显示，提供辅助导航功能。
  移动端通过 prop 控制抽屉式弹出，从左侧滑入。

  Props：
  - title: 侧边栏标题（可选）
  - items: 导航项列表，每项包含 label（显示文本）和 to（路由路径）
  - isOpen: 移动端抽屉是否打开（v-model）

  交互：
  - 桌面端：固定显示，sticky 定位
  - 移动端：抽屉式侧边栏，遮罩层 + 左侧滑入动画
  - 点击导航项自动关闭移动端抽屉
  - 点击遮罩层关闭移动端抽屉

  使用场景：博客详情页、文档页等需要辅助导航的页面
-->
<template>
  <div>
    <aside
      class="bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark hidden border-r lg:block"
    >
      <nav class="sticky top-20 p-4">
        <h3
          v-if="title"
          class="text-text-secondary-light dark:text-text-secondary-dark mb-3 text-sm font-semibold uppercase"
        >
          {{ title }}
        </h3>
        <ul class="space-y-1">
          <li v-for="item in items" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 duration-fast block rounded-md px-3 py-1.5 text-sm transition-colors"
              active-class="text-primary-500 bg-primary-50 dark:bg-primary-950"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="z-overlay fixed inset-0 bg-black/50 lg:hidden" @click="emitClose" />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-normal ease-out"
      leave-active-class="transition-transform duration-200 ease-in"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="isOpen"
        class="bg-surface-light dark:bg-surface-dark z-modal fixed top-0 left-0 h-full w-72 overflow-y-auto shadow-xl lg:hidden"
      >
        <div
          class="border-border-light dark:border-border-dark flex items-center justify-between border-b px-4 py-3"
        >
          <h3
            v-if="title"
            class="text-text-primary-light dark:text-text-primary-dark text-base font-semibold"
          >
            {{ title }}
          </h3>
          <UTooltip :text="t('common.closeMenu')">
            <button
              class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 duration-fast flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
              :aria-label="t('common.closeMenu')"
              @click="emitClose"
            >
              <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
            </button>
          </UTooltip>
        </div>
        <nav class="p-4">
          <ul class="space-y-1">
            <li v-for="item in items" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 duration-fast block rounded-lg px-3 py-2.5 text-sm transition-colors"
                active-class="text-primary-500 bg-primary-50 dark:bg-primary-950"
                @click="emitClose"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface SidebarItem {
  label: string
  to: string
}

defineProps<{
  title?: string
  items: SidebarItem[]
  isOpen?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

function emitClose() {
  emit('close')
}

const route = useRoute()
watch(
  () => route.path,
  () => {
    emitClose()
  },
)
</script>
