---
title: Personal Website
description: A comprehensive personal website built with Nuxt 3 SSG, fully adapted for mobile, with PWA support for offline access, featuring blog, projects portfolio, about, and contact modules.
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

## Overview

This is a comprehensive personal website project using Nuxt 3 SSG static generation + GitHub Pages deployment. It includes five core modules: Home, Blog, Projects, About, and Contact. Fully adapted for mobile with PWA offline access support.

## Technical Features

- **SSG Static Generation**: Pure static site generated with `nuxt generate`
- **Content Management**: Markdown content managed through @nuxt/content v3
- **Internationalization**: Chinese and English bilingual support
- **Theme Switching**: Complete light/dark dual-mode
- **Mobile Adaptation**: Mobile-first with dedicated mobile interaction components
- **PWA Support**: Offline access, add-to-home-screen, auto-update

## Mobile Adaptation

- **Enhanced Hamburger Menu**: Slide-down animation + click-outside-to-close + body scroll lock
- **Mobile TOC**: MobileToc floating button + bottom sheet panel
- **Bottom Navigation Bar**: MobileNavBar fixed bottom navigation (visible below md breakpoint)
- **Drawer Sidebar**: AppSidebar slides in from the left with overlay on mobile
- **Touch Target Optimization**: All interactive elements ≥ 40×40px
- **Responsive Images**: NuxtImg configured with sizes attribute for on-demand loading
- **Safe Area Adaptation**: viewport-fit=cover + env(safe-area-inset-*)
- **prefers-reduced-motion**: Global CSS rule respects user animation preferences

## Tech Stack

- Nuxt 3 + Vue 3
- Nuxt UI v3 + Tailwind CSS v4
- TypeScript
- @nuxt/content v3
- @nuxtjs/i18n
- @nuxtjs/color-mode
- @nuxt/image (with responsive sizes)
- @vite-pwa/nuxt

## Highlights

1. Content layer abstraction: All content fetching logic encapsulated in composables
2. Design Token system: Unified design variable management via CSS @theme
3. Mobile-first: Dedicated mobile interaction components (MobileToc, MobileNavBar)
4. Accessibility: Following WCAG AA standards, touch targets ≥ 40px
5. PWA support: Service Worker + Web App Manifest + offline access
6. Performance optimization: Responsive images, code splitting, pre-rendering
