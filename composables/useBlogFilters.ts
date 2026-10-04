/**
 * @file 博客筛选（业务层，全站唯一实现）
 * @description 把「按标签 / 按分类筛选文章」的交互状态收敛到一处：
 *              候选清单、当前选中项、过滤后的列表，以及与 URL query 的双向同步。
 *
 * 两个维度是**正交**的：同时指定 `?tag=X&category=Y` 时取交集。
 * 只有 dashboard 风格同时用了两个维度（它的仪表盘本来就有分类切片面板），
 * 其余风格只用标签——用 `useBlogTagFilter` 这个只暴露标签部分的薄包装即可。
 *
 * 设计要点：
 * - 走 query 而不是新路由：见 utils/tags.ts 的说明，避免预渲染页面量翻倍；
 * - query 在 SSR 也能读到，因此筛选结果与首屏 HTML 一致，不会 hydration 不匹配；
 * - 切换用 router.replace：不堆历史记录，浏览器后退直接离开页面而不是逐个筛选回退。
 */

import { computed, onMounted, ref, toValue, type MaybeRefOrGetter } from 'vue'
import type { BlogPost } from '~/types/blog'
import {
  collectCategories,
  collectTags,
  filterPostsByCategory,
  filterPostsByTag,
  type CategoryCount,
  type TagCount,
} from '~/utils/tags'

/** URL query 里承载标签的键名 */
export const TAG_QUERY_KEY = 'tag'
/** URL query 里承载分类的键名 */
export const CATEGORY_QUERY_KEY = 'category'

/** 读取 query 里的字符串参数（多值只取第一个） */
function readQuery(query: Record<string, unknown> | undefined, key: string): string {
  const value = query?.[key]
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return ''
}

/**
 * 标签 + 分类筛选。传入文章数据源（ref / getter / 数组均可）。
 */
export function useBlogFilters(posts: MaybeRefOrGetter<BlogPost[]>) {
  const route = useRoute()
  const router = useRouter()

  const list = computed<BlogPost[]>(() => toValue(posts) ?? [])

  /**
   * 是否已完成挂载。
   * ------------------------------------------------------------
   * SSG 场景下必须靠它把关：预渲染时 URL 上没有 query，产物 HTML 是「全量列表」；
   * 访客带 `?tag=xxx` 打开时，客户端首次渲染若直接读 route.query，会渲染出
   * 「过滤后的列表」，与 SSR HTML 结构不一致 → hydration mismatch。
   * 因此 SSR 与客户端首次渲染都按「未筛选」处理，mount 之后再跟随 query，
   * 这属于正常响应式更新；SEO 看到的也仍是全量列表。
   */
  const mounted = ref(false)
  onMounted(() => {
    mounted.value = true
  })

  const activeTag = computed<string>(() =>
    mounted.value ? readQuery(route.query, TAG_QUERY_KEY) : '',
  )
  const activeCategory = computed<string>(() =>
    mounted.value ? readQuery(route.query, CATEGORY_QUERY_KEY) : '',
  )

  /** 标签清单（按文章数降序） */
  const tags = computed<TagCount[]>(() => collectTags(list.value))
  /** 分类清单（按文章数降序） */
  const categories = computed<CategoryCount[]>(() => collectCategories(list.value))

  const hasFilter = computed(() => activeTag.value !== '' || activeCategory.value !== '')

  /** 两个维度取交集后的文章列表 */
  const filteredPosts = computed<BlogPost[]>(() =>
    filterPostsByCategory(filterPostsByTag(list.value, activeTag.value), activeCategory.value),
  )

  /**
   * 写入 query：保留其他已有参数，覆盖/去掉对应的键。
   * 用「重建对象」而不是 delete——ESLint 的 no-dynamic-delete 禁止删除
   * 动态计算的属性键，重建也让 query 的顺序稳定可预期。
   */
  function apply(key: string, value: string) {
    const query: Record<string, string> = {}
    for (const [k, v] of Object.entries(route.query ?? {})) {
      if (k !== key && typeof v === 'string') query[k] = v
    }
    if (value) query[key] = value
    router.replace({ query })
  }

  /** 选中标签；传空串或当前标签 → 取消该维度的筛选（再次点击即取消） */
  function selectTag(tag: string) {
    apply(TAG_QUERY_KEY, tag && tag !== activeTag.value ? tag : '')
  }

  /** 选中分类；传空串或当前分类 → 取消该维度的筛选 */
  function selectCategory(category: string) {
    apply(
      CATEGORY_QUERY_KEY,
      category && category !== activeCategory.value ? category : '',
    )
  }

  function clearFilters() {
    const query: Record<string, string> = {}
    for (const [k, v] of Object.entries(route.query ?? {})) {
      if (k !== TAG_QUERY_KEY && k !== CATEGORY_QUERY_KEY && typeof v === 'string') query[k] = v
    }
    router.replace({ query })
  }

  return {
    tags,
    categories,
    activeTag,
    activeCategory,
    hasFilter,
    filteredPosts,
    selectTag,
    selectCategory,
    clearFilters,
  }
}
