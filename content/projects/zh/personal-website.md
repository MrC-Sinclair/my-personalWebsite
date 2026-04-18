---
title: 个人网站项目
description: 基于 Nuxt 3 SSG 构建的综合型个人网站，包含博客、项目集锦、关于和联系模块。
date: "2025-04-10"
tags:
  - Nuxt
  - Vue
  - TypeScript
  - Tailwind CSS
demoUrl: https://yourusername.github.io/my-personalWebsite/
githubUrl: https://github.com/yourusername/my-personalWebsite
featured: true
---

## 项目简介

这是一个综合型个人网站项目，使用 Nuxt 3 SSG 静态生成 + GitHub Pages 部署。包含首页、博客、项目集锦、关于和联系五大核心模块。

## 技术特点

- **SSG 静态生成**：使用 `nuxt generate` 生成纯静态站点
- **内容管理**：通过 @nuxt/content v3 管理 Markdown 内容
- **国际化**：支持中英文双语
- **主题切换**：完整的亮色/暗色双模式
- **响应式设计**：移动端优先，适配各种设备

## 技术栈

- Nuxt 3 + Vue 3
- Nuxt UI v3 + Tailwind CSS v4
- TypeScript
- @nuxt/content v3
- @nuxtjs/i18n
- @nuxtjs/color-mode

## 实现亮点

1. 内容层抽象：所有内容获取逻辑封装在 composables 中
2. Design Token 系统：通过 CSS @theme 统一管理设计变量
3. 无障碍支持：遵循 WCAG AA 标准
4. 性能优化：图片优化、代码分割、预渲染
