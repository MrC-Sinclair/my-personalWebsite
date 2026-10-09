---
title: ardot-design-expert
description: 自包含的 Ardot 设计专家包，技能与规则随包内置，唯一外部依赖是 Ardot MCP 服务保持连接，可在任意支持 MCP 的 IDE 中运行。
date: '2026-08-05'
updated: '2026-10-05'
tags:
  - 专家包
  - 设计系统
  - MCP
  - UI/UX
  - Ardot
githubUrl: https://github.com/MrC-Sinclair/ardot-design-expert
featured: true
---

## 项目简介

一个**自包含的 Ardot 设计专家**：技能与规则文件全部随包内置，唯一的外部依赖是 Ardot MCP 服务需要保持连接。它不绑定特定 IDE —— WorkBuddy（含设计创意模式）、Cursor、Claude Code、Cline 等任意支持 MCP 的 IDE 都能用，MCP 通道名在运行时探测而非写死。

人设是 UI/UX 设计专家（花名 Jax），负责两件事：在画布上构建像素级精准的 UI 界面，以及把设计稿转成生产可用的前端代码（React / Tailwind / Vue / HTML）。

> 非官方声明：本专家由社区个人维护，与 Ardot 官方无任何隶属或合作关系。

## 为什么要做成自包含

本专家包是 WorkBuddy 内置 Ardot 技能族（设计核心、UI 设计、幻灯片、海报、直播海报、设计转码与 Miora 四件套）的 fork。保留 fork 是一个有意的产品决策：**必须能在任意支持 MCP 的 IDE 里独立运行，不依赖宿主注入任何内置技能**。

代价是上游升级不会自动同步，所以配套了两项机制：

- **`PROVENANCE.md`**：逐文件标注来源——`verbatim`（与上游逐字节一致）、`fork`（本地分叉）、`local-only`（本包独有）
- **`sync-check.sh`**：机械检测与上游的漂移，供维护者使用，普通使用者无需运行

## 宿主注入加载门

在 WorkBuddy 设计创意模式下，宿主会额外注入同源技能，于是同一份规则会出现两份。

`SKILL.md` 里的「宿主注入加载门」解决这个问题：**跳过与上游逐字节相同的文件，只加载本地分叉的部分**——既避免双份规则互相冲突，也省下上下文。这条机制对使用者完全透明，直接安装使用即可。

## 包内容

```text
ardot-design-expert/
├── .codebuddy-plugin/plugin.json   # 专家元数据（含展示字段）
├── agents/ardot-design-expert.md   # 人设 / 提示词（Jax）
├── avatars/expert.png
└── skills/ardot-design-assistant-local/   # 设计助理技能（自包含）
    ├── SKILL.md          # 主入口：可移植性说明 / 通道探测 / 加载门 / 工作流 / 硬规则
    ├── PROVENANCE.md     # 溯源标注
    ├── sync-check.sh     # 漂移检测（维护用）
    ├── scripts/          # 直播海报风格目录拉取脚本
    └── references/       # 规则与指南，全部随包提供
```

`references/` 覆盖核心规则（`design-rules.md` 是唯一事实来源，含编辑原则、坐标、flexbox、组件、变量、属性 schema、排障与禁止模式）、视觉效果配方、组件与实例、变量绑定、`batch_edit` 操作手册，以及幻灯片 / 海报 / 落地页 / Web 应用 / 移动端 / 表格等分类型指南和设计转码、设计走查、代码还原度评审等工作流。

## 技术特点

- **可移植**：不依赖宿主注入内置技能，换 IDE 也能跑
- **通道名运行时探测**：不把 MCP 通道名写死在配置里
- **依赖缺失时明确提示而非静默失败**：画布设计缺 `ardot_*` MCP、直播海报缺 `ImageGen`、AI 生图 / 生视频 / 品牌资产缺 `miora_*` MCP 时，都会停下来告知，且不影响其余能力
- **规则分层**：51 份指南按「核心规则 / 专项能力 / 工作流 / 类型指南」组织，按需加载
- **溯源可审计**：每个文件都能查到它是与上游一致、本地分叉还是本包独有

## 安装

需注册到 WorkBuddy 的 `marketplace.json` 后才会出现在专家中心，仅复制文件夹不会自动生效。两种方式任选：

1. **专家中心导入**（推荐）：打开 WorkBuddy → 专家中心 → 导入本地专家 → 选择本仓库根目录
2. **手动放置 + 注册脚本**：复制目录到 `~/.workbuddy/plugins/marketplaces/my-experts/plugins/ardot-design-expert/`，再运行内置的 `expert-manager` 注册脚本，重启专家中心即可

使用前必须先安装并连接 Ardot MCP 服务；若未连接，专家会提示先安装连接。

## 擅长领域

UI/UX 设计、设计系统、用户研究、代码还原度评审。典型用法：设计一个移动端 App 首页、把设计稿转成 React + Tailwind 代码、搭建一套设计系统、审查代码对设计稿的还原度。
