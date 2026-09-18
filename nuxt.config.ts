import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { styleRegistry, STYLE_SUB_PATHS } from './styles/registry'

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

export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@nuxt/image',
    '@nuxt/eslint',
    '@vite-pwa/nuxt',
  ],

  components: [{ path: '~/components', pathPrefix: false }],

  css: ['~/assets/css/main.css', '~/styles/_base/tokens.css'],

  app: {
    baseURL: '/my-personalWebsite/',
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: '个人网站 - 技术博客、项目作品集、关于我' },
        { name: 'og:type', content: 'website' },
        { name: 'og:site_name', content: '我的个人网站' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'theme-color', content: '#6366f1' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
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
          src: '/favicon.ico',
          sizes: '48x48',
          type: 'image/x-icon',
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

  nitro: {
    prerender: {
      // 风格预渲染路由清单 —— 由 styles/registry.ts 与 STYLE_ALL_PATHS 自动生成。
      // 以前这里是 21 条手写路径，新增风格/子页时必须记得同步，漏了就静默不预渲染；
      // 改成派生后新增风格只需改注册表。画廊页与各风格内部链接仍由预渲染爬虫自动发现。
      routes: ['/styles', ...stylePrerenderRoutes()],
    },
  },

  runtimeConfig: {
    public: {},
  },

  compatibilityDate: '2025-04-18',

  devtools: { enabled: true },
})
