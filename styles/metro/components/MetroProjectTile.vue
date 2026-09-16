<!--
  MetroProjectTile - 精选项目 Tile
  ------------------------------------------------------------
  项目信息直接铺在色块上：顶部技术标签（细边框章）+ 标题大字 + 简介。
  整块 Tile 是 NuxtLink（localePath 包裹）跳转项目详情页，
  slug 推导复用共享层 contentSlug（从内容 path 取末段去扩展名）。
-->
<template>
  <MetroTile :span="span" :variant="variant" :to="detailLink">
    <p class="proj__tags">
      <span v-for="tag in topTags" :key="tag" class="proj__tag">{{ tag }}</span>
    </p>
    <div>
      <h3 class="proj__title" :class="{ 'proj__title--wide': span === 'wide' }">{{ project.title }}</h3>
      <p v-if="project.description" class="proj__desc">{{ project.description }}</p>
    </div>
  </MetroTile>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { Project } from '~/types/project'
import MetroTile from './MetroTile.vue'
import type { MetroTileSpan, MetroTileVariant } from './MetroTile.vue'

const props = defineProps<{
  /** 项目数据（来自共享层 useProjects） */
  project: Project
  /** 跨度：首个项目用 wide（2x1），其余 sm（1x1） */
  span?: MetroTileSpan
  /** 色块变体 */
  variant?: MetroTileVariant
}>()

const localePath = useLocalePath()

/** 详情页地址：slug 用共享层 contentSlug 从内容 path 推导，再拼详情路由 */
const detailLink = computed(() => localePath(`/projects/${contentSlug(props.project.path)}`))

/** 防御：tags 非数组时回退空列表，只取前三个 */
const topTags = computed(() => (Array.isArray(props.project.tags) ? props.project.tags.slice(0, 3) : []))
</script>

<style scoped>
/* 技术标签：细边框章（不做底色，避免降低白字对比度） */
.proj__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
}

.proj__tag {
  padding: 3px 8px;
  font-size: 12px;
  letter-spacing: 0.06em;
  border: 1px solid color-mix(in srgb, currentColor 55%, transparent);
}

.proj__title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  margin: 0;
  font-family: var(--font-head);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

/* 宽 Tile（2x1）：标题升级为大字 */
.proj__title--wide {
  font-size: clamp(24px, 2.6vw, 32px);
}

.proj__desc {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  margin: 8px 0 0;
  font-size: var(--fs-small);
  line-height: 1.55;
}
</style>
