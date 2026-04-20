---
title: 使用 Nuxt 3 构建个人网站
description: 记录使用 Nuxt 3 + Nuxt UI + @nuxt/content 搭建个人网站的全过程，分享技术选型、移动端适配与 PWA 实现细节。
date: '2025-04-15'
updated: '2025-04-20'
tags:
  - Nuxt
  - Vue
  - SSG
  - PWA
  - 移动端适配
category: 前端
draft: false
---

## 为什么选择 Nuxt 3

Nuxt 3 是一个基于 Vue 3 的全栈框架，支持 SSR、SSG 和混合渲染模式。对于个人网站来说，SSG（静态站点生成）是最理想的选择：

- **性能优异**：预渲染为纯静态 HTML，加载速度极快
- **部署简单**：可直接部署到 GitHub Pages、Vercel 等平台
- **SEO 友好**：预渲染的 HTML 对搜索引擎完全可见
- **开发体验好**：热更新、自动导入、TypeScript 支持

## 技术栈选择

### UI 框架：Nuxt UI v3

Nuxt UI v3 基于 Tailwind CSS v4 和 Reka UI，提供了丰富的组件和优秀的开发体验。

### 内容管理：@nuxt/content v3

使用 Markdown 文件管理博客和项目内容，通过 Zod schema 定义结构化数据，支持全文搜索。

### 国际化：@nuxtjs/i18n

支持中英文双语，使用 `prefix_except_default` 策略，中文为默认语言。

### PWA：@vite-pwa/nuxt

通过 @vite-pwa/nuxt 模块实现 PWA 支持，用户可以将网站添加到主屏幕，支持离线访问和自动更新。

## 项目结构

项目采用模块化的目录结构，将组件按功能分类：

- `components/layout/` - 布局组件（AppHeader, AppFooter, AppSidebar, MobileNavBar）
- `components/home/` - 首页组件
- `components/blog/` - 博客组件（含 MobileToc 移动端目录）
- `components/project/` - 项目组件
- `components/common/` - 通用组件（ThemeToggle, LangSwitcher, SearchModal, ContactForm）

## 移动端适配方案

项目遵循"移动端优先，渐进增强"的设计策略，从核心交互、体验优化和高级特性三个层面实现完整的移动端适配。

### 核心交互

**汉堡菜单增强**：AppHeader 的移动端菜单添加了 slide-down 展开/收起动画、点击外部区域自动关闭、菜单打开时锁定背景滚动（body scroll lock），确保移动端导航体验流畅。

**搜索入口**：在 AppHeader 中添加搜索图标按钮，移动端和桌面端均可触发 SearchModal，解决了之前移动端无法使用搜索功能的问题。

**移动端文章目录**：新建 MobileToc 组件，在博客详情页以右下角浮动按钮形式展示，点击后弹出底部目录面板，方便移动端用户跳转文章章节。桌面端仍使用 BlogToc 侧边栏固定显示。

**底部导航栏**：新建 MobileNavBar 组件，在 md 断点以下固定在页面底部，提供首页、博客、项目、关于、联系五个主要页面的快速切换入口。

### 体验优化

**触控目标尺寸**：所有可交互元素（按钮、链接）的触控区域扩大到 40×40px（h-10 w-10），接近 WCAG 推荐的 44×44px 标准，避免移动端误触。

**prefers-reduced-motion**：在 `assets/css/main.css` 中添加全局 CSS 规则，当用户系统设置减少动画时，自动禁用所有动画和过渡效果。

**响应式图片**：NuxtImg 组件配置 `sizes="sm:100vw md:50vw lg:33vw"`，避免移动端下载不必要的大图，节省流量。

**ProjectCard 整体可点击**：使用 NuxtLink 包裹整张卡片，内部按钮通过 `@click.stop` 阻止事件冒泡，移动端无需精确点击小按钮。

**AppSidebar 抽屉模式**：移动端侧边栏改为抽屉式，从左侧滑入并显示遮罩层，通过 `isOpen` prop 和 `close` emit 控制，路由切换时自动关闭。

### 高级特性

**安全区域适配**：viewport meta 添加 `viewport-fit=cover`，CSS 提供 `safe-bottom/top/left/right` 工具类，适配 iPhone X+ 等刘海屏设备。

**PWA 支持**：通过 @vite-pwa/nuxt 模块配置 Web App Manifest 和 Service Worker，支持添加到主屏幕、离线访问和自动更新。同时配置了 `apple-mobile-web-app-capable` 和 `black-translucent` 状态栏样式。

## 总结

通过 Nuxt 3 生态系统的各个模块，我们可以快速搭建一个功能完善、性能优异的个人网站。从基础的 SSG 静态生成到完整的移动端适配和 PWA 支持，项目逐步完善了各个功能模块，确保在各种设备上都能提供优秀的用户体验。
