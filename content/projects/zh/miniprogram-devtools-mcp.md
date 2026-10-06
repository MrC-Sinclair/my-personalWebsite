---
title: miniprogram-devtools-mcp
description: 操控微信开发者工具的 MCP server（30 个工具），双通道设计让 AI Agent 自动调试微信小程序。
date: '2026-09-16'
updated: '2026-09-19'
tags:
  - MCP
  - Node.js
  - 微信小程序
  - 自动化测试
demoUrl: https://www.npmjs.com/package/miniprogram-devtools-mcp
githubUrl: https://github.com/MrC-Sinclair/miniprogram-devtools-mcp
featured: true
---

## 项目简介

把微信开发者工具变成 AI Agent 可以操作的对象。基于 [MCP](https://modelcontextprotocol.io/)（Model Context Protocol）暴露 30 个工具，让 Agent 能自己启动小程序、点元素、读数据、看日志、截图、上传体验版——把「人盯着开发者工具点」变成「Agent 自己跑」。

## 双通道设计

这是它的核心：官方 CLI 与 automator 各有覆盖不到的地方，所以两条路一起用。

- **automator 直连**（20 个工具）
  基于 [miniprogram-automator](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/)：读 `globalData`、执行 JS、点击元素、读页面 data、静态自检、坏状态自愈、跑运行时用例。

- **官方 wechatide CLI 封装**（10 个工具）
  补齐 automator 做不到的能力：模拟器截图、console/network 日志、预览推送、上传体验版、云开发；并内置 **`wechatide_call` 通用透传**，官方 CLI 新增能力时可直接使用，不必等本工具发版。

## 技术特点

- **两条通道互补**：直连适合细粒度操控，CLI 封装适合模拟器与发布链路
- **坏状态自愈**：小程序卡在异常状态时能自动恢复到可测状态
- **通用透传**：`wechatide_call` 让上游新增能力可以立刻用到，不形成版本阻塞
- **已发布 npm**：`npm i miniprogram-devtools-mcp` 即可接入任意 MCP 客户端

## 实现亮点

1. 用 MCP 标准协议接入，任何支持 MCP 的 Agent 都能直接调用，不绑定特定产品
2. 双通道不是重复实现，而是按「谁更适合」分工，覆盖度明显好于单通道方案
3. 透传设计把「上游更新」和「本工具发版」解耦
4. 自带静态自检与运行时用例能力，Agent 能自己验证改对了没有
