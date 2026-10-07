/**
 * useBlogSearch 单元测试
 * ------------------------------------------------------------
 * 这是「输入关键词 → 命中结果 → 写回 URL」的全站唯一实现。
 * 风格层只负责输入框长什么样，因此这里测行为不测外观。
 * 环境无 Nuxt 自动导入，用 stubGlobal 注入 useRoute / useRouter
 * （同 useBlogTagFilter 的测法；route 必须是响应式的）。
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, effectScope, h, reactive, ref } from 'vue'
import { mount } from '@vue/test-utils'
import type { BlogPost } from '~/types/blog'
import { useBlogSearch } from '~/composables/useBlogSearch'

function post(title: string, description = ''): BlogPost {
  return { title, description, date: '2026-01-01', tags: [], draft: false, path: `/blog/zh/${title}` }
}

const posts = [
  post('Vue 性能优化', '长列表渲染'),
  post('Nuxt 内容管理', '组件组织'),
  post('PostgreSQL 索引', '查询计划'),
]

let route: { query: Record<string, string> }
let replaceCalls: Array<{ query: Record<string, string> }>

/** 挂载宿主组件，暴露 composable 的全部返回值 */
function mountSearch(source: Array<BlogPost> | (() => BlogPost[]) = posts) {
  const Harness = defineComponent({
    setup() {
      const search = useBlogSearch(typeof source === 'function' ? source : ref(source))
      return { ...search }
    },
    render: () => h('div'),
  })
  return mount(Harness)
}

describe('useBlogSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    route = reactive({ query: {} as Record<string, string> })
    replaceCalls = []
    vi.stubGlobal('useRoute', () => route)
    vi.stubGlobal('useRouter', () => ({
      replace: (arg: { query: Record<string, string> }) => replaceCalls.push(arg),
    }))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('初始未搜索：结果等于原列表，计数正确', () => {
    const wrapper = mountSearch()
    expect(wrapper.vm.query).toBe('')
    expect(wrapper.vm.hasQuery).toBe(false)
    expect(wrapper.vm.results).toHaveLength(3)
    expect(wrapper.vm.resultCount).toBe(3)
    expect(wrapper.vm.totalCount).toBe(3)
  })

  it('输入关键词立即过滤结果（输入跟手，不等防抖）', () => {
    const wrapper = mountSearch()
    wrapper.vm.setQuery('vue')
    expect(wrapper.vm.hasQuery).toBe(true)
    expect(wrapper.vm.results.map((p) => p.title)).toEqual(['Vue 性能优化'])
    // 尚未到防抖时间，URL 还没写
    expect(replaceCalls).toHaveLength(0)
  })

  it('★ 防抖到点后把关键词写进 ?q=', () => {
    const wrapper = mountSearch()
    wrapper.vm.setQuery('vue')
    vi.advanceTimersByTime(300)
    expect(replaceCalls).toEqual([{ query: { q: 'vue' } }])
  })

  it('连续输入只在最后一次写 URL（防抖生效）', () => {
    const wrapper = mountSearch()
    wrapper.vm.setQuery('v')
    wrapper.vm.setQuery('vu')
    wrapper.vm.setQuery('vue')
    vi.advanceTimersByTime(300)
    expect(replaceCalls).toEqual([{ query: { q: 'vue' } }])
  })

  it('写入 q 时保留其他 query 参数（与标签筛选共存）', () => {
    route.query = { tag: '前端' }
    const wrapper = mountSearch()
    wrapper.vm.setQuery('vue')
    vi.advanceTimersByTime(300)
    expect(replaceCalls[0].query).toEqual({ tag: '前端', q: 'vue' })
  })

  it('clear 立即清空并立刻从 URL 去掉 q', () => {
    const wrapper = mountSearch()
    wrapper.vm.setQuery('vue')
    wrapper.vm.clear()
    expect(wrapper.vm.query).toBe('')
    expect(wrapper.vm.results).toHaveLength(3)
    expect(replaceCalls).toEqual([{ query: {} }])
    // 已清理定时器：再推进时间不应产生补写
    vi.advanceTimersByTime(1000)
    expect(replaceCalls).toHaveLength(1)
  })

  it('★ 挂载前不跟随 URL 上的 ?q=（避免 SSG hydration 不匹配）', () => {
    route.query = { q: 'vue' }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const scope = effectScope()
    const search = scope.run(() => useBlogSearch(posts))!
    expect(search.query.value).toBe('')
    expect(search.results.value).toHaveLength(3)
    scope.stop()
    warn.mockRestore()
  })

  it('挂载后跟随 URL 上的 ?q=（分享链接可读）', () => {
    route.query = { q: 'postgres' }
    const wrapper = mountSearch()
    // mount 后 activeQuery 生效并灌入输入框
    expect(wrapper.vm.query).toBe('postgres')
    expect(wrapper.vm.results.map((p) => p.title)).toEqual(['PostgreSQL 索引'])
  })

  it('卸载后防抖定时器被清理（不往已消失的路由写）', () => {
    const wrapper = mountSearch()
    wrapper.vm.setQuery('vue')
    wrapper.unmount()
    vi.advanceTimersByTime(1000)
    expect(replaceCalls).toHaveLength(0)
  })

  it('数据源是 getter 时也能跟随更新', () => {
    const source = ref<BlogPost[]>([post('Vue 性能优化')])
    const wrapper = mountSearch(() => source.value)
    wrapper.vm.setQuery('postgres')
    expect(wrapper.vm.results).toHaveLength(0)
    source.value = posts
    expect(wrapper.vm.results).toHaveLength(1)
  })
})
