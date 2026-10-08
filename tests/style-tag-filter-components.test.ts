/**
 * 20 个风格的标签筛选组件契约测试
 * ------------------------------------------------------------
 * 与 style-search-components.test.ts 同一思路：标签筛选同样是「一套契约、
 * 20 个风格各写一遍」，而写错 props / emit 名在 build 与 lint 里是静默的。
 * 这里固定成断言：
 *   1. 每个风格都有一个标签筛选组件（数量守住 20）
 *   2. 标签按钮数 = 标签数 + 「全部」
 *   3. 点某个标签 → emit('select', 该标签)
 *   4. 处于筛选态（activeTag 非空）时出现清除项 → 点击 emit('select', '')
 * 视觉（胶囊 / 瓦片 / 黏土丸 / 像素按钮）不在这里断言，jsdom 不算布局。
 *
 * 组件只用到 useI18n，stubGlobal 注入即可。
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, type Component } from 'vue'
import type { TagCount } from '~/utils/tags'

const modules = import.meta.glob('../styles/*/components/*TagFilter.vue') as Record<
  string,
  () => Promise<{ default: Component }>
>

function styleIdOf(path: string): string {
  return path.split('/')[2] ?? path
}

const TAGS: TagCount[] = [
  { tag: 'Vue', count: 3 },
  { tag: '性能', count: 2 },
]

describe('风格标签筛选组件契约', () => {
  beforeEach(() => {
    vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const entries = Object.entries(modules)

  it('20 个风格各有一个标签筛选组件', () => {
    expect(entries.length).toBe(20)
  })

  for (const [path, load] of entries) {
    describe(styleIdOf(path), () => {
      it('渲染「全部 + 各标签」，点击发 select', async () => {
        const Comp = (await load()).default
        const wrapper = mount(Comp, {
          props: { tags: TAGS, activeTag: '', total: 14 },
        })

        // 未筛选：没有清除项 → 按钮数 = 全部 + 标签数
        const buttons = wrapper.findAll('button')
        expect(buttons.length).toBe(TAGS.length + 1)

        // 点第一个标签（buttons[0] 是「全部」）→ emit 该标签
        await buttons[1]!.trigger('click')
        await nextTick()
        expect(wrapper.emitted('select')?.[0]).toEqual(['Vue'])
      })

      it('筛选态多出一个清除项，点击发空串取消筛选', async () => {
        const Comp = (await load()).default
        const wrapper = mount(Comp, {
          props: { tags: TAGS, activeTag: 'Vue', total: 14 },
        })

        // 筛选态：全部 + 标签 + 清除
        const buttons = wrapper.findAll('button')
        expect(buttons.length).toBe(TAGS.length + 2)

        // 最后一项是清除：再次点击即取消（传空串）
        await buttons[buttons.length - 1]!.trigger('click')
        await nextTick()
        expect(wrapper.emitted('select')?.[0]).toEqual([''])
      })
    })
  }
})
