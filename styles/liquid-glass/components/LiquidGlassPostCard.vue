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
      <span class="lens" aria-hidden="true"/>
      <span class="sheen" aria-hidden="true"/>
      <time class="date" :datetime="post.date">{{ displayDate }}</time>
      <div class="main">
        <NuxtImg
          v-if="post.image"
          class="post-cover"
          :src="post.image"
          :alt="post.title"
          sizes="sm:100vw md:50vw"
          loading="lazy"
        />
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
// 详情链接走风格内路由（/style/<id>/blog/<slug>），旧的 /blog/<slug> 已 404
const { styleId } = useStyleContentPath()

/** 标签防御：只取前 4 个非空标签 */
const displayTags = computed(() =>
  (Array.isArray(props.post.tags) ? props.post.tags : [])
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 4),
)

/** 日期展示：共享层 formatDate 按当前语言格式化 */
const displayDate = computed(() => formatDate(props.post.date, locale.value === 'zh' ? 'zh-CN' : 'en-US'))

/** 由内容路径推导详情页路由（风格内：/style/<id>/blog/<slug>） */
const postRoute = computed(() => `/style/${styleId.value}/blog/${contentSlug(props.post.path)}`)
</script>

<style scoped>
.post-link {
  display: block;
  border-radius: var(--radius-sm);
}

/* —— 玻璃配方（长条级：全站最浅的一档景深） ——
   高度只有 96px 的长条上，15px 的折射环会占掉两侧近三分之一，
   所以这里只留镜面环，折射环收窄到 9px。 */
.glass {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--gap);
  overflow: hidden;
  min-height: 96px;
  padding: 18px 22px;
  background: var(--lg-depth), var(--lg-fill);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-press);
  backdrop-filter: blur(var(--lg-blur-sm)) saturate(1.28) brightness(1.03) contrast(1.12);
  -webkit-backdrop-filter: blur(var(--lg-blur-sm)) saturate(1.28) brightness(1.03) contrast(1.12);
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

/* hover：只换投影与描边，不加 inset 高光（理由同项目卡） */
.post-link:hover .glass {
  border-color: rgb(255 255 255 / 0.2);
  box-shadow: 0 8px 20px rgb(4 2 18 / 0.24);
  transform: translateY(-3px);
}

.post-link:active .glass {
  transform: var(--press-transform);
}

/* 镜面高光环 */
.glass::after {
  position: absolute;
  inset: 0;
  padding: var(--lg-spec-w);
  border-radius: inherit;
  pointer-events: none;
  content: '';
  background: var(--lg-spec);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

/* 顶部泛光 */
.glass::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: var(--lg-luster);
}

/* 折射环：长条专用窄环 */
.lens {
  position: absolute;
  inset: 0;
  padding: 9px;
  border-radius: inherit;
  pointer-events: none;
  /* 透镜环带 + 折射染色 */
  backdrop-filter: blur(6px) saturate(1.7) brightness(1.15) contrast(1.1);
  -webkit-backdrop-filter: blur(6px) saturate(1.7) brightness(1.15) contrast(1.1);
  background: var(--lg-refract);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

.lens::after {
  position: absolute;
  inset: 0;
  padding: 4px;
  border-radius: inherit;
  content: '';
  /* 透镜环带 + 折射染色 */
  backdrop-filter: blur(6px) saturate(1.7) brightness(1.15) contrast(1.1);
  -webkit-backdrop-filter: blur(6px) saturate(1.7) brightness(1.15) contrast(1.1);
  background: var(--lg-refract);
  opacity: 0.6;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

/* 折射光带：hover 扫过（默认隐形） */
.sheen {
  position: absolute;
  top: -40%;
  bottom: -40%;
  left: -40%;
  width: 26%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.07), transparent);
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
  box-shadow: inset 0 1px 0 var(--lg-bevel);
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
  overflow-wrap: break-word;
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
  box-shadow: inset 0 1px 0 var(--lg-bevel);
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
/* —— 文章封面：与项目卡同一套 16:9 裁切。博客是长列表，限高比项目卡的 240px 更紧 —— */
.post-cover {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  max-height: 180px;
  object-fit: cover;
  margin-bottom: 10px;
  border-radius: var(--radius-sm);
  background: var(--c-surface);
}
</style>
