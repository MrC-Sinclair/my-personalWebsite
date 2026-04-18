---
title: 使用 Nuxt 3 构建个人网站
description: 记录使用 Nuxt 3 + Nuxt UI + @nuxt/content 搭建个人网站的全过程，分享技术选型与实现细节。
date: "2025-04-15"
tags:
  - Nuxt
  - Vue
  - SSG
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

## 项目结构

项目采用模块化的目录结构，将组件按功能分类：

- `components/layout/` - 布局组件
- `components/home/` - 首页组件
- `components/blog/` - 博客组件
- `components/project/` - 项目组件
- `components/common/` - 通用组件

## 总结

通过 Nuxt 3 生态系统的各个模块，我们可以快速搭建一个功能完善、性能优异的个人网站。后续将逐步完善各个功能模块。
