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
      // 风格预渲染路由清单 —— 必须与 styles/registry.ts 同步维护；
      // 画廊页与各风格内部链接由预渲染爬虫自动发现
      routes: [
        '/styles',
        '/style/liquid-glass',
        '/style/neo-brutalism',
        '/style/soft-3d',
        '/style/minimalism',
        '/style/cyberpunk',
        '/style/editorial',
        '/style/y2k',
        '/style/web2-glossy',
        '/style/pixel',
        '/style/terminal',
        '/style/dashboard',
        '/style/swiss',
        '/style/retro-computer',
        '/style/sci-fi-hud',
        '/style/claymorphism',
        '/style/neumorphism',
        '/style/glassmorphism',
        '/style/skeuomorphism',
        '/style/metro',
        '/style/flat-design',
      ],
    },
  },

  runtimeConfig: {
    public: {},
  },

  compatibilityDate: '2025-04-18',

  devtools: { enabled: true },
})
