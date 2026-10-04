/**
 * useBlogFilters 单元测试（标签 + 分类双维度）
 * ------------------------------------------------------------
 * 这个 composable 是 dashboard 风格那条「分类筛选」从页面里抽出来之后的归宿：
 * 原先 dashboard 把 activeCategory / 分类统计 / 过滤全写在自己的 blog 页里，
 * 属于「业务逻辑写死在风格组件」的违规。抽到共享层后，这里守住三个行为：
 *   1. 两个维度**正交**（同时指定取交集），不是一个覆盖另一个；
 *   2. 任一维度都能通过「再点一次」取消；
 *   3. clearFilters 一次清掉两个维度，且保留无关 query。
 *
 * 测试环境没有 Nuxt 的 useRoute / useRouter，用 stubGlobal 注入（未声明的标识符
 * 会回退到全局对象查找）。route 必须是响应式的，否则 computed 不会重算。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, effectScope, h, reactive, ref } from 'vue'
import { mount } from '@vue/test-utils'
import type { BlogPost } from '~/types/blog'
import { useBlogFilters } from '~/composables/useBlogFilters'
import { collectCategories, filterPostsByCategory } from '~/utils/tags'

function post(title: string, tags: string[], category?: string): BlogPost {
  return { title, date: '2026-01-01', tags, draft: false, path: `/blog/zh/${title}`, category }
}

const posts = [
  post('a', ['AI'], '前端'),
  post('b', ['前端'], '前端'),
  post('c', ['AI', '前端'], '工程'),
  post('d', [], '工程'),
]

let route: { query: Record<string, string> }
let replaceCalls: Array<{ query: Record<string, string> }>

function mountFilters() {
  const Harness = defineComponent({
    setup() {
      const filters = useBlogFilters(ref(posts))
      return { ...filters }
    },
    render: () => h('div'),
  })
  return mount(Harness)
}

describe('collectCategories / filterPostsByCategory', () => {
  it('按文章数降序聚合，忽略空分类', () => {
    // 同为 2 篇时按码位字典序：'前'(0x524D) < '工'(0x5DE5)
    expect(collectCategories(posts)).toEqual([
      { label: '前端', count: 2 },
      { label: '工程', count: 2 },
    ])
  })

  it('空 category 表示未筛选', () => {
    expect(filterPostsByCategory(posts, '')).toBe(posts)
  })

  it('按分类过滤', () => {
    expect(filterPostsByCategory(posts, '工程').map((p) => p.title)).toEqual(['c', 'd'])
  })
})

describe('useBlogFilters', () => {
  beforeEach(() => {
    route = reactive({ query: {} as Record<string, string> })
    replaceCalls = []
    vi.stubGlobal('useRoute', () => route)
    vi.stubGlobal('useRouter', () => ({
      replace: (arg: { query: Record<string, string> }) => replaceCalls.push(arg),
    }))
  })

  it('未带 query 时两个维度都不筛选', () => {
    const wrapper = mountFilters()
    expect(wrapper.vm.activeTag).toBe('')
    expect(wrapper.vm.activeCategory).toBe('')
    expect(wrapper.vm.filteredPosts).toHaveLength(4)
  })

  it('★ 两个维度正交：同时指定时取交集', () => {
    route.query = { tag: 'AI', category: '前端' }
    const wrapper = mountFilters()
    expect(wrapper.vm.filteredPosts.map((p) => p.title)).toEqual(['a'])
  })

  it('只指定分类时按分类过滤', () => {
    route.query = { category: '工程' }
    const wrapper = mountFilters()
    expect(wrapper.vm.activeCategory).toBe('工程')
    expect(wrapper.vm.filteredPosts.map((p) => p.title)).toEqual(['c', 'd'])
  })

  it('分类维度：再次点击同一分类即取消', () => {
    route.query = { category: '工程' }
    const wrapper = mountFilters()
    wrapper.vm.selectCategory('工程')
    expect(replaceCalls).toEqual([{ query: {} }])
  })

  it('选中分类时不影响已选标签（只改自己的键）', () => {
    route.query = { tag: 'AI' }
    const wrapper = mountFilters()
    wrapper.vm.selectCategory('前端')
    expect(replaceCalls[0].query).toEqual({ tag: 'AI', category: '前端' })
  })

  it('clearFilters 一次清掉两个维度并保留其他参数', () => {
    route.query = { tag: 'AI', category: '前端', page: '2' }
    const wrapper = mountFilters()
    wrapper.vm.clearFilters()
    expect(replaceCalls).toEqual([{ query: { page: '2' } }])
  })

  it('★ 挂载前不跟随 query（SSG 下避免 hydration 不匹配）', () => {
    route.query = { tag: 'AI', category: '前端' }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const scope = effectScope()
    const filters = scope.run(() => useBlogFilters(ref(posts)))!
    expect(filters.activeTag.value).toBe('')
    expect(filters.activeCategory.value).toBe('')
    expect(filters.filteredPosts.value).toHaveLength(4)
    scope.stop()
    warn.mockRestore()
  })
})
