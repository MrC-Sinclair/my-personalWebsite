/**
 * 详情页面包屑测试
 * ------------------------------------------------------------
 * 分两层测：
 * 1. utils/breadcrumb.ts 的纯函数（层级与路径拼装）
 * 2. composables/useDetailBreadcrumb.ts（i18n 文案与语言前缀注入）
 *
 * composable 依赖 Nuxt 自动导入，用 stubGlobal 注入（同 useBlogSearch 的测法）。
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { computed, defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import type { DetailView } from '~/types/detail'
import { buildDetailBreadcrumb } from '~/utils/breadcrumb'
import { useDetailBreadcrumb } from '~/composables/useDetailBreadcrumb'

/** i18n 取值表：只用得上这三个 key */
const labels: Record<string, string> = {
  'common.home': '首页',
  'blog.breadcrumb': '博客',
  'projects.breadcrumb': '项目',
}

function view(kind: DetailView['kind'], title = '某篇文章'): DetailView {
  const doc =
    kind === 'post'
      ? { title, description: '', date: '2026-01-01', tags: [], draft: false, path: `/blog/zh/${title}` }
      : { title, description: '', date: '2026-01-01', tags: [], draft: false, path: `/projects/zh/${title}` }
  return { kind, doc, content: null, prev: null, next: null } as DetailView
}

describe('buildDetailBreadcrumb（纯函数）', () => {
  it('文章：三级，末级是当前标题且不带 to', () => {
    const items = buildDetailBreadcrumb({
      kind: 'post',
      title: 'Vue 性能优化',
      homePath: '/style/minimalism',
      homeLabel: '首页',
      listLabel: '博客',
    })
    expect(items).toHaveLength(3)
    expect(items[0]).toEqual({ label: '首页', to: '/style/minimalism' })
    expect(items[1]).toEqual({ label: '博客', to: '/style/minimalism/blog' })
    expect(items[2].label).toBe('Vue 性能优化')
    expect(items[2].to).toBeUndefined()
  })

  it('项目：第二级指向 projects', () => {
    const items = buildDetailBreadcrumb({
      kind: 'project',
      title: 'my-chat',
      homePath: '/en/style/y2k',
      homeLabel: 'Home',
      listLabel: 'Projects',
    })
    expect(items[1].to).toBe('/en/style/y2k/projects')
  })
})

describe('useDetailBreadcrumb', () => {
  beforeEach(() => {
    vi.stubGlobal('useI18n', () => ({ t: (key: string) => labels[key] ?? key }))
    vi.stubGlobal('useLocalePath', () => (path: string) => `/en${path}`)
    // useStyleContentPath 是 Nuxt 自动导入的 composable，vitest 里不会自动注入
    vi.stubGlobal('useStyleContentPath', () => ({ styleId: computed(() => 'minimalism') }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function mountBreadcrumb(initial: DetailView) {
    const source = ref(initial)
    const Harness = defineComponent({
      setup() {
        return { ...useDetailBreadcrumb(source) }
      },
      render: () => h('div'),
    })
    const wrapper = mount(Harness)
    return { wrapper, source }
  }

  it('注入 i18n 文案与语言前缀', () => {
    const { wrapper } = mountBreadcrumb(view('post', 'AI 全流程开发'))
    const items = wrapper.vm.items as Array<{ label: string; to?: string }>
    expect(items.map((i) => i.label)).toEqual(['首页', '博客', 'AI 全流程开发'])
    expect(items[0].to).toBe('/en/style/minimalism')
    expect(items[1].to).toBe('/en/style/minimalism/blog')
    expect(items[2].to).toBeUndefined()
  })

  it('项目详情页第二级是「项目」且指向 projects', () => {
    const { wrapper } = mountBreadcrumb(view('project', 'my-chat'))
    const items = wrapper.vm.items as Array<{ label: string; to?: string }>
    expect(items[1]).toEqual({ label: '项目', to: '/en/style/minimalism/projects' })
  })

  it('随 view 变化重算（换文章标题跟着变）', async () => {
    const { wrapper, source } = mountBreadcrumb(view('post', 'A'))
    expect((wrapper.vm.items as Array<{ label: string }>)[2].label).toBe('A')
    source.value = view('post', 'B')
    await wrapper.vm.$nextTick()
    expect((wrapper.vm.items as Array<{ label: string }>)[2].label).toBe('B')
  })
})
