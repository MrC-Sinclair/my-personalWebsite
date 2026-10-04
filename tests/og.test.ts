/**
 * OG 分享图模板测试
 * ------------------------------------------------------------
 * 守住几件事：
 *   1. 尺寸必须是 1200×630（各平台的裁切基准）；
 *   2. 风格名与 accent 色要真的出现在 SVG 里（否则 20 张图会长得一模一样）；
 *   3. ★ 图上不能出现中文 —— CI 容器通常没有中文字体，会渲染成方块；
 *   4. 特殊字符要转义，不能生成非法 SVG。
 */
import { describe, expect, it } from 'vitest'
import { OG_HEIGHT, OG_WIDTH, styleOgSvg } from '~/utils/og'

const sample = { id: 'neo-brutalism', en: 'Neo-Brutalism', accent: '#ffe600' }

describe('styleOgSvg', () => {
  it('输出 1200×630 的画布', () => {
    const svg = styleOgSvg(sample)
    expect(svg).toContain(`width="${OG_WIDTH}"`)
    expect(svg).toContain(`height="${OG_HEIGHT}"`)
    expect(svg).toContain(`viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}"`)
  })

  it('带上风格名、风格路径与 accent 色', () => {
    const svg = styleOgSvg(sample)
    expect(svg).toContain('Neo-Brutalism')
    expect(svg).toContain('/style/neo-brutalism')
    expect(svg).toContain('#ffe600')
  })

  it('不同风格产出不同内容（不是 20 张一样的图）', () => {
    const other = { id: 'y2k', en: 'Y2K UI', accent: '#8b7bff' }
    expect(styleOgSvg(other)).not.toBe(styleOgSvg(sample))
  })

  it('★ 不含中文（CI 无中文字体会渲染成方块）', () => {
    const svg = styleOgSvg(sample)
    expect(svg).not.toMatch(/[一-鿿]/)
  })

  it('长名自动缩小字号，避免溢出', () => {
    const long = styleOgSvg({ ...sample, en: 'A Very Long Style Name Here' })
    const short = styleOgSvg({ ...sample, en: 'Y2K' })
    expect(long).toContain('font-size="72"')
    expect(short).toContain('font-size="96"')
  })

  it('风格名里的特殊字符被转义（SVG 始终合法）', () => {
    const svg = styleOgSvg({ ...sample, en: 'A & B <C>' })
    expect(svg).toContain('A &amp; B &lt;C&gt;')
    expect(svg).not.toContain('<C>')
  })
})
