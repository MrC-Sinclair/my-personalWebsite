/**
 * useBlogTagFilter 单元测试
 * ------------------------------------------------------------
 * 这是「按标签筛选」的全站唯一实现：标签清单、?tag= 同步、过滤后的列表。
 * 风格层只负责长什么样，因此这里测的是行为而不是外观。
 *
 * 测试环境没有 Nuxt 的自动导入（useRoute / useRouter），用 stubGlobal 注入：
 * 未声明的标识符会回退到全局对象查找，因此组件里写的 useRoute() 能拿到 stub。
 * route 必须是**响应式**的（reactive），否则 computed 不会随 query 变化重算。
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { defineComponent, h, reactive, ref } from 'vue'
import { mount } from '@vue/test-utils'
import type { BlogPost } from '~/types/blog'
import { useBlogTagFilter } from '~/composables/useBlogTagFilter'

function post(title: string, tags: string[]): BlogPost {
  return { title, date: '2026-01-01', tags, draft: false, path: `/blog/zh/${title}` }
}

const posts = [post('a', ['AI']), post('b', ['前端']), post('c', ['AI', '前端'])]

let route: { query: Record<string, string> }
let replaceCalls: Array<{ query: Record<string, string> }>

/** 挂载宿主组件，暴露 composable 的全部返回值 */
function mountFilter(source: Array<BlogPost> | (() => BlogPost[]) = posts) {
  const Harness = defineComponent({
    setup() {
      const filter = useBlogTagFilter(typeof source === 'function' ? source : ref(source))
      return { ...filter }
    },
    render: () => h('div'),
  })
  return mount(Harness)
}

describe('useBlogTagFilter', () => {
  beforeEach(() => {
    route = reactive({ query: {} as Record<string, string> })
    replaceCalls = []
    vi.stubGlobal('useRoute', () => route)
    vi.stubGlobal('useRouter', () => ({
      replace: (arg: { query: Record<string, string> }) => replaceCalls.push(arg),
    }))
  })

  it('未带 ?tag= 时不筛选，列表原样返回', () => {
    const wrapper = mountFilter()
    expect(wrapper.vm.activeTag).toBe('')
    expect(wrapper.vm.hasFilter).toBe(false)
    expect(wrapper.vm.filteredPosts).toHaveLength(3)
  })

  it('标签清单含计数，按文章数降序', () => {
    const wrapper = mountFilter()
    expect(wrapper.vm.tags).toEqual([
      { tag: 'AI', count: 2 },
      { tag: '前端', count: 2 },
    ])
  })

  it('URL 带 ?tag=AI 时只返回带该标签的文章', () => {
    route.query = { tag: 'AI' }
    const wrapper = mountFilter()
    expect(wrapper.vm.activeTag).toBe('AI')
    expect(wrapper.vm.hasFilter).toBe(true)
    expect(wrapper.vm.filteredPosts.map((p) => p.title)).toEqual(['a', 'c'])
  })

  it('query 变化后筛选结果跟着变（响应式）', () => {
    const wrapper = mountFilter()
    expect(wrapper.vm.filteredPosts).toHaveLength(3)
    route.query = { tag: '前端' }
    expect(wrapper.vm.activeTag).toBe('前端')
    expect(wrapper.vm.filteredPosts.map((p) => p.title)).toEqual(['b', 'c'])
  })

  it('选中标签写入 query', () => {
    const wrapper = mountFilter()
    wrapper.vm.select('AI')
    expect(replaceCalls).toEqual([{ query: { tag: 'AI' } }])
  })

  it('再次点击同一标签 = 取消筛选', () => {
    route.query = { tag: 'AI' }
    const wrapper = mountFilter()
    wrapper.vm.select('AI')
    expect(replaceCalls).toEqual([{ query: {} }])
  })

  it('clear 移除 tag 参数', () => {
    route.query = { tag: 'AI' }
    const wrapper = mountFilter()
    wrapper.vm.clear()
    expect(replaceCalls).toEqual([{ query: {} }])
  })

  it('写入 tag 时保留其他 query 参数', () => {
    route.query = { page: '2' }
    const wrapper = mountFilter()
    wrapper.vm.select('AI')
    expect(replaceCalls[0].query).toEqual({ page: '2', tag: 'AI' })
  })

  it('数据源是 getter 时也能跟随更新', () => {
    const source = ref<BlogPost[]>([post('x', ['AI'])])
    const wrapper = mountFilter(() => source.value)
    expect(wrapper.vm.filteredPosts).toHaveLength(1)
    source.value = posts
    expect(wrapper.vm.filteredPosts).toHaveLength(3)
  })
})
