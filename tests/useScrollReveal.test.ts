/**
 * useScrollReveal 单元测试
 * ------------------------------------------------------------
 * 滚动入场动画是全站共享的（20 个风格都用 .scroll-reveal 类），这个 composable
 * 用 IntersectionObserver 观察元素、用 MutationObserver 接住后来插入的节点。
 * jsdom 两者都没有，用最小 mock 验证：
 *   1. 挂载后观察全部 .scroll-reveal 元素（已有 revealed 的跳过）；
 *   2. 进入视口时加 revealed 并停止观察该元素（只触发一次）；
 *   3. 后插入的节点能被 MutationObserver 接住；
 *   4. ★ 卸载时两个 observer 都要断开（onMounted 申请的资源必须成对清理）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useScrollReveal } from '~/composables/useScrollReveal'

interface MockEntry {
  isIntersecting: boolean
  target: Element
}

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  observed: Element[] = []
  unobserved: Element[] = []
  disconnected = false

  constructor(
    public callback: (entries: MockEntry[]) => void,
    public options?: IntersectionObserverInit,
  ) {
    MockIntersectionObserver.instances.push(this)
  }

  observe(el: Element) {
    this.observed.push(el)
  }

  unobserve(el: Element) {
    this.unobserved.push(el)
  }

  disconnect() {
    this.disconnected = true
  }

  emit(entries: MockEntry[]) {
    this.callback(entries)
  }
}

class MockMutationObserver {
  static instances: MockMutationObserver[] = []
  disconnected = false
  /** observe(target, options)：选项在 observe 的第二个参数，不在构造函数里 */
  observeArgs: Array<[Node, MutationObserverInit | undefined]> = []

  constructor(public callback: (mutations: Array<{ addedNodes: Node[] }>) => void) {
    MockMutationObserver.instances.push(this)
  }

  observe(target: Node, options?: MutationObserverInit) {
    this.observeArgs.push([target, options])
  }

  disconnect() {
    this.disconnected = true
  }

  emit(mutations: Array<{ addedNodes: Node[] }>) {
    this.callback(mutations)
  }
}

const Harness = defineComponent({
  setup() {
    useScrollReveal()
    return {}
  },
  render() {
    return h('div', [
      h('section', { class: 'scroll-reveal scroll-reveal-up' }, 'a'),
      h('section', { class: 'scroll-reveal revealed' }, 'b'),
    ])
  },
})

describe('useScrollReveal', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = []
    MockMutationObserver.instances = []
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    vi.stubGlobal('MutationObserver', MockMutationObserver)
  })

  it('挂载后观察全部 scroll-reveal 元素（跳过已有 revealed 的）', () => {
    const wrapper = mount(Harness, { attachTo: document.body })
    expect(MockIntersectionObserver.instances).toHaveLength(1)
    const observer = MockIntersectionObserver.instances[0]
    // 两个元素里只有第一个没有 revealed
    expect(observer.observed).toHaveLength(1)
    wrapper.unmount()
  })

  it('观察选项固定为 threshold 0.1 + 底部 -40px 根边距', () => {
    const wrapper = mount(Harness, { attachTo: document.body })
    expect(MockIntersectionObserver.instances[0].options).toEqual({
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    })
    wrapper.unmount()
  })

  it('进入视口时加 revealed，并停止观察该元素（只触发一次）', () => {
    const wrapper = mount(Harness, { attachTo: document.body })
    const observer = MockIntersectionObserver.instances[0]
    const target = document.querySelector<HTMLElement>('.scroll-reveal:not(.revealed)')!
    observer.emit([{ isIntersecting: true, target }])
    expect(target.classList.contains('revealed')).toBe(true)
    expect(observer.unobserved).toContain(target)
    wrapper.unmount()
  })

  it('未进入视口的元素不加 revealed', () => {
    const wrapper = mount(Harness, { attachTo: document.body })
    const target = document.querySelector<HTMLElement>('.scroll-reveal:not(.revealed)')!
    MockIntersectionObserver.instances[0].emit([{ isIntersecting: false, target }])
    expect(target.classList.contains('revealed')).toBe(false)
    wrapper.unmount()
  })

  it('★★ 后插入的节点被 MutationObserver 接住', () => {
    const wrapper = mount(Harness, { attachTo: document.body })
    const mutation = MockMutationObserver.instances[0]
    expect(mutation.observeArgs[0]?.[1]).toEqual({ childList: true, subtree: true })
    expect(mutation.observeArgs[0]?.[0]).toBe(document.body)

    const late = document.createElement('div')
    late.className = 'scroll-reveal scroll-reveal-left'
    mutation.emit([{ addedNodes: [late] }])
    expect(MockIntersectionObserver.instances[0].observed).toContain(late)
    wrapper.unmount()
  })

  it('卸载时两个 observer 都断开（资源成对清理）', () => {
    const wrapper = mount(Harness, { attachTo: document.body })
    wrapper.unmount()
    expect(MockIntersectionObserver.instances[0].disconnected).toBe(true)
    expect(MockMutationObserver.instances[0].disconnected).toBe(true)
  })
})
