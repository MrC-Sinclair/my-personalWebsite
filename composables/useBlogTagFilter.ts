/**
 * @file 博客标签筛选（业务层，全站唯一实现）
 * @description 把「按标签筛选文章」的交互状态收敛到一处：标签清单、当前选中标签、
 *              过滤后的列表，以及与 URL query（?tag=xxx）的双向同步。
 *
 * 设计要点：
 * - 走 query 而不是新路由：见 utils/tags.ts 的说明，避免预渲染页面量翻倍；
 * - query 是 SSR 也能读到的（route.query 在服务端有值），因此筛选结果
 *   在首屏 HTML 与客户端一致，不会有 hydration 不匹配；
 * - 切换用 router.replace：不堆历史记录，浏览器后退直接离开页面而不是逐个标签回退。
 *
 * 风格层只负责长什么样（标签栏的视觉），筛选行为本身不进风格组件。
 */

import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { BlogPost } from '~/types/blog'
import { collectTags, filterPostsByTag, type TagCount } from '~/utils/tags'

/** URL query 里承载标签的键名 */
export const TAG_QUERY_KEY = 'tag'

/**
 * 标签筛选。传入文章数据源（ref / getter / 数组均可）。
 */
export function useBlogTagFilter(posts: MaybeRefOrGetter<BlogPost[]>) {
  const route = useRoute()
  const router = useRouter()

  const list = computed<BlogPost[]>(() => toValue(posts) ?? [])

  /** 全部标签（按文章数降序） */
  const tags = computed<TagCount[]>(() => collectTags(list.value))

  /** 当前选中的标签；空串表示未筛选 */
  const activeTag = computed<string>(() => {
    const value = route.query?.[TAG_QUERY_KEY]
    return typeof value === 'string' ? value : ''
  })

  /** 处于筛选态（用于「清除筛选」按钮的显隐） */
  const hasFilter = computed(() => activeTag.value !== '')

  /** 过滤后的文章列表 */
  const filteredPosts = computed<BlogPost[]>(() =>
    filterPostsByTag(list.value, activeTag.value),
  )

  /**
   * 写入 query：保留其他已有参数，覆盖/去掉 tag。
   * 用「重建对象」而不是 delete——ESLint 的 no-dynamic-delete 禁止删除
   * 动态计算的属性键，重建也让 query 的顺序稳定可预期。
   */
  function applyTag(tag: string) {
    const query: Record<string, string> = {}
    for (const [key, value] of Object.entries(route.query ?? {})) {
      if (key !== TAG_QUERY_KEY && typeof value === 'string') query[key] = value
    }
    if (tag) query[TAG_QUERY_KEY] = tag
    router.replace({ query })
  }

  /** 选中某个标签；传空串或当前标签 → 取消筛选（再次点击即取消） */
  function select(tag: string) {
    applyTag(tag && tag !== activeTag.value ? tag : '')
  }

  function clear() {
    applyTag('')
  }

  return { tags, activeTag, hasFilter, filteredPosts, select, clear, applyTag }
}
