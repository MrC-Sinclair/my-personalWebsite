---
title: 使用 Nuxt 3 构建个人网站
description: 记录使用 Nuxt 3 + Nuxt UI + @nuxt/content 搭建个人网站的全过程，分享技术选型、移动端适配与 PWA 实现细节。
date: '2025-04-15'
updated: '2025-04-28'
tags:
  - Nuxt
  - Vue
  - SSG
  - PWA
  - 移动端适配
category: 前端
draft: false
---

## 为什么选择 Nuxt 3

在众多前端框架中，我选择 Nuxt 3 主要基于以下考量：

- **SSG 是个人网站的最优解**：个人网站内容更新频率低、无服务端逻辑，预渲染为纯静态 HTML 后加载极快，部署到 GitHub Pages 零成本。Nuxt 3 同时支持 SSR/SSG/混合渲染，未来如果需要动态功能（如评论系统），可以逐页切换渲染模式，不必重构
- **生态完整**：Nuxt UI、@nuxt/content、@nuxtjs/i18n、@vite-pwa/nuxt 等官方/社区模块覆盖了个人网站几乎所有需求，避免自己拼装
- **TypeScript 优先**：从路由参数到内容 schema 全链路类型安全，配合 Zod 做运行时校验，构建时就能捕获内容格式错误

## 技术栈选择与踩坑

### 内容管理：@nuxt/content v3

选择 @nuxt/content v3 而非 v2，是因为 v3 引入了 `defineCollection` + Zod schema，可以在构建时校验 Markdown frontmatter 的字段类型和格式。

**踩坑**：v3 的 collection 必须按 source 路径分离，不支持在单个 collection 内用语言字段区分。因此中英文内容需要定义独立的 collection：

```ts
// content.config.ts
const blogSchema = z.object({
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  // ...
})

export default defineContentConfig({
  collections: {
    blogZh: defineCollection({ type: 'page', source: 'blog/zh/**/*.md', schema: blogSchema }),
    blogEn: defineCollection({ type: 'page', source: 'blog/en/**/*.md', schema: blogSchema }),
  },
})
```

这样做的好处是 schema 可以在中文和英文 collection 之间复用，坏处是每新增一种语言就要加一对 collection。对于个人网站的双语场景，这个代价可以接受。

### 国际化：@nuxtjs/i18n

使用 `prefix_except_default` 策略：中文（默认语言）URL 无前缀，英文带 `/en/` 前缀。这样中文用户访问的 URL 更简洁，英文用户也能通过前缀明确语言。

**踩坑**：i18n 切换语言时，composable 中缓存的列表数据需要清空，否则页面会短暂显示旧语言内容。解决方案是在 composable 中 `watch(locale)` 时清空缓存：

```ts
const postsCache = ref<BlogPost[] | null>(null)

watch(locale, () => {
  postsCache.value = null
})
```

### Design Token 系统

项目通过 Tailwind CSS v4 的 `@theme` 指令统一管理设计变量，避免组件中硬编码颜色值：

```css
@theme {
  --color-primary-500: #6366f1;
  --color-surface-light: #ffffff;
  --color-surface-dark: #0f172a;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --z-overlay: 40;
  --z-modal: 50;
}
```

这样组件中使用 `bg-surface-light dark:bg-surface-dark`、`duration-fast` 等语义 Token，换主题色只需改一处。

## 移动端适配：为什么这样做

项目遵循"移动端优先，渐进增强"策略。以下是几个关键决策及其背后的原因。

### 为什么需要独立的移动端组件

最初我把移动端和桌面端的交互逻辑写在同一个组件里，用 `v-if` + 断点切换。但很快发现这会导致：

1. **组件臃肿**：一个组件同时维护两套交互逻辑（如侧边栏固定显示 vs 抽屉滑入），可读性急剧下降
2. **SSR 困境**：服务端无法知道屏幕宽度，`v-if="isMobile"` 在 SSR 时只能猜一个默认值，容易导致 hydration mismatch

最终方案是拆分为独立组件：`MobileToc`（浮动按钮 + 底部面板）和 `BlogToc`（侧边栏固定），通过 CSS 媒体查询控制显示（`lg:hidden` vs `hidden lg:block`），SSR 时两套 DOM 都渲染，客户端由 CSS 决定哪套可见，避免 hydration 问题。

### 滚动动画的 SSG 兼容方案

常见的滚动动画方案是在 `onMounted` 中给元素设置初始透明状态，但这会导致 SSG 场景下的 hydration mismatch——服务端渲染的 HTML 是可见的，客户端 mount 后突然变透明再动画出现。

我的方案是用纯 CSS 定义初始状态，IntersectionObserver 只负责添加 `.revealed` 类：

```ts
export function useScrollReveal() {
  onMounted(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer.observe(el)
    })
  })
}
```

CSS 中 `.scroll-reveal` 初始 `opacity: 0`，`.scroll-reveal.revealed` 过渡到 `opacity: 1`。服务端渲染时元素就是透明的（CSS 生效），客户端进入视口后添加类触发过渡，SSR 和客户端渲染结果一致。

同时，`prefers-reduced-motion` 下必须显式覆盖 `.scroll-reveal { opacity: 1 !important; transform: none !important }`，仅设置 `transition-duration: 0` 不够——`opacity: 0` 是静态样式不是 transition，不会因为禁用过渡就自动变为可见。

### 触控目标的教训

移动端可交互元素的触控区域应 ≥ 40×40px（WCAG 推荐 44×44px）。我在开发中漏掉了 MobileToc 面板的关闭按钮，用了 `h-8 w-8`（32px），后来审查时才发现并修正为 `h-10 w-10`。这类问题容易遗漏，建议在代码审查时专门检查移动端按钮尺寸。

### 安全区域适配

iPhone X 及以上机型有底部 Home Indicator，固定定位的底部导航栏会被遮挡。解决方案：

```css
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

viewport meta 需添加 `viewport-fit=cover`，否则 `env(safe-area-inset-*)` 值为 0。

## PWA 实现要点

通过 @vite-pwa/nuxt 模块实现 PWA 支持，关键配置：

- `registerType: 'autoUpdate'`：Service Worker 自动更新，用户无需手动刷新
- `client: { installPrompt: true }`：启用安装提示
- `apple-mobile-web-app-capable` + `black-translucent` 状态栏：iOS 添加到主屏幕后全屏显示

**踩坑**：iOS 的 PWA 状态栏默认覆盖页面内容，必须用 `safe-area-inset-top` 给顶部留出空间，否则 AppHeader 会被状态栏遮挡。

## 总结

通过 Nuxt 3 生态系统的各个模块，我们可以快速搭建一个功能完善、性能优异的个人网站。开发过程中最大的挑战不是功能实现，而是 SSG 场景下的 hydration 一致性和移动端交互的细节打磨。以下是我总结的几条经验：

1. **SSG 项目中，所有"客户端才知道的值"都必须延迟到 `onMounted` 或用 `<ClientOnly>` 包裹**，否则必然产生 hydration mismatch
2. **移动端交互组件应该独立拆分**，而非在同一个组件内用条件判断切换，这样代码更清晰、SSR 更安全
3. **Design Token 统一管理**比看起来更重要——当项目从 10 个组件增长到 50 个时，硬编码的颜色值会成为维护噩梦
4. **触控目标尺寸这类细节容易遗漏**，建议建立检查清单，在代码审查时逐项确认
