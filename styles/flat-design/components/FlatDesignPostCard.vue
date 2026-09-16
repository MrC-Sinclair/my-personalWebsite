<!--
  FlatDesignPostCard - 扁平化风格文章卡片
  ------------------------------------------------------------
  白色表面卡 + 左侧纯色强调条（本风格的「色条」签名）+ 分类章 /
  标题 / 摘要 / 日期与标签。标题链接拉伸热区覆盖整卡，
  日期走共享层 formatDate，tags 用 Array.isArray 防御。
-->
<template>
  <article class="post-card" :style="{ '--tone': tone.main, '--tone-deep': tone.deep }">
    <span class="post-card__bar" aria-hidden="true"/>

    <div class="post-card__body">
      <p class="post-card__meta-top">
        <span v-if="post.category" class="post-card__chip">{{ post.category }}</span>
        <span class="post-card__date">{{ formattedDate }}</span>
      </p>

      <h3 class="post-card__title">
        <NuxtLink :to="detailLink" class="post-card__link">{{ post.title }}</NuxtLink>
      </h3>

      <p v-if="post.description" class="post-card__desc">{{ post.description }}</p>

      <p v-if="tagText" class="post-card__tags">{{ tagText }}</p>

      <p class="post-card__more">
        {{ t('blog.readMore') }}
        <span aria-hidden="true">→</span>
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import { contentSlug } from '~/utils/content'
import { flatTone } from '../tones'

const props = defineProps<{
  /** 文章数据（来自共享层 useBlog） */
  post: BlogPost
  /** 序号：决定色条 / 分类章颜色（循环取用，SSR 安全） */
  toneIndex: number
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

/** 当前色调（主色 + 加深色，经 CSS 变量注入） */
const tone = computed(() => flatTone(props.toneIndex))

/** 本地化发布日期（共享层 formatDate） */
const formattedDate = computed(() => formatDate(props.post.date, locale.value))

/** 详情页地址：slug 换算复用共享层 contentSlug，再拼本地化详情路由 */
const detailLink = computed(() => localePath(`/blog/${contentSlug(props.post.path)}`))

/** 防御：tags 非数组时回退空串，只取前三个 */
const tagText = computed(() =>
  Array.isArray(props.post.tags) ? props.post.tags.slice(0, 3).join(' / ') : '',
)
</script>

<style scoped>
.post-card {
  position: relative;
  display: flex;
  background: var(--c-surface);
  border-radius: var(--radius);
  overflow: hidden;
}

/* 左侧纯色强调条：hover 加深（纯颜色反馈） */
.post-card__bar {
  width: 6px;
  flex: 0 0 6px;
  background: var(--tone);
  transition: background var(--transition);
}

.post-card:hover .post-card__bar {
  background: var(--tone-deep);
}

.post-card__body {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  padding: 18px 20px 16px;
}

.post-card__meta-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 0;
}

/* 分类章：纯色底白字（色板均校验 ≥ 4.5:1） */
.post-card__chip {
  padding: 2px 9px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #ffffff;
  background: var(--tone);
  border-radius: var(--radius-sm);
}

.post-card__date {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--c-muted);
}

.post-card__title {
  margin: 10px 0 0;
  font-family: var(--font-head);
  font-size: 19px;
  font-weight: 800;
  line-height: 1.35;
}

.post-card__link {
  color: var(--c-text);
  text-decoration: none;
  transition: color var(--transition);
}

/* 拉伸热区：整卡可点击 */
.post-card__link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.post-card__link:hover,
.post-card:hover .post-card__link {
  color: var(--tone);
}

.post-card__link:focus-visible {
  outline: 3px solid var(--tone);
  outline-offset: 2px;
}

.post-card__desc {
  display: -webkit-box;
  overflow: hidden;
  margin: 8px 0 0;
  font-size: var(--fs-small);
  line-height: 1.65;
  color: var(--c-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.post-card__tags {
  margin: 10px 0 0;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--c-muted);
}

/* 阅读更多提示：箭头随卡片 hover 变色（无位移） */
.post-card__more {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 14px 0 0;
  padding-top: 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-muted);
  border-top: var(--border-w) solid #edf1f6;
  transition: color var(--transition);
}

.post-card__more span {
  color: var(--tone);
  transition: color var(--transition);
}

.post-card:hover .post-card__more {
  color: var(--c-text);
}

.post-card:hover .post-card__more span {
  color: var(--tone-deep);
}
</style>
