# my-personalWebsite

综合型个人网站，包含首页、技术博客、项目作品集、关于页面和联系方式五大核心模块。采用 Nuxt 3 SSG 静态生成 + GitHub Pages 部署方案，内容通过 Markdown 文件 + @nuxt/content v3 管理，UI 使用 Nuxt UI v3 组件库。

## 功能特性

- **首页**：个人简介、最新博客预览、精选项目展示、社交链接
- **博客系统**：Markdown 文章管理、分类/标签筛选、文章详情、全文搜索
- **项目集锦**：项目卡片展示、项目详情页、技术栈标签、在线演示/GitHub 链接
- **关于页面**：个人信息、技能树、工作经历时间线、教育背景
- **联系表单**：静态表单提交（Formspree 第三方服务）
- **国际化**：中英文双语支持，URL 策略 prefix_except_default
- **主题切换**：亮色/暗色双模式，持久化到 localStorage
- **响应式设计**：移动端优先，适配手机/平板/桌面

## 技术栈

| 类别   | 技术                                            | 用途                      |
| ------ | ----------------------------------------------- | ------------------------- |
| 框架   | Nuxt 3 (^3.17, SSG 模式)                        | 全栈框架                  |
| UI     | Nuxt UI v3 + Tailwind CSS v4                    | 组件库 + 原子化 CSS       |
| 语言   | TypeScript ^5.x                                 | 类型安全                  |
| 内容   | @nuxt/content v3                                | Markdown 渲染与搜索       |
| 国际化 | @nuxtjs/i18n ^9.x                               | 中/英双语                 |
| 主题   | @nuxtjs/color-mode                              | 亮色/暗色切换             |
| 图片   | @nuxt/image ^1.x                                | 响应式图片优化            |
| 数据库 | Drizzle ORM + PostgreSQL 17                     | 预留，Docker Compose 本地 |
| 测试   | Vitest                                          | 单元测试                  |
| 规范   | ESLint + Prettier + Commitlint + husky + cspell | 代码质量                  |
| 部署   | GitHub Actions → GitHub Pages                   | CI/CD + 静态托管          |

## 项目结构

```
my-personalWebsite/
├── .github/workflows/deploy.yml   # GitHub Actions CI/CD 部署配置
├── assets/css/main.css            # 全局样式入口（Tailwind @theme Design Tokens）
├── components/                    # Vue 组件
│   ├── layout/                    # 布局组件（AppHeader, AppFooter, AppSidebar）
│   ├── home/                      # 首页组件（HeroSection, LatestPosts, FeaturedProjects）
│   ├── blog/                      # 博客组件（BlogCard, BlogDetail, BlogList, BlogToc）
│   ├── project/                   # 项目组件（ProjectCard, ProjectDetail, ProjectGrid）
│   └── common/                    # 通用组件（ThemeToggle, LangSwitcher, SearchModal, ContactForm）
├── composables/                   # 可组合函数（内容获取抽象层）
│   ├── useBlog.ts                 # 博客数据获取
│   ├── useProjects.ts             # 项目数据获取
│   └── useSiteConfig.ts           # 站点配置与导航
├── content/                       # Markdown 内容文件
│   ├── blog/zh/                   # 中文博客文章
│   ├── blog/en/                   # 英文博客文章
│   ├── projects/zh/               # 中文项目介绍
│   └── projects/en/               # 英文项目介绍
├── docker/docker-compose.yml      # 本地 PostgreSQL 开发环境
├── drizzle/schema.ts              # 数据库 Schema（预留）
├── i18n/                          # 国际化语言包
│   ├── zh-CN.json                 # 中文
│   └── en-US.json                 # 英文
├── layouts/default.vue            # 默认布局（Header + main + Footer）
├── pages/                         # 文件路由
│   ├── index.vue                  # 首页
│   ├── blog/index.vue             # 博客列表
│   ├── blog/[slug].vue            # 博客详情
│   ├── projects/index.vue         # 项目列表
│   ├── projects/[slug].vue        # 项目详情
│   ├── about.vue                  # 关于页面
│   └── contact.vue                # 联系页面
├── types/                         # TypeScript 类型定义
│   ├── blog.ts                    # 博客相关类型
│   ├── project.ts                 # 项目相关类型
│   └── site.ts                    # 站点配置类型
├── utils/format.ts                # 工具函数（日期格式化、阅读时长、slug 生成）
├── app.vue                        # Nuxt 应用入口
├── error.vue                      # 全局错误页
├── content.config.ts              # @nuxt/content v3 collections 定义
├── nuxt.config.ts                 # Nuxt 主配置
└── vitest.config.ts               # 单测配置
```

## 快速开始

### 环境要求

- Node.js >= 20 LTS
- pnpm（推荐）或 npm

### 安装与开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 生成静态站点
pnpm generate

# 本地预览生成结果
pnpm preview
```

### 环境变量

复制 `.env.example` 为 `.env`，按需修改：

| 变量                   | 说明                          | 默认值                           |
| ---------------------- | ----------------------------- | -------------------------------- |
| `NUXT_PUBLIC_SITE_URL` | 站点 URL                      | `https://yourusername.github.io` |
| `DATABASE_URL`         | PostgreSQL 连接字符串（可选） | -                                |

## 规范检查

```bash
pnpm lint          # ESLint 检查
pnpm lint:fix      # ESLint 检查并自动修复
pnpm format        # Prettier 格式化
pnpm format:check  # Prettier 格式检查
pnpm spellcheck    # cspell 拼写检查
pnpm test          # 运行 Vitest 单元测试
pnpm test:watch    # 运行测试（监听模式）
```

## 部署

项目使用 GitHub Actions 自动构建部署到 GitHub Pages：

1. 推送代码到 `main` 分支触发自动部署
2. GitHub Actions 执行 `pnpm install → pnpm generate`
3. 将 `.output/public/` 部署到 GitHub Pages

### 关键配置

- `nuxt.config.ts` 中 `app.baseURL` 设为 `/my-personalWebsite/`
- i18n 使用 `prefix_except_default` 策略（中文无前缀，英文 URL 带 `/en/`）
- 图片优化使用 `@nuxt/image` 的 `ipx` provider

## 本地数据库（可选）

如需启动本地 PostgreSQL 开发环境：

```bash
# 启动 Docker Compose
docker compose -f docker/docker-compose.yml up -d

# 停止
docker compose -f docker/docker-compose.yml down
```

## 开发规范

- **注释语言**：中文，使用 JSDoc 标准注释
- **代码格式**：遵循 Prettier 配置
- **代码质量**：遵循 ESLint 规则
- **提交规范**：Conventional Commits（feat/fix/docs/style/refactor/test/chore）
- **拼写检查**：cspell
- **测试**：Vitest 单元测试，新增功能需同步更新测试
- **组件命名**：自动导入 `pathPrefix: false`，组件名不带目录前缀

## 架构要点

1. **SSG 优先**：`nuxt generate` 生成纯静态站点，不依赖 Node.js 运行时
2. **内容层抽象**：`composables/` 封装数据获取逻辑，组件不直接硬编码数据源
3. **数据层预留**：Drizzle + PostgreSQL 可选，通过 composables 隔离
4. **路由**：基于文件路由，`pages/` 目录结构即路由结构
