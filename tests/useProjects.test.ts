/**
 * useProjects 单元测试（内容层）
 * ------------------------------------------------------------
 * 与 useBlog 同构，差异点在这里单独守住：
 *   1. project schema **没有 draft 字段**（博客有），不要想当然地过滤；
 *   2. featured 才进「精选」，并受 limit 限制；
 *   3. 取数失败返回空数组（项目列表页同样要能渲染空状态）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useProjects } from '~/composables/useProjects'

interface FakeProject {
  title: string
  date: string
  path: string
  tags: string[]
  featured: boolean
  demoUrl?: string
  githubUrl?: string
}

const ZH: FakeProject[] = [
  {
    title: '本站',
    date: '2026-05-01',
    path: '/projects/zh/site',
    tags: ['Nuxt'],
    featured: true,
    githubUrl: 'https://github.com/x/y',
  },
  {
    title: '小工具',
    date: '2025-02-02',
    path: '/projects/zh/tool',
    tags: ['Vue'],
    featured: false,
  },
]

const collections: Record<string, FakeProject[]> = { projectsZh: ZH, projectsEn: [] }

let locale: ReturnType<typeof ref<string>>

function mountProjects() {
  const Harness = defineComponent({
    setup() {
      const projects = useProjects()
      return { ...projects }
    },
    render: () => h('div'),
  })
  return mount(Harness)
}

describe('useProjects', () => {
  beforeEach(() => {
    locale = ref('zh')
    vi.stubGlobal('useI18n', () => ({ locale }))
    vi.stubGlobal('queryCollection', (name: string) => ({
      order: () => ({ all: async () => [...(collections[name] ?? [])] }),
      path: (value: string) => ({
        first: async () => (collections[name] ?? []).find((item) => item.path === value) ?? null,
      }),
    }))
  })

  it('映射字段并保留顺序（project 无 draft，不做过滤）', async () => {
    const wrapper = mountProjects()
    const projects = await wrapper.vm.getAllProjects()
    expect(projects.map((p) => p.title)).toEqual(['本站', '小工具'])
    expect(projects[0]).toMatchObject({ featured: true, githubUrl: 'https://github.com/x/y' })
  })

  it('精选只取 featured，且受 limit 限制', async () => {
    const wrapper = mountProjects()
    expect((await wrapper.vm.getFeaturedProjects(1)).map((p) => p.title)).toEqual(['本站'])
  })

  it('按 slug 取详情时拼对内容路径', async () => {
    const wrapper = mountProjects()
    const { project } = await wrapper.vm.getProjectBySlug('site')
    expect(project?.title).toBe('本站')
  })

  it('上下篇按列表顺序取相邻项', async () => {
    const wrapper = mountProjects()
    expect(await wrapper.vm.getProjectNeighbors('/projects/zh/site')).toMatchObject({
      prev: null,
      next: { title: '小工具' },
    })
  })

  it('切换语言后改读英文 collection', async () => {
    const wrapper = mountProjects()
    expect(await wrapper.vm.getAllProjects()).toHaveLength(2)
    locale.value = 'en'
    await wrapper.vm.$nextTick()
    expect(await wrapper.vm.getAllProjects()).toHaveLength(0)
  })

  it('★ 取数抛错时返回空数组', async () => {
    vi.stubGlobal('queryCollection', () => ({
      order: () => ({ all: async () => Promise.reject(new Error('boom')) }),
      path: () => ({ first: async () => null }),
    }))
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mountProjects()
    expect(await wrapper.vm.getAllProjects()).toEqual([])
    error.mockRestore()
  })
})
