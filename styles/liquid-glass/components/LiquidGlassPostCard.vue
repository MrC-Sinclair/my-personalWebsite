<!--
  LiquidGlassPostCard - liquid-glass 风格的文章玻璃长条
  ------------------------------------------------------------
  最新文章以「横躺的玻璃长条」列表呈现（区别于卡片网格的
  另一种玻璃形态）：左侧日期玻璃徽标，中部标题 / 摘要 /
  标签，右侧阅读箭头；整条 NuxtLink 跳详情页。
  日期格式化调用共享层 utils 的 formatDate（不在风格里
  重写业务逻辑）。
-->
<template>
  <NuxtLink :to="localePath(postRoute)" class="post-link">
    <article class="bar glass">
      <span class="sheen" aria-hidden="true"/>
      <time class="date" :datetime="post.date">{{ displayDate }}</time>
      <div class="main">
        <h3 class="title">{{ post.title }}</h3>
        <p v-if="post.description" class="desc">{{ post.description }}</p>
        <ul v-if="displayTags.length" class="tags">
          <li v-for="tag in displayTags" :key="tag" class="tag">{{ tag }}</li>
        </ul>
      </div>
      <span class="more">
        <span class="more-text">{{ t('blog.readMore') }}</span>
        <span class="more-arrow" aria-hidden="true">→</span>
      </span>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import { contentSlug } from '~/utils/content'

const props = defineProps<{
  /** 文章数据（来自共享层 useBlog） */
  post: BlogPost
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

/** 标签防御：只取前 4 个非空标签 */
const displayTags = computed(() =>
  (Array.isArray(props.post.tags) ? props.post.tags : [])
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 4),
)

/** 日期展示：共享层 formatDate 按当前语言格式化 */
const displayDate = computed(() => formatDate(props.post.date, locale.value === 'zh' ? 'zh-CN' : 'en-US'))

/** 由内容路径推导详情页路由（slug 推导统一走共享层 contentSlug） */
const postRoute = computed(() => `/blog/${contentSlug(props.post.path)}`)
</script>

<style scoped>
.post-link {
  display: block;
  border-radius: var(--radius-sm);
}

/* —— 玻璃配方（长条级，模糊半径 12px，景深最浅） —— */
.glass {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--gap);
  overflow: hidden;
  min-height: 96px;
  padding: 18px 22px;
  background:
    linear-gradient(120deg, rgb(167 139 255 / 0.07), rgb(94 227 255 / 0.04) 55%, rgb(255 122 184 / 0.07)),
    linear-gradient(180deg, rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.03));
  border: var(--border-w) solid rgb(255 255 255 / 0.16);
  border-radius: var(--radius-sm);
  box-shadow:
    0 12px 28px rgb(4 2 18 / 0.32),
    inset 0 1px 0 rgb(255 255 255 / 0.24);
  backdrop-filter: blur(12px) saturate(1.3);
  -webkit-backdrop-filter: blur(12px) saturate(1.3);
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    border-color var(--transition);
}

@supports not (backdrop-filter: blur(1px)) {
  .glass {
    background: rgb(24 17 60 / 0.94);
  }
}

.post-link:hover .glass {
  border-color: rgb(255 255 255 / 0.3);
  box-shadow:
    0 18px 36px rgb(4 2 18 / 0.4),
    inset 0 1px 0 rgb(255 255 255 / 0.32);
  transform: translateY(-3px);
}

.post-link:active .glass {
  transform: var(--press-transform);
}

/* 上缘高光弧（--deco） */
.glass::after {
  position: absolute;
  top: 0;
  right: 20%;
  left: 20%;
  height: 1px;
  content: '';
  background: var(--deco);
}

/* 折射光带：hover 扫过 */
.sheen {
  position: absolute;
  top: -40%;
  bottom: -40%;
  left: -40%;
  width: 26%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.08), transparent);
  transform: rotate(14deg);
  transition: left 0.9s cubic-bezier(0.45, 0, 0.2, 1), opacity var(--transition);
  opacity: 0;
}

.post-link:hover .sheen {
  left: 118%;
  opacity: 1;
}

/* 日期徽标：竖排窄玻璃片（视觉锚点） */
.date {
  flex: none;
  align-self: flex-start;
  min-width: 84px;
  padding: 8px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  text-align: center;
  color: var(--c-accent);
  background: rgb(94 227 255 / 0.08);
  border: var(--border-w) solid rgb(94 227 255 / 0.3);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.2);
}

.main {
  flex: 1 1 auto;
  min-width: 0;
}

.title {
  margin: 0 0 4px;
  font-size: var(--fs-title);
  font-weight: 600;
  line-height: 1.35;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.desc {
  margin: 0;
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-muted);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-text);
  background: rgb(255 255 255 / 0.08);
  border: var(--border-w) solid rgb(255 255 255 / 0.16);
  border-radius: 999px;
}

/* 阅读更多：右缘箭头组 */
.more {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  color: var(--c-accent);
  font-size: var(--fs-small);
  white-space: nowrap;
}

.more-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-family: var(--font-mono);
  background: rgb(94 227 255 / 0.1);
  border: var(--border-w) solid rgb(94 227 255 / 0.35);
  border-radius: 50%;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.25);
  transition: transform var(--transition);
}

.post-link:hover .more-arrow {
  transform: translateX(4px);
}

/* 窄屏：长条折行为上下两段（日期徽标并入行首），玻璃签名保留 */
@media (max-width: 640px) {
  .glass {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .more-text {
    display: none;
  }

  .more {
    margin-left: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .glass,
  .sheen,
  .more-arrow {
    transition: none;
  }

  .post-link:hover .glass,
  .post-link:hover .more-arrow {
    transform: none;
  }

  .post-link:hover .sheen {
    left: -40%;
    opacity: 0;
  }
}
</style>
