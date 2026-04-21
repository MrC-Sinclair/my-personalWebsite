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

## 关键配置

- `app.baseURL` 设为 `/my-personalWebsite/`（GitHub Pages 部署需要，本地开发为 `/`）
- i18n 使用 `prefix_except_default` 策略（默认中文无前缀，英文 URL 带 `/en/` 前缀）
- 卡片组件需配置 `sizes` 属性（如 `sizes="sm:100vw md:50vw lg:33vw"`）

## 移动端适配约定

### 交互模式

- **AppHeader**：移动端汉堡菜单 + slide-down 动画 + 外部点击关闭 + body scroll lock
- **MobileToc**：博客详情页浮动 TOC 按钮（右下角），点击弹出底部目录面板
- **MobileNavBar**：移动端底部固定导航栏（md 以下显示），布局 `default.vue` 中 `main` 需添加 `pb-16 md:pb-0` 为其留出空间
- **AppSidebar**：移动端抽屉式（左侧滑入 + 遮罩层），桌面端固定显示

### 约束规则

- 触控目标 ≥ 40×40px（h-10 w-10）
- 移动端交互组件（抽屉、弹出面板）需提供遮罩层 + 关闭按钮 + 路由切换自动关闭
- **ProjectCard**：整张卡片 NuxtLink 包裹可点击，内部按钮使用 `@click.stop` 阻止冒泡
