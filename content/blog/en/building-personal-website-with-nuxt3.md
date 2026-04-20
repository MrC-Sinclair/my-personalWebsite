---
title: Building a Personal Website with Nuxt 3
description: Documenting the process of building a personal website using Nuxt 3 + Nuxt UI + @nuxt/content, sharing technical choices, mobile adaptation, and PWA implementation details.
date: '2025-04-15'
updated: '2025-04-20'
tags:
  - Nuxt
  - Vue
  - SSG
  - PWA
  - Mobile
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

### PWA: @vite-pwa/nuxt

Implementing PWA support through the @vite-pwa/nuxt module, allowing users to add the website to their home screen with offline access and auto-update capabilities.

## Project Structure

The project uses a modular directory structure with components organized by function:

- `components/layout/` - Layout components (AppHeader, AppFooter, AppSidebar, MobileNavBar)
- `components/home/` - Home page components
- `components/blog/` - Blog components (including MobileToc for mobile)
- `components/project/` - Project components
- `components/common/` - Common components (ThemeToggle, LangSwitcher, SearchModal, ContactForm)

## Mobile Adaptation

The project follows a "mobile-first, progressive enhancement" design strategy, implementing complete mobile adaptation across three layers: core interactions, experience optimization, and advanced features.

### Core Interactions

**Enhanced Hamburger Menu**: The AppHeader mobile menu features slide-down animation, click-outside-to-close behavior, and body scroll lock when the menu is open, ensuring a smooth mobile navigation experience.

**Search Access**: A search icon button was added to AppHeader, enabling both mobile and desktop users to trigger SearchModal, resolving the previous issue where search was inaccessible on mobile.

**Mobile Table of Contents**: A new MobileToc component displays as a floating button in the bottom-right corner of blog detail pages. Tapping it reveals a bottom sheet with the table of contents, making it easy for mobile users to navigate article sections. Desktop users still see the BlogToc sidebar.

**Bottom Navigation Bar**: A new MobileNavBar component is fixed at the bottom of the page below the md breakpoint, providing quick access to Home, Blog, Projects, About, and Contact pages.

### Experience Optimization

**Touch Target Size**: All interactive elements (buttons, links) have been enlarged to 40×40px (h-10 w-10), approaching the WCAG-recommended 44×44px standard to prevent accidental taps on mobile.

**prefers-reduced-motion**: A global CSS rule in `assets/css/main.css` automatically disables all animations and transitions when the user's system is set to reduce motion.

**Responsive Images**: NuxtImg components are configured with `sizes="sm:100vw md:50vw lg:33vw"` to prevent mobile devices from downloading unnecessarily large images.

**Clickable ProjectCard**: The entire ProjectCard is wrapped in a NuxtLink, with internal buttons using `@click.stop` to prevent event bubbling, eliminating the need for precise tapping on mobile.

**AppSidebar Drawer Mode**: The mobile sidebar uses a drawer pattern, sliding in from the left with an overlay backdrop, controlled via `isOpen` prop and `close` emit, and automatically closes on route changes.

### Advanced Features

**Safe Area Adaptation**: The viewport meta includes `viewport-fit=cover`, and CSS provides `safe-bottom/top/left/right` utility classes for iPhone X+ notch device compatibility.

**PWA Support**: Configured via @vite-pwa/nuxt with Web App Manifest and Service Worker, supporting add-to-home-screen, offline access, and auto-update. Also configured with `apple-mobile-web-app-capable` and `black-translucent` status bar style.

## Summary

Through the various modules of the Nuxt 3 ecosystem, we can quickly build a fully-featured, high-performance personal website. From basic SSG static generation to complete mobile adaptation and PWA support, the project has progressively improved each functional module to ensure an excellent user experience across all devices.
