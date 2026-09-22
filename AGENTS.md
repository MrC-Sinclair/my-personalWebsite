# AGENTS.md - 项目 AI 代理上下文

## 项目概述

一站多风格的个人网站，使用 Nuxt 3 SSG 静态生成 + GitHub Pages 部署。站点形态：`/` 是 20 种 UI 大风格的画廊入口，`/style/<id>[/<page>]` 是各风格的 5 个页面（首页 + about / projects / blog / contact），共 101 条路由。内容通过 Markdown + @nuxt/content v3 管理，风格层全部用原生元素 + 各风格独立 token 实现，**不依赖任何第三方 UI 库**。完整适配移动端，支持 PWA 离线访问。

**目标架构已落地：一站多风格（20 种 UI 大风格），UI 不复用、业务逻辑复用。** 迁移阶段 0~4 全部完成：过渡层（`components/`、旧 `pages/`、`layouts/default.vue`、`assets/css/main.css`、Nuxt UI + Tailwind）已整体删除，共享 CSS 落在 `styles/_base/base.css`。架构总纲见 `docs/architecture/multi-style-ui.md`，新增风格 SOP 见 `docs/architecture/style-authoring-guide.md`。

## 技术栈

| 类别   | 技术                                                    |
| ------ | ------------------------------------------------------- |
| 框架   | Nuxt 3 (^3.17.7, SSG 模式) + Vue 3 (^3.5)              |
| UI     | 无第三方 UI 库。每风格用原生元素 + 自己的 `styles/<id>/tokens.css`（契约在 `styles/_base/tokens.css`）；Nuxt UI / Tailwind 已随过渡层移除 |
| 语言   | TypeScript ^5.8.3                                       |
| 内容   | @nuxt/content v3 (^3.6.3, Markdown + Zod schema)       |
| 国际化 | @nuxtjs/i18n ^9.5.5 (中/英)                             |
| 图标   | @iconify-json/tabler + simple-icons（按需内联 SVG）      |
| 图片   | @nuxt/image ^1.10.0 (含响应式 sizes)                    |
| PWA    | @vite-pwa/nuxt ^1.1.1 (离线访问、添加到主屏幕)          |
| 测试   | Vitest (^3.1.4)                                         |
| 规范   | ESLint + Prettier + Commitlint + husky + cspell         |
| 部署   | GitHub Actions → GitHub Pages                           |

## 架构约束

- **SSG 优先**：`nuxt generate` 生成纯静态站点，不依赖 Node.js 运行时
- **内容层抽象**：所有内容获取逻辑封装在 `composables/` 中，组件内不硬编码数据获取方式，不直接调用 content API
- **数据层预留**：Drizzle + PostgreSQL 仅作为开发环境可选配置，不实际使用，通过 composables 层隔离数据源
- **路由**：基于文件路由，`pages/` 目录结构即路由结构
- **组件导入**：`styles/` 下的组件**不走自动导入**（`components/` 已随过渡层删除），一律显式 `import` 且组件名带风格前缀（如 `Y2KChromeButton`）；漏 import 时 build / lint / 类型检查全部静默通过，由 `tests/styles-structure.test.ts` 守住
- **移动端优先**：所有组件遵循移动端优先渐进增强策略，独立移动端交互组件
- **滚动动画**：`useScrollReveal` composable 基于 IntersectionObserver 实现视口进入动画，SSG 友好无 hydration 风险
- **多风格架构（目标，详见 `docs/architecture/multi-style-ui.md`）**：三层分工——内容层（content/ + i18n/）、业务逻辑层（composables/ + types/ + utils/，全站唯一）、风格表现层（styles/[id]/，每风格独立组件与样式）。核心哲学「结构各写各的，行为只写一份」。红线：UI 不跨风格复用；业务动作只写一份（判定标准：能用「用户做了什么」描述的是业务，需要形容词描述的是表现）；风格组件不得直接调用 content API；onMounted 申请的资源必须在 onUnmounted 清理
- **风格层纪律**：新交互行为一律进共享层（composables / utils），不要写死在风格组件里；评估新功能先问它属于内容层、业务逻辑层还是风格表现层，只实现一次；风格内部的重复可以抽组件（如 `XxxSubPage`），但不得跨风格复用

## 目录约定

```
content/          → Markdown 内容（blog/zh|en, projects/zh|en）
composables/      → 业务逻辑层（useBlog, useProjects, useSiteConfig, useScrollReveal）
                     注意：useSiteConfig.ts 文件导出的函数名为 useAppInfo()
types/            → blog.ts, project.ts, site.ts
utils/            → format.ts 等工具函数
i18n/             → zh-CN.json, en-US.json（各 134 个 key，双向零缺失）
pages/            → style/[style]/[...slug].vue 薄壳路由（不含 UI，未知风格/页面抛 404）
layouts/          → style.vue（裸布局）
app.vue / error.vue → 全局壳与 404 页（自包含，不引用已删除的过渡层组件）
styles/
  registry.ts     → 风格注册表（20 个风格，status 全为 ready）
  _base/          → base.css（全局 reset + .sr-only/.safe-*/.scroll-reveal）+ tokens.css 变量契约
  <id>/           → index.ts + tokens.css + components/ + pages/
                     （可加 layout.css / composables/ / tones.ts）
                     页面键只允许 registry.ts 的 STYLE_SUB_PATHS：/about /projects /blog /contact
tests/            → Vitest（styles-structure.test.ts 守结构契约）
docs/architecture/ → 架构文档（multi-style-ui.md 总纲 + style-authoring-guide.md 风格 SOP）
.workbuddy/       → 排查脚本（CDP 截图 shot.mjs、对比度 contrast.mjs 等）+ memory/ 项目记忆
```

## 编码约定

- 注释使用中文
- 代码格式遵循 Prettier 配置，代码质量遵循 ESLint 规则
- 提交规范：Conventional Commits (feat/fix/docs/style/refactor/test/chore)
- 拼写检查：cspell
- 风格组件按 `styles/[id]/components` 组织，一律显式 `import` 且组件名带风格前缀；禁止跨风格复用
- 移动端适配由各风格在自己目录内解决（导航、页脚、断点），不复用跨风格组件
- 标题层级：每个页面必须有且仅有一个 `h1`。风格首页的 h1 通常是 hero 姓名；**子页若把 SectionHead / Panel 当页头用，必须给它加 `level` prop 并传 1**，否则整页没有一级标题
- 新增功能需同步编写 Vitest 单元测试；测试失败时先判断根因再动手：预期内的行为变更 → 同步更新测试用例，意外的回归（测试抓住了 bug）→ 修复代码，不改测试
- 新组件必须包含恰当的交互效果（悬浮、点击、切换等），不可出现"裸交互"

## AI 修改代码后的验证流程

- **实质性代码修改后必须验证**：先运行 GetDiagnostics 获取 IDE 诊断（类型错误 + lint 错误），再运行 `pnpm lint:fix` 自动修复格式问题
- **仅修改文档时可跳过**：如只修改 .md 文件；但代码文件（.vue/.ts/.js/.css）内即使只改注释、文案或 CSS 类名，也必须验证
- **禁止以改动简单为由跳过验证（硬性禁令）**：严禁以"改动太小不会出错""只改了一行""只是文案调整""只改了格式"等任何理由跳过验证步骤，违反此规则视为严重执行失误
- **核心逻辑变更必须运行 `pnpm test`**：涉及 composables 数据层、SSR/hydration 相关逻辑、构建配置（nuxt.config.ts / content.config.ts）的修改必须跑通测试；涉及类型定义的变更必须确认 GetDiagnostics 无类型错误
- **如有无法自动修复的错误**：针对性手动处理后重新验证

## AI 执行纪律

以下纪律规范 AI 助手的执行行为，不因任务简单而豁免：

- **禁止未执行就标记完成**：每个操作必须实际执行并验证成功才能标记完成，禁止基于假设或推断跳过执行步骤
- **关键操作必须验证**：有副作用的操作（启动服务、安装依赖、修改文件等）执行后必须验证结果（检查退出码、终端输出、服务可达性），不能假设成功
- **交叉验证原则**：当工具返回的结果会影响后续决策时，必须用另一种工具交叉验证（如搜索工具报告文件不存在时，用直接路径检测或目录列表再确认）
- **修改文件前重新读取**：距上次读取超过 3 条消息，或编辑操作连续失败 2 次，必须重新读取文件内容，禁止基于过时上下文继续编辑
- **搜索无结果禁止单次下结论**：搜索代码内容或关键词无结果时，禁止直接判定"项目中没有此功能"，必须换关键词/正则重试至少 1 次，或用目录列表交叉确认
- **大文件分批读取**：超过 500 行的文件用行号范围分批读取，避免一次性加载导致上下文丢失
- **空 catch 禁止静默吞异常**：`catch` 必须写明吞掉了什么异常、为何安全，禁止 `catch (e) {}` 这类静默空 catch

## SSR Hydration 规则

Nuxt 3 使用 SSR，服务端和客户端必须渲染出相同的 HTML，否则产生水合不匹配（Hydration Mismatch）警告或错误。以下规则防止此类问题：

- **禁止在模板或 computed 中使用不确定值**：`Date.now()`、`new Date()`、`Math.random()`、`crypto.randomUUID()` 等在 SSR 和客户端会产生不同结果，必须放在 `onMounted` 内或用 `<ClientOnly>` 包裹
- **浏览器 API 必须守卫**：`window`、`document`、`navigator`、`localStorage` 等仅在客户端存在，访问前必须用 `import.meta.client` 或 `process.client` 守卫，或放在 `onMounted` 内。即使在点击回调中，也应加守卫作为防御性编程
- **客户端条件渲染用 `<ClientOnly>`**：依赖浏览器 API 或客户端状态的组件（如地图、图表、富文本编辑器）必须用 `<ClientOnly>` 包裹，或使用 `client:only` 指令跳过 SSR
- **ref 初始值必须 SSR 安全**：`ref()` 的初始值在 SSR 和客户端必须一致。需要客户端才能确定的值（如屏幕宽度、用户偏好），应在 `onMounted` 中延迟赋值，初始值用安全的默认值
- **禁止 onMounted 后直接修改 SSR 渲染的 DOM**：`onMounted` 中直接操作 DOM（如 `createElement`、`replaceChild`）会破坏 Vue 的水合节点匹配。如需动态渲染，用 `<ClientOnly>` 包裹整个区域

## 设计系统（风格层）

> 过渡层已删除，**不存在「全站默认风格」**。每个风格的视觉完全由它自己的
> `styles/<id>/tokens.css` 决定（变量契约见 `styles/_base/tokens.css`）；
> 全局只保留 reset、断点体系、prefers-reduced-motion 与安全区域工具（`styles/_base/base.css`）。

- **变量契约**（`styles/_base/tokens.css`）：`--c-bg --c-surface --c-text --c-muted --c-border --c-accent --c-accent-2 --c-on-accent --font-head --font-body --font-mono --fs-* --lh-body --space --gap --radius --radius-sm --shadow --shadow-press --press-transform --border-w --page-w --transition --deco --img-rendering --font-smooth`；风格必须实现这套契约
- **字体**：Inter + Noto Sans SC（正文），JetBrains Mono（代码），风格可用 `--font-*` 覆盖
- **响应式**：移动端优先，断点 sm:640 / md:768 / lg:1024 / xl:1280
- **主题**：无全站亮/暗色切换（`@nuxtjs/color-mode` 已随 Nuxt UI 移除），每个风格自带固定配色
- **动效**：各风格用自己的 `--transition` 定义（允许为 `none`），必须尊重 prefers-reduced-motion（全局 CSS 已实现）
- **无障碍**：WCAG AA，对比度 ≥ 4.5:1，键盘导航，语义化 HTML，触控目标 ≥ 40px
- **安全区域**：viewport-fit=cover + env(safe-area-inset-\*) 适配刘海屏

### 交互效果规范

新组件必须包含恰当的交互效果，不可出现"裸交互"，具体场景如下：

- **导航/路由切换**：页面切换过渡动画（fade、slide 等），导航项激活态视觉反馈
- **卡片/按钮悬浮**：hover 时阴影提升（如 `hover:shadow-lg`）+ 微位移（如 `hover:-translate-y-1`），过渡时长 250ms
- **面板展开收起**：滑入滑出动画（slide-down / slide-left 等），配合遮罩层淡入淡出
- **状态切换**：开关、标签页等使用渐变过渡（`transition-colors` / `transition-opacity`），时长 150-250ms
- **按压反馈**：可点击元素 active 时加 `active:scale-95`（或 `active:scale-[0.98]`），提供按压手感
- **列表项**：hover 背景色变化 + 左侧指示条或图标微动
- **模态/弹窗**：背景遮罩淡入 + 内容缩放弹入（`scale-95 → scale-100`）
- **加载状态**：骨架屏或 spinner，避免内容突变
- 所有动效使用风格自己的 token（如 `--transition`，允许为 `none`）实现，必须尊重 `prefers-reduced-motion`。Tailwind 已移除，不要写 `transition-*` / `duration-*` / `hover:shadow-lg` 这类工具类

## UX 生成规则

以下是生成页面和组件时必须遵循的通用原则，确保产出高质量的用户体验。

### 导航与路由

- **可点击卡片必须用 NuxtLink 包裹**，禁止 `@click + router.push()`。NuxtLink 支持 Ctrl+Click、右键菜单、SEO 爬虫、prefetch。卡片内嵌的外链按钮用 `@click.stop` 阻止冒泡
- **详情页必须包含面包屑**（首页 > 列表页 > 当前标题），帮助用户定位当前位置
- **列表型详情页应提供上下篇导航**，避免用户阅读完必须返回列表才能看下一篇
- **数据不存在时必须抛出 404**：使用 `throw createError({ statusCode: 404 })`，不要静默显示空内容（SEO 需要 404 状态码）
- **错误页面必须保留导航能力**：提供返回风格画廊 / 该风格首页的入口，添加 `noindex` meta（`error.vue` 自包含，不引用任何风格组件）

### 加载与反馈

- **页面切换必须有加载反馈**：`app.vue` 中包含 `<NuxtLoadingIndicator>`
- **列表为空时必须提示**：搜索/筛选无结果时显示空状态提示（图标 + 文案），不要留白
- **异步操作必须有加载态**：表单提交、数据加载等场景使用 loading/disabled 状态，禁止裸提交

### 滚动与锚点

- **锚点跳转必须补偿固定 header**：全局设置 `[id] { scroll-margin-top: 5rem }`，避免标题被遮挡
- **锚点跳转应平滑滚动**：`html { scroll-behavior: smooth }`，reduced-motion 下自动禁用

### Design Token 一致性（风格层）

> 风格层的变量必须走 `styles/_base/tokens.css` 契约（见 docs/architecture/multi-style-ui.md）。
> Tailwind 与 `@theme` 已随过渡层移除，不要再写 `bg-*` / `border-gray-*` / `--z-index-*` 这类东西。

- **颜色一律走变量**：用 `var(--c-border)` / `var(--c-surface)` 等，不要在组件里硬编码颜色；需要同色系变体用 `color-mix(in srgb, …)`，不要新造裸色值
- **间距 / 圆角 / 阴影 / 边框宽度**同样走 `--space` / `--radius` / `--shadow` / `--border-w`，不要写裸 px
- **动效走 `--transition`**，不要写裸 `transition-duration`
- **★ `styles/<id>/layout.css` 必须加作用域**：它是普通 CSS，不经 Vue scoped 变换，一加载就常驻全站，**每条选择器都必须加 `[data-style='<id>']` 前缀**（`@keyframes` 不加），否则会跨风格泄漏且随注入顺序时有时无

### 国际化

- **所有用户可见文本必须走 i18n**：composable 中的分类名、时间线内容等也必须用 `t()`，不要硬编码中文。`aria-label` 等无障碍属性也必须走 `t()` 国际化
- **i18n key 按模块命名**：`blog.breadcrumb`、`projects.featured`、`common.notFound` 等

### SEO

- **每个页面必须设置 og:title 和 og:description**：通过 `useHead()` 设置
- **首页 title 必须包含站点名称和关键词**，不要用"首页"这种无意义标题
- **htmlAttrs.lang 不要硬编码**：让 i18n 模块动态控制，切换语言时 `<html lang>` 应自动更新

### Composable 数据层

- **组件不得直接调用 queryCollection**：统一通过 composables 获取数据，详情页 composable 返回 `{ post, content }` 元组
- **异步方法必须 try-catch**：失败时返回空值并 `console.error`，不要让异常冒泡到组件
- **列表查询应缓存**：用 `ref` 缓存结果，语言切换时清空缓存
- **数据映射防御性处理**：`tags` 等数组字段用 `Array.isArray()` 检查，不要盲目 `as string[]`

### 无障碍

- **正文/次要文字对比度 ≥ 4.5:1**：必须**实测**不能凭观感（脚本 `.workbuddy/contrast.mjs`）。暗色风格浅字压深底通常天然合格，真正易出问题的是**浅色风格的次要文字**
- **图标按钮必须有 aria-label**：值使用 `t()` 国际化，如 `:aria-label="t('common.closeMenu')"`
- **纯图标按钮必须提供文字提示**：Nuxt UI 已移除，风格层自行实现 tooltip 或直接在按钮上给出可见文案；不要只依赖原生 `title` 属性（触屏设备无法触发）
- **遮罩层/弹窗/抽屉需可关闭**：ESC 键、点击遮罩、关闭按钮三种方式至少支持两种

### prefers-reduced-motion

- **scroll-reveal 在 reduced-motion 下必须立即可见**：`opacity: 1 !important; transform: none !important`
- **不要仅靠 transition-duration: 0 来处理**：`opacity: 0` 是静态样式不是 transition，必须显式覆盖

## 关键配置

- `app.baseURL` 设为 `/my-personalWebsite/`（GitHub Pages 部署需要，本地开发为 `/`）
- @nuxt/content v3 的 `defineCollection` + Zod schema 在 `content.config.ts` 定义
- i18n 使用 `prefix_except_default` 策略（默认中文无前缀，英文 URL 带 `/en/` 前缀）
- 图片 `@nuxt/image` 配置 `provider: ipx`，卡片组件配置 `sizes="sm:100vw md:50vw lg:33vw"`
- 多风格架构：风格预渲染清单**从 `styles/registry.ts` 自动派生**（`nuxt.config.ts` 的 `stylePrerenderRoutes()`，不再手工维护数组）；路由壳 `pages/style/[style]/[...slug].vue`（未知风格/缺失页面抛 404）+ 裸布局 `layouts/style.vue`
- 画廊页 `pages/index.vue`（`/`）列出注册表条目；`/styles` 与 `/en/styles` 301 → `/`
- **部署**：`.github/workflows/deploy.yml` 跑 `pnpm generate`，产出 `.output/public`。**Node 必须 ≥ 22.13**（`packageManager: pnpm@11.25.0` 的 engines 要求），且 **Setup Node 必须排在 Setup pnpm 之前**——顺序反了会让 Setup pnpm 直接失败（2026-09-18 起 CI 因此全红）
- 网络受限环境下，Google Fonts 和 Google Icons 已在 `nuxt.config.ts` 中禁用（`fonts.providers.google: false, fonts.providers.googleicons: false`）
- 依赖客户端状态的组件（各风格的滚动进度、canvas 装饰等）使用 `<ClientOnly>` 包裹，避免 hydration mismatch
- PWA 配置在 `nuxt.config.ts` 的 `pwa` 字段，manifest 含 name/short_name/theme_color/icons
- viewport meta 含 `viewport-fit=cover`，适配刘海屏安全区域；Apple Web App 用 `apple-mobile-web-app-capable` + `black-translucent` 状态栏
- **联系页**：无后端，各风格只展示社交链接（Formspree 与 `ContactForm.vue` 已随过渡层删除）

## 移动端适配约定

> 过渡层的 AppHeader / MobileNavBar / MobileToc / AppSidebar 已随过渡层删除。
> **每个风格在自己目录内自带导航、页脚与移动端方案**，不跨风格复用。

### 约束规则

- 触控目标 ≥ 40×40px
- 移动端交互组件（抽屉、弹出面板）需提供遮罩层 + 关闭按钮 + 路由切换自动关闭
- 卡片整张用 `NuxtLink` 包裹可点击，内部按钮使用 `@click.stop` 阻止冒泡
- **prefers-reduced-motion**：`styles/_base/base.css` 的全局规则禁用动画；scroll-reveal 在 reduced-motion 下必须立即可见
- **安全区域**：`styles/_base/base.css` 提供 `.safe-bottom/top/left/right`，页脚使用 `.safe-bottom`

## 数据安全规则

- **异步写操作必须防重复提交**：任何修改数据的异步操作（表单提交、API 请求、数据库写入），入口必须有守卫阻止并发重复调用，异步完成后（成功和失败分支都要）重置守卫；实现方式可用标志位 / disabled 属性 / debounce
- **数据库操作避免 Read-Modify-Write**：先查后改存在竞态窗口，优先使用原子操作（如 `UPDATE ... WHERE`、`INSERT ... ON CONFLICT`），除非业务逻辑必须基于旧值判断（当前未接入数据库；`docker/` 下保留了 PostgreSQL 17 Compose 备用）
- **多数据源写入保持一致性**：同一数据写入多个存储时，所有路径以相同顺序写入，避免旧数据覆盖新数据
- **密钥只能放在服务端**：置于 `runtimeConfig` 非 public 字段或 `.env` 文件，禁止暴露到前端（Formspree form ID 属公开标识，不在此列）
- **只在真正的边界做运行时校验**：运行时校验（如 Zod）只放在真正的边界——content schema（content.config.ts）、环境配置解析、网络接口、用户输入；TypeScript 静态类型已保证的同进程调用不重复加校验

## 开发工作流

1. 新增功能前先确认路由和组件归属
2. 内容型数据放 `content/` 目录，结构化类型放 `types/`
3. 数据获取逻辑封装到 `composables/`，不要在组件中直接调用 content API
4. 新增风格组件放 `styles/<id>/components/`，显式 import、组件名带风格前缀
6. 提交前确保 ESLint + Prettier + cspell 通过
7. 新增功能需编写 Vitest 单元测试
8. 新增 UI 风格按 `docs/architecture/style-authoring-guide.md` 的 SOP 执行；新风格的通用交互行为先进共享层

## 与 AI 协作约定

- 有需要用户选择的方案时（多种技术实现路径、需求描述有模糊空间、需分步骤执行），必须使用 AskUserQuestion 工具列出 3-4 个清晰选项并注明推荐理由，等待用户选择后再继续，禁止自动执行或手写 checkbox 纯文本代替
- 严格按照项目现有规范开发
- 代码注释使用中文
- 不要引入项目未使用的第三方库
- 修改代码前先理解现有代码风格和模式
