# AGENTS.md - 项目 AI 代理上下文

## 项目概述

综合型个人网站，包含首页、技术博客、项目作品集、关于页面和联系方式五大核心模块。

## 架构约束

- **内容层抽象**：所有内容获取逻辑封装在 `composables/` 中，组件内不硬编码数据获取方式，不直接调用 content API
- **数据层预留**：Drizzle + PostgreSQL 仅作为开发环境可选配置，不实际使用，通过 composables 层隔离数据源
- **移动端优先**：所有组件遵循移动端优先渐进增强策略，独立移动端交互组件

## 编码约定

- 注释使用中文
- 组件按 layout/home/blog/project/common 分类，自动导入 `pathPrefix: false`（组件名不带目录前缀）
- 移动端专属组件以 `Mobile` 前缀命名（如 MobileToc、MobileNavBar）
- 新增功能需同步编写 Vitest 单元测试
- 新组件必须包含恰当的交互效果（悬浮、点击、切换等），不可出现"裸交互"

## SSR Hydration 规则

Nuxt 3 使用 SSR，服务端和客户端必须渲染出相同的 HTML，否则产生水合不匹配（Hydration Mismatch）警告或错误。以下规则防止此类问题：

- **禁止在模板或 computed 中使用不确定值**：`Date.now()`、`new Date()`、`Math.random()`、`crypto.randomUUID()` 等在 SSR 和客户端会产生不同结果，必须放在 `onMounted` 内或用 `<ClientOnly>` 包裹
- **浏览器 API 必须守卫**：`window`、`document`、`navigator`、`localStorage` 等仅在客户端存在，访问前必须用 `import.meta.client` 或 `process.client` 守卫，或放在 `onMounted` 内
- **客户端条件渲染用 `<ClientOnly>`**：依赖浏览器 API 或客户端状态的组件（如地图、图表、富文本编辑器）必须用 `<ClientOnly>` 包裹，或使用 `client:only` 指令跳过 SSR
- **ref 初始值必须 SSR 安全**：`ref()` 的初始值在 SSR 和客户端必须一致。需要客户端才能确定的值（如屏幕宽度、用户偏好），应在 `onMounted` 中延迟赋值，初始值用安全的默认值
- **禁止 onMounted 后直接修改 SSR 渲染的 DOM**：`onMounted` 中直接操作 DOM（如 `createElement`、`replaceChild`）会破坏 Vue 的水合节点匹配。如需动态渲染，用 `<ClientOnly>` 包裹整个区域

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

### Design Token 一致性

- **边框色统一**：使用 `border-border-light dark:border-border-dark`，不要用 `border-gray-*`
- **动画时长用语义 Token**：`duration-fast`(150ms) / `duration-normal`(250ms) / `duration-slow`(400ms)，不要硬编码 `duration-250` 等非标准值
- **Z-index 用语义 Token**：`z-dropdown`(30) / `z-overlay`(40) / `z-modal`(50) / `z-toast`(60)
- **新增 Design Token 必须在 `@theme` 中定义**，不要在组件中硬编码颜色/间距/圆角/阴影值

### 国际化

- **所有用户可见文本必须走 i18n**：composable 中的分类名、时间线内容等也必须用 `t()`，不要硬编码中文
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
- **遮罩层/弹窗/抽屉需可关闭**：ESC 键、点击遮罩、关闭按钮三种方式至少支持两种

### prefers-reduced-motion

- **scroll-reveal 在 reduced-motion 下必须立即可见**：`opacity: 1 !important; transform: none !important`
- **不要仅靠 transition-duration: 0 来处理**：`opacity: 0` 是静态样式不是 transition，必须显式覆盖

## 关键配置

- `app.baseURL` 设为 `/my-personalWebsite/`（GitHub Pages 部署需要，本地开发为 `/`）
- i18n 使用 `prefix_except_default` 策略（默认中文无前缀，英文 URL 带 `/en/` 前缀）
- 卡片组件需配置 `sizes` 属性（如 `sizes="sm:100vw md:50vw lg:33vw"`）

## 移动端适配约定

### 交互模式

- **AppHeader**：移动端汉堡菜单 + slide-down 动画 + 外部点击关闭 + body scroll lock
- **MobileToc**：博客详情页浮动 TOC 按钮（右下角，避开 MobileNavBar 用 `bottom-24`），点击弹出底部目录面板
- **MobileNavBar**：移动端底部固定导航栏（md 以下显示），布局 `default.vue` 中 `main` 需添加 `pb-16 md:pb-0` 为其留出空间
- **AppSidebar**：移动端抽屉式（左侧滑入 + 遮罩层），桌面端固定显示

### 约束规则

- 触控目标 ≥ 40×40px（h-10 w-10）
- 移动端交互组件（抽屉、弹出面板）需提供遮罩层 + 关闭按钮 + 路由切换自动关闭
- **ProjectCard**：整张卡片 NuxtLink 包裹可点击，内部按钮使用 `@click.stop` 阻止冒泡
