---
title: '攻克 KaTeX 超长公式渲染性能瓶颈：60秒到1.5秒的优化之路'
description: 在 AI 学习平板项目中，KaTeX 超长公式渲染耗时高达 60 秒。本文详细拆解如何通过分片异步渲染 + 可视化懒加载技术，将渲染时间压缩至 1.5 秒，并分享了完整的优化思路与工程实践。
date: '2025-08-15'
tags:
  - KaTeX
  - 性能优化
  - Vue3
  - 渲染优化
  - 前端架构
category: 前端
draft: false
---

## 背景：当 AI 回答遇上了 KaTeX

在教育类 AI 学习产品中，一个核心场景是：学生拍照搜题或向 AI 提问后，大模型返回详细解题步骤，其中包含大量复杂的数学公式——二次函数、三角函数、微积分、矩阵等。

我们项目的技术栈是 Vue3 + TypeScript + Vercel AI SDK。AI 流式输出返回的是 Markdown 格式的文本，其中内联数学公式用 `$...$` 包裹，块级公式用 `$$...$$` 包裹。前端拿到这份 Markdown 后，先解析出公式部分，再用 KaTeX 渲染成可读的数学符号。

问题出在这里：**某些超长公式（如包含多层嵌套的积分、矩阵、求和符号）的 KaTeX 渲染耗时高达 60 秒**。

设想一下：学生用平板拍了一道题，等了大半分钟还没看到解题过程——这种体验直接让用户流失。

本文就记录了我们如何把 60 秒一步步优化到 1.5 秒的过程，以及这背后的一系列工程决策。

## 第一步：定位根因——KaTeX 为什么慢

### 1.1 确认瓶颈

首先需要确认：60 秒到底是渲染慢还是其他环节慢？

我们在关键节点打了 `performance.mark`：

```ts
performance.mark('render-start')
katex.render(formula, element, {
  throwOnError: false,
  displayMode: isBlock,
})
performance.mark('render-end')
performance.measure('katex-render', 'render-start', 'render-end')
```

测量结果清晰地指向了 KaTeX 自身的 `render` 调用。

### 1.2 分析慢的原因

KaTeX 的渲染过程大致分为三个阶段：

1. **词法分析（Lexing）**：将 LaTeX 字符串拆分为 Token 序列
2. **语法分析（Parsing）**：将 Token 构建为 AST（抽象语法树）
3. **布局生成（Build）**：将 AST 转换为 HTML DOM

对于普通公式，这三个步骤在毫秒级完成。但对于以下特征的超长公式：

- 多层嵌套的 `\frac`、`\sum`、`\int`
- 大型矩阵（如 10×10 矩阵）
- 带复杂上下标的累积符号
- 含大量参数的对齐环境（`align`、`cases`）

KaTeX 的解析器会进入深度递归，AST 节点数量呈指数级增长，导致 Parsing 和 Build 阶段耗时急剧上升。

举个具体的例子，一个包含 3 层嵌套求和 + 多层分数 + 矩阵的公式，KaTeX 生成的 AST 节点数可达数万个。

## 第二步：初步尝试——Web Worker 的主线程卸载

### 2.1 思路

既然 KaTeX 的渲染是 CPU 密集型任务，自然想到用 Web Worker 放到后台线程执行，避免阻塞主线程。

### 2.2 实现

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

主线程中调用：

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

### 2.3 效果

- **主线程不卡顿了** ✅ 公式渲染不再阻塞 UI
- **总渲染时间没有减少** ❌ 从 60 秒变成了用户等待 60 秒拿到完整结果

这说明 Web Worker 只解决了「不卡主线程」的问题，没有解决「用户仍然需要等很久」的问题。

我们需要的是**让用户尽快看到内容，而不是让用户空等**。

## 第三步：核心方案——分片异步渲染

### 3.1 思路转变

核心洞察：AI 返回的 Markdown 是一个 **包含多个公式的文档**，而不是单个公式。如果我们能先渲染简单公式，让用户看到大部分内容，再逐步处理复杂公式，用户的感知等待时间就会大幅缩短。

这就是**分片异步渲染（Chunked Async Rendering）** 的基本思想。

### 3.2 分片粒度设计

我们把一次渲染任务拆分为三个层次：

1. **文档级分片**：Markdown 文档按段落拆分为独立块
2. **公式级分片**：每个段落内，将公式按复杂度排序，简单公式优先渲染
3. **单公式超时分片**：单个超长公式本身也拆分为多个渲染阶段

### 3.3 实现

首先，我们需要将 Markdown 中的 KaTeX 公式提取出来，并为每个公式标记复杂度：

```ts
interface FormulaChunk {
  id: string
  rawFormula: string
  displayMode: boolean
  complexity: number // 预估复杂度分值
  position: number // 在文档中的位置
}

function estimateComplexity(formula: string): number {
  let score = 0
  // 嵌套结构加分
  score += (formula.match(/\\frac/g) || []).length * 2
  score += (formula.match(/\\sum/g) || []).length * 3
  score += (formula.match(/\\int/g) || []).length * 3
  score += (formula.match(/\\begin/g) || []).length * 5
  score += (formula.match(/\\\\/g) || []).length * 2 // 矩阵换行
  // 总长度兜底
  score += formula.length / 50

  return score
}
```

然后，实现分片渲染调度器：

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
    // 按复杂度排序——简单公式优先
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

    // 使用 requestIdleCallback 或 requestAnimationFrame 分片
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
            console.error(`渲染公式失败: ${chunk.rawFormula.slice(0, 30)}...`, error)
            this.onChunkComplete(chunk.id, `<span class="formula-error">公式渲染失败</span>`)
          }
          resolve()
        },
        { timeout: 50 },
      )
    })
  }
}
```

### 3.4 在 Vue 组件中的集成

```vue
<script setup lang="ts">
const props = defineProps<{
  markdown: string
}>()

const renderedHtml = ref('') // 已渲染完成的 HTML
const isRendering = ref(true)
const renderProgress = ref(0)

const renderer = new ChunkedRenderer(
  // onChunkComplete：公式渲染完成，更新显示
  (id, html) => {
    const placeholder = document.querySelector(`[data-formula-id="${id}"]`)
    if (placeholder) {
      placeholder.outerHTML = html
    }
    renderProgress.value++
  },
  // onComplete：全部完成
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

    // 解析 Markdown，提取公式
    const { text, formulas } = parseMarkdownFormulas(md)

    // 先渲染非公式文本部分（纯文本 + HTML）
    renderedHtml.value = text

    // 添加公式占位符
    formulas.forEach((f) => {
      renderedHtml.value = renderedHtml.value.replace(
        `__FORMULA_${f.id}__`,
        `<span data-formula-id="${f.id}" class="formula-placeholder">加载中...</span>`,
      )
    })

    // 下一帧开始分片渲染公式
    nextTick(() => {
      renderer.addChunks(formulas)
    })
  },
  { immediate: true },
)
</script>
```

### 3.5 效果

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 用户首次看到内容 | 60 秒 | 0.5 秒（纯文本先渲染） |
| 简单公式可见 | 60 秒 | 1-2 秒 |
| 复杂公式可见 | 60 秒 | 1.5 秒（超长公式） |
| 主线程阻塞 | 全程阻塞 | 无阻塞 |
| 用户感知等待 | 60 秒漫长等待 | 逐步呈现，几乎无等待 |

分片渲染最大的收益不是「总时间变短」，而是**用户感知时间大幅缩短**。

## 第四步：进阶优化——可视化懒加载

### 4.1 问题

分片渲染让用户能快速看到简单公式，但在极长文档中（如一次对话包含 20+ 个复杂公式），即使分片，整体渲染仍然需要较长时间。而且屏幕外的公式不需要立即渲染——用户可能根本不会滚动到那里。

### 4.2 方案：IntersectionObserver + 优先级调度

我们引入**可视化懒加载（Visual Lazy Loading）**：只有进入视口（或即将进入视口）的公式才触发渲染，屏幕外的公式进入等待队列。

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
        rootMargin: '200px 0px', // 提前 200px 触发渲染
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

    // 使用 requestAnimationFrame 分片
    requestAnimationFrame(() => {
      try {
        const html = katex.renderToString(chunk.rawFormula, {
          throwOnError: false,
          displayMode: chunk.displayMode,
        })
        this.onChunkComplete(id, html)
      } catch (error) {
        console.error(`渲染公式失败: ${chunk.rawFormula.slice(0, 30)}...`, error)
      }
      this.pendingChunks.delete(id)
    })
  }

  destroy() {
    this.observer.disconnect()
  }
}
```

### 4.3 效果叠加

将可视化懒加载叠加到分片渲染之上后：

- **首屏公式**：页面加载后立即渲染，1.5 秒内完成
- **屏外公式**：用户滚动到附近时才开始渲染，零首屏负担
- **长文档场景**：渲染总耗时从 60 秒降至 1.5 秒（首屏）+ 按需加载

## 第五步：兜底与体验优化

### 5.1 公式占位动画

在公式渲染完成前，显示一个带有骨架屏效果的占位符，避免页面布局抖动：

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

### 5.2 渲染错误兜底

部分超长公式可能因为 AST 节点过多导致栈溢出。我们增加了保护机制：

```ts
function safeRender(formula: string, displayMode: boolean): string {
  try {
    return katex.renderToString(formula, {
      throwOnError: false,
      displayMode,
      maxSize: 100, // 限制最大字号
      maxExpand: 100, // 限制最大展开深度
      macros: {
        '\\f': '#1', // 用户自定义宏支持
      },
    })
  } catch (error) {
    // 兜底：降级为纯文本显示
    return `<code class="formula-fallback">${escapeHtml(formula)}</code>`
  }
}
```

### 5.3 渲染进度提示

在分片渲染过程中，显示一个轻量级的进度指示：

```vue
<template>
  <div v-if="isRendering" class="render-progress">
    <span class="render-progress__text">
      公式渲染中 ({{ doneCount }}/{{ totalCount }})
    </span>
    <div class="render-progress__bar">
      <div class="render-progress__fill" :style="{ width: `${percentage}%` }" />
    </div>
  </div>
</template>
```

## 优化结果汇总

| 优化阶段 | 方案 | 首屏渲染时间 | 总渲染时间 | 主线程阻塞 |
|---------|------|-------------|-----------|-----------|
| 原始状态 | 同步渲染 | 60 秒阻塞 | 60 秒 | 全程阻塞 |
| 第一步 | Web Worker | 60 秒 | 60 秒 | 无阻塞 |
| 第二步 | 分片异步渲染 | 0.5 秒（纯文本）/ 1.5 秒（首屏公式） | 全量渲染 | 无阻塞 |
| 第三步 | 可视化懒加载 | 1.5 秒（仅首屏公式） | 按需渲染 | 无阻塞 |
| 最终 | 分片 + 可视懒加载 + 占位动画 | **1.5 秒** | **1.5 秒（首屏）** | **无阻塞** |

## 经验总结

### 1. 优化前必须先量化

不要凭感觉说「KaTeX 慢」，要打点测量出具体的耗时分布。我们发现 60 秒中 90% 花在 Parsing + Build，而不是网络或 DOM 操作。

### 2. Web Worker 不是万能药

Worker 解决了主线程阻塞，但**总耗时不变**。用户要的是尽快看到内容，不是「UI 不卡但要等更久」。

### 3. 用户感知时间比实际时间更重要

分片渲染的总耗时可能比同步渲染还长（因为有调度开销），但用户从 0.5 秒开始就看到内容不断呈现，感知体验远超等待 60 秒后一次性展示。

### 4. 复杂度预估的精准度决定体验

`estimateComplexity` 函数的质量直接影响渲染排序。我们根据生产数据调整了权重：矩阵比嵌套分数更耗时，`\begin` 环境比单行公式更重。如果预估不准，可能出现「简单公式排后面、复杂公式先渲染」的情况。

### 5. 可视化懒加载是长文档场景的必选项

在 AI 对话场景中，用户一次提问可能触发多条回复。如果每次都全量渲染，内存占用和 CPU 消耗都是问题。可视化懒加载让这些开销与用户的阅读进度同步。

## 结语

回到开头的问题：一个 AI 教育产品的核心体验——学生拍题后快速看到解答——是否流畅，直接决定了产品的转化率和留存率。

KaTeX 本身是一个优秀的公式渲染库，但在超长公式场景下，它需要正确的工程化使用姿势。**分片异步渲染 + 可视化懒加载**这套组合方案，不仅适用于 KaTeX，也适用于任意前端场景下的重型渲染任务——从代码高亮、图表渲染到复杂 UI 组件的按需加载。

最终，那个让团队头疼了数周的 60 秒渲染问题，变成了一个 1.5 秒的流畅体验。而更重要的是，我们为后续的 AI 对话产品打磨出了一套通用的「重型内容渐进渲染」方案。
