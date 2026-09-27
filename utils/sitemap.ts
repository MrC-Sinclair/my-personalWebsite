/**
 * @file sitemap.xml 生成（构建期，纯函数）
 * @description 从「真实预渲染成功的路由」生成 sitemap，中英双语用 xhtml:link alternate 互指。
 *
 * 抽成纯函数的直接原因：2026-09-27 之前这段逻辑内联在 nuxt.config.ts 里，
 * 英文 URL 是从中文路由「对称推导」出来的（假设 i18n 会自动生成 /en 版本），
 * 实际上一个英文页都没生成，sitemap 因此写了 400 条线上 404，且没有任何测试能发现。
 * 抽出来之后 normalizeRoute / isPageRoute / buildSitemapXml 全部可单测，
 * 且「英文缺失就不收录」这条规则有测试守着（见 tests/sitemap.test.ts）。
 *
 * 仅供构建期使用：由 nuxt.config.ts 的 nitro prerender:done 钩子调用，不进客户端产物。
 */

import { escapeXml } from './xml'

/**
 * 预渲染路由归一化：去掉 baseURL 前缀、去掉结尾斜杠（根路径除外）。
 * ------------------------------------------------------------
 * @nuxt/content 与 nitro 给出的 route 可能带 baseURL（`/my-personalWebsite/en/style/y2k`），
 * 也可能带尾斜杠，sitemap 里的 loc 必须是「站点内路径」的唯一形态，否则会重复收录。
 */
export function normalizeRoute(route: string, baseUrl: string): string {
  const r = route.startsWith(baseUrl) ? route.slice(baseUrl.length - 1) : route
  return r !== '/' && r.endsWith('/') ? r.slice(0, -1) : r
}

/**
 * 是否为真实页面路由。
 * ------------------------------------------------------------
 * 必须显式过滤：@nuxt/content 会把 collection 的 SQL dump 端点
 * （`/__nuxt_content/...`）也计入预渲染结果，它们不是页面，不该进 sitemap。
 * 白名单依据 registry：'/'、'/en'、'/[en/]style/<id>[/子页][/详情 slug]'。
 */
export function isPageRoute(route: string, styleIds: string[]): boolean {
  if (route === '/' || route === '/en') return true
  const pattern = new RegExp(
    `^/(en/)?style/(${styleIds.join('|')})(/(about|projects|blog|contact))?(/(blog|projects)/[a-z0-9-]+)?$`,
  )
  return pattern.test(route)
}

/** sitemap 生成参数 */
export interface SitemapBuildParams {
  /** 真实预渲染成功的路由（可含 baseURL 前缀与尾斜杠，内部会归一化） */
  routes: string[]
  /** 风格 id 清单（来自 styles/registry.ts） */
  styleIds: string[]
  /** 站点对外 URL，如 https://mrc-sinclair.github.io */
  siteUrl: string
  /** 部署子路径，如 /my-personalWebsite/ */
  baseUrl: string
}

/** sitemap 生成结果（条数用于构建日志核对） */
export interface SitemapBuildResult {
  xml: string
  zhCount: number
  enCount: number
}

/**
 * 生成 sitemap.xml。
 * ------------------------------------------------------------
 * 规则（与 2026-09-27 的修复一致）：英文条目必须真实存在才收录。
 * 中文页的 /en 版本若没被预渲染出来，就只输出中文条目，且**不写**指向 404 的
 * alternate —— 宁可少一条，也不给搜索引擎喂死链。
 */
export function buildSitemapXml(params: SitemapBuildParams): SitemapBuildResult {
  const { routes, styleIds, siteUrl, baseUrl } = params

  const pageRoutes = [
    ...new Set(routes.map((route) => normalizeRoute(route, baseUrl))),
  ]
    .filter((route) => isPageRoute(route, styleIds))
    .sort()

  const zhRoutes = pageRoutes.filter((r) => r === '/' || !/^\/en(\/|$)/.test(r))
  const enSet = new Set(pageRoutes.filter((r) => r === '/en' || r.startsWith('/en/')))

  const urlFor = (route: string) => `${siteUrl}${baseUrl}${route === '/' ? '' : route.slice(1)}`

  const entries = zhRoutes
    .map((zhRoute) => {
      const enRoute = zhRoute === '/' ? '/en' : `/en${zhRoute}`
      const hasEn = enSet.has(enRoute)
      const alternates =
        `\n    <xhtml:link rel="alternate" hreflang="zh-CN" href="${escapeXml(urlFor(zhRoute))}"/>` +
        (hasEn
          ? `\n    <xhtml:link rel="alternate" hreflang="en-US" href="${escapeXml(urlFor(enRoute))}"/>`
          : '')
      const zhEntry = `  <url>\n    <loc>${escapeXml(urlFor(zhRoute))}</loc>${alternates}\n  </url>`
      if (!hasEn) return [zhEntry]
      return [
        zhEntry,
        `  <url>\n    <loc>${escapeXml(urlFor(enRoute))}</loc>${alternates}\n  </url>`,
      ]
    })
    .flat()
    .join('\n')

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
    `xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>\n`

  return {
    xml,
    zhCount: zhRoutes.length,
    enCount: enSet.size,
  }
}
