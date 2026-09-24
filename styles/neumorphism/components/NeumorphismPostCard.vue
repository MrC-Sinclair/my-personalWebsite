<!--
  NeumorphismPostCard - neumorphism 风格最新文章行
  ------------------------------------------------------------
  一条条压进材料里的凹槽行：发布日期（等宽）+ 标题链接 +
  摘要 + 分类/标签胶囊。标题链接用 ::after 铺满整行（触控
  目标 ≥ 40px），hover 时凹槽加深、标题点亮为强调色、行尾
  箭头浮现（reduced-motion 下关闭过渡）。
  slug 换算复用共享层 contentSlug（不在风格里重写业务逻辑）。
-->
<template>
  <article class="row">
    <p class="row-date">{{ formatDate(post.date, locale) }}</p>

    <div class="row-main">
      <h3 class="row-title">
        <NuxtLink
          class="row-link"
          :to="localePath(`/style/${styleId}/blog/${contentSlug(post.path)}`)"
        >
          {{ post.title }}
        </NuxtLink>
      </h3>

      <p v-if="post.description" class="row-desc">{{ post.description }}</p>

      <p v-if="post.category || metaTags.length" class="row-meta">
        <span v-if="post.category" class="row-tag row-tag-strong">{{ post.category }}</span>
        <span v-for="tag in metaTags" :key="tag" class="row-tag">{{ tag }}</span>
      </p>
    </div>

    <span class="row-arrow" aria-hidden="true">→</span>
  </article>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { BlogPost } from '~/types/blog'

const props = defineProps<{
  /** 文章数据（来自共享层 useBlog，列表已按日期倒序） */
  post: BlogPost
}>()

const { locale } = useI18n()
const localePath = useLocalePath()
// 详情链接走风格内路由（/style/<id>/blog/<slug>），旧的 /blog/<slug> 已 404
const { styleId } = useStyleContentPath()

/** 标签摘要：最多显示前 2 个（防御性处理非数组字段） */
const metaTags = computed(() => (Array.isArray(props.post.tags) ? props.post.tags.slice(0, 2) : []))
</script>

<style scoped>
/* —— 凹槽行：材料表面压出的长槽 —— */
.row {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 16px 20px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  box-shadow: inset 4px 4px 9px #a3b1c6, inset -4px -4px 9px #ffffff;
  transition: box-shadow var(--transition);
}

/* hover：凹槽加深（与按压态同一组内凹阴影） */
.row:hover {
  box-shadow: var(--shadow-press);
}

.row-date {
  flex: none;
  min-width: 96px;
  margin: 2px 0 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.row-main {
  flex: 1;
  min-width: 0;
}

.row-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
  line-height: 1.6;
}

.row-link {
  color: var(--c-text);
  text-decoration: none;
  transition: color var(--transition);
}

.row-link:hover {
  color: var(--c-accent);
}

.row-link:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 4px;
  border-radius: 4px;
}

/* 链接热区铺满整行（触控目标 ≥ 40px） */
.row-link::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.row-desc {
  display: -webkit-box;
  overflow: hidden;
  margin: 4px 0 0;
  color: var(--c-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.row-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 0;
}

.row-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-muted);
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: 2px 2px 5px #a3b1c6, -2px -2px 5px #ffffff;
}

.row-tag-strong {
  color: var(--c-accent);
}

.row-arrow {
  flex: none;
  margin-top: 2px;
  font-family: var(--font-mono);
  color: var(--c-accent);
  opacity: 0;
  transform: translateX(-4px);
  transition:
    opacity var(--transition),
    transform var(--transition);
}

.row:hover .row-arrow {
  opacity: 1;
  transform: none;
}

/* 窄屏：日期并入上方，保持单列节奏 */
@media (max-width: 560px) {
  .row {
    flex-direction: column;
    gap: 8px;
  }

  .row-date {
    min-width: 0;
    margin: 0;
  }

  .row-arrow {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .row,
  .row-link,
  .row-arrow {
    transition: none;
  }

  .row-arrow {
    transform: none;
  }
}
</style>
