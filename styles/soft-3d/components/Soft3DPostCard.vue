<!--
  Soft3DPostCard - soft-3d 风格最新文章卡
  ------------------------------------------------------------
  一枚「漂浮的刊物」：左侧悬浮日期球体（球内为月份的
  等宽数字，数据派生），右侧为分类 / 标题 / 摘要 / 标签。
  卡片为展示体（不链接详情页：详情路径转换属共享层能力，
  当前缺失，见交付报告），hover 仅做上浮与影子加深。
-->
<template>
  <article class="post">
    <div class="post-orb" aria-hidden="true">
      <span class="post-orb-month">{{ monthLabel }}</span>
    </div>

    <div class="post-body">
      <div class="post-meta">
        <time v-if="post.date" class="post-time">{{
          formatDate(post.date, locale === 'zh' ? 'zh-CN' : 'en-US')
        }}</time>
        <span v-if="post.category" class="post-cat">{{ post.category }}</span>
      </div>

      <h3 class="post-title">{{ post.title }}</h3>
      <p v-if="post.description" class="post-desc">{{ post.description }}</p>

      <ul v-if="safeTags.length" class="post-tags" :aria-label="t('blog.tags')">
        <li v-for="tag in safeTags" :key="tag" class="post-tag">{{ tag }}</li>
      </ul>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'

const props = withDefaults(
  defineProps<{
    /** 文章数据（来自 useBlog） */
    post: BlogPost
    /** 日期球配色 */
    variant?: 'violet' | 'cyan' | 'pink' | 'mint' | 'sun'
  }>(),
  {
    variant: 'violet',
  },
)

const { t, locale } = useI18n()

/** 数组防御：标签非数组回退为空 */
const safeTags = computed(() => (Array.isArray(props.post.tags) ? props.post.tags : []))

/** 球面月份：从日期字符串截取两位月份（纯字符串运算，SSR 安全） */
const monthLabel = computed(() => {
  const month = String(props.post.date).slice(5, 7)
  return /^\d{2}$/.test(month) ? month : '·'
})
</script>

<style scoped>
.post {
  display: flex;
  align-items: flex-start;
  gap: var(--gap);
  height: 100%;
  padding: var(--space);
  background: linear-gradient(150deg, color-mix(in srgb, var(--c-accent-2) 7%, var(--c-surface)), var(--c-surface) 55%);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform var(--transition), box-shadow var(--transition);
}

/* 悬浮：刊物被托起端详 */
.post:hover {
  transform: translateY(-5px);
  box-shadow:
    0 32px 56px rgb(6 3 26 / 0.64),
    0 13px 26px rgb(34 211 238 / 0.2),
    0 4px 9px rgb(6 3 26 / 0.48),
    inset 0 2px 5px rgb(255 255 255 / 0.24),
    inset 0 -8px 16px rgb(9 5 40 / 0.5);
}

/* —— 日期球：受光渐变球体，中心为等宽月份 —— */
.post-orb {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 26%, #cffafe 0%, #67e8f9 34%, #22d3ee 66%, #0e7490 100%);
  box-shadow:
    inset -6px -9px 14px rgb(9 5 40 / 0.45),
    inset 2px 3px 6px rgb(255 255 255 / 0.35),
    0 12px 22px rgb(34 211 238 / 0.32);
}

.post-orb::before {
  content: '';
  position: absolute;
  top: 12%;
  left: 20%;
  width: 32%;
  height: 22%;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgb(255 255 255 / 0.85), rgb(255 255 255 / 0) 70%);
}

.post-orb-month {
  font-family: var(--font-mono);
  font-size: var(--fs-base);
  font-weight: 700;
  color: #083344;
}

.post-body {
  min-width: 0;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.post-time {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.post-cat {
  padding: 2px 10px;
  font-size: var(--fs-small);
  color: var(--c-accent);
  background: color-mix(in srgb, var(--c-accent) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-accent) 36%, transparent);
  border-radius: 999px;
}

.post-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  line-height: 1.35;
  color: var(--c-text);
  overflow-wrap: break-word;
}

.post-desc {
  display: -webkit-box;
  margin: 6px 0 0;
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-muted);
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.post-tag {
  padding: 3px 11px;
  font-size: var(--fs-small);
  color: var(--c-text);
  background: color-mix(in srgb, var(--c-accent) 15%, var(--c-surface));
  border: 1px solid rgb(255 255 255 / 0.13);
  border-radius: 999px;
}

@media (max-width: 640px) {
  .post {
    padding: calc(var(--space) * 0.8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .post {
    transition: none;
  }

  .post:hover {
    transform: none;
  }
}
</style>
