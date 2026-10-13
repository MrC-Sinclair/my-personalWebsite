/**
 * useLocaleSwitch 单元测试
 * ------------------------------------------------------------
 * 语言切换是全站唯一实现，风格层只负责长什么样，所以这里测行为：
 * 目标语言取反、控件文案显示「目标语言的自称」、路径拿不到时必须回落。
 *
 * 测试环境没有 Nuxt 自动导入（useI18n / useSwitchLocalePath），用 stubGlobal 注入。
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { effectScope } from 'vue'
import { useLocaleSwitch } from '~/composables/useLocaleSwitch'

/** 在响应式作用域里跑一次 composable，拿到返回值 */
function withScope() {
  const scope = effectScope()
  const api = scope.run(() => useLocaleSwitch())
  if (!api) throw new Error('useLocaleSwitch 应在作用域内返回状态')
  return api
}

describe('useLocaleSwitch', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('中文环境下目标是 English，路径由 i18n 给出', () => {
    vi.stubGlobal('useI18n', () => ({ locale: { value: 'zh-CN' } }))
    vi.stubGlobal('useSwitchLocalePath', () => (code: string) => `/style/swiss/${code}`)

    const { currentCode, targetCode, targetLabel, targetPath } = withScope()
    expect(currentCode.value).toBe('zh')
    expect(targetCode.value).toBe('en')
    // 文案显示「切过去之后看到的语言」，不是当前语言
    expect(targetLabel.value).toBe('English')
    expect(targetPath.value).toBe('/style/swiss/en')
  })

  it('英文环境下目标回到中文，文案是「中文」', () => {
    vi.stubGlobal('useI18n', () => ({ locale: { value: 'en-US' } }))
    vi.stubGlobal('useSwitchLocalePath', () => () => '/style/swiss')

    const { currentCode, targetCode, targetLabel, targetPath } = withScope()
    // locale 带地区后缀（en-US）也要认成 en
    expect(currentCode.value).toBe('en')
    expect(targetCode.value).toBe('zh')
    expect(targetLabel.value).toBe('中文')
    expect(targetPath.value).toBe('/style/swiss')
  })

  it('拿不到目标路径时回落站点根，绝不产出空链接', () => {
    vi.stubGlobal('useI18n', () => ({ locale: { value: 'zh-CN' } }))
    // prefix_except_default 下未知路由可能返回空串，空 :to 会渲染出一个死链接
    vi.stubGlobal('useSwitchLocalePath', () => () => '')

    expect(withScope().targetPath.value).toBe('/')
  })
})
