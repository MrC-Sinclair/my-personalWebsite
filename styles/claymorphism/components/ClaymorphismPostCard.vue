<!--
  ClaymorphismPostCard - claymorphism 风格文章黏土胶囊行
  ------------------------------------------------------------
  最新文章做成一条条圆滚滚的厚胶囊行：左侧日期黏土压印 +
  标题与摘要 + 分类 / 标签点 + 右端箭头小球。
  整行 NuxtLink 包裹跳文章详情（localePath 包裹，slug 由共享层
  contentSlug 从内容路径推导）；hover 抬起，active 压扁（标志反馈）。
-->
<template>
  <NuxtLink class="row-link" :to="localePath(postRoute)">
    <article class="row" :class="`tone-${tone}`">
      <!-- 日期黏土压印 -->
      <time class="date" :datetime="post.date">{{ formatDate(post.date, locale) }}</time>

      <div class="body">
        <h3 class="title">{{ post.title }}</h3>
        <p v-if="post.description" class="excerpt">{{ post.description }}</p>
        <div class="meta">
          <span v-if="post.category" class="category">{{ post.category }}</span>
          <span v-for="tag in displayTags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>

      <!-- 右端箭头小球 -->
      <span class="go" aria-hidden="true">→</span>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { BlogPost } from '~/types/blog'

const props = withDefaults(
  defineProps<{
    /** 文章数据（来自共享层 useBlog，已按日期倒序） */
    post: BlogPost
    /** 黏土压印色相轮换 */
    tone?: 'pink' | 'mint' | 'butter' | 'lilac' | 'blue'
  }>(),
  { tone: 'lilac' },
)

const { locale } = useI18n()
const localePath = useLocalePath()

/** 标签防御：只取前 2 个非空标签 */
const displayTags = computed(() =>
  (Array.isArray(props.post.tags) ? props.post.tags : [])
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 2),
)

/** 由内容路径推导详情页路由（slug 换算复用共享层 contentSlug） */
const postRoute = computed(() => `/blog/${contentSlug(props.post.path)}`)
</script>

<style scoped>
/* 整行可点击：链接本体接管圆角裁切 */
.row-link {
  display: block;
  border-radius: var(--radius);
}

/* 厚胶囊行：近白黏土底 + 双层投影 + 内高光 */
.row {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 76px;
  padding: 16px 20px;
  background: var(--c-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

/* hover：抬起 + 阴影加深 + 压印染色 */
.row-link:hover .row {
  transform: translateY(-4px);
  box-shadow:
    0 26px 44px rgb(150 90 210 / 0.28),
    0 10px 18px rgb(150 90 210 / 0.16),
    inset 0 10px 18px rgb(255 255 255 / 0.65),
    inset 0 -10px 16px rgb(125 63 201 / 0.1);
}

.row-link:hover .date {
  background: var(--tone-bg);
  color: var(--tone-text);
  box-shadow:
    0 6px 10px var(--tone-shadow),
    inset 0 4px 7px rgb(255 255 255 / 0.7),
    inset 0 -4px 6px var(--tone-inset);
}

.row-link:active .row {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

/* 日期黏土压印（hover 才染色，默认近白） */
.date {
  flex: none;
  align-self: flex-start;
  min-width: 84px;
  padding: 6px 12px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-muted);
  text-align: center;
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow:
    inset 0 3px 6px rgb(125 63 201 / 0.14),
    inset 0 -2px 4px rgb(255 255 255 / 0.85);
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition);
}

.body {
  flex: 1;
  min-width: 0;
}

.title {
  margin: 0 0 2px;
  font-size: var(--fs-title);
  font-weight: 800;
  line-height: 1.35;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.excerpt {
  display: -webkit-box;
  margin: 0 0 8px;
  overflow: hidden;
  font-size: var(--fs-base);
  line-height: 1.6;
  color: var(--c-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 分类：同色系压印胶囊 */
.category {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--tone-text);
  background: var(--tone-bg);
  border-radius: 999px;
  box-shadow:
    0 4px 7px var(--tone-shadow),
    inset 0 3px 5px rgb(255 255 255 / 0.6),
    inset 0 -3px 4px var(--tone-inset);
}

/* 标签：更轻的小点 */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: var(--fs-small);
  color: var(--c-muted);
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: inset 0 2px 4px rgb(125 63 201 / 0.1);
}

/* 右端箭头小球 */
.go {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-radius: 50%;
  box-shadow:
    0 6px 10px rgb(125 63 201 / 0.35),
    inset 0 4px 7px rgb(255 255 255 / 0.4),
    inset 0 -4px 6px rgb(90 40 150 / 0.25);
  transition: transform var(--transition);
}

.row-link:hover .go {
  transform: translateX(3px) scale(1.08);
}

/* —— Pastel 色相（压印染色用，文字为加深色） —— */
.tone-pink {
  --tone-bg: #ffdfe9;
  --tone-text: #7a2953;
  --tone-shadow: rgb(215 100 150 / 0.3);
  --tone-inset: rgb(215 100 150 / 0.22);
}

.tone-mint {
  --tone-bg: #d3f3e1;
  --tone-text: #175639;
  --tone-shadow: rgb(90 175 135 / 0.3);
  --tone-inset: rgb(70 145 105 / 0.22);
}

.tone-butter {
  --tone-bg: #fff3cd;
  --tone-text: #65450c;
  --tone-shadow: rgb(215 170 70 / 0.3);
  --tone-inset: rgb(190 140 40 / 0.22);
}

.tone-lilac {
  --tone-bg: #e9defc;
  --tone-text: #4c2689;
  --tone-shadow: rgb(140 100 200 / 0.3);
  --tone-inset: rgb(120 80 185 / 0.22);
}

.tone-blue {
  --tone-bg: #dcebff;
  --tone-text: #173f73;
  --tone-shadow: rgb(80 130 200 / 0.3);
  --tone-inset: rgb(60 105 175 / 0.22);
}

/* 窄屏：日期压印收到标题上方（布局回退，黏土配方保留） */
@media (max-width: 560px) {
  .row {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 10px;
  }

  .go {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .row,
  .date,
  .go {
    transition: none;
  }

  .row-link:hover .row,
  .row-link:active .row,
  .row-link:hover .go {
    transform: none;
  }
}
</style>
