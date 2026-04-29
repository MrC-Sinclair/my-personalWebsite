# CLAUDE.md - Claude AI 项目上下文

## 项目简介

这是一个综合型个人网站项目，使用 Nuxt 3 SSG 静态生成 + GitHub Pages 部署。包含首页、博客、项目集锦、关于、联系五大模块。内容通过 Markdown + @nuxt/content v3 管理，UI 使用 Nuxt UI v3。完整适配移动端，支持 PWA 离线访问。

## 技术栈

| 类别   | 技术                                                    |
| ------ | ------------------------------------------------------- |
| 框架   | Nuxt 3 (^3.17.7, SSG 模式) + Vue 3 (^3.5)              |
| UI     | Nuxt UI v3 (^3.1.3) + Tailwind CSS v4 (^4.2.2)         |
| 语言   | TypeScript ^5.8.3                                       |
| 内容   | @nuxt/content v3 (^3.6.3, Markdown + Zod schema)       |
| 国际化 | @nuxtjs/i18n ^9.5.5 (中/英)                             |
| 主题   | @nuxtjs/color-mode (Nuxt UI 内置，亮色/暗色)            |
| 图片   | @nuxt/image ^1.10.0 (含响应式 sizes)                    |
| PWA    | @vite-pwa/nuxt ^1.1.1 (离线访问、添加到主屏幕)          |
| 数据库 | Drizzle ORM + PostgreSQL 17 (预留，Docker Compose 本地) |
| 测试   | Vitest (^3.1.4)                                         |
| 规范   | ESLint + Prettier + Commitlint + husky + cspell         |
| 部署   | GitHub Actions → GitHub Pages                           |

## 代码风格与规范

- **注释语言**：中文
- **代码格式**：遵循 Prettier 配置
- **代码质量**：遵循 ESLint 规则
- **提交规范**：Conventional Commits (feat/fix/docs/style/refactor/test/chore)
- **拼写检查**：cspell
- **测试**：Vitest 单元测试，新增功能需同步更新测试

## 架构要点

1. **SSG 优先**：`nuxt generate` 生成纯静态站点，不依赖 Node.js 运行时
2. **内容层抽象**：`composables/` 封装数据获取逻辑，组件不直接硬编码数据源
3. **数据层预留**：Drizzle + PostgreSQL 可选，通过 composables 隔离
4. **路由**：基于文件路由，`pages/` 目录结构即路由结构
5. **组件自动导入**：配置了 `pathPrefix: false`，组件名不带目录前缀（如 `AppHeader` 而非 `LayoutAppHeader`）
6. **移动端优先**：独立移动端交互组件（MobileToc、MobileNavBar），桌面端和移动端体验分离

## 目录约定

```
content/          → Markdown 内容（blog/zh/, blog/en/, projects/zh/, projects/en/）
composables/      → 数据获取抽象层（useBlog, useProjects, useSiteConfig, useScrollReveal）
                     注意：useSiteConfig.ts 文件导出的函数名为 useAppInfo()
components/
  layout/         → AppHeader, AppFooter, AppSidebar, MobileNavBar
  home/           → HeroSection, LatestPosts, FeaturedProjects
  blog/           → BlogList, BlogCard, BlogDetail, BlogToc, MobileToc
  project/        → ProjectGrid, ProjectCard, ProjectDetail
  common/         → ThemeToggle, LangSwitcher, SearchModal, ContactForm, SocialIcon
  icon/           → IconFeishu（自定义 SVG 图标组件）
pages/            → index, blog/[slug], projects/[slug], about, contact
types/            → blog.ts, project.ts, site.ts
utils/            → format.ts 等工具函数
i18n/             → zh-CN.json, en-US.json
```

## 设计系统

- **主色**：Indigo (#6366F1)，通过 CSS @theme 定义 Design Tokens
- **字体**：Inter + Noto Sans SC（正文），JetBrains Mono（代码）
- **响应式**：移动端优先，断点 sm:640 / md:768 / lg:1024 / xl:1280
- **主题**：完整亮色/暗色双模式，非简单颜色反转
- **动效**：快速 150ms / 标准 250ms / 慢速 400ms，尊重 prefers-reduced-motion（全局 CSS 已实现）
- **交互效果规范**：新组件必须包含恰当的交互效果，不可出现"裸交互"，具体场景如下：
  - **导航/路由切换**：页面切换过渡动画（fade、slide 等），导航项激活态视觉反馈
  - **卡片/按钮悬浮**：hover 时阴影提升（如 `hover:shadow-lg`）+ 微位移（如 `hover:-translate-y-1`），过渡时长 250ms
  - **面板展开收起**：滑入滑出动画（slide-down / slide-left 等），配合遮罩层淡入淡出
  - **状态切换**：开关、标签页等使用渐变过渡（`transition-colors` / `transition-opacity`），时长 150-250ms
  - **列表项**：hover 背景色变化 + 左侧指示条或图标微动
  - **模态/弹窗**：背景遮罩淡入 + 内容缩放弹入（`scale-95 → scale-100`）
  - **加载状态**：骨架屏或 spinner，避免内容突变
  - 所有过渡统一使用 Tailwind 的 `transition` / `duration-*` / `ease-*` 工具类，尊重 `prefers-reduced-motion`
- **无障碍**：WCAG AA，对比度 ≥ 4.5:1，键盘导航，语义化 HTML，触控目标 ≥ 40px
- **安全区域**：viewport-fit=cover + env(safe-area-inset-\*) 适配刘海屏

## 关键配置

- `app.baseURL` 设为 `/my-personalWebsite/`（GitHub Pages）
- @nuxt/content v3 的 `defineCollection` + Zod schema 在 `content.config.ts` 定义
- i18n 使用 `prefix_except_default` 策略（默认中文无前缀，英文 URL 带 `/en/` 前缀）
- 图片 `@nuxt/image` 配置 `provider: ipx`，卡片组件配置 `sizes="sm:100vw md:50vw lg:33vw"`
- 组件自动导入 `pathPrefix: false`，避免目录前缀（如 `LayoutAppHeader` → `AppHeader`）
- Tailwind CSS v4 使用 `@theme` 指令定义 Design Tokens（在 `assets/css/main.css` 中），z-index 必须用 `--z-index-*` 命名空间（如 `--z-index-modal: 50`），`--z-*` 不会生成工具类
- 网络受限环境下，Google Fonts 和 Google Icons 已在 `nuxt.config.ts` 中禁用（`fonts.providers.google: false, fonts.providers.googleicons: false`）
- ThemeToggle 等依赖客户端状态的组件使用 `<ClientOnly>` 包裹，避免 hydration mismatch
- PWA 配置在 `nuxt.config.ts` 的 `pwa` 字段，manifest 含 name/short_name/theme_color/icons
- viewport meta 含 `viewport-fit=cover`，适配刘海屏安全区域
- 联系表单使用 Formspree，form ID 在 `ContactForm.vue` 中硬编码，组件为 `ContactForm`
- Apple Web App 配置：`apple-mobile-web-app-capable` + `black-translucent` 状态栏

## 移动端适配要点

- **AppHeader**：搜索按钮（h-10 w-10）+ 汉堡菜单（slide-down 动画 + 外部点击关闭 + body scroll lock）
- **MobileToc**：博客详情页移动端浮动 TOC 按钮，底部弹出面板
- **MobileNavBar**：底部固定导航栏（md 以下），布局 main 需 `pb-16 md:pb-0`
- **AppSidebar**：移动端抽屉式（左侧滑入 + 遮罩层），通过 `isOpen` prop + `close` emit 控制
- **ProjectCard**：整张卡片 NuxtLink 包裹可点击，内部按钮 `@click.stop` 阻止冒泡
- **prefers-reduced-motion**：`assets/css/main.css` 全局规则禁用动画
- **安全区域**：CSS 工具类 `safe-bottom/top/left/right`，AppFooter 使用 `safe-bottom`

## 开发工作流

1. 新增功能前先确认路由和组件归属
2. 内容型数据放 `content/` 目录，结构化类型放 `types/`
3. 数据获取逻辑封装到 `composables/`，不要在组件中直接调用 content API
4. 新增组件遵循目录分类约定（layout/home/blog/project/common/icon）
5. 移动端专属组件以 `Mobile` 前缀命名（如 MobileToc、MobileNavBar）
6. 提交前确保 ESLint + Prettier + cspell 通过
7. 新增功能需编写 Vitest 单元测试

## 与 AI 协作约定

- 有需要用户选择的方案时，列出选项让用户选择，不要自动执行
- 严格按照项目现有规范开发
- 代码注释使用中文
- 不要引入项目未使用的第三方库
- 修改代码前先理解现有代码风格和模式
