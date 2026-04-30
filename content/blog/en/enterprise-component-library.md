---
title: 'Building an Enterprise-Grade Component Library from Scratch: Lessons from Two Years of Practice'
description: A complete guide to building a company-wide Vue3 component library from requirements analysis to deployment, covering layered architecture design, JSON-driven development, build and publish, multi-threaded performance optimization, and real-world results.
date: '2023-04-28'
tags:
  - Component Library
  - Vue3
  - Enterprise
  - Frontend Engineering
  - JSON Config
  - Architecture
category: Architecture
draft: false
---

## Introduction: A Decision That Changed How Our Team Works

> "Why don't these modals look the same?" "Who changed the table styles again?" "Can we just reuse that date picker from Project X?"

In the summer of 2022, after two years with the company, our internal business systems had grown from 2 to 6: CRM, business analytics, supply chain management, HR... Each built by different developers at different times. **5 projects, 5 different input styles, 5 different pagination components.**

Every time someone needed to build a new feature, they'd copy-paste code from one project to another and manually adapt the styles. UI consistency was a chronic pain — users switching between systems felt like they were using products from entirely different companies.

It was under these circumstances that I initiated the **enterprise component library project**. From its kickoff in July 2022 through continuous iteration until December 2024, this component library grew alongside the company's business, ultimately improving the team's **new feature development efficiency by 30%**.

## Step 1: Requirements Analysis and Tech Selection

### 1.1 Pain Point Inventory

Before writing any code, I spent two weeks conducting a thorough requirements survey:

| Pain Point | Frequency | Impact | Priority |
| --- | --- | --- | --- |
| Inconsistent UI styles | Ongoing | Company-wide | P0 |
| Non-reusable components | Every feature | Entire team | P0 |
| Reinventing the wheel | Weekly | Entire team | P0 |
| Low configurability | Every iteration | Entire team | P1 |
| Missing documentation | Ongoing | New hires | P1 |

### 1.2 Technology Selection

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| **Wrap Element Plus** | Solid foundation, less base UI work | Some styling effort needed | **✅ Final choice** |
| Build from scratch | Complete control | Too time-consuming, poor ROI | ❌ |
| Use Element Plus directly | Lowest cost | Can't abstract complex business scenarios | ❌ |

The core reasoning: **Our pain wasn't missing "buttons" or "inputs" — it was the lack of business scenario abstraction**. A "table with search, pagination, and batch operations" was being re-implemented countless times across the company. This type of "business component" abstraction was where the component library would deliver real value.

Final tech stack:

- **UI Framework**: Element Plus
- **Language**: TypeScript (fully typed)
- **Build Tools**: Vite (dev), Rollup (library build)
- **CSS**: SCSS + CSS Variables (theming)
- **Docs**: Vitepress

## Step 2: Component Library Architecture

### 2.1 Three-Layer Architecture

```
Component Library Structure
├── Base Components Layer
│   ├── Form: Input, Select, DatePicker, Upload
│   ├── Display: Table, Tree, Card, Tag, Badge
│   ├── Feedback: Dialog, Drawer, Message, Notification
│   └── Navigation: Menu, Tabs, Breadcrumb, Pagination
│
├── Business Components Layer
│   ├── SearchForm                    —— JSON configurable
│   ├── ProTable                      —— JSON configurable
│   ├── DetailDescriptions
│   ├── ProcessCard
│   ├── FilterPanel
│   └── UploadPreview
│
└── Utility Module Layer
    ├── HttpClient                    —— Request/response interceptors
    ├── v-permission directive        —— Button-level permissions
    ├── Validators                    —— Business validation rules
    ├── Formatters                    —— Money, date, phone masking
    └── ThemeManager                  —— Dynamic theme switching
```

**Design Principles**:

1. **Base components handle "how to render", business components handle "what to render"**
2. **Business components must be JSON-configurable** — this is the key to efficiency
3. **Utility modules are decoupled from components** — exported independently

### 2.2 Component Design Standards

Every component follows a consistent development standard:

```typescript
// Component design specification example
// 1. All components must export TypeScript types
export interface ProTableProps {
  columns: ProTableColumn[]
  dataSource: Record<string, unknown>[]
  pagination?: PaginationConfig
  loading?: boolean
  rowKey?: string
  selection?: 'single' | 'multiple' | false
  toolbar?: ToolbarConfig
}

// 2. Component naming uses unified prefix
// B = Business: BSearchForm, BProTable
// F = Base: FForm, FTable (Element Plus wrappers)

// 3. Support v-model and event two-way binding
// 4. Dark mode support via CSS Variables
// 5. Complete unit test coverage
```

## Step 3: JSON-Driven Development — The Key to Efficiency

### 3.1 Why JSON-Driven?

Traditional component usage involves repetitive template code:

```vue
<!-- Traditional approach: lots of repetitive template code -->
<template>
  <div>
    <el-input v-model="searchForm.name" placeholder="Search name" />
    <el-select v-model="searchForm.status" placeholder="Select status">
      <el-option label="Active" value="active" />
      <el-option label="Inactive" value="inactive" />
    </el-select>
    <el-button @click="handleSearch">Search</el-button>
  </div>
</template>
```

JSON-driven development means: **describing the UI with configuration data, letting the framework handle the rendering**:

```vue
<!-- JSON-driven approach -->
<template>
  <BSearchForm :fields="searchFields" @search="handleSearch" />
</template>

<script setup lang="ts">
const searchFields: SearchField[] = [
  { key: 'name', label: 'Name', type: 'input', placeholder: 'Search name' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  { key: 'dateRange', label: 'Date Range', type: 'dateRange' },
]
</script>
```

### 3.2 Core Implementation: ProTable Component

ProTable is the most-used component in the library and the pinnacle of JSON-driven development:

```typescript
interface ProTableProps {
  columns: ColumnConfig[]
  dataSource: Record<string, unknown>[]
  pagination?: { current: number; pageSize: number; total: number }
  toolbar?: {
    title?: string
    actions?: ToolbarAction[]
    search?: boolean
    export?: boolean
  }
  rowActions?: RowAction[]
  loading?: boolean
  selection?: 'single' | 'multiple'
  expandable?: ExpandableConfig
}

interface ColumnConfig {
  key: string
  title: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  sortable?: boolean
  filterable?: boolean
  render?: (value: unknown, record: Record<string, unknown>, index: number) => VNode
  // Value mapping (e.g., enum → display text)
  valueEnum?: Record<string, { text: string; status?: string }>
  formatter?: 'date' | 'datetime' | 'money' | 'phone' | 'custom'
  slotName?: string
}
```

The real-world result: **A table page with search, pagination, and operations that previously required 200+ lines of template code now needs only ~50 lines of configuration plus business logic.**

## Step 4: Build and Publish

### 4.1 Build Configuration

Building a component library requires more considerations than building an app:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'CompanyUI',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `company-ui.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'element-plus', '@element-plus/icons-vue'],
    },
    cssCodeSplit: false,
  },
  plugins: [
    vue(),
    dts({ rollupTypes: true }),
  ],
})
```

### 4.2 Version Management and Release

Since the library was for internal use only, we published to the company's GitLab npm registry:

```bash
# .npmrc
registry=http://gitlab.company.com/api/v4/projects/123/packages/npm/
always-auth=true
```

**Version naming** followed semantic versioning:

```bash
# v2.5.0
# Major: Architecture changes or breaking updates
# Minor: New features/new components
# Patch: Bug fixes, style adjustments
```

## Step 5: Performance Optimization — The Multi-Threading Approach

### 5.1 Performance Challenges

As the component library gained widespread adoption, we identified performance issues:

1. **Large table rendering lag**: Tables with 5000+ rows caused scrolling and interaction stuttering
2. **Notification polling**: Background notifications used `setInterval` polling, blocking the main thread
3. **Permission data parsing**: 200+ permission nodes took over 2 seconds to parse on low-end devices

### 5.2 Web Worker Solution

We introduced **Web Workers** to solve these problems — a key differentiator from a mere "UI component collection":

```typescript
// utils/worker.ts - Generic Worker utility
export function useWorkerTask<T, R>(workerScript: string) {
  const result = ref<R | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  function run(data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      loading.value = true
      error.value = null

      const worker = new Worker(workerScript)

      worker.onmessage = (e: MessageEvent<R>) => {
        result.value = e.data
        loading.value = false
        worker.terminate()
        resolve(e.data)
      }

      worker.onerror = (e) => {
        loading.value = false
        worker.terminate()
        error.value = new Error(e.message)
        reject(error.value)
      }

      worker.postMessage(data)
    })
  }

  return { result, loading, error, run }
}
```

### 5.3 Notification Polling Optimization

The background notification system was one of our most successful Web Worker applications:

```typescript
// notification.worker.ts - Worker script (separate file)
self.onmessage = async function (e) {
  const { interval = 30000, apiUrl, token } = e.data

  const poll = async () => {
    try {
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      self.postMessage({ type: 'notification', payload: data })
    } catch (err) {
      self.postMessage({ type: 'error', payload: err })
    }
  }

  await poll()
  setInterval(poll, interval)
}
```

**Optimization Results**:

| Metric | Before (Main Thread) | After (Worker) | Improvement |
| --- | --- | --- | --- |
| Page FPS | 45-55fps | 58-60fps | Smoothness significantly improved |
| Main thread blocking | ~80ms every 30s | 0ms | Main thread fully freed |
| CPU Usage | 12-18% | 3-5% | ~70% reduction |

## Results and Summary

### The Numbers

After two years of continuous development and adoption:

| Metric | Before Library | After Library | Improvement |
| --- | --- | --- | --- |
| **New feature efficiency** | Baseline | Config-driven dev | **+30%** |
| **UI consistency** | 5 projects, 5 styles | Unified standards | **Fully unified** |
| **Code reuse** | Manual copy-paste | One-line import | **Quantum leap** |
| **New hire ramp-up** | 2-4 weeks | 1 week | **-60%** |
| **Notification performance** | Occasional lag | Always smooth | **Transformed** |

### Lessons Learned

1. **Don't abstract too early**: The biggest mistake was over-abstraction. Creating a generic component after seeing only 1-2 use cases often led to unused code. **The best time to abstract is after the "3rd repetition"**.

2. **Docs must sync with code**: The biggest maintenance challenge is "docs falling behind code". Establish a "not done without updating docs" policy.

3. **Business components are more valuable than base components**: For an enterprise, a generic "search form" component is far more valuable than re-wrapping a "date picker". **Invest resources in high-value business component abstractions first**.

4. **Internal adoption is harder than development**: Building a component takes 1 day, but getting the whole team to use it can take 1 month. Continuous communication, training, and feedback collection are essential workloads you can't ignore.

### Final Thoughts

Building an enterprise component library isn't a one-time effort. It's a **continuous process of iteration and accumulation**. From the first base component to a complete design system, from early adoption by a few to organization-wide usage — getting there requires not just technical skills, but also persistence and patience.

But if you ask me "was it worth it?" — my answer is: **Absolutely.** For any company with multiple product lines, a component library is one of the most worthwhile frontend infrastructure investments you can make. It's the "debt repayment account" for technical debt — every time you package a reusable component, you're paying off technical debt; every time a new hire ramps up faster, you're seeing return on that investment.
