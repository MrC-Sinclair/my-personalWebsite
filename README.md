# my-personalWebsite

**一站多风格的个人网站**：同一套内容与业务逻辑，20 种完全不同的 UI 风格。采用 Nuxt 3 SSG 静态生成 + GitHub Pages 部署，内容通过 Markdown + @nuxt/content v3 管理，中英双语，支持 PWA 离线访问。

## 站点形态

| 路由                                | 内容                                        |
| ----------------------------------- | ------------------------------------------- |
| `/`                                 | 风格画廊（20 个风格入口，站点的门脸）      |
| `/style/<id>/`                      | 某风格的首页（单页式，导航为页内锚点）      |
| `/style/<id>/about`                 | 关于                                        |
| `/style/<id>/projects`              | 项目                                        |
| `/style/<id>/blog`                  | 博客                                        |
| `/style/<id>/contact`               | 联系                                        |

20 风格 × 5 页 + 画廊 = **101 条路由**（预渲染清单由 `styles/registry.ts` 自动派生）。`/styles` 与 `/en/styles` 301 重定向到 `/`。

## 功能特性

- **20 种 UI 风格**：minimalism、liquid-glass、metro、swiss、editorial、flat-design、dashboard、terminal、cyberpunk、y2k、web2-glossy、pixel、retro-computer、sci-fi-hud、soft-3d、glassmorphism、claymorphism、neumorphism、skeuomorphism、neo-brutalism
- **UI 不复用、业务逻辑复用**：风格层各写各的结构与 token；取数、滚动动画、格式化等行为只写一份在 `composables/` / `utils/`
- **内容驱动**：blog 每个语种 14 篇，projects 目前 1 篇（中英各一份）
- **国际化**：中英双语，URL 策略 `prefix_except_default`（中文无前缀，英文 `/en/`）
- **PWA**：添加到主屏幕、离线访问、自动更新
- **无障碍**：WCAG AA、prefers-reduced-motion、刘海屏安全区域适配

## 技术栈

| 类别   | 技术                                            | 用途                       |
| ------ | ----------------------------------------------- | -------------------------- |
| 框架   | Nuxt 3 (^3.17.7, SSG 模式)                      | 全栈框架                   |
| UI     | 无第三方 UI 库                                  | 每风格原生元素 + 独立 token |
| 语言   | TypeScript ^5.8.3                               | 类型安全                   |
| 内容   | @nuxt/content v3 (^3.6.3)                       | Markdown 渲染              |
| 国际化 | @nuxtjs/i18n ^9.5.5                             | 中/英双语                  |
| 图标   | @iconify-json/tabler + simple-icons             | 按需内联 SVG               |
| 图片   | @nuxt/image ^1.10.0                             | 响应式图片优化（含 sizes） |
| PWA    | @vite-pwa/nuxt ^1.1.1                           | 离线访问、添加到主屏幕     |
| 测试   | Vitest (^3.1.4)                                 | 单元测试                   |
| 规范   | ESLint + Prettier + Commitlint + husky + cspell | 代码质量                   |
| 部署   | GitHub Actions → GitHub Pages                   | CI/CD + 静态托管           |

> Nuxt UI 与 Tailwind 已随过渡层整体移除（阶段 3），风格层与它们零耦合。

## 项目结构

```
my-personalWebsite/
├── .github/workflows/deploy.yml   # GitHub Actions CI/CD（Node 22 + pnpm 11 → pnpm generate）
├── app.vue                        # Nuxt 应用入口
├── error.vue                      # 全局错误页（自包含）
├── composables/                   # 业务逻辑层（唯一来源）
│   ├── useBlog.ts                 # 博客数据获取
│   ├── useProjects.ts             # 项目数据获取
│   ├── useSiteConfig.ts           # 站点配置（导出 useAppInfo 函数）
│   └── useScrollReveal.ts         # 滚动进入视口动画（IntersectionObserver）
├── content/                       # Markdown 内容文件
│   ├── blog/zh|en/                # 博客文章
│   └── projects/zh|en/            # 项目介绍
├── i18n/                          # 国际化语言包（各 134 key，双向零缺失）
├── layouts/style.vue              # 风格裸布局
├── pages/
│   ├── index.vue                  # 风格画廊（/）
│   └── style/[style]/[...slug].vue # 薄壳路由（不含 UI，未知风格/页面抛 404）
├── styles/
│   ├── registry.ts                # 风格注册表（20 个风格，status 全 ready）
│   ├── _base/                     # base.css（reset + 工具类）+ tokens.css（变量契约）
│   └── <id>/                      # index.ts + tokens.css + components/ + pages/
├── types/                         # TypeScript 类型定义
├── utils/format.ts                # 工具函数（日期、阅读时长、slug）
├── public/images/                 # 静态图片资源
├── content.config.ts              # @nuxt/content v3 collections 定义
├── nuxt.config.ts                 # Nuxt 主配置（含 PWA、i18n、预渲染路由）
├── tests/                         # Vitest（styles-structure.test.ts 守结构契约）
├── docs/architecture/             # multi-style-ui.md 总纲 + style-authoring-guide.md SOP
└── docker/docker-compose.yml      # 本地 PostgreSQL（备用，当前未接入）
```

## 快速开始

### 环境要求

- **Node.js >= 22.13**（`packageManager: pnpm@11.25.0` 的 engines 要求；CI 同样锁 22）
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

| 变量                   | 说明     | 默认值                           |
| ---------------------- | -------- | -------------------------------- |
| `NUXT_PUBLIC_SITE_URL` | 站点 URL | `https://yourusername.github.io` |

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

> CI 里 **Setup Node 必须排在 Setup pnpm 之前**，且 Node 版本 ≥ 22.13，否则 `Setup pnpm` 会直接失败（2026-09-18 ~ 09-23 期间 CI 因此全红，线上版本停滞）。

### 手动部署到自有服务器（腾讯云轻量 + 宝塔）

如需发布到自有服务器，按以下步骤操作：

```bash
# 1. 本地生成静态站点（先关闭 Nuxt 遥测询问）
$env:NUXT_TELEMETRY_DISABLED = "1"
pnpm generate
```

2. 将 `.output/public/` 目录打包为 zip
3. 打开宝塔面板，上传 zip 到站点根目录并解压覆盖
4. 浏览器访问验证（返回 HTTP 200 即成功）

关键点：

- `pnpm generate` 已定义在 package.json 的 `scripts` 中，直接执行即可
- 服务器站点根目录：`/www/wwwroot/my-personalWebsite/`
- 本流程为手动发布；如要自动化，可另配 GitHub Actions 通过 SSH/SFTP 推送产物

### 关键配置

- `nuxt.config.ts` 中 `app.baseURL` 设为 `/my-personalWebsite/`
- i18n 使用 `prefix_except_default` 策略（中文无前缀，英文 URL 带 `/en/`）
- 图片优化使用 `@nuxt/image` 的 `ipx` provider，卡片组件配置 `sizes` 属性
- PWA 配置在 `nuxt.config.ts` 的 `pwa` 字段
- 预渲染路由由 `stylePrerenderRoutes()` 从注册表派生，无需手工维护

## 开发规范

- **注释语言**：中文，使用 JSDoc 标准注释
- **代码格式**：遵循 Prettier 配置
- **代码质量**：遵循 ESLint 规则
- **提交规范**：Conventional Commits（feat/fix/docs/style/refactor/test/chore）
- **拼写检查**：cspell
- **测试**：Vitest 单元测试，新增功能需同步更新测试
- **组件命名**：`styles/<id>/` 下组件不走自动导入，一律显式 import 且带风格前缀
- **样式作用域**：`styles/<id>/layout.css` 每条选择器必须加 `[data-style='<id>']` 前缀

## 架构要点

1. **SSG 优先**：`nuxt generate` 生成纯静态站点，不依赖 Node.js 运行时
2. **三层分工**：内容层（content/ + i18n/）、业务逻辑层（composables/ + types/ + utils/）、风格表现层（styles/<id>/）
3. **UI 不跨风格复用**：风格内部的重复可以抽组件（如 `XxxSubPage`），但不得跨风格引用
4. **薄壳路由**：`pages/style/[style]/[...slug].vue` 不含 UI，只解析注册表与渲染对应页面组件
5. **每个风格自带移动端方案**：导航、页脚、断点都在风格目录内，不复用跨风格组件
