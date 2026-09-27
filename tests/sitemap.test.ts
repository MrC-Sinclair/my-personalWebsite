/**
 * sitemap 生成测试
 * ------------------------------------------------------------
 * 这些用例的直接来源是一次真实事故：2026-09-27 之前 sitemap 的英文 URL 是
 * 从中文路由「对称推导」出来的，而英文页压根没被预渲染，于是线上出现 400 条
 * 死链，且没有任何测试能发现。逻辑抽成 utils/sitemap.ts 的纯函数后，
 * 下面这几条就是防回归的闸门：
 *   1. 英文缺失 → 只输出中文，且不写指向英文的 alternate；
 *   2. content 的 SQL dump 端点必须被过滤；
 *   3. baseURL / 尾斜杠归一化必须稳定。
 */
import { describe, expect, it } from 'vitest'
import { buildSitemapXml, isPageRoute, normalizeRoute } from '~/utils/sitemap'
import { escapeXml } from '~/utils/xml'

const STYLE_IDS = ['minimalism', 'y2k', 'flat-design']
const BASE = '/my-personalWebsite/'
const SITE = 'https://mrc-sinclair.github.io'

describe('normalizeRoute', () => {
  it('去掉 baseURL 前缀', () => {
    expect(normalizeRoute('/my-personalWebsite/en/style/y2k', BASE)).toBe('/en/style/y2k')
  })

  it('去掉结尾斜杠，但根路径保持 /', () => {
    expect(normalizeRoute('/style/y2k/', BASE)).toBe('/style/y2k')
    expect(normalizeRoute('/', BASE)).toBe('/')
  })

  it('不含 baseURL 时只做尾斜杠处理', () => {
    expect(normalizeRoute('/style/y2k/', '/other/')).toBe('/style/y2k')
  })
})

describe('isPageRoute', () => {
  it('放行根路径与英文根路径', () => {
    expect(isPageRoute('/', STYLE_IDS)).toBe(true)
    expect(isPageRoute('/en', STYLE_IDS)).toBe(true)
  })

  it('放行风格首页、子页与内容详情页', () => {
    expect(isPageRoute('/style/y2k', STYLE_IDS)).toBe(true)
    expect(isPageRoute('/style/y2k/about', STYLE_IDS)).toBe(true)
    expect(isPageRoute('/en/style/y2k/blog/some-post', STYLE_IDS)).toBe(true)
    expect(isPageRoute('/style/minimalism/projects/personal-website', STYLE_IDS)).toBe(true)
  })

  it('拦截 content 的 SQL dump 端点（不是页面）', () => {
    expect(isPageRoute('/__nuxt_content/blogZh/sql_dump.txt', STYLE_IDS)).toBe(false)
  })

  it('拦截未注册风格的路径', () => {
    expect(isPageRoute('/style/not-a-style', STYLE_IDS)).toBe(false)
  })
})

describe('buildSitemapXml', () => {
  const build = (routes: string[]) =>
    buildSitemapXml({ routes, styleIds: STYLE_IDS, siteUrl: SITE, baseUrl: BASE })

  it('英文路由真实存在时，中英各成条目且双向 alternate', () => {
    const { xml, zhCount, enCount } = build(['/style/y2k', '/en/style/y2k'])
    expect(zhCount).toBe(1)
    expect(enCount).toBe(1)
    expect(xml).toContain(`<loc>${SITE}${BASE}style/y2k</loc>`)
    expect(xml).toContain(`<loc>${SITE}${BASE}en/style/y2k</loc>`)
    expect(xml.match(/hreflang="en-US"/g)).toHaveLength(2)
    expect(xml.match(/<url>/g)).toHaveLength(2)
  })

  it('★ 英文缺失时只收录中文，且不写指向 404 的 alternate', () => {
    // 这条是 2026-09-27 事故的直接回归测试：英文页没预渲染出来时，
    // 绝不允许再推导出一条 /en/... URL。
    const { xml, zhCount, enCount } = build(['/style/y2k'])
    expect(zhCount).toBe(1)
    expect(enCount).toBe(0)
    expect(xml.match(/<url>/g)).toHaveLength(1)
    expect(xml).not.toContain('hreflang="en-US"')
    expect(xml).not.toContain(`${BASE}en/`)
  })

  it('过滤 content dump 并去重', () => {
    const { xml } = build([
      '/style/y2k',
      '/style/y2k',
      '/style/y2k/',
      '/__nuxt_content/blogZh/sql_dump.txt',
    ])
    expect(xml.match(/<url>/g)).toHaveLength(1)
    expect(xml).not.toContain('__nuxt_content')
  })

  it('根路径的英文对应 /en 而不是 /en/', () => {
    const { xml } = build(['/', '/en'])
    expect(xml).toContain(`<loc>${SITE}${BASE}</loc>`)
    expect(xml).toContain(`<loc>${SITE}${BASE}en</loc>`)
    expect(xml).not.toContain(`${BASE}en/`)
  })

  it('产出合法的 urlset 骨架', () => {
    const { xml } = build(['/style/y2k'])
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true)
  })
})

describe('escapeXml', () => {
  it('转义 & < > "', () => {
    expect(escapeXml('a & b < c > "d"')).toBe('a &amp; b &lt; c &gt; &quot;d&quot;')
  })

  it('先转义 & 避免二次转义', () => {
    expect(escapeXml('&lt;')).toBe('&amp;lt;')
  })
})
