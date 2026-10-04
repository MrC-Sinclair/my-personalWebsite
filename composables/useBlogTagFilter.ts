/**
 * @file 博客标签筛选（useBlogFilters 的薄包装）
 * @description 绝大多数风格只需要「按标签筛选」这一个维度，这个包装只暴露标签
 *              相关的部分，风格组件不必关心分类维度的存在。
 *              两个维度都要用（分类切片 + 标签）的 dashboard 直接用 useBlogFilters。
 *
 * 行为实现全在共享层（useBlogFilters），风格层只负责长什么样。
 */

import type { MaybeRefOrGetter } from 'vue'
import type { BlogPost } from '~/types/blog'
import { useBlogFilters } from './useBlogFilters'

/** URL query 里承载标签的键名（与 useBlogFilters 一致） */
export const TAG_QUERY_KEY = 'tag'

/**
 * 标签筛选。传入文章数据源（ref / getter / 数组均可）。
 */
export function useBlogTagFilter(posts: MaybeRefOrGetter<BlogPost[]>) {
  const { tags, activeTag, hasFilter, filteredPosts, selectTag, clearFilters } =
    useBlogFilters(posts)

  return {
    /** 标签清单（含文章数，按文章数降序） */
    tags,
    /** 当前选中标签，空串表示未筛选 */
    activeTag,
    /** 处于筛选态（用于「清除筛选」按钮的显隐） */
    hasFilter,
    /** 过滤后的文章列表 */
    filteredPosts,
    /** 选中某个标签；传空串或当前标签 → 取消筛选（再次点击即取消） */
    select: selectTag,
    /** 清除标签筛选 */
    clear: clearFilters,
  }
}
