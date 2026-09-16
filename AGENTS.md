# AGENTS.md - 项目 AI 代理上下文

## 项目概述

综合型个人网站，使用 Nuxt 3 SSG 静态生成 + GitHub Pages 部署。包含首页、技术博客、项目作品集、关于页面和联系方式五大核心模块。内容通过 Markdown + @nuxt/content v3 管理，UI 使用 Nuxt UI v3。完整适配移动端，支持 PWA 离线访问。

**目标架构：一站多风格（20+ 种 UI 大风格），UI 不复用、业务逻辑复用。** 当前处于迁移阶段 0，现有 `components/` + `pages/` 为过渡层（逐步淘汰）。架构总纲见 `docs/architecture/multi-style-ui.md`，新增风格 SOP 见 `docs/architecture/style-authoring-guide.md`。

## 技术栈

| 类别   | 技术                                                    |
| ------ | ------------------------------------------------------- |
| 框架   | Nuxt 3 (^3.17.7, SSG 模式) + Vue 3 (^3.5)              |
| UI     | Nuxt UI v3 (^3.1.3) + Tailwind CSS v4 (^4.2.2)（Nuxt UI 为过渡层 UI 库，新风格用原生元素 + 独立 token） |
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

## 架构约束

- **SSG 优先**：`nuxt generate` 生成纯静态站点，不依赖 Node.js 运行时
- **内容层抽象**：所有内容获取逻辑封装在 `composables/` 中，组件内不硬编码数据获取方式，不直接调用 content API
- **数据层预留**：Drizzle + PostgreSQL 仅作为开发环境可选配置，不实际使用，通过 composables 层隔离数据源
- **路由**：基于文件路由，`pages/` 目录结构即路由结构
- **组件自动导入**：配置了 `pathPrefix: false`，组件名不带目录前缀（如 `AppHeader` 而非 `LayoutAppHeader`）
- **移动端优先**：所有组件遵循移动端优先渐进增强策略，独立移动端交互组件
- **滚动动画**：`useScrollReveal` composable 基于 IntersectionObserver 实现视口进入动画，SSG 友好无 hydration 风险
- **多风格架构（目标，详见 `docs/architecture/multi-style-ui.md`）**：三层分工——内容层（content/ + i18n/）、业务逻辑层（composables/ + types/ + utils/，全站唯一）、风格表现层（styles/[id]/，每风格独立组件与样式）。核心哲学「结构各写各的，行为只写一份」。红线：UI 不跨风格复用；业务动作只写一份（判定标准：能用「用户做了什么」描述的是业务，需要形容词描述的是表现）；风格组件不得直接调用 content API；onMounted 申请的资源必须在 onUnmounted 清理
- **迁移期纪律**：现有过渡层组件只维护、不扩展（不新增页面或大功能）；新交互行为一律进共享层（composables / utils），不要写死在过渡层组件里；评估新功能先问它属于内容层、业务逻辑层还是风格表现层，只实现一次

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
styles/           → 【规划】风格表现层：registry.ts 注册表 + _base/tokens.css 变量契约 + 每风格独立目录
                     （目标架构，尚未创建；现有 components/ 为过渡层）
docs/architecture/ → 架构文档（multi-style-ui.md 总纲 + style-authoring-guide.md 风格 SOP）
```

## 编码约定

- 注释使用中文
- 代码格式遵循 Prettier 配置，代码质量遵循 ESLint 规则
- 提交规范：Conventional Commits (feat/fix/docs/style/refactor/test/chore)
- 拼写检查：cspell
- 组件按 layout/home/blog/project/common/icon 分类（过渡层），风格组件按 `styles/[id]/components` 组织；`components/` 自动导入 `pathPrefix: false`（组件名不带目录前缀），`styles/` 下组件不走自动导入、一律显式 import 且组件名带风格前缀
- 自定义 SVG 图标组件放 `components/icon/` 目录（如 IconFeishu）
- 移动端专属组件以 `Mobile` 前缀命名（如 MobileToc、MobileNavBar）
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

## 设计系统（过渡层默认风格）

> 本节与「交互效果规范」中的具体取值（主色 Indigo、字体、duration 语义值等）只约束**过渡层**页面与组件。新风格（styles/[id]/）的视觉由 `styles/_base/tokens.css` 变量契约 + 该风格自己的 tokens.css 决定；全局仅保留断点体系与 prefers-reduced-motion 规则。

- **主色**：Indigo (#6366F1)，通过 CSS @theme 定义 Design Tokens
- **字体**：Inter + Noto Sans SC（正文），JetBrains Mono（代码）
- **响应式**：移动端优先，断点 sm:640 / md:768 / lg:1024 / xl:1280
- **主题**：完整亮色/暗色双模式，非简单颜色反转
- **动效**：快速 150ms / 标准 250ms / 慢速 400ms，尊重 prefers-reduced-motion（全局 CSS 已实现）
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
- 过渡层统一使用 Tailwind 的 `transition` / `duration-*` / `ease-*` 工具类；风格层（styles/[id]/）使用自己的 token（如 `--transition`，允许为 `none`）实现，两种方式都必须尊重 `prefers-reduced-motion`

## UX 生成规则

以下是生成页面和组件时必须遵循的通用原则，确保产出高质量的用户体验。

### 导航与路由

- **可点击卡片必须用 NuxtLink 包裹**，禁止 `@click + router.push()`。NuxtLink 支持 Ctrl+Click、右键菜单、SEO 爬虫、prefetch。卡片内嵌的外链按钮用 `@click.stop` 阻止冒泡
- **详情页必须包含面包屑**（首页 > 列表页 > 当前标题），帮助用户定位当前位置
- **列表型详情页应提供上下篇导航**，避免用户阅读完必须返回列表才能看下一篇
- **数据不存在时必须抛出 404**：使用 `throw createError({ statusCode: 404 })`，不要静默显示空内容（SEO 需要 404 状态码）
- **错误页面必须保留导航能力**：包含 AppHeader/AppFooter/MobileNavBar，添加 `noindex` meta

### 加载与反馈

- **页面切换必须有加载反馈**：`app.vue` 中包含 `<NuxtLoadingIndicator>`
- **列表为空时必须提示**：搜索/筛选无结果时显示空状态提示（图标 + 文案），不要留白
- **异步操作必须有加载态**：表单提交、数据加载等场景使用 loading/disabled 状态，禁止裸提交

### 滚动与锚点

- **锚点跳转必须补偿固定 header**：全局设置 `[id] { scroll-margin-top: 5rem }`，避免标题被遮挡
- **锚点跳转应平滑滚动**：`html { scroll-behavior: smooth }`，reduced-motion 下自动禁用

### Design Token 一致性（过渡层）

> 以下 Token 规则只约束过渡层页面与组件；风格层的变量必须走 `styles/_base/tokens.css` 契约（见 docs/architecture/multi-style-ui.md）。

- **边框色统一**：使用 `border-border-light dark:border-border-dark`，不要用 `border-gray-*`
- **背景色统一**：使用 `bg-surface-light dark:bg-surface-dark` 等 Design Token，不要硬编码 `bg-white dark:bg-[#0f172a]` 等颜色值
- **动画时长用语义 Token**：`duration-fast`(150ms) / `duration-normal`(250ms) / `duration-slow`(400ms)，不要硬编码 `duration-100`、`duration-150`、`duration-200`、`duration-250` 等非标准值
- **Z-index 用语义 Token**：`z-dropdown`(30) / `z-overlay`(40) / `z-modal`(50) / `z-toast`(60)，`@theme` 中必须用 `--z-index-*` 命名空间（如 `--z-index-modal: 50`），`--z-*` 不会生成工具类
- **新增 Design Token 必须在 `@theme` 中定义**，不要在组件中硬编码颜色/间距/圆角/阴影值

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

- **亮色模式主色文本对比度 ≥ 4.5:1**：`text-primary-400` 在白底上仅 3.1:1，亮色用 `text-primary-600`，暗色用 `text-primary-400`
- **图标按钮必须有 aria-label**：值使用 `t()` 国际化，如 `:aria-label="t('common.closeMenu')"`
- **纯图标按钮必须提供文字提示**：优先使用 Nuxt UI 的 `UTooltip` 提供悬浮提示，禁止仅依赖原生 `title` 属性（触屏设备无法触发）
- **遮罩层/弹窗/抽屉需可关闭**：ESC 键、点击遮罩、关闭按钮三种方式至少支持两种

### prefers-reduced-motion

- **scroll-reveal 在 reduced-motion 下必须立即可见**：`opacity: 1 !important; transform: none !important`
- **不要仅靠 transition-duration: 0 来处理**：`opacity: 0` 是静态样式不是 transition，必须显式覆盖

## 关键配置

- `app.baseURL` 设为 `/my-personalWebsite/`（GitHub Pages 部署需要，本地开发为 `/`）
- @nuxt/content v3 的 `defineCollection` + Zod schema 在 `content.config.ts` 定义
- i18n 使用 `prefix_except_default` 策略（默认中文无前缀，英文 URL 带 `/en/` 前缀）
- 图片 `@nuxt/image` 配置 `provider: ipx`，卡片组件配置 `sizes="sm:100vw md:50vw lg:33vw"`
- 组件自动导入 `pathPrefix: false`，避免目录前缀（如 `LayoutAppHeader` → `AppHeader`）
- Tailwind CSS v4 使用 `@theme` 指令定义 Design Tokens（在 `assets/css/main.css` 中），z-index 必须用 `--z-index-*` 命名空间（如 `--z-index-modal: 50`），`--z-*` 不会生成工具类
- 网络受限环境下，Google Fonts 和 Google Icons 已在 `nuxt.config.ts` 中禁用（`fonts.providers.google: false, fonts.providers.googleicons: false`）
- ThemeToggle 等依赖客户端状态的组件使用 `<ClientOnly>` 包裹，避免 hydration mismatch
- PWA 配置在 `nuxt.config.ts` 的 `pwa` 字段，manifest 含 name/short_name/theme_color/icons
- 多风格架构：风格预渲染路由清单在 `nuxt.config.ts` 的 `nitro.prerender.routes`，必须与 `styles/registry.ts` 同步维护；风格路由壳 `pages/style/[style]/[...slug].vue`（未知风格/缺失页面抛 404）+ 裸布局 `layouts/style.vue`；风格画廊页 `pages/styles.vue` 自动列出注册表条目
- viewport meta 含 `viewport-fit=cover`，适配刘海屏安全区域
- 联系表单使用 Formspree，form ID 在 `ContactForm.vue` 中硬编码，组件为 `ContactForm`
- Apple Web App 配置：`apple-mobile-web-app-capable` + `black-translucent` 状态栏

## 移动端适配约定

### 交互模式（过渡层组件；新风格在 styles/[id]/ 内自带导航/页脚/移动端方案，不复用以下组件）

- **AppHeader**：移动端汉堡菜单 + slide-down 动画 + 外部点击关闭 + body scroll lock
- **MobileToc**：博客详情页浮动 TOC 按钮（右下角，避开 MobileNavBar 用 `bottom-24`），点击弹出底部目录面板
- **MobileNavBar**：移动端底部固定导航栏（md 以下显示），布局 `default.vue` 中 `main` 需添加 `pb-16 md:pb-0` 为其留出空间
- **AppSidebar**：移动端抽屉式（左侧滑入 + 遮罩层），桌面端固定显示

### 约束规则

- 触控目标 ≥ 40×40px（h-10 w-10）
- 移动端交互组件（抽屉、弹出面板）需提供遮罩层 + 关闭按钮 + 路由切换自动关闭
- **ProjectCard**：整张卡片 NuxtLink 包裹可点击，内部按钮使用 `@click.stop` 阻止冒泡
- **prefers-reduced-motion**：`assets/css/main.css` 全局规则禁用动画
- **安全区域**：CSS 工具类 `safe-bottom/top/left/right`，AppFooter 使用 `safe-bottom`

## 数据安全规则

- **异步写操作必须防重复提交**：任何修改数据的异步操作（表单提交、API 请求、数据库写入），入口必须有守卫阻止并发重复调用，异步完成后（成功和失败分支都要）重置守卫；实现方式可用标志位 / disabled 属性 / debounce
- **数据库操作避免 Read-Modify-Write**：先查后改存在竞态窗口，优先使用原子操作（如 `UPDATE ... WHERE`、`INSERT ... ON CONFLICT`），除非业务逻辑必须基于旧值判断（当前项目数据层为预留的 Drizzle，启用后同样适用）
- **多数据源写入保持一致性**：同一数据写入多个存储时，所有路径以相同顺序写入，避免旧数据覆盖新数据
- **密钥只能放在服务端**：置于 `runtimeConfig` 非 public 字段或 `.env` 文件，禁止暴露到前端（Formspree form ID 属公开标识，不在此列）
- **只在真正的边界做运行时校验**：运行时校验（如 Zod）只放在真正的边界——content schema（content.config.ts）、环境配置解析、网络接口、用户输入；TypeScript 静态类型已保证的同进程调用不重复加校验

## 开发工作流

1. 新增功能前先确认路由和组件归属
2. 内容型数据放 `content/` 目录，结构化类型放 `types/`
3. 数据获取逻辑封装到 `composables/`，不要在组件中直接调用 content API
4. 新增组件遵循目录分类约定（layout/home/blog/project/common/icon）
5. 移动端专属组件以 `Mobile` 前缀命名（如 MobileToc、MobileNavBar）
6. 提交前确保 ESLint + Prettier + cspell 通过
7. 新增功能需编写 Vitest 单元测试
8. 新增 UI 风格按 `docs/architecture/style-authoring-guide.md` 的 SOP 执行；新风格的通用交互行为先进共享层

## 与 AI 协作约定

- 有需要用户选择的方案时（多种技术实现路径、需求描述有模糊空间、需分步骤执行），必须使用 AskUserQuestion 工具列出 3-4 个清晰选项并注明推荐理由，等待用户选择后再继续，禁止自动执行或手写 checkbox 纯文本代替
- 严格按照项目现有规范开发
- 代码注释使用中文
- 不要引入项目未使用的第三方库
- 修改代码前先理解现有代码风格和模式
