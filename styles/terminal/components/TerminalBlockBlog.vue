<!--
  TerminalBlockBlog - terminal 风格「最新文章」区块
  ------------------------------------------------------------
  文章清单是纯文本日志行：发布日期（等宽表格数字）+ 标题
  （NuxtLink 进入 /blog/[slug]，slug 由共享层 contentSlug 从内容
  path 提取）+ 可选
  分类徽标 [分类]。数据来自共享层 useBlog（页面经 useAsyncData
  传入）；空列表显示 i18n 空状态文案。行 hover 整行提亮。
  同一组件同时服务于命令输出区与页尾隐藏降级区。
-->
<template>
  <ol class="posts">
    <li v-for="(post, i) in safePosts" :key="post.path || i" class="post">
      <span class="post-date">{{ dateText(post) }}</span>
      <span class="post-title">
        <NuxtLink
          class="post-link"
          :to="localePath(`/style/${styleId}/blog/${slugOf(post)}`)"
        >
          {{ post.title }}
        </NuxtLink>
      </span>
      <span v-if="post.category" class="post-badge">[{{ post.category }}]</span>
    </li>

    <li v-if="!safePosts.length" class="empty">
      <p class="empty-main">{{ t('blog.noResults') }}</p>
      <p class="empty-hint">{{ t('blog.noResultsHint') }}</p>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import { contentSlug } from '~/utils/content'

const props = defineProps<{
  /** 文章数据（来自共享层 useBlog，经 useAsyncData 传入） */
  posts: BlogPost[]
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
// 详情链接走风格内路由（/style/<id>/blog/<slug>），旧的 /blog/<slug> 已 404
const { styleId } = useStyleContentPath()

/** 防御：数组字段用 Array.isArray 检查，异常时回落为空列表 */
const safePosts = computed(() => (Array.isArray(props.posts) ? props.posts : []))

/** 从内容路径提取 slug（收敛到共享层 contentSlug，多风格唯一实现） */
function slugOf(post: BlogPost): string {
  return contentSlug(post.path)
}

/** 本地化日期（日期字段必填，异常时留空不阻塞渲染） */
function dateText(post: BlogPost): string {
  return post.date ? formatDate(post.date, locale.value) : ''
}
</script>

<style scoped>
.posts {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 4px 0;
  list-style: none;
}

/* 日志行：日期 + 标题 + 分类，hover 整行提亮（瞬时底色变化） */
.post {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  min-height: 40px;
  padding: 6px 4px;
}

.post:hover {
  background: color-mix(in srgb, var(--c-text) 10%, transparent);
}

.post-date {
  flex: none;
  color: var(--c-accent-2);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.post-title {
  flex: 1 1 200px;
  min-width: 0;
}

/* 标题链接拉伸铺满整行（相对 .post 定位），整行 ≥40px 可点 */
.post-link {
  color: var(--c-accent);
  text-decoration: none;
  overflow-wrap: break-word;
}

.post-link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.post-link:hover {
  text-decoration: underline;
  text-shadow: 0 0 8px color-mix(in srgb, var(--c-accent) 45%, transparent);
}

.post-link:active {
  transform: var(--press-transform);
}

.post-link:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* 分类徽标：方括号文本样式 */
.post-badge {
  flex: none;
  margin-left: auto;
  color: var(--c-muted);
  white-space: nowrap;
}

.empty {
  padding: 8px 4px;
}

.empty-main {
  margin: 0;
  color: var(--c-muted);
}

.empty-hint {
  margin: 2px 0 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}
</style>
