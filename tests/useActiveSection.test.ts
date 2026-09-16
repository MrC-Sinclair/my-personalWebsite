/**
 * useActiveSection 单元测试 —— 滚动激活区块（scroll spy）的全站唯一实现
 * jsdom 无 IntersectionObserver，用最小 mock 验证订阅/回调/清理行为；
 * 宿主组件用 render 函数（运行时 Vue 不含模板编译器）
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useActiveSection } from '~/composables/useActiveSection'

interface MockEntry {
  isIntersecting: boolean
  target: HTMLElement
}

/** 最小 IntersectionObserver mock：记录实例、观察目标与回调 */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  callback: (entries: MockEntry[]) => void
  options?: IntersectionObserverInit
  observed: Element[] = []
  disconnected = false

  constructor(callback: (entries: MockEntry[]) => void, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options
    MockIntersectionObserver.instances.push(this)
  }

  observe(el: Element) {
    this.observed.push(el)
  }

  unobserve() {}

  disconnect() {
    this.disconnected = true
  }

  /** 测试辅助：触发回调 */
  emit(entries: MockEntry[]) {
    this.callback(entries)
  }
}

/** 测试宿主：渲染两个带 data-section 的区块 */
const Harness = defineComponent({
  setup() {
    const { activeId } = useActiveSection()
    return { activeId }
  },
  render() {
    return h('div', [
      h('section', { 'data-section': 'about' }, 'about'),
      h('section', { 'data-section': 'projects' }, 'projects'),
    ])
  },
})

describe('useActiveSection', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = []
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  it('挂载后观察全部 data-section 元素', () => {
    const wrapper = mount(Harness, { attachTo: document.body })
    expect(MockIntersectionObserver.instances).toHaveLength(1)
    expect(MockIntersectionObserver.instances[0].observed).toHaveLength(2)
    wrapper.unmount()
  })

  it('区块进入阅读线时 activeId 更新', () => {
    const wrapper = mount(Harness, { attachTo: document.body })
    const observer = MockIntersectionObserver.instances[0]
    const target = document.querySelector<HTMLElement>('[data-section="projects"]')!
    observer.emit([{ isIntersecting: true, target }])
    expect(wrapper.vm.activeId).toBe('projects')
    wrapper.unmount()
  })

  it('未相交的区块不更新激活态', () => {
    const wrapper = mount(Harness, { attachTo: document.body })
    const observer = MockIntersectionObserver.instances[0]
    const target = document.querySelector<HTMLElement>('[data-section="about"]')!
    observer.emit([{ isIntersecting: false, target }])
    expect(wrapper.vm.activeId).toBe('')
    wrapper.unmount()
  })

  it('卸载时断开观察（资源成对清理）', () => {
    const wrapper = mount(Harness, { attachTo: document.body })
    const observer = MockIntersectionObserver.instances[0]
    wrapper.unmount()
    expect(observer.disconnected).toBe(true)
  })
})
