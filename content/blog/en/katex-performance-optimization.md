---
title: 'Conquering KaTeX Long Formula Rendering: From 60 Seconds to 1.5 Seconds'
description: A deep dive into how sharded async rendering and visual lazy loading reduced KaTeX long formula rendering time from 60 seconds to 1.5 seconds in an AI education tablet project. Full optimization strategy and engineering practices included.
date: '2025-08-15'
tags:
  - KaTeX
  - Performance Optimization
  - Vue3
  - Rendering
  - Frontend Architecture
category: Frontend
draft: false
---

## Background: When AI Answers Meet KaTeX

In AI-powered education products, there's a core use case: a student takes a photo of a problem, and the AI returns detailed step-by-step solutions containing numerous complex mathematical formulas — quadratic functions, trigonometric functions, calculus, matrices, and more.

Our tech stack is Vue3 + TypeScript + Vercel AI SDK. The AI streaming output returns Markdown text, where inline formulas are wrapped in `$...$` and block formulas in `$$...$$`. The frontend parses the Markdown, extracts the formula portions, and renders them using KaTeX.

Here's where the problem surfaced: **some extremely long formulas (like deeply nested integrals, matrices, and summation symbols) took up to 60 seconds for KaTeX to render.**

Imagine a student using a tablet to scan a problem and waiting half a minute without seeing any solution — that experience alone would drive users away.

This article chronicles how we optimized that 60-second render down to 1.5 seconds, step by step, along with the engineering decisions behind each change.

## Step 1: Identifying the Root Cause — Why KaTeX is Slow

### 1.1 Confirming the Bottleneck

First, we needed to confirm: was the 60 seconds spent on rendering or other stages?

We injected `performance.mark` at critical points:

```ts
performance.mark('render-start')
katex.render(formula, element, {
  throwOnError: false,
  displayMode: isBlock,
})
performance.mark('render-end')
performance.measure('katex-render', 'render-start', 'render-end')
```

The measurements clearly pointed to KaTeX's own `render` call.

### 1.2 Analyzing the Cause

KaTeX's rendering process consists of three stages:

1. **Lexing**: Breaks LaTeX strings into token sequences
2. **Parsing**: Builds tokens into an AST (Abstract Syntax Tree)
3. **Build**: Converts the AST into HTML DOM

For typical formulas, all three stages complete in milliseconds. But for formulas with these characteristics:

- Deeply nested `\frac`, `\sum`, `\int`
- Large matrices (e.g., 10×10)
- Accumulation symbols with complex sub/superscripts
- Align environments with many parameters (`align`, `cases`)

KaTeX's parser enters deep recursion, and the AST node count grows exponentially, causing the Parsing and Build phases to skyrocket.

For example, a formula with 3 levels of nested summation + multiple fractions + a matrix can generate tens of thousands of AST nodes.

## Step 2: First Attempt — Offloading to Web Worker

### 2.1 The Idea

Since KaTeX rendering is CPU-intensive, the natural thought was to move it to a background thread via Web Worker.

### 2.2 Implementation

```ts
// katex.worker.ts
import katex from 'katex'

self.onmessage = (e: MessageEvent<{ id: string; formula: string; displayMode: boolean }>) => {
  const { id, formula, displayMode } = e.data
  try {
    const html = katex.renderToString(formula, {
      throwOnError: false,
      displayMode,
    })
    self.postMessage({ id, html, error: null })
  } catch (error) {
    self.postMessage({ id, html: null, error: String(error) })
  }
}
```

Calling from the main thread:

```ts
const worker = new Worker(new URL('./katex.worker.ts', import.meta.url), { type: 'module' })

export function renderFormulaAsync(formula: string, displayMode: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID()
    worker.postMessage({ id, formula, displayMode })
    worker.onmessage = (e) => {
      if (e.data.id === id) {
        if (e.data.error) reject(e.data.error)
        else resolve(e.data.html)
      }
    }
  })
}
```

### 2.3 Results

- **Main thread no longer blocked** ✅ Formula rendering no longer freezes the UI
- **Total rendering time unchanged** ❌ The user still waits 60 seconds

This showed that Web Worker only solved the "don't block the main thread" problem, not the "user still has to wait forever" problem.

What we needed was **let users see content quickly**, not make them wait idly.

## Step 3: Core Solution — Chunked Async Rendering

### 3.1 Shift in Thinking

The key insight: the AI's Markdown response is a **document containing multiple formulas**, not a single formula. If we can render simple formulas first to show users most of the content, then gradually process complex ones, the perceived wait time drops dramatically.

This is the essence of **Chunked Async Rendering**.

### 3.2 Chunk Granularity

We split the rendering task into three levels:

1. **Document-level chunks**: Split the Markdown into independent paragraphs
2. **Formula-level chunks**: Within each paragraph, sort formulas by complexity (simple first)
3. **Single-formula timeout chunks**: Ultra-long individual formulas are also broken into stages

### 3.3 Implementation

First, extract KaTeX formulas from Markdown and assign a complexity score:

```ts
interface FormulaChunk {
  id: string
  rawFormula: string
  displayMode: boolean
  complexity: number
  position: number
}

function estimateComplexity(formula: string): number {
  let score = 0
  score += (formula.match(/\\frac/g) || []).length * 2
  score += (formula.match(/\\sum/g) || []).length * 3
  score += (formula.match(/\\int/g) || []).length * 3
  score += (formula.match(/\\begin/g) || []).length * 5
  score += (formula.match(/\\\\/g) || []).length * 2
  score += formula.length / 50

  return score
}
```

Then, implement the chunked renderer:

```ts
class ChunkedRenderer {
  private queue: FormulaChunk[] = []
  private isProcessing = false
  private onChunkComplete: (id: string, html: string) => void
  private onComplete: () => void

  constructor(
    onChunkComplete: (id: string, html: string) => void,
    onComplete: () => void,
  ) {
    this.onChunkComplete = onChunkComplete
    this.onComplete = onComplete
  }

  addChunks(chunks: FormulaChunk[]) {
    const sorted = [...chunks].sort((a, b) => a.complexity - b.complexity)
    this.queue.push(...sorted)
    this.processNext()
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) {
      if (this.queue.length === 0 && !this.isProcessing) {
        this.onComplete()
      }
      return
    }

    this.isProcessing = true
    const chunk = this.queue.shift()!

    await this.renderWithScheduling(chunk)

    this.isProcessing = false
    this.processNext()
  }

  private renderWithScheduling(chunk: FormulaChunk): Promise<void> {
    return new Promise((resolve) => {
      requestIdleCallback(
        () => {
          try {
            const html = katex.renderToString(chunk.rawFormula, {
              throwOnError: false,
              displayMode: chunk.displayMode,
            })
            this.onChunkComplete(chunk.id, html)
          } catch (error) {
            console.error(`Formula render failed: ${chunk.rawFormula.slice(0, 30)}...`, error)
            this.onChunkComplete(chunk.id, `<span class="formula-error">Render failed</span>`)
          }
          resolve()
        },
        { timeout: 50 },
      )
    })
  }
}
```

### 3.4 Integration in Vue Component

```vue
<script setup lang="ts">
const props = defineProps<{
  markdown: string
}>()

const renderedHtml = ref('')
const isRendering = ref(true)
const renderProgress = ref(0)

const renderer = new ChunkedRenderer(
  (id, html) => {
    const placeholder = document.querySelector(`[data-formula-id="${id}"]`)
    if (placeholder) {
      placeholder.outerHTML = html
    }
    renderProgress.value++
  },
  () => {
    isRendering.value = false
  },
)

watch(
  () => props.markdown,
  (md) => {
    if (!md) return
    isRendering.value = true
    renderProgress.value = 0

    const { text, formulas } = parseMarkdownFormulas(md)
    renderedHtml.value = text

    formulas.forEach((f) => {
      renderedHtml.value = renderedHtml.value.replace(
        `__FORMULA_${f.id}__`,
        `<span data-formula-id="${f.id}" class="formula-placeholder">Loading...</span>`,
      )
    })

    nextTick(() => {
      renderer.addChunks(formulas)
    })
  },
  { immediate: true },
)
</script>
```

### 3.5 Results

| Metric | Before | After |
|--------|--------|-------|
| Time to first visible content | 60 s | 0.5 s (plain text first) |
| Simple formulas visible | 60 s | 1-2 s |
| Complex formulas visible | 60 s | 1.5 s (ultra-long) |
| Main thread blocked | Entirely | None |
| Perceived wait | 60 s painful wait | Gradual reveal, almost none |

The biggest benefit of chunked rendering isn't "total time reduction" — it's the **dramatic reduction in perceived wait time**.

## Step 4: Advanced Optimization — Visual Lazy Loading

### 4.1 Problem

Chunked rendering lets users see simple formulas quickly. But in extremely long documents (e.g., one AI response with 20+ complex formulas), the total rendering time still adds up. Moreover, off-screen formulas don't need to be rendered immediately — the user may never scroll to them.

### 4.2 Solution: IntersectionObserver + Priority Scheduling

We introduced **Visual Lazy Loading**: only formulas that enter (or are about to enter) the viewport trigger rendering. Off-screen formulas join a waiting queue.

```ts
class VisibilityAwareRenderer {
  private pendingChunks: Map<string, FormulaChunk> = new Map()
  private observer: IntersectionObserver

  constructor(
    private onChunkComplete: (id: string, html: string) => void,
  ) {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-formula-id')
            if (id && this.pendingChunks.has(id)) {
              this.renderChunk(id)
              this.observer.unobserve(entry.target)
            }
          }
        })
      },
      {
        rootMargin: '200px 0px',
        threshold: 0,
      },
    )
  }

  registerChunk(element: HTMLElement, chunk: FormulaChunk) {
    this.pendingChunks.set(chunk.id, chunk)
    this.observer.observe(element)
  }

  private renderChunk(id: string) {
    const chunk = this.pendingChunks.get(id)
    if (!chunk) return

    requestAnimationFrame(() => {
      try {
        const html = katex.renderToString(chunk.rawFormula, {
          throwOnError: false,
          displayMode: chunk.displayMode,
        })
        this.onChunkComplete(id, html)
      } catch (error) {
        console.error(`Formula render failed: ${chunk.rawFormula.slice(0, 30)}...`, error)
      }
      this.pendingChunks.delete(id)
    })
  }

  destroy() {
    this.observer.disconnect()
  }
}
```

### 4.3 Cumulative Effect

Combining visual lazy loading with chunked rendering:

- **Viewport formulas**: Render immediately after page load — complete in 1.5 seconds
- **Off-screen formulas**: Start rendering as the user scrolls near — zero initial load impact
- **Long document scenario**: Total render time drops from 60 s to 1.5 s (viewport) + on-demand loading

## Step 5: Fallbacks and UX Polish

### 5.1 Formula Placeholder Animation

Show a shimmer skeleton effect while formulas render, preventing layout shifts:

```css
.formula-placeholder {
  display: inline-block;
  min-width: 60px;
  height: 1.2em;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  vertical-align: middle;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 5.2 Render Error Fallback

Some ultra-long formulas may cause stack overflow due to too many AST nodes. We added protection:

```ts
function safeRender(formula: string, displayMode: boolean): string {
  try {
    return katex.renderToString(formula, {
      throwOnError: false,
      displayMode,
      maxSize: 100,
      maxExpand: 100,
      macros: {
        '\\f': '#1',
      },
    })
  } catch (error) {
    return `<code class="formula-fallback">${escapeHtml(formula)}</code>`
  }
}
```

### 5.3 Progress Indicator

Display a lightweight progress indicator during rendering:

```vue
<template>
  <div v-if="isRendering" class="render-progress">
    <span class="render-progress__text">
      Rendering formulas ({{ doneCount }}/{{ totalCount }})
    </span>
    <div class="render-progress__bar">
      <div class="render-progress__fill" :style="{ width: `${percentage}%` }" />
    </div>
  </div>
</template>
```

## Optimization Results Summary

| Stage | Solution | Viewport Render | Total Render | Main Thread Blocked |
|-------|----------|-----------------|--------------|-------------------|
| Baseline | Sync render | 60 s blocked | 60 s | Entirely |
| Step 1 | Web Worker | 60 s | 60 s | None |
| Step 2 | Chunked async | 0.5 s (text) / 1.5 s (formulas) | Full render | None |
| Step 3 | Visual lazy load | 1.5 s (viewport only) | On-demand | None |
| Final | Chunked + Lazy + Skeleton | **1.5 s** | **1.5 s (viewport)** | **None** |

## Lessons Learned

### 1. Measure Before Optimizing

Don't say "KaTeX is slow" based on feelings. Instrument measurements to find where time is actually spent. We found 90% of the 60 seconds was in Parsing + Build, not network or DOM operations.

### 2. Web Worker Isn't a Silver Bullet

Workers solve main-thread blocking, but **total time stays the same**. Users want to see content quickly, not "a responsive UI that takes just as long."

### 3. Perceived Time Matters More Than Actual Time

Chunked rendering may have slightly longer total time (due to scheduling overhead), but users see content appearing from 0.5 seconds onward — a vastly better experience than waiting 60 seconds for everything at once.

### 4. Complexity Estimation Quality Matters

The `estimateComplexity` function directly affects rendering order. We tuned weights based on production data: matrices are more expensive than nested fractions, and `\begin` environments are heavier than inline formulas. Wrong estimates can cause "simple formulas queued behind complex ones."

### 5. Visual Lazy Loading is Essential for Long Documents

In AI chat scenarios, one query can trigger multiple responses. Full rendering every time would consume excessive memory and CPU. Visual lazy loading synchronizes these costs with the user's reading progress.

## Conclusion

Back to the opening question: whether an AI education product's core experience — students seeing solutions quickly after scanning a problem — is smooth, directly determines conversion and retention.

KaTeX is an excellent formula rendering library, but in ultra-long formula scenarios, it needs proper engineering practices to shine. The **chunked async rendering + visual lazy loading** combo isn't specific to KaTeX — it applies to any frontend scenario involving heavy rendering tasks: code highlighting, chart rendering, and on-demand complex UI rendering.

In the end, the 60-second rendering headache that haunted the team for weeks became a smooth 1.5-second experience. More importantly, we crafted a reusable "progressive heavy content rendering" solution for future AI chat products.
