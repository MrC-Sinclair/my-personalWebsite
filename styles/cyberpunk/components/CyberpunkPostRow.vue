<!--
  CyberpunkPostRow - cyberpunk 风格文章「数据流行」
  ------------------------------------------------------------
  最新文章以数据流单行呈现（区别于卡片网格的另一形态）：
  左侧十六进制索引徽标（0x01 起，由 index 确定性推导，SSR
  安全）+ 等宽日期，中部标题 / 摘要 / 三色轮换标签，右侧
  READ 箭头；整行 NuxtLink 跳详情页。hover 时左缘点亮霓虹
  指示条、行底泛光、箭头位移。日期格式化调用共享层
  formatDate、slug 换算复用共享层 contentSlug（不在风格里
  重写业务逻辑）。
-->
<template>
  <NuxtLink :to="localePath(postRoute)" class="row-link">
    <article class="row">
      <span class="hex" aria-hidden="true">{{ hexIndex }}</span>
      <time class="date" :datetime="post.date">{{ displayDate }}</time>

      <div class="main">
        <h3 class="title">{{ post.title }}</h3>
        <p v-if="post.description" class="desc">{{ post.description }}</p>
        <ul v-if="displayTags.length" class="tags">
          <li
            v-for="(tag, tagIndex) in displayTags"
            :key="tag"
            class="tag"
            :class="`tag-${tagIndex % 3}`"
          >
            {{ tag }}
          </li>
        </ul>
      </div>

      <span class="more">
        <span class="more-text">{{ t('blog.readMore') }}</span>
        <span class="more-arrow" aria-hidden="true">▸</span>
      </span>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
import { contentSlug } from '~/utils/content'
import type { BlogPost } from '~/types/blog'

const props = defineProps<{
  /** 文章数据（来自共享层 useBlog） */
  post: BlogPost
  /** 行序号（十六进制索引用，从 0 起） */
  index: number
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

/** 十六进制索引徽标：0x01、0x02…（纯视图装饰，确定性推导） */
const hexIndex = computed(() => `0x${(props.index + 1).toString(16).toUpperCase().padStart(2, '0')}`)

/** 标签防御：只取前 3 个非空标签 */
const displayTags = computed(() =>
  (Array.isArray(props.post.tags) ? props.post.tags : [])
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 3),
)

/** 日期展示：共享层 formatDate 按当前语言格式化 */
const displayDate = computed(() =>
  formatDate(props.post.date, locale.value === 'zh' ? 'zh-CN' : 'en-US'),
)

/** 由内容路径推导详情页路由（slug 换算复用共享层 contentSlug） */
const postRoute = computed(() => `/blog/${contentSlug(props.post.path)}`)
</script>

<style scoped>
.row-link {
  display: block;
  outline-offset: 3px;
}

/* —— 数据流行：左缘指示条 + 徽标 + 正文 + 箭头 —— */
.row {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--gap);
  min-height: 72px;
  padding: 14px 18px 14px 22px;
  background: rgb(255 255 255 / 0.02);
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
  transition:
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

/* 左缘霓虹指示条：默认微亮，hover 全亮 */
.row::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  content: '';
  background: linear-gradient(180deg, var(--c-accent), var(--c-accent-2));
  opacity: 0.3;
  transition: opacity var(--transition);
}

.row-link:hover .row {
  background: rgb(34 211 238 / 0.06);
  box-shadow: inset 0 0 24px rgb(34 211 238 / 0.08);
}

.row-link:hover .row::before {
  opacity: 1;
  box-shadow: 0 0 12px rgb(34 211 238 / 0.7);
}

.row-link:active .row {
  transform: var(--press-transform);
}

/* 十六进制索引徽标：等宽粉字 */
.hex {
  flex: none;
  min-width: 52px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  text-align: center;
}

/* 等宽日期 */
.date {
  flex: none;
  min-width: 96px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent);
}

.main {
  flex: 1 1 auto;
  min-width: 0;
}

.title {
  margin: 0 0 2px;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  line-height: 1.35;
  color: var(--c-text);
  overflow-wrap: anywhere;
  transition: text-shadow var(--transition);
}

.row-link:hover .title {
  text-shadow: 0 0 14px rgb(34 211 238 / 0.6);
}

.desc {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  background: rgb(255 255 255 / 0.03);
  clip-path: polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px);
  box-shadow: inset 0 0 0 var(--border-w) var(--tag-line);
}

.tag-0 {
  --tag-line: rgb(34 211 238 / 0.5);
  color: var(--c-accent);
}

.tag-1 {
  --tag-line: rgb(168 85 247 / 0.5);
  color: color-mix(in srgb, var(--c-accent) 48%, var(--c-accent-2));
}

.tag-2 {
  --tag-line: rgb(255 45 149 / 0.5);
  color: var(--c-accent-2);
}

/* READ 箭头：hover 位移 */
.more {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  color: var(--c-accent);
  white-space: nowrap;
}

.more-arrow {
  font-family: var(--font-mono);
  transition: transform var(--transition);
}

.row-link:hover .more-arrow {
  transform: translateX(5px);
}

/* 窄屏：折行为上下两段（徽标并入行首），READ 只留箭头 */
@media (max-width: 640px) {
  .row {
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
  .row,
  .row::before,
  .title,
  .more-arrow {
    transition: none;
  }

  .row-link:active .row,
  .row-link:hover .more-arrow {
    transform: none;
  }
}
</style>
