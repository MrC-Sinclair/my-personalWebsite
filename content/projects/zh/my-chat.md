---
title: my-chat
description: 基于 Nuxt 3 + Vercel AI SDK 的通用 AI 对话应用，支持 Markdown 与 LaTeX 安全渲染、图片多模态对话、语音转写与情感识别、TTS 朗读、工具调用与跨会话长期记忆。
date: '2026-04-20'
updated: '2026-09-13'
tags:
  - Nuxt
  - Vue
  - TypeScript
  - AI
  - PostgreSQL
  - Tailwind CSS
githubUrl: https://github.com/MrC-Sinclair/my-chat
featured: true
---

## 项目简介

一个功能完整的通用 AI 对话应用。除基础的流式对话外，覆盖了多模态输入、语音交互、工具调用与长期记忆——把「和模型聊天」做成了一个真正可用的产品形态，而不只是一个输入框。

## 功能

- **富文本渲染**：Markdown + LaTeX 公式安全渲染（做了 XSS 防护）
- **图片对话**：多模态输入，可以直接就图片内容提问
- **语音消息**：录音转写 + 情感识别，不只是把语音转成文字
- **语音朗读**：TTS 输出，支持听回复
- **工具调用**：天气、搜索、OCR、文生图、GitHub 文件读取
- **长期记忆**：跨会话保留上下文，换一次对话也记得之前聊过什么
- **响应式**：适配平板与手机屏幕

## 技术栈

| 层级 | 技术 | 说明 |
| --- | --- | --- |
| 前端框架 | Nuxt 3 + Vue 3 | SSR/SSG 支持 |
| AI SDK | Vercel AI SDK（`@ai-sdk/vue` + `ai`） | `useChat()` 流式对话 |
| UI | Tailwind CSS + shadcn-vue 风格 | 响应式布局 |
| 后端 API | Nuxt Server Routes（Nitro） | 无需额外服务器 |
| 数据库 | PostgreSQL 18 + Drizzle ORM | 会话与记忆持久化 |

## 实现亮点

1. **流式体验**：基于 `useChat()` 的流式输出，输入即响应，不做整段等待
2. **安全渲染**：Markdown/LaTeX 渲染走白名单与转义，模型输出不被当作可信 HTML
3. **工具调用闭环**：把天气、搜索、OCR、文生图等能力接成可调用工具，模型不只是嘴上回答
4. **记忆分层**：短期上下文与跨会话长期记忆分开存储，避免无脑塞满上下文窗口
5. **零额外后端**：用 Nuxt Server Routes 承载 API，部署形态简单
