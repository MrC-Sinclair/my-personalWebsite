<!--
  BlogToc - 文章目录导航组件

  在博客详情页右侧展示文章的标题目录（Table of Contents），
  点击目录项可跳转到对应标题位置。

  Props：
  - toc: { links: TocLink[] } - 目录数据对象
    - links: 目录项列表，每项包含 id（锚点 ID）、text（标题文本）、depth（标题层级）

  布局：
  - 粘性定位（sticky），跟随页面滚动
  - h3 级别标题缩进显示（pl-4）
  - 仅在桌面端显示（由父组件 BlogDetail 控制显隐）

  依赖：
  - useI18n() 提供国际化文案
-->
<template>
  <nav class="sticky top-20 w-56 shrink-0">
    <h4
      class="text-text-secondary-light dark:text-text-secondary-dark mb-3 text-sm font-semibold uppercase"
    >
      {{ t('blog.toc') }}
    </h4>
    <ul class="space-y-1">
      <li v-for="link in toc.links" :key="link.id">
        <a
          :href="`#${link.id}`"
          class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500 block text-sm transition-colors duration-fast"
          :class="{ 'pl-4': link.depth === 3 }"
        >
          {{ link.text }}
        </a>
      </li>
    </ul>
  </nav>
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
</script>
