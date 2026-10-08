import { readdirSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { styleRegistry, STYLE_SUB_PATHS } from './styles/registry'
import { buildSitemapXml } from './utils/sitemap'
import { buildFeedXml, readBlogEntries, toFeedItems } from './utils/feed'
import { styleOgSvg } from './utils/og'

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
 * RSS feed 的文章链接指向哪个风格的详情页。
 * 同一篇文章在 20 个风格下都有阅读页，feed 只能给一个 canonical 视图，
 * 选 minimalism：正文排版最中性、可读性最好，其余风格是"换个皮肤看同一篇"。
 */
const FEED_STYLE_ID = 'minimalism'

/** 读取 content 目录下的 slug 清单：content/blog/zh/*.md → ['xxx', ...] */
function contentSlugs(kind: 'blog' | 'projects', localeDir: 'zh' | 'en'): string[] {
  const dir = join(process.cwd(), 'content', kind, localeDir)
  try {
    return readdirSync(dir)
      .filter((file) => file.endsWith('.md'))
      .map((file) => file.replace(/\.md$/, ''))
      .sort()
  } catch {
    console.warn(`[prerender] 读取 content/${kind}/${localeDir} 失败，跳过相应详情路由`)
    return []
  }
}

/**
 * 详情路由清单：/style/<id>/blog/<slug> 与 /style/<id>/projects/<slug>。
 * ------------------------------------------------------------
 * 只给「导出了 detail 组件」的风格生成——否则预渲染会 404 拖垮整个构建
 * （2026-09-23 的 CI 就是这么挂的）。判定方式同 pages 键：扫描 index.ts 源码。
 * slug 取中英交集：任一语种缺了这篇，另一语种的页面会走 404，
 * 这里只生成两边都有的，避免生成必然失败的路由。
 */
function styleDetailRoutes(): string[] {
  const blogZh = contentSlugs('blog', 'zh')
  const blogEn = contentSlugs('blog', 'en')
  const projectZh = contentSlugs('projects', 'zh')
  const projectEn = contentSlugs('projects', 'en')
  const sharedBlog = blogZh.filter((slug) => blogEn.includes(slug))
  const sharedProjects = projectZh.filter((slug) => projectEn.includes(slug))

  const routes: string[] = []
  for (const meta of styleRegistry) {
    let source = ''
    try {
      source = readFileSync(join(process.cwd(), 'styles', meta.id, 'index.ts'), 'utf8')
    } catch {
      continue
    }
    // 去掉注释后再判断，避免注释里的 detail 字样造成误判
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
    if (!/\bdetail\s*:/.test(code)) continue

    for (const slug of sharedBlog) routes.push(`/style/${meta.id}/blog/${slug}`)
    for (const slug of sharedProjects) routes.push(`/style/${meta.id}/projects/${slug}`)
  }
  return [...new Set(routes)]
}

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
 * 双语展开，直接复用预渲染结果可以保证 sitemap 与实际产物严格一致，
 * 不会出现「清单里有、产物里没有」的死链 URL。
 *
 * 生成逻辑本身在 utils/sitemap.ts（纯函数，有单测守着），这里只负责
 * 取数、调用、落盘。
 */
async function writeSitemapAndRobots(
  publicDir: string,
  prerendered: Array<{ route: string }>,
): Promise<void> {
  const { xml, zhCount, enCount } = buildSitemapXml({
    routes: prerendered.map((item) => item.route),
    styleIds: styleRegistry.map((meta) => meta.id),
    siteUrl: SITE_URL,
    baseUrl: SITE_BASE_URL,
  })

  const robots = `User-agent: *\nAllow: /\n\n` + `Sitemap: ${SITE_URL}${SITE_BASE_URL}sitemap.xml\n`

  await mkdir(publicDir, { recursive: true })
  await writeFile(join(publicDir, 'sitemap.xml'), xml, 'utf8')
  await writeFile(join(publicDir, 'robots.txt'), robots, 'utf8')
  console.log(
    `[seo] sitemap.xml（zh ${zhCount} + en ${enCount} = ${zhCount + enCount} 条 URL）与 robots.txt 已写入 ${publicDir}`,
  )
}

/**
 * 生成中英两个 RSS feed（feed.xml 与 en/feed.xml）。
 * ------------------------------------------------------------
 * 内容是构建期从 content/blog/<locale>/*.md 的 frontmatter 读出来的，
 * 与 sitemap 同批落盘，因此不需要额外的预渲染路由，也不依赖运行时。
 * 生成逻辑见 utils/feed.ts（纯函数，有单测）。
 */
/**
 * 为每个风格生成一张 OG 分享图（public/og/<id>.png）。
 * ------------------------------------------------------------
 * 此前全站 802 页共用一张 og-image.png：分享任何风格页出去，卡片都长一样。
 * 现在按风格出图（用该风格的 accent 色与英文名），页面级 og:image 覆盖全局值。
 *
 * 用 sharp（@nuxt/image 的依赖）把 SVG 转 PNG。pnpm 严格结构下 sharp 不在顶层
 * node_modules，按 .pnpm 路径解析；解析不到就**跳过生成并告警**——分享图是
 * 增强项，不该因为它让构建失败。
 */
/**
 * 定位 sharp：pnpm 严格结构下它不在顶层 node_modules，
 * 只能到 node_modules/.pnpm/sharp@<ver>/node_modules/sharp 去找。
 * 不写死版本号（升级后会自动匹配到新目录）；找不到返回 null，由调用方降级。
 */
function resolveSharpPath(): string | null {
  const pnpmDir = join(process.cwd(), 'node_modules', '.pnpm')
  try {
    const entry = readdirSync(pnpmDir).find((name) => name.startsWith('sharp@'))
    return entry ? join(pnpmDir, entry, 'node_modules', 'sharp') : null
  } catch {
    return null
  }
}

async function writeStyleOgImages(publicDir: string): Promise<void> {
  const sharpPath = resolveSharpPath()
  if (!sharpPath) {
    console.warn('[seo] 未找到 sharp，跳过风格 OG 图（页面回退到全局 og-image.png）')
    return
  }

  let sharp: unknown = null
  try {
    // sharp 是 CJS，ESM 的 `import()` 无法直接导入目录，走 createRequire
    sharp = createRequire(import.meta.url)(sharpPath)
  } catch (error) {
    console.warn(`[seo] sharp 加载失败，跳过风格 OG 图：${(error as Error).message}`)
    return
  }

  const ogDir = join(publicDir, 'og')
  await mkdir(ogDir, { recursive: true })

  for (const meta of styleRegistry) {
    const svg = Buffer.from(styleOgSvg({ id: meta.id, en: meta.en, accent: meta.accent }))
    await (sharp as (input: Buffer) => { png(): { toFile(path: string): Promise<unknown> } })(
      svg,
    )
      .png()
      .toFile(join(ogDir, `${meta.id}.png`))
  }
  console.log(`[seo] ${styleRegistry.length} 张风格 OG 图已写入 ${ogDir}`)
}

async function writeFeeds(publicDir: string): Promise<void> {
  // 构建时间由这里传入（而不是在 feed.ts 里 new Date()），保证同一份内容
  // 产出同一份 feed，便于 CI 核对与排查
  const lastBuildDate = new Date().toUTCString()
  const linkOptions = { siteUrl: SITE_URL, baseUrl: SITE_BASE_URL, styleId: FEED_STYLE_ID }

  const feeds = [
    {
      file: 'feed.xml',
      dir: join('content', 'blog', 'zh'),
      localePrefix: '',
      title: 'Sinclair-CXP · 技术博客',
      description: '前端 / 跨端开发与工程实践的技术笔记（文章链接在 Minimalism 风格视图下打开）',
      language: 'zh-CN',
      feedPath: 'feed.xml',
    },
    {
      file: join('en', 'feed.xml'),
      dir: join('content', 'blog', 'en'),
      localePrefix: 'en/',
      title: 'Sinclair-CXP · Tech Blog',
      description:
        'Notes on frontend & cross-platform development (links open in the Minimalism style view)',
      language: 'en-US',
      feedPath: 'en/feed.xml',
    },
  ]

  await mkdir(publicDir, { recursive: true })

  for (const feed of feeds) {
    const entries = readBlogEntries(join(process.cwd(), feed.dir))
    const items = toFeedItems(entries, { ...linkOptions, localePrefix: feed.localePrefix })
    const xml = buildFeedXml(
      {
        title: feed.title,
        description: feed.description,
        siteUrl: `${SITE_URL}${SITE_BASE_URL}${feed.localePrefix}`,
        feedUrl: `${SITE_URL}${SITE_BASE_URL}${feed.feedPath}`,
        language: feed.language,
        lastBuildDate,
      },
      items,
    )
    const target = join(publicDir, feed.file)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, xml, 'utf8')
    console.log(`[seo] ${feed.file}（${items.length} 篇文章）已写入`)
  }
}

/** 产物 public 目录：build:before 时由 nitro 实例填充（generate 模式即 .output/public） */
let outputPublicDir = ''

/** 中文路由清单：根路径（风格画廊）+ registry 派生的风格页 + 内容详情页 */
const baseZhRoutes = ['/', ...stylePrerenderRoutes(), ...styleDetailRoutes()]

/**
 * 双语展开：中文路由 → 追加 /en 前缀版本。
 * ------------------------------------------------------------
 * 必须显式列英文路由，不能指望 i18n 自动展开——@nuxtjs/i18n v9 只有
 * strategy === 'prefix' 时才往 prerender.routes 注入本地化路由
 * （见其 prepareStrategy），prefix_except_default 下一个都不注入。
 * 本站用的是 prefix_except_default，2026-09-27 实测线上 /en/** 全量 404
 * 就是这个原因（sitemap 还因此多写了 400 条死链）。
 */
const allLocaleRoutes = [
  ...baseZhRoutes,
  ...baseZhRoutes.map((route) => (route === '/' ? '/en' : `/en${route}`)),
]

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

  // 这里原本有一段 `fonts: { providers: { google: false } }`，已删除：
  // 该配置属于 @nuxt/fonts 模块，而 modules 里没有注册它，属于永不生效的死配置
  //（TS 也报 InputConfig 上不存在 fonts）。各风格字体一律用系统字体栈
  //（见 styles/<id>/tokens.css 的 --font-*，约定禁止引入字体文件），
  // 本就不存在从 Google Fonts 拉字体的路径。

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
        await writeFeeds(outputPublicDir)
        await writeStyleOgImages(outputPublicDir)
      },
    },
    prerender: {
      // 预渲染清单：中文路由 + 显式展开的英文路由（双语共 802 条）。
      // 旧写法里这里是 '/styles'，阶段 3 后画廊搬到 '/'，故改为 '/'。
      routes: allLocaleRoutes,
      // 关闭链接爬取：清单本身已经是完整的 101 条路由（×2 语言由 i18n 展开），
      // 不需要再跟着页面里的 <a> 走。爬取的坏处是会把页面里残存的死链
      // （如已随过渡层删除的 /blog/<slug>、/projects/<slug>）也拉进来预渲染，
      // 一旦 404 就让整个构建失败——2026-09-23 的 CI 就是这么挂的。
      crawlLinks: false,
    },
  },

  // Markdown 代码块语法高亮（@nuxt/content 内置 shiki）
  content: {
    build: {
      markdown: {
        highlight: {
          // 双主题：亮底风格取 --shiki-default，暗底风格取 --shiki-dark。
          // 必须显式声明——默认的 github-light/github-dark 是普通对比度，
          // 注释色（#6A737D）在多数风格的代码块底色上不到 4.5:1；
          // high-contrast 版是官方可达性专供，实测代码 token 对比度 7~11:1。
          //
          // ⚠️ shiki 双主题只输出 CSS 变量（--shiki-default / --shiki-dark），
          // 真正把它接到 color 上的规则挂在 `html .default` / `html .dark`，
          // 而本站没有 color-mode（Nuxt UI 已随过渡层移除）→ 两条都不生效，
          // 代码块会一直是纯文本色。接线放在 styles/_base/base.css，
          // 由各风格决定取亮色还是暗色变量。
          theme: {
            default: 'github-light-high-contrast',
            dark: 'github-dark-high-contrast',
          },
        },
      },
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
