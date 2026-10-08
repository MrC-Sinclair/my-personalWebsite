/**
 * 20 个风格的搜索组件契约测试
 * ------------------------------------------------------------
 * 为什么需要它：风格组件不走自动导入，且**漏写 / 改名不会让 build、lint、
 * 类型检查报错**（项目既有的痛点，由 styles-structure.test.ts 守结构）。
 * 搜索铺开到 20 个风格后，每个 XxxSearch 都是手写的，props / emit 名一旦
 * 写错（比如某风格写成 @input 或 :keyword）页面会静默失效——只有真浏览器
 * 点一下才发现。这里把契约固定成断言：
 *   1. 每个风格都有搜索组件（数量守住 20，新增风格漏做会被抓到）
 *   2. 渲染 input[type=search] 且 value 受控于 props.query
 *   3. 输入 → emit('update', 值)；点清除 → emit('clear')
 * 视觉差异（圆角、阴影、提示符样式）属于表现层，不在这里断言——
 * jsdom 不算布局，那些只能靠截图确认。
 *
 * 组件里只用到 useI18n，用 stubGlobal 注入即可（同 useBlogTagFilter 的测法）。
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, type Component } from 'vue'

/** 自动收集全部风格的搜索组件：新增风格只要按命名约定放文件就会被测到 */
const modules = import.meta.glob('../styles/*/components/*Search.vue') as Record<
  string,
  () => Promise<{ default: Component }>
>

/** 从路径取风格 id（styles/<id>/components/XxxSearch.vue） */
function styleIdOf(path: string): string {
  return path.split('/')[2] ?? path
}

describe('风格搜索组件契约', () => {
  beforeEach(() => {
    vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const entries = Object.entries(modules)

  // ★ 数量断言：20 个风格一个都不能少（也是「新增风格必须做搜索」的守门员）
  it('20 个风格各有一个搜索组件', () => {
    expect(entries.length).toBe(20)
  })

  for (const [path, load] of entries) {
    describe(styleIdOf(path), () => {
      it('渲染受控输入框，输入与清除都通过 emit 交给页面', async () => {
        const Comp = (await load()).default
        const wrapper = mount(Comp, {
          props: { query: 'vue', resultCount: 8, total: 14 },
        })

        // 搜索框存在，且值是 props 传入的（受控，不自己持有状态）
        const input = wrapper.find('input[type=search]')
        expect(input.exists()).toBe(true)
        expect((input.element as HTMLInputElement).value).toBe('vue')

        // 搜索态显示命中计数（文案由各风格自己排版，这里只断言数字出现）
        expect(wrapper.text()).toContain('8')
        expect(wrapper.text()).toContain('14')

        // 输入：只发事件，不自己改数据（数据流向由页面持有）。
        // ⚠️ 必须自己派发原生 input 事件：VTU 的 setValue() 会连带触发 change，
        //    那样即使组件写错成 @change 也能通过——这条断言就白写了
        //    （实测：用 setValue 时把 @input 改成 @change，测试照样绿）。
        const el = input.element as HTMLInputElement
        el.value = 'nuxt'
        el.dispatchEvent(new Event('input'))
        await nextTick()
        expect(wrapper.emitted('update')?.[0]).toEqual(['nuxt'])

        // 清除按钮：搜索态才出现，点击发 clear
        const clear = wrapper.find('button')
        expect(clear.exists()).toBe(true)
        await clear.trigger('click')
        expect(wrapper.emitted('clear')).toHaveLength(1)
      })

      it('未搜索时不渲染清除按钮', async () => {
        const Comp = (await load()).default
        const wrapper = mount(Comp, {
          props: { query: '', resultCount: 14, total: 14 },
        })
        expect(wrapper.find('button').exists()).toBe(false)
      })
    })
  }
})
