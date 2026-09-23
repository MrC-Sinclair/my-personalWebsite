import { readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { styleRegistry, STYLE_SUB_PATHS } from './styles/registry'

/**
 * 站点对外 URL（canonical / og:url / sitemap 用）。
 * 部署在 GitHub Pages 用户域的子路径下：站点根 = https://mrc-sinclair.github.io/my-personalWebsite/
 * 可用 NUXT_PUBLIC_SITE_URL 覆盖（如未来启用自定义域名）。
 */
const SITE_URL = (process.env.NUXT_PUBLIC_SITE_URL || 'https://mrc-sinclair.github.io').replace(
  /\/+$/,
  '',
)
const SITE_BASE_URL = '/my-personalWebsite/'

/**
 * 生成风格预渲染路由清单。
 * ------------------------------------------------------------
 * 不直接 import 各风格 index.ts——那会把 Vue 单文件组件拉进构建配置，
 * 这里只需要「有哪些路由」这个事实，无需组件本体。
 * 改为扫描 `styles/<id>/index.ts` 里 pages 映射的键，两者等价但零副作用。
 *
 * 解析要点（踩过的坑）：
 * - 不能要求 `pages: {` 后必须换行——有的风格写成单行
 *   `export default { pages: { '/': X } }`，只认多行写法会漏掉它；
 * - 也不能用贪婪匹配，注释里出现的 `pages:` 字样会污染结果。
 * 因此先剥掉注释，再用「先定位 pages:，再从该位置做括号配对」的方式取块。
 *
 * 若某风格解析不到键，会退化为只预渲染首页**并打印告警**，
 * 不会静默少生成子页。
 */
function stylePrerenderRoutes(): string[] {
  const stylesDir = join(process.cwd(), 'styles')
  const routes: string[] = []

  for (const meta of styleRegistry) {
    const entryPath = join(stylesDir, meta.id, 'index.ts')
    let source = ''
    try {
      source = readFileSync(entryPath, 'utf8')
    } catch {
      console.warn(`[prerender] 风格 ${meta.id} 缺少 index.ts，跳过预渲染路由`)
      continue
    }

    const keys = extractPageKeys(source)

    if (keys.length === 0) {
      console.warn(`[prerender] 风格 ${meta.id} 的 pages 映射解析为空，仅预渲染首页`)
      routes.push(`/style/${meta.id}`)
      continue
    }

    // '/' → /style/<id>；'/about' → /style/<id>/about
    for (const key of keys) {
      routes.push(key === '/' ? `/style/${meta.id}` : `/style/${meta.id}${key}`)
    }

    // 契约校验：子页键必须来自 STYLE_SUB_PATHS（防止各风格自造路径）
    for (const key of keys) {
      if (key !== '/' && !STYLE_SUB_PATHS.includes(key as (typeof STYLE_SUB_PATHS)[number])) {
        console.warn(
          `[prerender] 风格 ${meta.id} 导出了契约外的页面键 "${key}"，` +
            `允许值：${STYLE_SUB_PATHS.join(' / ')}`,
        )
      }
    }
  }

  // 去重（防御：注册表若出现重复 id）
  return [...new Set(routes)]
}

/** 从 index.ts 源码中取出 pages 映射的键（剥注释 + 括号配对） */
function extractPageKeys(source: string): string[] {
  // 1. 剥掉块注释与行注释，避免注释里的 "pages:" 干扰定位
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')

  // 2. 定位 `pages:`（必须带冒号）——不能只找 "pages"，
  //    否则会命中 import 语句里的 `~/styles/registry` 等字样
  const at = code.search(/\bpages\s*:/)
  if (at === -1) return []
  const open = code.indexOf('{', at)
  if (open === -1) return []

  let depth = 0
  let end = -1
  for (let i = open; i < code.length; i += 1) {
    if (code[i] === '{') depth += 1
    else if (code[i] === '}') {
      depth -= 1
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  if (end === -1) return []

  // 3. 只取键（先剥掉嵌套对象，pages 是扁平映射，这里做防御性处理）
  const block = code.slice(open + 1, end)
  const flat = block.replace(/\{[^{}]*\}/g, '')
  return [...flat.matchAll(/['"]([^'"]+)['"]\s*:/g)].map((m) => m[1])
}

/**
 * 依据「真实预渲染成功的路由」生成 sitemap.xml 与 robots.txt。
 * ------------------------------------------------------------
 * 为什么在 nitro prerender:done 里做：路由清单由 registry 派生 +
 * i18n 展开，直接复用预渲染结果可以保证 sitemap 与实际产物严格一致，
 * 不会出现「清单里有、产物里没有」的死链 URL。
 * 中英双语用 xhtml:link alternate 互指（zh 无前缀，en 带 /en）。
 */
async function writeSitemapAndRobots(
  publicDir: string,
  prerendered: Array<{ route: string }>,
): Promise<void> {
  const normalize = (route: string) => {
    let r = route.startsWith(SITE_BASE_URL) ? route.slice(SITE_BASE_URL.length - 1) : route
    if (r !== '/' && r.endsWith('/')) r = r.slice(0, -1)
    return r
  }

  const routes = [...new Set(prerendered.map((item) => normalize(item.route)))]

  // 只保留真实页面路由：@nuxt/content 会把 collection 的 SQL dump 端点
  // （/__nuxt_content/...）也拉进预渲染，它们不是页面，不该进 sitemap。
  // 白名单依据 registry：'/'、'/en'、'/[en/]style/<id>[/sub]'。
  const styleIds = styleRegistry.map((meta) => meta.id).join('|')
  const pagePattern = new RegExp(`^/(en/)?style/(${styleIds})(/(about|projects|blog|contact))?$`)
  const isPage = (r: string) => r === '/' || r === '/en' || pagePattern.test(r)
  const pageRoutes = routes.filter(isPage)
  const zhRoutes = pageRoutes.filter((r) => r === '/' || !/^\/en(\/|$)/.test(r)).sort()

  // 英文路由从中文路由对称推导（/en + 路径）：i18n 的 prefix_except_default
  // 策略保证 SSG 必为每个中文页生成 /en 版本，因此无需依赖实际预渲染集合
  //（node-server preset 下本机 build 不会展开 en 路由，generate（CI）则会）。
  const urlFor = (r: string) => `${SITE_URL}${SITE_BASE_URL}${r === '/' ? '' : r.slice(1)}`
  const escapeXml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const entries = zhRoutes
    .map((r) => {
      const enRoute = r === '/' ? '/en' : `/en${r}`
      // hreflang sitemap 规范：中英两个 URL 各自成条目，均带双向 alternate
      const alternates =
        `\n    <xhtml:link rel="alternate" hreflang="zh-CN" href="${escapeXml(urlFor(r))}"/>` +
        `\n    <xhtml:link rel="alternate" hreflang="en-US" href="${escapeXml(urlFor(enRoute))}"/>`
      return [
        `  <url>\n    <loc>${escapeXml(urlFor(r))}</loc>${alternates}\n  </url>`,
        `  <url>\n    <loc>${escapeXml(urlFor(enRoute))}</loc>${alternates}\n  </url>`,
      ]
    })
    .flat()
    .join('\n')

  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
    `xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>\n`

  const robots = `User-agent: *\nAllow: /\n\n` + `Sitemap: ${SITE_URL}${SITE_BASE_URL}sitemap.xml\n`

  await mkdir(publicDir, { recursive: true })
  await writeFile(join(publicDir, 'sitemap.xml'), sitemap, 'utf8')
  await writeFile(join(publicDir, 'robots.txt'), robots, 'utf8')
  console.log(`[seo] sitemap.xml（${zhRoutes.length} 条 URL）与 robots.txt 已写入 ${publicDir}`)
}

/** 产物 public 目录：build:before 时由 nitro 实例填充（generate 模式即 .output/public） */
let outputPublicDir = ''

export default defineNuxtConfig({
  // 阶段 3：过渡层（@nuxt/ui / components/ / assets/css/main.css）已整体移除，
  // 站点由「风格画廊（/）+ 20 个风格路由」构成，不再需要 Nuxt UI 与其 Tailwind 主题。
  modules: ['@nuxt/content', '@nuxtjs/i18n', '@nuxt/image', '@nuxt/eslint', '@vite-pwa/nuxt'],

  // 全局样式层：base.css 提供 reset / 无障碍工具类 / 共享动画契约，
  // tokens.css 提供风格变量契约的默认回落值。二者均与过渡层无关。
  css: ['~/styles/_base/base.css', '~/styles/_base/tokens.css'],

  app: {
    baseURL: '/my-personalWebsite/',
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: '个人网站 - 技术博客、项目作品集、关于我' },
        // OG 标签必须用 property 属性——写成 name 爬虫不识别（曾经的 bug）
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Sinclair-CXP' },
        { property: 'og:image', content: `${SITE_URL}${SITE_BASE_URL}og-image.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Sinclair-CXP · 20 UI Styles, One Site' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: `${SITE_URL}${SITE_BASE_URL}og-image.png` },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'theme-color', content: '#6366f1' },
      ],
      // 图标路径必须带 baseURL：站点部署在 /my-personalWebsite/ 子路径下，
      // 裸 '/favicon.ico' 会解析到域名根，线上 404
      link: [
        { rel: 'icon', type: 'image/x-icon', href: `${SITE_BASE_URL}favicon.ico` },
        { rel: 'icon', type: 'image/svg+xml', href: `${SITE_BASE_URL}favicon.svg` },
        { rel: 'apple-touch-icon', href: `${SITE_BASE_URL}apple-touch-icon.png` },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  i18n: {
    locales: [
      { code: 'zh', name: '中文', language: 'zh-CN', file: 'zh-CN.json' },
      { code: 'en', name: 'English', language: 'en-US', file: 'en-US.json' },
    ],
    defaultLocale: 'zh',
    strategy: 'prefix_except_default',
    langDir: '../i18n',
    lazy: true,
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  image: {
    provider: 'ipx',
  },

  fonts: {
    providers: {
      google: false,
      googleicons: false,
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: '我的个人网站',
      short_name: '个人网站',
      description: '技术博客、项目作品集、关于我',
      theme_color: '#6366f1',
      background_color: '#0f172a',
      display: 'standalone',
      start_url: '/my-personalWebsite/',
      icons: [
        {
          src: `${SITE_BASE_URL}favicon.ico`,
          sizes: '48x48',
          type: 'image/x-icon',
        },
        {
          src: `${SITE_BASE_URL}favicon-192.png`,
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: `${SITE_BASE_URL}favicon-512.png`,
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      navigateFallback: null,
    },
    client: {
      installPrompt: true,
    },
  },

  // 阶段 3：画廊已提升为根路径 `/`。旧的 `/styles` 保留 301 重定向（含英文前缀），
  // 以免外部书签/分享链接失效。
  routeRules: {
    '/styles': { redirect: { to: '/', statusCode: 301 } },
    '/en/styles': { redirect: { to: '/en', statusCode: 301 } },
  },

  nitro: {
    // SEO：预渲染完成后，用「真实成功的路由」生成 sitemap.xml + robots.txt
    // （写进产物 public 目录，随 Pages 部署一起上传）
    hooks: {
      'build:before'(nitro) {
        // 记录产物目录；generate 模式下即 .output/public
        outputPublicDir =
          nitro.options.output?.publicDir || join(process.cwd(), '.output', 'public')
      },
      async 'prerender:done'(result) {
        if (!outputPublicDir) {
          throw new Error('[seo] outputPublicDir 未初始化：build:before 未执行')
        }
        await writeSitemapAndRobots(outputPublicDir, result.prerenderedRoutes)
      },
    },
    prerender: {
      // 预渲染清单：根路径（风格画廊）+ 由 styles/registry.ts 派生的全部风格路由。
      // 旧写法里这里是 '/styles'，阶段 3 后画廊搬到 '/'，故改为 '/'。
      routes: ['/', ...stylePrerenderRoutes()],
      // 关闭链接爬取：清单本身已经是完整的 101 条路由（×2 语言由 i18n 展开），
      // 不需要再跟着页面里的 <a> 走。爬取的坏处是会把页面里残存的死链
      // （如已随过渡层删除的 /blog/<slug>、/projects/<slug>）也拉进来预渲染，
      // 一旦 404 就让整个构建失败——2026-09-23 的 CI 就是这么挂的。
      crawlLinks: false,
    },
  },

  runtimeConfig: {
    public: {
      // 页面级 canonical / og:url 拼接用（NUXT_PUBLIC_SITE_URL 可覆盖默认 GitHub Pages 域）
      siteUrl: SITE_URL,
    },
  },

  compatibilityDate: '2025-04-18',

  devtools: { enabled: true },
})
