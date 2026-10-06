---
title: my-chat
description: A general-purpose AI chat app built on Nuxt 3 + Vercel AI SDK, with safe Markdown/LaTeX rendering, multimodal image chat, speech transcription with sentiment detection, TTS, tool calling and long-term memory across sessions.
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

## Overview

A fully-featured general-purpose AI chat application. Beyond streaming conversation it covers multimodal input, voice interaction, tool calling and long-term memory — turning "talking to a model" into something actually usable rather than just another text box.

## Features

- **Rich rendering**: safe Markdown + LaTeX rendering (XSS-hardened)
- **Image chat**: multimodal input — ask questions about a picture directly
- **Voice messages**: recording transcribed *and* scored for sentiment, not just converted to text
- **Text-to-speech**: listen to replies instead of reading them
- **Tool calling**: weather, search, OCR, image generation, GitHub file reading
- **Long-term memory**: context survives across sessions, so a new conversation still remembers earlier ones
- **Responsive**: adapts to tablet and phone screens

## Tech stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Frontend | Nuxt 3 + Vue 3 | SSR/SSG support |
| AI SDK | Vercel AI SDK (`@ai-sdk/vue` + `ai`) | `useChat()` streaming |
| UI | Tailwind CSS + shadcn-vue style | Responsive layout |
| Backend API | Nuxt Server Routes (Nitro) | No separate server needed |
| Database | PostgreSQL 18 + Drizzle ORM | Sessions and memory persistence |

## Engineering notes

1. **Streaming first**: `useChat()` streams tokens, so responses start immediately instead of blocking on a full completion
2. **Safe rendering**: Markdown/LaTeX goes through allowlisting and escaping — model output is never trusted as HTML
3. **Closed-loop tools**: weather, search, OCR and image generation are wired up as callable tools, so the model does things rather than only talking
4. **Tiered memory**: short-term context and cross-session long-term memory are stored separately, avoiding an ever-growing context window
5. **No extra backend**: Nuxt Server Routes carry the API, keeping deployment simple
