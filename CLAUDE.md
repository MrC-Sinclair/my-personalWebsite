# CLAUDE.md - Claude AI 项目上下文

## 项目简介

这是一个综合型个人网站项目，使用 Nuxt 3 SSG 静态生成 + GitHub Pages 部署。包含首页、博客、项目集锦、关于、联系五大模块。内容通过 Markdown + @nuxt/content v3 管理，UI 使用 Nuxt UI v3。

## 技术栈

| 类别   | 技术                                                    |
| ------ | ------------------------------------------------------- |
| 框架   | Nuxt 3 (^3.17, SSG 模式) + Vue 3 (^3.5)                 |
| UI     | Nuxt UI v3 + Tailwind CSS v4                            |
| 语言   | TypeScript ^5.x                                         |
| 内容   | @nuxt/content v3 (Markdown + Zod schema)                |
| 国际化 | @nuxtjs/i18n ^9.x (中/英)                               |
| 主题   | @nuxtjs/color-mode (Nuxt UI 内置，亮色/暗色)            |
| 图片   | @nuxt/image ^1.x                                        |
| 数据库 | Drizzle ORM + PostgreSQL 17 (预留，Docker Compose 本地) |
| 测试   | Vitest                                                  |
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

## 目录约定

```
content/          → Markdown 内容（blog/zh/, blog/en/, projects/zh/, projects/en/）
composables/      → 数据获取抽象层（useBlog, useProjects, useAppInfo）
components/
  layout/         → AppHeader, AppFooter, AppSidebar
  home/           → HeroSection, LatestPosts, FeaturedProjects
  blog/           → BlogList, BlogCard, BlogDetail, BlogToc
  project/        → ProjectGrid, ProjectCard, ProjectDetail
  common/         → ThemeToggle, LangSwitcher, SearchModal, ContactForm
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
- **动效**：快速 150ms / 标准 250ms / 慢速 400ms
- **无障碍**：WCAG AA，对比度 ≥ 4.5:1，键盘导航，语义化 HTML

## 关键配置

- `app.baseURL` 设为 `/my-personalWebsite/`（GitHub Pages）
- @nuxt/content v3 的 `defineCollection` + Zod schema 在 `content.config.ts` 定义
- i18n 使用 `prefix_except_default` 策略（默认中文无前缀，英文 URL 带 `/en/` 前缀）
- 图片 `@nuxt/image` 配置 `provider: ipx`
- 组件自动导入 `pathPrefix: false`，避免目录前缀（如 `LayoutAppHeader` → `AppHeader`）
- Tailwind CSS v4 使用 `@theme` 指令定义 Design Tokens（在 `assets/css/main.css` 中）
- ThemeToggle 等依赖客户端状态的组件使用 `<ClientOnly>` 包裹，避免 hydration mismatch

## 开发工作流

1. 新增功能前先确认路由和组件归属
2. 内容型数据放 `content/` 目录，结构化类型放 `types/`
3. 数据获取逻辑封装到 `composables/`，不要在组件中直接调用 content API
4. 新增组件遵循目录分类约定（layout/home/blog/project/common）
5. 提交前确保 ESLint + Prettier + cspell 通过
6. 新增功能需编写 Vitest 单元测试

## 与 AI 协作约定

- 有需要用户选择的方案时，列出选项让用户选择，不要自动执行
- 严格按照项目现有规范开发
- 代码注释使用中文
- 不要引入项目未使用的第三方库
- 修改代码前先理解现有代码风格和模式
