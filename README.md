# my-personalWebsite

**一站多风格的个人网站**：同一套内容与业务逻辑，20 种完全不同的 UI 风格。采用 Nuxt 3 SSG 静态生成 + GitHub Pages 部署，内容通过 Markdown + @nuxt/content v3 管理，中英双语，支持 PWA 离线访问。

## 站点形态

| 路由                   | 内容                                   |
| ---------------------- | -------------------------------------- |
| `/`                    | 风格画廊（20 个风格入口，站点的门脸）  |
| `/style/<id>/`         | 某风格的首页（单页式，导航为页内锚点） |
| `/style/<id>/about`    | 关于                                   |
| `/style/<id>/projects` | 项目                                   |
| `/style/<id>/blog`     | 博客                                   |
| `/style/<id>/contact`  | 联系                                   |

20 风格 × 5 页 + 画廊 = **101 条路由**（预渲染清单由 `styles/registry.ts` 自动派生）。`/styles` 与 `/en/styles` 301 重定向到 `/`。

## 功能特性

- **20 种 UI 风格**：minimalism、liquid-glass、metro、swiss、editorial、flat-design、dashboard、terminal、cyberpunk、y2k、web2-glossy、pixel、retro-computer、sci-fi-hud、soft-3d、glassmorphism、claymorphism、neumorphism、skeuomorphism、neo-brutalism
- **SEO**：构建时自动生成 `sitemap.xml`（中英双语 + hreflang alternate）与 `robots.txt`；每页 canonical / og:url / og:locale；OG 与 Twitter 分享卡指向 `public/og-image.png`
- **品牌资源**：favicon（ico/svg/png）、apple-touch-icon、PWA 图标（192/512）由 `scripts/gen-brand-assets.mjs` 生成
- **风格预览图**：画廊页每张卡的真实首页缩略图由 `scripts/gen-style-previews.mjs` 生成（CDP 截图，需 dev server + 调试端口 9222 的 Chrome）；内容改版后重跑一次刷新
- **详情页层级导航**：面包屑（风格首页 › 列表 › 当前标题，末级 `aria-current="page"` 且不是链接）+ 上下篇导航。层级与路径由共享层 `useDetailBreadcrumb` / `utils/breadcrumb.ts` 算，20 个风格各自渲染成自己的样子
- **UI 不复用、业务逻辑复用**：风格层各写各的结构与 token；取数、滚动动画、格式化等行为只写一份在 `composables/` / `utils/`
- **内容驱动**：blog 每个语种 14 篇，projects 每个语种 6 篇
- **博客筛选与搜索**：标签/分类筛选（`?tag=` / `?category=`）+ 关键词搜索（`?q=`，匹配标题/摘要/分类/标签/slug，标题命中优先），维度正交可叠加，行为全在共享层
- **代码块语法高亮**：shiki 双主题（`github-light/dark-high-contrast`）。⚠️ shiki 只输出 CSS 变量，把它接到 `color` 上的规则由共享层 `styles/_base/base.css` 提供（shiki 自带的挂在 `html .default/.dark`，本站没有 color-mode 永不生效）；各风格再按自己代码块的底色明暗决定取亮色还是暗色变量——20 个风格实测最低对比度 4.58:1。改动这块请看 `tests/code-highlight.test.ts` 的守门断言
- **国际化**：中英双语，URL 策略 `prefix_except_default`（中文无前缀，英文 `/en/`）
- **PWA**：添加到主屏幕、离线访问、自动更新
- **无障碍**：WCAG AA、prefers-reduced-motion、刘海屏安全区域适配

## 技术栈

| 类别   | 技术                                            | 用途                        |
| ------ | ----------------------------------------------- | --------------------------- |
| 框架   | Nuxt 3 (^3.17.7, SSG 模式)                      | 全栈框架                    |
| UI     | 无第三方 UI 库                                  | 每风格原生元素 + 独立 token |
| 语言   | TypeScript ^5.8.3                               | 类型安全                    |
| 内容   | @nuxt/content v3 (^3.6.3)                       | Markdown 渲染               |
| 国际化 | @nuxtjs/i18n ^9.5.5                             | 中/英双语                   |
| 图标   | @iconify-json/tabler + simple-icons             | 按需内联 SVG                |
| 图片   | @nuxt/image ^1.10.0                             | 响应式图片优化（含 sizes）  |
| PWA    | @vite-pwa/nuxt ^1.1.1                           | 离线访问、添加到主屏幕      |
| 测试   | Vitest (^3.1.4)                                 | 单元测试                    |
| 规范   | ESLint + Prettier + Commitlint + husky + cspell | 代码质量                    |
| 部署   | GitHub Actions → GitHub Pages                   | CI/CD + 静态托管            |

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
│   ├── useBlogFilters.ts          # 标签 + 分类筛选（?tag= / ?category=）
│   ├── useBlogTagFilter.ts        # 标签筛选（useBlogFilters 的薄包装）
│   ├── useBlogSearch.ts           # 关键词搜索（?q=，配 utils/search.ts）
│   └── useScrollReveal.ts         # 滚动进入视口动画（IntersectionObserver）
├── content/                       # Markdown 内容文件
│   ├── blog/zh|en/                # 博客文章
│   └── projects/zh|en/            # 项目介绍
├── i18n/                          # 国际化语言包（各 107 key，双向零缺失）
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

站点发布在**腾讯云 CVM**（`122.51.97.106`，与 mychat、jintian-1851 同一台机器），
线上地址 <https://122.51.97.106:8444/>。GitHub Pages 已停用，CI 不再往它推产物。

链路固定为「CI 构建 → 浏览器下载 artifact → 本机脚本上传」：

1. 推到 `main`，Actions 并行跑**质量门禁**（`pnpm lint` / `pnpm test` / `pnpm spellcheck`）、
   **移动端 + 无障碍审计**、以及 `pnpm generate`
2. 确认该 run 全绿，在 Summary 页底部下载 `site-cvm` artifact 并解压
3. 上传并生效：

```bash
node scripts/publish-cvm.mjs <解压出来的目录>
```

脚本打 tar.gz → scp 到 `/root/personal-web/deploy/dist/` → **原地解包覆盖** →
`docker compose up -d --force-recreate caddy` → 用 curl 校验关键路由状态码。
凭据走本机 `~/.ssh/cvm_deploy_rsa`（可用 `CVM_KEY` / `CVM_HOST` 覆盖），仓库里不留任何密钥。

> **为什么不在服务器上构建**：机器是 2C2G，802 页预渲染会 OOM。
> **为什么不在本机构建**：Windows 跑 `nuxt generate` 是 CPU 空转十几分钟零产物（Linux 约 48 秒），
> 所以 CI 的 artifact 是唯一可信发布物。
> **为什么用自签证书**：这台机器只有公网 IP、没有域名，ACME 不给裸 IP 签证书。
> 但仍必须走 HTTPS —— Service Worker 要求安全上下文，`http://IP:PORT` 下 PWA 离线
> 和 `navigator.clipboard` 一类 API 会直接失效。浏览器首次访问提示证书不受信任，点「继续访问」。
> **没有域名的代价**：sitemap / canonical 里是 `IP:8444`，且证书不受信任，
> 公开搜索引擎基本收不到，现阶段它是「自己和朋友访问」的站点，不是公开门面。

服务器上的目录是 `/root/personal-web/deploy/`，含 `Caddyfile`、`docker-compose.deploy.yml`、
`certs/`（脚本首跑自动生成，不入库）、`dist/site/`（产物）。仓库内的配置副本在 `deploy/`。

> CI 里 **Setup Node 必须排在 Setup pnpm 之前**，且 Node 版本 ≥ 22.13，否则 `Setup pnpm` 会直接失败（2026-09-18 ~ 09-23 期间 CI 因此全红，线上版本停滞）。

### 关键配置

- 部署子路径由构建期变量 `NUXT_APP_BASE_URL` 决定（默认 `/my-personalWebsite/`，CVM 发布时 CI 传 `/`）：`app.baseURL`、PWA `start_url`、sitemap / feed / og 全部从它派生，改它必须重新 generate
- 站点对外 URL 取 `NUXT_PUBLIC_SITE_URL`（CI 默认 `https://122.51.97.106:8444`，可用仓库 variable `SITE_URL` 覆盖），sitemap / canonical / og:url 均由它拼接
- `sitemap.xml` / `robots.txt` 由 nitro 的 `prerender:done` 钩子在构建时依据「真实预渲染成功的路由」自动生成，无需手工维护
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
