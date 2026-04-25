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

  css: ['~/assets/css/main.css'],

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

  runtimeConfig: {
    public: {
      web3formsKey: '',
    },
  },

  compatibilityDate: '2025-04-18',

  devtools: { enabled: true },

  icon: {
    customCollections: [
      {
        prefix: 'local',
        icons: {
          feishu: {
            body: '<path fill="currentColor" d="M2.5 10.8L21 3.2c.4-.2.8.2.7.6L18 13.5l2.8 6.3c.2.4-.2.8-.6.6l-7.3-3.2L6 20.8c-.4.2-.8-.2-.7-.6l3.2-7.2-6-2.2c-.4-.2-.4-.8 0-1zm7.7 3.2l-2.5 5.6 5.7-2.9-3.2-2.7zm6.4-7.6L10 12.5l3.7 3.1 2.9-9.2z"/>',
          },
        },
      },
    ],
  },
})
