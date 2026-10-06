---
title: miniprogram-devtools-mcp
description: An MCP server (30 tools) that drives the WeChat DevTools, using a dual-channel design so AI agents can debug WeChat Mini Programs on their own.
date: '2026-09-16'
updated: '2026-09-19'
tags:
  - MCP
  - Node.js
  - WeChat Mini Program
  - Test Automation
demoUrl: https://www.npmjs.com/package/miniprogram-devtools-mcp
githubUrl: https://github.com/MrC-Sinclair/miniprogram-devtools-mcp
featured: true
---

## Overview

Turns the WeChat DevTools into something an AI agent can actually operate. It exposes 30 tools over [MCP](https://modelcontextprotocol.io/) (Model Context Protocol), so an agent can launch a mini program, tap elements, read data, tail logs, take screenshots and upload a beta build — turning "a human clicks around in DevTools" into "the agent runs it itself".

## Dual-channel design

This is the core idea: the official CLI and the automator each leave gaps, so both are used.

- **Direct automator channel** (20 tools)
  Built on [miniprogram-automator](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/): read `globalData`, execute JS, tap elements, read page data, static self-check, recover from bad state, run runtime cases.

- **Official `wechatide` CLI wrapper** (10 tools)
  Covers what the automator cannot: simulator screenshots, console/network logs, pushing previews, uploading beta builds, cloud development — plus a generic **`wechatide_call` passthrough**, so new upstream CLI features are usable immediately without waiting for a release here.

## Highlights

- **Two channels that complement each other**: direct connection for fine-grained control, CLI wrapper for simulator and release workflows
- **Self-healing**: recovers automatically when the mini program is stuck in a bad state
- **Generic passthrough**: `wechatide_call` means upstream additions are usable at once — no version bottleneck
- **Published on npm**: `npm i miniprogram-devtools-mcp` plugs into any MCP client

## Engineering notes

1. Standard MCP protocol, so any MCP-capable agent can call it — no vendor lock-in
2. The dual channels are not duplicated work; each handles what it is better at, giving noticeably wider coverage than a single-channel design
3. The passthrough decouples "upstream ships a feature" from "this tool ships a release"
4. Built-in static self-check and runtime cases let the agent verify its own changes
