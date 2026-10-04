/**
 * useBlog 单元测试（内容层）
 * ------------------------------------------------------------
 * 这是全站博客列表/详情的唯一取数入口，20 个风格都靠它。这里守住的几点：
 *   1. draft 必须被排除（草稿不能出现在任何前台列表）；
 *   2. 取数走 `.order('date','DESC')` —— 排序交给 content，不在 composable 里重排；
 *   3. 语言切换必须让缓存失效（否则切到英文还是中文列表）；
 *   4. 取数失败时返回空数组而不是抛出（页面仍要能渲染空状态）。
 *
 * 环境：没有 Nuxt 的 useI18n / queryCollection，用 stubGlobal 注入。
 * queryCollection 的 mock 记录调用参数，并模拟 content 的 order/path 链式 API。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useBlog } from '~/composables/useBlog'

/** 假数据只需覆盖 schema 里用得到的字段 */
interface FakePost {
  title: string
  date: string
  draft: boolean
  path: string
  tags: string[]
  category?: string
  description?: string
}

const ZH: FakePost[] = [
  {
    title: '新',
    date: '2026-03-02',
    draft: false,
    path: '/blog/zh/new',
    tags: ['AI', '前端'],
    category: '前端',
    description: '新文',
  },
  {
    title: '旧',
    date: '2025-01-01',
    draft: false,
    path: '/blog/zh/old',
    tags: ['前端'],
    category: '前端',
  },
  {
    title: '草稿',
    date: '2026-09-09',
    draft: true,
    path: '/blog/zh/draft',
    tags: ['AI'],
  },
]

const EN: FakePost[] = [
  { title: 'New', date: '2026-03-02', draft: false, path: '/blog/en/new', tags: ['AI'] },
]

const collections: Record<string, FakePost[]> = { blogZh: ZH, blogEn: EN }

let orderCalls: Array<[string, string]>
let pathCalls: string[]
let locale: ReturnType<typeof ref<string>>

function mountBlog() {
  const Harness = defineComponent({
    setup() {
      const blog = useBlog()
      return { ...blog }
    },
    render: () => h('div'),
  })
  return mount(Harness)
}

describe('useBlog', () => {
  beforeEach(() => {
    orderCalls = []
    pathCalls = []
    locale = ref('zh')

    vi.stubGlobal('useI18n', () => ({ locale }))
    vi.stubGlobal('queryCollection', (name: string) => ({
      order: (field: string, direction: string) => {
        orderCalls.push([field, direction])
        return { all: async () => [...(collections[name] ?? [])] }
      },
      path: (value: string) => {
        pathCalls.push(value)
        return {
          first: async () => (collections[name] ?? []).find((item) => item.path === value) ?? null,
        }
      },
    }))
  })

  it('★ 排除 draft，且按日期倒序取数', async () => {
    const wrapper = mountBlog()
    const posts = await wrapper.vm.getAllPosts()
    expect(posts.map((p) => p.title)).toEqual(['新', '旧'])
    expect(orderCalls).toEqual([['date', 'DESC']])
  })

  it('同一语言下复用缓存（不重复请求）', async () => {
    const wrapper = mountBlog()
    await wrapper.vm.getAllPosts()
    await wrapper.vm.getAllPosts()
    expect(orderCalls).toHaveLength(1)
  })

  it('★ 切换语言后缓存失效，改读英文 collection', async () => {
    const wrapper = mountBlog()
    expect((await wrapper.vm.getAllPosts()).map((p) => p.title)).toEqual(['新', '旧'])
    locale.value = 'en'
    await wrapper.vm.$nextTick()
    expect((await wrapper.vm.getAllPosts()).map((p) => p.title)).toEqual(['New'])
    expect(orderCalls).toHaveLength(2)
  })

  it('按 slug 取详情时拼对内容路径', async () => {
    const wrapper = mountBlog()
    const { post } = await wrapper.vm.getPostBySlug('new')
    expect(post?.title).toBe('新')
    expect(pathCalls).toEqual(['/blog/zh/new'])
  })

  it('取不到的详情返回 null（调用方据此抛 404）', async () => {
    const wrapper = mountBlog()
    const { post, content } = await wrapper.vm.getPostBySlug('nope')
    expect(post).toBeNull()
    expect(content).toBeNull()
  })

  it('上下篇按列表顺序取相邻项', async () => {
    const wrapper = mountBlog()
    expect(await wrapper.vm.getPostNeighbors('/blog/zh/old')).toMatchObject({
      prev: { title: '新' },
      next: null,
    })
  })

  it('不在列表中的路径没有上下篇', async () => {
    const wrapper = mountBlog()
    expect(await wrapper.vm.getPostNeighbors('/blog/zh/nope')).toEqual({ prev: null, next: null })
  })

  it('标签清单去重并排序', async () => {
    const wrapper = mountBlog()
    expect(await wrapper.vm.getAllTags()).toEqual(['AI', '前端'])
  })

  it('分类清单去重', async () => {
    const wrapper = mountBlog()
    expect(await wrapper.vm.getAllCategories()).toEqual(['前端'])
  })

  it('分页：按页取片并返回总数与总页数', async () => {
    const wrapper = mountBlog()
    const result = await wrapper.vm.getPaginatedPosts({ page: 2, pageSize: 1 })
    expect(result).toMatchObject({ total: 2, page: 2, pageSize: 1, totalPages: 2 })
    expect(result.posts.map((p) => p.title)).toEqual(['旧'])
  })

  it('★ 取数抛错时返回空数组（页面仍要能渲染空状态）', async () => {
    vi.stubGlobal('queryCollection', () => ({
      order: () => ({ all: async () => Promise.reject(new Error('boom')) }),
      path: () => ({ first: async () => null }),
    }))
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mountBlog()
    expect(await wrapper.vm.getAllPosts()).toEqual([])
    error.mockRestore()
  })
})
