/**
 * useClipboardCopy 单元测试 —— 剪贴板复制的全站唯一实现
 * 通过挂载测试宿主组件验证（composable 依赖组件实例生命周期）
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useClipboardCopy } from '~/composables/useClipboardCopy'

/** 测试宿主：真实组件内调用 composable，暴露行为（render 函数避免运行时模板编译） */
const Harness = defineComponent({
  setup() {
    const { copied, copy } = useClipboardCopy(1000)
    return { copied, copy }
  },
  render() {
    return h('div', String(this.copied))
  },
})

describe('useClipboardCopy', () => {
  const writeText = vi.fn<() => Promise<void>>()

  beforeEach(() => {
    vi.useFakeTimers()
    writeText.mockReset()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('复制成功：copied 更新为已复制文本', async () => {
    writeText.mockResolvedValue(undefined)
    const wrapper = mount(Harness)
    await wrapper.vm.copy('c2256843428')
    expect(writeText).toHaveBeenCalledWith('c2256843428')
    expect(wrapper.vm.copied).toBe('c2256843428')
  })

  it('反馈过期后 copied 自动清空', async () => {
    writeText.mockResolvedValue(undefined)
    const wrapper = mount(Harness)
    await wrapper.vm.copy('abc')
    expect(wrapper.vm.copied).toBe('abc')
    vi.advanceTimersByTime(1000)
    expect(wrapper.vm.copied).toBe('')
  })

  it('剪贴板写入失败时静默返回 false，不更新 copied', async () => {
    writeText.mockRejectedValue(new Error('denied'))
    const wrapper = mount(Harness)
    const ok = await wrapper.vm.copy('abc')
    expect(ok).toBe(false)
    expect(wrapper.vm.copied).toBe('')
  })

  it('空字符串直接返回 false，不触碰剪贴板', async () => {
    const wrapper = mount(Harness)
    const ok = await wrapper.vm.copy('')
    expect(ok).toBe(false)
    expect(writeText).not.toHaveBeenCalled()
  })

  it('组件卸载后反馈定时器被清理（不向已卸载组件写状态）', async () => {
    writeText.mockResolvedValue(undefined)
    const wrapper = mount(Harness)
    await wrapper.vm.copy('abc')
    wrapper.unmount()
    // 定时器触发时 copied 已随组件销毁，不应抛错
    expect(() => vi.advanceTimersByTime(1000)).not.toThrow()
  })
})
