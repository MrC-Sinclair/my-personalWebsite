# AGENTS.md - 项目 AI 代理上下文

## 项目概述

综合型个人网站，包含首页、技术博客、项目作品集、关于页面和联系方式五大核心模块。采用 Nuxt 3 SSG 静态生成 + GitHub Pages 部署方案，内容通过 Markdown 文件 + @nuxt/content v3 管理，UI 使用 Nuxt UI v3 组件库。完整适配移动端，支持 PWA 离线访问。

## 技术栈

### 前端核心

- **Nuxt 3** (^3.17) - 全栈框架，SSG 模式
- **Vue 3** (^3.5) - 前端框架
- **Nuxt UI** (^3.x) - UI 组件库（基于 Headless UI）
- **Tailwind CSS** (^4.x) - 原子化 CSS（v4 @theme 指令）
- **TypeScript** (^5.x) - 类型安全
- **@nuxt/content** (^3.x) - Markdown 内容渲染与搜索
- **@nuxtjs/i18n** (^9.x) - 国际化（中/英）
- **@nuxtjs/color-mode** (^4.x) - 主题切换（暗色/亮色，Nuxt UI 内置）
- **@nuxt/image** (^1.x) - 响应式图片优化（含 sizes 属性）
- **@vite-pwa/nuxt** (^1.x) - PWA 支持（离线访问、添加到主屏幕）

### 服务端 / 数据层（预留）

- **Drizzle ORM** - 轻量级 ORM（未来数据库接入预留）
- **PostgreSQL 17** - 关系型数据库（本地开发环境）
- **Docker Compose** v2 - 本地开发基础设施编排

### 工程规范工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Commitlint + husky** - 提交信息规范 + Git hooks
- **cspell** - 拼写检查
- **Vitest** - 单元测试

### 部署

- **GitHub Actions** - CI/CD 自动构建部署
- **GitHub Pages** - 静态站点托管

## 架构关键决策

1. **SSG 优先**：使用 `nuxt generate` 纯静态生成，不依赖 Node.js 运行时
2. **内容层抽象**：所有内容获取逻辑封装在 `composables/` 中，组件内不硬编码数据获取方式
3. **数据层预留**：Drizzle + PostgreSQL 仅作为开发环境可选配置，通过 composables 层隔离数据源
4. **路由语义化**：提前定义完整路由结构，页面可先留空骨架逐步填充
5. **移动端优先**：所有组件遵循移动端优先渐进增强策略，独立移动端交互组件

## 目录结构

```
my-personalWebsite/
├── .github/workflows/deploy.yml
├── content/                    # Markdown 内容
│   ├── blog/zh/ & en/
│   └── projects/zh/ & en/
├── docker/docker-compose.yml
├── public/                     # 静态资源
├── server/api/                 # 服务端 API（预留）
├── assets/css/                 # 未编译资源（含 @theme Design Tokens + prefers-reduced-motion + safe-area）
├── composables/                # 可组合函数（内容获取抽象层）
│   ├── useBlog.ts
│   ├── useProjects.ts
│   └── useSiteConfig.ts
├── components/                 # 组件
│   ├── layout/                 # 布局组件（AppHeader, AppFooter, AppSidebar, MobileNavBar）
│   ├── home/                   # 首页组件
│   ├── blog/                   # 博客组件（含 MobileToc 移动端目录）
│   ├── project/                # 项目组件
│   └── common/                 # 通用组件（ThemeToggle, LangSwitcher, SearchModal, ContactForm）
├── layouts/default.vue
├── pages/                      # 文件路由
│   ├── index.vue
│   ├── blog/index.vue & [slug].vue
│   ├── projects/index.vue & [slug].vue
│   ├── about.vue
│   └── contact.vue
├── types/                      # TypeScript 类型
├── utils/                      # 工具函数
├── i18n/                       # 国际化语言包
├── drizzle/                    # Drizzle ORM 配置（预留）
├── content.config.ts           # @nuxt/content v3 collections 定义
├── nuxt.config.ts              # 含 PWA 配置
└── vitest.config.ts
```

## 代码规范

- 注释规范齐全且使用中文
- 遵循 ESLint 规范
- 遵循 Prettier 格式化规则
- Commit 信息遵循 Commitlint 规范（Conventional Commits）
- 拼写检查通过 cspell
- 单元测试使用 Vitest

## 设计规范

- **风格**：现代科技感 + 极简主义
- **策略**：移动端优先，渐进增强
- **主题**：完整亮色/暗色双模式
- **主色**：Indigo 系 (#6366F1)
- **字体**：Inter + Noto Sans SC（正文），JetBrains Mono（代码）
- **响应式断点**：默认(<640px) / sm(≥640px) / md(≥768px) / lg(≥1024px) / xl(≥1280px)
- **动效**：快速 150ms / 标准 250ms / 慢速 400ms，尊重 prefers-reduced-motion（全局 CSS 规则已实现）
- **无障碍**：WCAG AA 标准，色彩对比度 ≥ 4.5:1，键盘导航，语义化 HTML，触控目标 ≥ 44×44px
- **安全区域**：viewport-fit=cover + env(safe-area-inset-*) 适配刘海屏

## 移动端适配方案

### 核心交互

- **AppHeader**：移动端汉堡菜单带 slide-down 动画 + 外部点击关闭 + body scroll lock
- **搜索入口**：AppHeader 添加搜索图标按钮，移动端和桌面端均可触发 SearchModal
- **MobileToc**：博客详情页移动端浮动 TOC 按钮（右下角），点击弹出底部目录面板
- **MobileNavBar**：移动端底部固定导航栏（md 以下显示），提供主要页面快速切换
- **AppSidebar**：移动端抽屉式侧边栏（左侧滑入 + 遮罩层），桌面端固定显示

### 体验优化

- **触控目标**：所有可交互元素触控区域 ≥ 40×40px（h-10 w-10），接近 WCAG 推荐 44×44px
- **prefers-reduced-motion**：全局 CSS 规则禁用动画和过渡（`assets/css/main.css`）
- **响应式图片**：NuxtImg 组件配置 `sizes="sm:100vw md:50vw lg:33vw"`，避免移动端下载大图
- **ProjectCard**：整张卡片可点击跳转（NuxtLink 包裹），内部按钮使用 `@click.stop` 阻止冒泡

### 高级特性

- **安全区域适配**：viewport meta 添加 `viewport-fit=cover`，CSS 提供 `safe-bottom/top/left/right` 工具类
- **PWA**：@vite-pwa/nuxt 模块，支持添加到主屏幕、离线访问、自动更新
- **Apple Web App**：配置 apple-mobile-web-app-capable + black-translucent 状态栏

## 开发注意事项

- GitHub Pages 需配置 `app.baseURL` 为仓库名前缀（如 `/my-personalWebsite/`）
- @nuxt/content v3 使用 `defineCollection` + Zod schema 在 `content.config.ts` 中定义
- i18n 使用 `prefix_except_default` 策略（除默认语言外 URL 带 `/en/` 前缀）
- 图片使用 `@nuxt/image` 优化，配置 `provider: ipx`，卡片组件需配置 `sizes` 属性
- 新增功能时需同步更新单元测试
- 移动端专属组件命名以 `Mobile` 前缀（如 MobileToc、MobileNavBar）
- 移动端交互组件（抽屉、弹出面板）需提供遮罩层 + 关闭按钮 + 路由切换自动关闭
- 布局 `default.vue` 中 `main` 添加 `pb-16 md:pb-0` 为移动端底部导航栏留出空间
