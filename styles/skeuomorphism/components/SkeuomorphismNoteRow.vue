<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismNoteRow - 拟物风格文章列表行
  ------------------------------------------------------------
  一张「图书馆索引卡」：米白卡纸 + 左侧两枚打孔 + 砖红页边
  线 + 打字机编号/日期；整行为一个 NuxtLink（无内嵌链接，
  HTML 合法）跳转过渡层文章详情。卡片带微旋转（--tilt），
  悬浮时被扶正抬离桌面、箭头右移。
-->
<template>
  <NuxtLink
    class="note"
    :style="{ '--tilt': `${tilt}deg` }"
    :to="localePath(`/style/${styleId}/blog/${slugOf(post.path)}`)"
  >
    <span class="note-holes" aria-hidden="true">
      <span class="note-hole" />
      <span class="note-hole" />
    </span>

    <span class="note-main">
      <span class="note-title">{{ post.title }}</span>
      <span v-if="post.description" class="note-desc">{{ post.description }}</span>
    </span>

    <span class="note-meta">
      <span v-if="post.category" class="note-cat">{{ post.category }}</span>
      <time class="note-date" :datetime="post.date">{{ formatDate(post.date, locale) }}</time>
    </span>

    <span class="note-arrow" aria-hidden="true">→</span>
  </NuxtLink>
</template>

<script setup lang="ts">
/**
 * @file 拟物风格的文章列表行组件
 * @description 索引卡行：打孔 + 页边线 + 打字机元信息，整行可点击。
 */
import { contentSlug } from '~/utils/content'
import type { BlogPost } from '~/types/blog'

withDefaults(
  defineProps<{
    /** 文章数据（共享层 useBlog 返回值） */
    post: BlogPost
    /** 行序号（用于打字机编号，从 0 起） */
    index?: number
    /** 卡片微旋转角度（deg，父级传入制造散落感） */
    tilt?: number
  }>(),
  {
    index: 0,
    tilt: 0,
  },
)

const { locale } = useI18n()
const localePath = useLocalePath()
// 详情链接走风格内路由（/style/<id>/blog/<slug>），旧的 /blog/<slug> 已 404
const { styleId } = useStyleContentPath()

/** 从内容路径提取 slug（收敛到共享层 contentSlug，多风格唯一实现，链接形态不变） */
function slugOf(path: string): string {
  return contentSlug(path)
}
</script>

<style scoped>
.note {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 40px;
  padding: 16px 20px 16px 58px;
  text-decoration: none;
  border: 1px solid rgb(0 0 0 / 0.4);
  border-radius: var(--radius-sm);
  /* 索引卡：米白卡纸 + 细横线 */
  background:
    repeating-linear-gradient(
      transparent 0 27px,
      rgb(109 83 53 / 0.14) 27px 28px
    ),
    linear-gradient(178deg, #f8f2e2 0%, #f1e7d0 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.8),
    0 6px 12px rgb(10 4 0 / 0.45);
  transform: rotate(var(--tilt, 0deg));
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

/* 悬浮：卡片被扶正并抬离桌面 */
.note:hover {
  transform: rotate(0deg) translateY(-3px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.8),
    0 14px 24px rgb(10 4 0 / 0.55);
}

.note:active {
  transform: rotate(0deg) translateY(-1px);
}

/* —— 左侧砖红页边线 —— */
.note::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 42px;
  width: 2px;
  background: var(--c-accent-2);
  opacity: 0.75;
}

/* —— 打孔（装订孔，微内凹） —— */
.note-holes {
  position: absolute;
  top: 50%;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transform: translateY(-50%);
}

.note-hole {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 40%, #241505 0%, #3a2614 70%);
  box-shadow:
    inset 0 1px 2px rgb(0 0 0 / 0.9),
    0 1px 0 rgb(255 255 255 / 0.75);
}

/* —— 文本区 —— */
.note-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.note-title {
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 700;
  color: var(--c-text);
  transition: color var(--transition);
  overflow-wrap: break-word;
}

.note:hover .note-title {
  color: var(--c-accent-2);
}

.note-desc {
  display: none;
  overflow: hidden;
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* —— 元信息 —— */
.note-meta {
  display: none;
  flex: none;
  align-items: center;
  gap: 10px;
}

.note-cat {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-muted);
  border: 1px dashed rgb(109 83 53 / 0.55);
  border-radius: 3px;
  background: rgb(255 255 255 / 0.42);
}

.note-date {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.05em;
  color: var(--c-muted);
  white-space: nowrap;
}

/* —— 箭头：墨水笔尖，hover 右移 —— */
.note-arrow {
  flex: none;
  font-family: var(--font-head);
  font-size: 20px;
  color: var(--c-accent-2);
  transition: transform var(--transition);
}

.note:hover .note-arrow {
  transform: translateX(5px);
}

/* —— 桌面端：显示摘要与元信息 —— */
@media (min-width: 768px) {
  .note-desc {
    display: block;
  }

  .note-meta {
    display: inline-flex;
  }
}

@media (prefers-reduced-motion: reduce) {
  .note,
  .note-title,
  .note-arrow {
    transition: none;
  }

  .note:hover {
    transform: rotate(var(--tilt, 0deg));
  }

  .note:hover .note-arrow {
    transform: none;
  }
}
</style>
