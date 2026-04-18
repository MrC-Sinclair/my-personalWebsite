---
title: Building a Personal Website with Nuxt 3
description: Documenting the process of building a personal website using Nuxt 3 + Nuxt UI + @nuxt/content, sharing technical choices and implementation details.
date: "2025-04-15"
tags:
  - Nuxt
  - Vue
  - SSG
category: Frontend
draft: false
---

## Why Nuxt 3

Nuxt 3 is a full-stack framework based on Vue 3 that supports SSR, SSG, and hybrid rendering modes. For a personal website, SSG (Static Site Generation) is the ideal choice:

- **Excellent Performance**: Pre-rendered as pure static HTML for blazing fast loading
- **Simple Deployment**: Can be deployed directly to GitHub Pages, Vercel, etc.
- **SEO Friendly**: Pre-rendered HTML is fully visible to search engines
- **Great DX**: Hot reload, auto-imports, TypeScript support

## Tech Stack

### UI Framework: Nuxt UI v3

Nuxt UI v3 is built on Tailwind CSS v4 and Reka UI, providing rich components and excellent developer experience.

### Content Management: @nuxt/content v3

Using Markdown files for blog and project content, with Zod schema for structured data and full-text search support.

### Internationalization: @nuxtjs/i18n

Supporting Chinese and English with `prefix_except_default` strategy, Chinese as the default language.

## Project Structure

The project uses a modular directory structure with components organized by function:

- `components/layout/` - Layout components
- `components/home/` - Home page components
- `components/blog/` - Blog components
- `components/project/` - Project components
- `components/common/` - Common components

## Summary

Through the various modules of the Nuxt 3 ecosystem, we can quickly build a fully-featured, high-performance personal website. Each functional module will be gradually improved in subsequent updates.
