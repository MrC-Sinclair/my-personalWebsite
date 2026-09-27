/**
 * @file 博客标签聚合（纯函数）
 * @description 标签云 / 标签筛选的取数逻辑，全站唯一实现。
 *
 * 为什么不放路由（/style/<id>/blog/tag/<tag>）：20 个风格 × 约 30 个标签 × 2 语言
 * 会让预渲染页面量翻倍（802 → 数千），且每个风格都要多一个页面组件。
 * 改为在 blog 子页内做客户端筛选，用 URL query（?tag=xxx）保持可分享、
 * 可前进后退，零新增预渲染页面。
 *
 * 排序稳定性：同频次的标签按「码位字典序」比较，不用 localeCompare——
 * 后者依赖 ICU，SSR（Node）与浏览器可能给出不同顺序，会造成 hydration 不一致。
 */

import type { BlogPost } from '~/types/blog'

/** 标签及其文章数 */
export interface TagCount {
  tag: string
  count: number
}

/** 取一篇文章的标签数组（防御脏数据：非数组、非字符串都过滤掉） */
function tagsOf(post: BlogPost): string[] {
  if (!Array.isArray(post.tags)) return []
  return post.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim() !== '')
}

/**
 * 聚合全部标签及文章数。
 * 排序：文章数降序 → 同数量按字典序（稳定、跨环境一致）。
 */
export function collectTags(posts: BlogPost[]): TagCount[] {
  const counter = new Map<string, number>()
  for (const post of posts) {
    for (const tag of tagsOf(post)) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1)
    }
  }
  return [...counter.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => (b.count - a.count) || (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0))
}

/**
 * 按标签过滤文章。tag 为空串 / 空值时返回原列表（未筛选状态）。
 * 命中「标签不存在」时返回空数组——调用方据此显示空状态。
 */
export function filterPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  if (!tag) return posts
  return posts.filter((post) => tagsOf(post).includes(tag))
}

/** 某个标签下的文章数（标签栏角标用） */
export function countPostsWithTag(posts: BlogPost[], tag: string): number {
  if (!tag) return posts.length
  return filterPostsByTag(posts, tag).length
}
