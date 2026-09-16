<!--
  MetroPostTile - 最新文章 Tile
  ------------------------------------------------------------
  文章信息直接铺在色块上：顶部发布日期（大写小字）+ 标题大字 + 标签行。
  整块 Tile 是 NuxtLink（localePath 包裹）跳转文章详情页，
  日期文案复用共享层 formatDate，slug 推导复用共享层 contentSlug。
-->
<template>
  <MetroTile :span="span" :variant="variant" :to="detailLink">
    <p class="post__date">{{ formattedDate }}</p>
    <div>
      <h3 class="post__title" :class="{ 'post__title--wide': span === 'wide' }">{{ post.title }}</h3>
      <p v-if="tagText" class="post__tags">{{ tagText }}</p>
    </div>
  </MetroTile>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { BlogPost } from '~/types/blog'
import MetroTile from './MetroTile.vue'
import type { MetroTileSpan, MetroTileVariant } from './MetroTile.vue'

const props = defineProps<{
  /** 文章数据（来自共享层 useBlog） */
  post: BlogPost
  /** 跨度：中间一篇用 wide（2x1），其余 sm（1x1） */
  span?: MetroTileSpan
  /** 色块变体 */
  variant?: MetroTileVariant
}>()

const { locale } = useI18n()
const localePath = useLocalePath()

/** 本地化发布日期（共享层 formatDate） */
const formattedDate = computed(() => formatDate(props.post.date, locale.value))

/** 详情页地址：slug 用共享层 contentSlug 从内容 path 推导，再拼详情路由 */
const detailLink = computed(() => localePath(`/blog/${contentSlug(props.post.path)}`))

/** 防御：tags 非数组时回退空串，只取前两个 */
const tagText = computed(() =>
  Array.isArray(props.post.tags) ? props.post.tags.slice(0, 2).join(' / ') : '',
)
</script>

<style scoped>
/* 日期：大写宽字距小字，信息版面的「时间戳」 */
.post__date {
  margin: 0;
  font-size: var(--fs-small);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.post__title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  margin: 0;
  font-family: var(--font-head);
  font-size: 19px;
  font-weight: 700;
  line-height: 1.25;
}

/* 宽 Tile（2x1）：标题升级为大字 */
.post__title--wide {
  font-size: clamp(22px, 2.4vw, 30px);
}

.post__tags {
  margin: 8px 0 0;
  font-size: var(--fs-small);
  letter-spacing: 0.06em;
}
</style>
