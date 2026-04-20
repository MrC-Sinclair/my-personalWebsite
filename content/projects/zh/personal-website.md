---
title: 个人网站项目
description: 基于 Nuxt 3 SSG 构建的综合型个人网站，完整适配移动端，支持 PWA 离线访问，包含博客、项目集锦、关于和联系模块。
date: '2025-04-10'
updated: '2025-04-20'
tags:
  - Nuxt
  - Vue
  - TypeScript
  - Tailwind CSS
  - PWA
demoUrl: https://yourusername.github.io/my-personalWebsite/
githubUrl: https://github.com/yourusername/my-personalWebsite
featured: true
---

## 项目简介

这是一个综合型个人网站项目，使用 Nuxt 3 SSG 静态生成 + GitHub Pages 部署。包含首页、博客、项目集锦、关于和联系五大核心模块。完整适配移动端，支持 PWA 离线访问。

## 技术特点

- **SSG 静态生成**：使用 `nuxt generate` 生成纯静态站点
- **内容管理**：通过 @nuxt/content v3 管理 Markdown 内容
- **国际化**：支持中英文双语
- **主题切换**：完整的亮色/暗色双模式
- **移动端适配**：移动端优先，独立移动端交互组件
- **PWA 支持**：离线访问、添加到主屏幕、自动更新

## 移动端适配

- **汉堡菜单增强**：slide-down 动画 + 外部点击关闭 + body scroll lock
- **移动端目录**：MobileToc 浮动按钮 + 底部弹出面板
- **底部导航栏**：MobileNavBar 固定底部导航（md 以下显示）
- **抽屉式侧边栏**：AppSidebar 移动端左侧滑入 + 遮罩层
- **触控目标优化**：所有可交互元素 ≥ 40×40px
- **响应式图片**：NuxtImg 配置 sizes 属性，移动端按需加载
- **安全区域适配**：viewport-fit=cover + env(safe-area-inset-*)
- **prefers-reduced-motion**：全局 CSS 规则尊重用户动画偏好

## 技术栈

- Nuxt 3 + Vue 3
- Nuxt UI v3 + Tailwind CSS v4
- TypeScript
- @nuxt/content v3
- @nuxtjs/i18n
- @nuxtjs/color-mode
- @nuxt/image（含响应式 sizes）
- @vite-pwa/nuxt

## 实现亮点

1. 内容层抽象：所有内容获取逻辑封装在 composables 中
2. Design Token 系统：通过 CSS @theme 统一管理设计变量
3. 移动端优先：独立移动端交互组件（MobileToc、MobileNavBar）
4. 无障碍支持：遵循 WCAG AA 标准，触控目标 ≥ 40px
5. PWA 支持：Service Worker + Web App Manifest + 离线访问
6. 性能优化：响应式图片、代码分割、预渲染
