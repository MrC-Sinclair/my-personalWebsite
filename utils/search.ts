/**
 * @file 博客搜索匹配（纯函数，全站唯一实现）
 * @description 把「输入关键词 → 命中哪些文章」的匹配逻辑收敛到一处，
 *              风格层只负责输入框长什么样、放在哪里。
 *
 * 设计取舍：
 * - **匹配范围**：标题、摘要、分类、标签、slug。不搜 Markdown 正文——列表数据
 *   （BlogPost）里没有 body，正文只在详情页加载，拿它做搜索会得到「列表搜不到、
 *   详情页却能搜到」的错位结果；
 * - **关键词关系**：AND。多关键词（空格分隔）必须全部命中，符合搜索直觉；
 *   中文无空格，整段即一个关键词，行为一致；
 * - **排序**：标题命中优先（全命中 > 部分命中 > 仅正文/标签命中），同档保持
 *   原有顺序（日期序），不引入新的排序维度；
 * - **空查询**：返回原列表，与 filterPostsByTag 的「未筛选」语义一致；
 * - 大小写不敏感、跨环境一致：只用 toLowerCase，不用 localeCompare / toLocaleLowerCase
 *   （ICU 差异会造成 SSR 与客户端结果不一致）。
 */

import type { BlogPost } from '~/types/blog'
import { contentSlug } from './content'

/** 归一化：小写 + 去首尾空白（脏数据返回空串，不抛错） */
export function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.toLowerCase().trim() : ''
}

/** 把查询串切成关键词数组（按空白切分；中文无空格，整段即一个词） */
export function tokenizeQuery(query: unknown): string[] {
  return normalizeText(query)
    .split(/\s+/)
    .filter((token) => token !== '')
}

/** 一篇文章的检索文本（标题 + 摘要 + 分类 + 标签 + slug），已归一化 */
function haystackOf(post: BlogPost): string {
  const parts = [
    post.title,
    post.description,
    post.category,
    Array.isArray(post.tags) ? post.tags.join(' ') : '',
    contentSlug(post.path),
  ]
  return normalizeText(parts.filter((part) => typeof part === 'string').join(' '))
}

/**
 * 标题命中权重：全部关键词命中标题 → 2；部分命中 → 1；未命中 → 0。
 * 只用于排序，不用于过滤（过滤由 haystack 决定）。
 */
function titleScore(post: BlogPost, tokens: string[]): number {
  const title = normalizeText(post.title)
  if (tokens.every((token) => title.includes(token))) return 2
  if (tokens.some((token) => title.includes(token))) return 1
  return 0
}

/**
 * 按关键词过滤文章。
 *
 * @param posts - 候选文章（调用方传入的当前列表，通常是标签/分类筛选后的结果）
 * @param query - 查询串；空串 / 空值返回原列表
 * @returns 命中的文章，标题命中优先、同档保持原顺序
 */
export function filterPostsByQuery(posts: BlogPost[], query: unknown): BlogPost[] {
  const tokens = tokenizeQuery(query)
  if (tokens.length === 0) return posts

  return posts
    .map((post, index) => ({ post, index, hay: haystackOf(post) }))
    .filter(({ hay }) => tokens.every((token) => hay.includes(token)))
    .sort((a, b) => {
      const diff = titleScore(b.post, tokens) - titleScore(a.post, tokens)
      // 同档保持原有顺序（index 参与比较，结果稳定且与日期序一致）
      return diff !== 0 ? diff : a.index - b.index
    })
    .map(({ post }) => post)
}

/** 命中数量（搜索框的结果计数用；空查询返回总数） */
export function countPostsMatchingQuery(posts: BlogPost[], query: unknown): number {
  return filterPostsByQuery(posts, query).length
}
