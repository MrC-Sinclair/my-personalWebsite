---
title: Building a Personal Website with Nuxt 3
description: Documenting the process of building a personal website using Nuxt 3 + Nuxt UI + @nuxt/content, sharing technical choices, mobile adaptation, and PWA implementation details.
date: '2025-04-15'
updated: '2025-04-28'
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

Among the many frontend frameworks, I chose Nuxt 3 for the following reasons:

- **SSG is the optimal solution for personal websites**: Personal sites have low content update frequency and no server-side logic. Pre-rendering to pure static HTML delivers blazing fast loads, and deploying to GitHub Pages costs nothing. Nuxt 3 supports SSR/SSG/hybrid rendering simultaneously — if dynamic features are needed in the future (e.g., a comment system), individual pages can switch rendering modes without a full rewrite
- **Complete ecosystem**: Nuxt UI, @nuxt/content, @nuxtjs/i18n, @vite-pwa/nuxt and other official/community modules cover nearly every need for a personal website, eliminating the need to assemble pieces yourself
- **TypeScript-first**: End-to-end type safety from route params to content schemas, with Zod for runtime validation — content format errors are caught at build time

## Tech Stack Choices and Pitfalls

### Content Management: @nuxt/content v3

I chose @nuxt/content v3 over v2 because v3 introduces `defineCollection` + Zod schema, which validates Markdown frontmatter field types and formats at build time.

**Pitfall**: v3 collections must be separated by source path — you can't distinguish languages within a single collection using a language field. Therefore, Chinese and English content require separate collections:

```ts
// content.config.ts
const blogSchema = z.object({
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  // ...
})

export default defineContentConfig({
  collections: {
    blogZh: defineCollection({ type: 'page', source: 'blog/zh/**/*.md', schema: blogSchema }),
    blogEn: defineCollection({ type: 'page', source: 'blog/en/**/*.md', schema: blogSchema }),
  },
})
```

The benefit is that schemas can be shared across Chinese and English collections. The downside is that adding a new language requires a new pair of collections. For a bilingual personal site, this trade-off is acceptable.

### Internationalization: @nuxtjs/i18n

Using the `prefix_except_default` strategy: Chinese (default language) URLs have no prefix, English URLs carry an `/en/` prefix. This gives Chinese users cleaner URLs while English users can identify the language from the URL.

**Pitfall**: When switching languages with i18n, cached list data in composables must be cleared — otherwise the page briefly shows content in the old language. The solution is to clear the cache when `watch(locale)` fires:

```ts
const postsCache = ref<BlogPost[] | null>(null)

watch(locale, () => {
  postsCache.value = null
})
```

### Design Token System

The project uses Tailwind CSS v4's `@theme` directive to centrally manage design variables, avoiding hardcoded color values in components:

```css
@theme {
  --color-primary-500: #6366f1;
  --color-surface-light: #ffffff;
  --color-surface-dark: #0f172a;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --z-overlay: 40;
  --z-modal: 50;
}
```

This way, components use semantic tokens like `bg-surface-light dark:bg-surface-dark` and `duration-fast`. Changing the theme color only requires updating one place.

## Mobile Adaptation: Why We Did It This Way

The project follows a "mobile-first, progressive enhancement" strategy. Below are key decisions and the reasoning behind them.

### Why Separate Mobile Components

Initially, I put mobile and desktop interaction logic in the same component, using `v-if` + breakpoint switching. This quickly led to:

1. **Bloated components**: A single component maintaining two sets of interaction logic (e.g., sidebar always visible vs. drawer slide-in) made readability plummet
2. **SSR dilemma**: The server doesn't know the screen width, so `v-if="isMobile"` can only guess a default value during SSR, easily causing hydration mismatch

The final solution was to split into separate components: `MobileToc` (floating button + bottom sheet) and `BlogToc` (sticky sidebar), controlled by CSS media queries (`lg:hidden` vs `hidden lg:block`). Both DOM trees render during SSR, and CSS determines which is visible on the client — avoiding hydration issues.

### SSG-Compatible Scroll Animation

A common scroll animation approach is to set elements to transparent in `onMounted`, but this causes hydration mismatch in SSG — the server renders visible HTML, then the client suddenly makes it transparent before animating it in.

My solution uses pure CSS for the initial state, with IntersectionObserver only adding the `.revealed` class:

```ts
export function useScrollReveal() {
  onMounted(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer.observe(el)
    })
  })
}
```

In CSS, `.scroll-reveal` starts at `opacity: 0`, and `.scroll-reveal.revealed` transitions to `opacity: 1`. During SSR, elements are already transparent (CSS takes effect), and on the client, the class is added when entering the viewport — SSR and client render results are consistent.

Additionally, under `prefers-reduced-motion`, you must explicitly override `.scroll-reveal { opacity: 1 !important; transform: none !important }`. Simply setting `transition-duration: 0` is not enough — `opacity: 0` is a static style, not a transition, so disabling transitions won't make it automatically visible.

### Touch Target Lessons

Interactive elements on mobile should have a touch area ≥ 40×40px (WCAG recommends 44×44px). During development, I missed the close button in the MobileToc panel — it used `h-8 w-8` (32px). I only caught this during a later review and fixed it to `h-10 w-10`. These issues are easy to overlook; I recommend specifically checking mobile button sizes during code review.

### Safe Area Adaptation

iPhone X and later models have a bottom Home Indicator that overlaps fixed-position bottom navigation bars. The solution:

```css
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

The viewport meta must include `viewport-fit=cover`, otherwise `env(safe-area-inset-*)` values will be 0.

## PWA Implementation Highlights

PWA support is implemented via the @vite-pwa/nuxt module with these key configurations:

- `registerType: 'autoUpdate'`: Service Worker updates automatically, no manual refresh needed
- `client: { installPrompt: true }`: Enables install prompt
- `apple-mobile-web-app-capable` + `black-translucent` status bar: Full-screen display when added to home screen on iOS

**Pitfall**: iOS PWA status bar overlaps page content by default. You must use `safe-area-inset-top` to reserve space at the top, otherwise AppHeader gets obscured by the status bar.

## Summary

Through the various modules of the Nuxt 3 ecosystem, we can quickly build a fully-featured, high-performance personal website. The biggest challenge during development wasn't implementing features — it was maintaining hydration consistency in SSG scenarios and polishing mobile interaction details. Here are my key takeaways:

1. **In SSG projects, all "client-only values" must be deferred to `onMounted` or wrapped in `<ClientOnly>`**, otherwise hydration mismatch is inevitable
2. **Mobile interaction components should be split independently** rather than conditionally switching within the same component — this yields cleaner code and safer SSR
3. **Centralized Design Token management** is more important than it seems — when a project grows from 10 to 50 components, hardcoded color values become a maintenance nightmare
4. **Details like touch target sizes are easy to miss** — I recommend building a checklist and verifying each item during code review
