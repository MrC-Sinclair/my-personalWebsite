/**
 * @file 博客关键词搜索（业务层，全站唯一实现）
 * @description 承接「用户输入关键词 → 命中哪些文章 → 写回 URL」这一整条行为，
 *              风格层只负责输入框长什么样、放在哪里。
 *
 * 与标签/分类筛选的关系：**正交**。页面把标签筛选后的列表传进来，
 * 本 composable 只在其上再按关键词过滤，两者叠加取交集，
 * 无需任何一方知道对方的存在（`?tag=X&q=Y` 天然可分享）。
 *
 * 设计要点：
 * - URL 用 `?q=`，与标签筛选同款（不新增路由，预渲染页面量不变）；
 * - **SSG 守卫**：预渲染时 URL 上没有 query，产物 HTML 是「全量列表」。
 *   访客带 `?q=xxx` 打开时，客户端首次渲染若直接读 route.query，会渲染出
 *   「搜索后的列表」→ hydration mismatch。故 SSR 与客户端首次渲染都按
 *   「未搜索」处理，mount 之后再跟随 URL（同 useBlogFilters）；
 * - 输入即时生效、写 URL 防抖：输入框要跟手，但每次按键都 router.replace
 *   会刷出大量路由更新，故延后 300ms 落盘，定时器在 onUnmounted 清理；
 * - 匹配逻辑在 utils/search.ts（纯函数），这里只管状态与副作用。
 */

import { computed, onMounted, onUnmounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { BlogPost } from '~/types/blog'
import { filterPostsByQuery, tokenizeQuery } from '~/utils/search'
import { readStringQuery } from '~/utils/route'

/** URL query 里承载搜索词的键名 */
export const SEARCH_QUERY_KEY = 'q'

/** 写回 URL 的防抖时长（毫秒）：跟手与少写路由之间的折中 */
const URL_SYNC_DELAY = 300

/**
 * 关键词搜索。传入文章数据源（ref / getter / 数组均可，通常是标签筛选后的结果）。
 */
export function useBlogSearch(posts: MaybeRefOrGetter<BlogPost[]>) {
  const route = useRoute()
  const router = useRouter()

  const list = computed<BlogPost[]>(() => toValue(posts) ?? [])

  /** 是否已完成挂载（SSG hydration 守卫，见文件头说明） */
  const mounted = ref(false)
  onMounted(() => {
    mounted.value = true
    // 分享链接带 ?q= 时，挂载完成的这一刻就把 URL 上的词灌进输入框。
    // 不用 watch 等下一次 flush：那要等到微任务，首帧结果会慢一拍
    const fromUrl = readStringQuery(route.query, SEARCH_QUERY_KEY)
    if (fromUrl) query.value = fromUrl
  })

  /** 输入框的即时值：SSR 与客户端首次渲染均为空串 */
  const query = ref('')

  /** URL 上的搜索词（mount 前恒为空串，避免水合不一致） */
  const activeQuery = computed<string>(() =>
    mounted.value ? readStringQuery(route.query, SEARCH_QUERY_KEY) : '',
  )

  // 分享链接带 ?q= 时，mount 后把 URL 上的词灌进输入框（此时更新属正常响应式）
  watch(
    activeQuery,
    (value) => {
      if (value !== query.value) query.value = value
    },
    { immediate: true },
  )

  /** 命中的文章（空关键词返回原列表） */
  const results = computed<BlogPost[]>(() => filterPostsByQuery(list.value, query.value))

  /** 处于搜索态（关键词非空，用于清除按钮与结果计数的显隐） */
  const hasQuery = computed(() => tokenizeQuery(query.value).length > 0)
  /** 命中数量 */
  const resultCount = computed(() => results.value.length)
  /** 未搜索时的总数（结果计数「x / y」的分母） */
  const totalCount = computed(() => list.value.length)

  /** 写 URL：保留其他参数，覆盖/去掉 q。重建对象而非 delete（no-dynamic-delete） */
  function syncToUrl(value: string) {
    const next: Record<string, string> = {}
    for (const [key, val] of Object.entries(route.query ?? {})) {
      if (key !== SEARCH_QUERY_KEY && typeof val === 'string') next[key] = val
    }
    if (value) next[SEARCH_QUERY_KEY] = value
    router.replace({ query: next })
  }

  let timer: ReturnType<typeof setTimeout> | undefined

  /** 输入关键词：立即更新结果，防抖后写回 URL */
  function setQuery(value: string) {
    query.value = value
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => syncToUrl(value), URL_SYNC_DELAY)
  }

  /** 清除搜索：立即生效并立刻从 URL 去掉 q（取消待执行的防抖写入） */
  function clear() {
    if (timer) clearTimeout(timer)
    query.value = ''
    syncToUrl('')
  }

  // 资源成对清理：路由切换即卸载，残留定时器会往已消失的路由写 query
  onUnmounted(() => {
    if (timer) clearTimeout(timer)
  })

  return {
    /** 输入框当前值（受控：由页面传给搜索组件做 v-model 的源） */
    query,
    /** URL 上的搜索词（mount 前为空串） */
    activeQuery,
    /** 命中结果 */
    results,
    /** 是否处于搜索态 */
    hasQuery,
    /** 命中数量 */
    resultCount,
    /** 未搜索时的总数 */
    totalCount,
    /** 更新关键词（输入时调用） */
    setQuery,
    /** 清除搜索 */
    clear,
  }
}
