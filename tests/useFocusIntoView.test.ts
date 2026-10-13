/**
 * useFocusIntoView 单元测试 —— 键盘焦点滚进滚动条带可视区的全站唯一实现
 * jsdom 不做布局，getBoundingClientRect 一律返回 0，所以按元素逐个打桩给出矩形；
 * 宿主组件用 render 函数（运行时 Vue 不含模板编译器），生命周期才真的会跑。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useFocusIntoView } from '~/composables/useFocusIntoView'

/** 矩形表：元素 → 视口坐标 */
let rects = new Map<Element, { left: number; right: number }>()
let realRect: () => DOMRect

/** 造一个可横向滚动的条带 + 里面的条目 */
function build() {
  document.body.innerHTML = ''
  const strip = document.createElement('div')
  strip.style.overflowX = 'auto'
  const inside = document.createElement('a')
  inside.href = '#inside'
  const edge = document.createElement('a')
  edge.href = '#edge'
  const plain = document.createElement('a')
  plain.href = '#plain'
  strip.append(inside, edge)
  document.body.append(strip, plain)
  rects = new Map([
    [strip, { left: 0, right: 100 }],
    [inside, { left: 10, right: 60 }], // 完整可见
    [edge, { left: 90, right: 150 }], // 只露半截
    [plain, { left: 0, right: 40 }],
  ])
  return { strip, inside, edge, plain }
}

function focusIn(el: Element) {
  el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
}

const Harness = defineComponent({
  setup() {
    useFocusIntoView()
    return () => h('div')
  },
})

/** 每个用例都记下来，afterEach 统一卸载：监听挂在 document 上，
    不卸载的话上一个用例的监听器还会响应下一个用例的 focusin（实测叠到 4 份） */
const mounted: { unmount: () => void }[] = []
function mountHarness() {
  const wrapper = mount(Harness, { attachTo: document.body })
  mounted.push(wrapper)
  return wrapper
}

describe('useFocusIntoView', () => {
  beforeEach(() => {
    realRect = Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = function fake() {
      const r = rects.get(this) ?? { left: 0, right: 0 }
      return { ...r, top: 0, bottom: 40, width: r.right - r.left, height: 40 } as DOMRect
    }
  })

  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
    Element.prototype.getBoundingClientRect = realRect
    document.body.innerHTML = ''
  })

  it('焦点落在条带可视区之外时，把它滚进来（只横向挪）', () => {
    const { edge } = build()
    const spy = vi.fn()
    edge.scrollIntoView = spy
    mountHarness()
    focusIn(edge)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toMatchObject({ block: 'nearest', inline: 'nearest' })
  })

  it('本来就完整可见的条目不去动它', () => {
    const { inside } = build()
    const spy = vi.fn()
    inside.scrollIntoView = spy
    mountHarness()
    focusIn(inside)
    expect(spy).not.toHaveBeenCalled()
  })

  it('没有可横向滚动祖先的条目不管', () => {
    const { plain } = build()
    const spy = vi.fn()
    plain.scrollIntoView = spy
    mountHarness()
    focusIn(plain)
    expect(spy).not.toHaveBeenCalled()
  })

  it('用瞬时滚动而不是平滑动画（环不会追着跑，量测也读得到落位后的位置）', () => {
    const { edge } = build()
    const spy = vi.fn()
    edge.scrollIntoView = spy
    mountHarness()
    focusIn(edge)
    expect(spy.mock.calls[0][0]).toMatchObject({ behavior: 'auto' })
  })

  it('卸载后不再监听 focusin', () => {
    const { edge } = build()
    const spy = vi.fn()
    edge.scrollIntoView = spy
    const wrapper = mount(Harness, { attachTo: document.body })
    wrapper.unmount()
    focusIn(edge)
    expect(spy).not.toHaveBeenCalled()
  })
})
