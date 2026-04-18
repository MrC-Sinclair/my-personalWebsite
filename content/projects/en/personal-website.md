---
title: Personal Website
description: A comprehensive personal website built with Nuxt 3 SSG, featuring blog, projects portfolio, about, and contact modules.
date: '2025-04-10'
tags:
  - Nuxt
  - Vue
  - TypeScript
  - Tailwind CSS
demoUrl: https://yourusername.github.io/my-personalWebsite/
githubUrl: https://github.com/yourusername/my-personalWebsite
featured: true
---

## Overview

This is a comprehensive personal website project using Nuxt 3 SSG static generation + GitHub Pages deployment. It includes five core modules: Home, Blog, Projects, About, and Contact.

## Technical Features

- **SSG Static Generation**: Pure static site generated with `nuxt generate`
- **Content Management**: Markdown content managed through @nuxt/content v3
- **Internationalization**: Chinese and English bilingual support
- **Theme Switching**: Complete light/dark dual-mode
- **Responsive Design**: Mobile-first, adapting to all devices

## Tech Stack

- Nuxt 3 + Vue 3
- Nuxt UI v3 + Tailwind CSS v4
- TypeScript
- @nuxt/content v3
- @nuxtjs/i18n
- @nuxtjs/color-mode

## Highlights

1. Content layer abstraction: All content fetching logic encapsulated in composables
2. Design Token system: Unified design variable management via CSS @theme
3. Accessibility: Following WCAG AA standards
4. Performance optimization: Image optimization, code splitting, pre-rendering
