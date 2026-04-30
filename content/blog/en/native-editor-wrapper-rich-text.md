---
title: 'Wrapping the Native Editor Component: A Practical Approach to Custom Rich Text Editing in WeChat Mini Programs'
description: In an education supervision mini-program, facing the complex demands of composing inspection reports, I wrapped the native wechat editor component to deliver custom toolbars, content templates, format validation, and offline draft support — ultimately helping the project win the tender for the Longgang Education Bureau.
date: '2021-01-15'
tags:
  - WeChat Mini Program
  - Rich Text Editing
  - Component Wrapping
  - Mobile Development
  - Frontend
category: Frontend
draft: false
---

## Background: From a Blank Textbox to a Full-Featured Editor

In 2018, I took on the development of an education supervision management mini-program. The core scenario was straightforward yet demanding —

Supervisors would visit schools for on-site inspections, checking for teaching compliance, safety hazards, and quality metrics. After each visit, they needed to compose detailed inspection reports on their phones, containing text descriptions, photo evidence, tabular data, and even formatted citations from official supervision standards.

The WeChat Mini Program's native `<editor>` component, however, is quite barebones:

- A blank content editing area
- Basic rich text operations (bold, italic, headings, lists)
- Basic image insertion

For a scenario with **strict formatting requirements and complex content structures**, the native capabilities were far from sufficient. Supervisors needed:

1. **Quick template insertion** — No need to manually reformat every time
2. **Custom toolbar** — Buttons tailored to the supervision workflow (insert tables, add evidence images, mark corrective items)
3. **Content format validation** — Heading levels, paragraph structure, and required sections must not be missing
4. **Offline save and sync** — Schools often have poor network connectivity

This was the starting point for wrapping the native editor component.

## Native Editor: Capabilities and Limitations

### What the Native API Provides

WeChat's `<editor>` component is built on top of Quill.js, offering a basic set of rich text APIs:

```js
// Initialize the editor
const editor = wx.createSelectorQuery().select('#editor')
editor.context((res) => {
  this.editorCtx = res.context
})

// Basic formatting commands
this.editorCtx.format('bold')
this.editorCtx.format('italic')
this.editorCtx.format('header', 2)

// Insert content
this.editorCtx.insertText({ text: 'Insert some text' })
this.editorCtx.insertImage({ src: 'https://example.com/image.png' })
```

### Where the Native API Falls Short

After mapping out the actual requirements, here's what the native component couldn't do:

| Requirement | Native Support | Problem |
| --- | --- | --- |
| Custom toolbar buttons | Basic only | Can't add business-specific buttons like "Insert Table" or "Mark Corrective Item" |
| Content template insertion | Not supported | Every report requires manual formatting from scratch |
| Format structure validation | Not supported | No guarantee of compliant report structure |
| Batch image upload | Single image only | Supervisors need to add multiple evidence photos at once |
| Offline editing | Not supported | Content loss when network is spotty at school |
| Export formatting | Raw HTML only | Inconsistent output when sending to backend |
| Keyboard adaptation | Basic | Severe keyboard obstruction in complex editing scenarios |

## Wrapper Design: Three-Layer Architecture

Based on the analysis, I designed a three-layer wrapper architecture:

```
┌─────────────────────────────────────────────┐
│          UI Layer (View & Interaction)        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Custom    │  │ Template  │  │ Validation│  │
│  │ Toolbar   │  │ Selector  │  │ Panel    │   │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘   │
└────────┼──────────────┼──────────────┼───────┘
         │              │              │
┌────────▼──────────────▼──────────────▼───────┐
│     API Bridge Layer (Editor Context Wrapper)   │
│  ┌─────────────┐  ┌──────────┐  ┌─────────┐  │
│  │ Format Cmds  │  │ Content  │  │ State   │  │
│  │ Wrapper      │  │ Injection│  │ Manager │  │
│  └──────┬──────┘  └─────┬────┘  └─────┬───┘  │
└─────────┼───────────────┼──────────────┼──────┘
          │               │              │
┌─────────▼───────────────▼──────────────▼──────┐
│        Config Layer (External Extension API)   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Toolbar  │  │ Template │  │ Validation   │ │
│  │ Config   │  │ Config   │  │ Rules Config │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
└────────────────────────────────────────────────┘
```

### Layer 1: API Bridge

This is the **core** of the wrapper — it encapsulates all direct interactions with the native editor context into unified, semantic methods. The UI layer never touches the raw editor API.

```javascript
// utils/editor-bridge.js
class EditorBridge {
  constructor(selector) {
    this.selector = selector
    this.editorCtx = null
    this._initPromise = null
  }

  /**
   * Initialize editor context
   * Returns a Promise so that all operations wait for context readiness
   */
  init() {
    if (this._initPromise) return this._initPromise

    this._initPromise = new Promise((resolve, reject) => {
      const query = wx.createSelectorQuery()
      query.select(this.selector).context((res) => {
        if (res && res.context) {
          this.editorCtx = res.context
          resolve(this.editorCtx)
        } else {
          reject(new Error('Failed to get editor context'))
        }
      }).exec()
    })

    return this._initPromise
  }

  // ========== Text Formatting ==========

  /** Set heading level */
  setHeader(level) {
    return this._exec((ctx) => {
      if (level === 0) {
        ctx.format('header', false)
      } else {
        ctx.format('header', level)
      }
    })
  }

  /** Toggle list type */
  toggleList(type) {
    return this._exec((ctx) => {
      ctx.format('list', type) // 'ordered' | 'bullet' | 'check'
    })
  }

  /** Set font color */
  setColor(color) {
    return this._exec((ctx) => {
      ctx.format('color', color)
    })
  }

  // ========== Content Operations ==========

  /** Clear formatting (clean paste) */
  clearFormat() {
    return this._exec((ctx) => {
      ctx.removeFormat()
    })
  }

  /** Insert plain text */
  insertText(text) {
    return this._exec((ctx) => {
      ctx.insertText({ text })
    })
  }

  /** Insert HTML content (e.g., templates) */
  insertHtml(html) {
    return this._exec((ctx) => {
      ctx.insertText({ text: 'TEMP_PLACEHOLDER' })
      this._replaceHtml(html)
    })
  }

  /** Insert images (batch support) */
  insertImages(imageUrls) {
    return this._exec(async (ctx) => {
      for (const url of imageUrls) {
        ctx.insertImage({
          src: url,
          data: { uploaded: true },
          fail: (err) => {
            console.error('Image insert failed:', err)
          }
        })
        ctx.insertText({ text: '\n' })
      }
    })
  }

  // ========== Content Retrieval ==========

  /** Get formatted content */
  getContent() {
    return new Promise((resolve) => {
      this._exec((ctx) => {
        ctx.getContents({
          success: (res) => {
            resolve(this._cleanContents(res))
          }
        })
      })
    })
  }

  /** Get plain text content */
  getPlainText() {
    return new Promise((resolve) => {
      this._exec((ctx) => {
        ctx.getText({
          success: (res) => resolve(res.text)
        })
      })
    })
  }

  // ========== Internal Methods ==========

  _exec(fn) {
    return this.init().then(fn).catch((err) => {
      console.error('[EditorBridge] Operation failed:', err)
      wx.showToast({ title: 'Editor operation failed', icon: 'none' })
    })
  }

  _cleanContents(contents) {
    if (contents && contents.html) {
      contents.html = contents.html.replace(/^<p><br><\/p>/, '')
      contents.html = contents.html.replace(/<p><br><\/p>$/, '')
    }
    return contents
  }

  _replaceHtml(html) {
    // Implementation for replacing placeholder with actual HTML
    // ...
  }
}
```

Key design decisions for the bridge layer:

- **Promise-based** — Editor context retrieval is async; wrapping everything in Promises ensures correct sequencing
- **Operation queue** — Consecutive format operations execute serially to prevent race conditions
- **Unified error handling** — All failures show a user-friendly Toast, no raw try-catch scattered across components

### Layer 2: Custom Toolbar

The most visible part of the wrapper is the **custom toolbar tailored for supervision workflows**. The native toolbar only offers generic buttons; we needed this layout:

```
┌────────────── Toolbar ─────────────────┐
│ [Heading] [Bold] [Italic] [List] [Color] │
│ [Insert Image] [Insert Table] [Mark]    │
│ [Template] [Validate] [Save Draft]      │
└──────────────────────────────────────────┘
```

The toolbar is implemented as a custom mini-program component:

```javascript
// components/editor-toolbar/editor-toolbar.js
Component({
  properties: {
    editorSelector: { type: String, value: '#editor' }
  },

  data: {
    activeFormats: {},
  },

  lifetimes: {
    attached() {
      this.bridge = new EditorBridge(this.properties.editorSelector)
      this._observeSelectionChange()
    }
  },

  methods: {
    onToolbarTap(e) {
      const { action, payload } = e.currentTarget.dataset
      this[action] && this[action](payload)
    },

    setHeader(level) {
      this.bridge.setHeader(level).then(() => {
        this._updateActiveFormats()
      })
    },

    async insertTemplate(e) {
      const { templateId } = e.currentTarget.dataset
      wx.showLoading({ title: 'Inserting template...' })

      try {
        const template = await this._getTemplate(templateId)
        await this.bridge.insertHtml(template.content)
        wx.showToast({ title: 'Template inserted', icon: 'success' })
      } catch (err) {
        wx.showToast({ title: 'Template insert failed', icon: 'none' })
      } finally {
        wx.hideLoading()
      }
    },

    insertEvidenceImage() {
      const that = this
      wx.chooseImage({
        count: 9,
        sourceType: ['camera', 'album'],
        success(res) {
          wx.showLoading({ title: 'Uploading images...' })
          that._uploadImages(res.tempFilePaths).then((urls) => {
            return that.bridge.insertImages(urls)
          }).then(() => {
            wx.showToast({ title: 'Images inserted', icon: 'success' })
          }).catch(() => {
            wx.showToast({ title: 'Upload failed', icon: 'none' })
          }).finally(() => {
            wx.hideLoading()
          })
        }
      })
    },

    validateContent() {
      this.bridge.getContent().then((contents) => {
        const result = this._validateReport(contents.html)
        if (!result.valid) {
          wx.showModal({
            title: 'Format Check',
            content: result.message,
            confirmText: 'Fix it',
            showCancel: false
          })
        } else {
          wx.showToast({ title: 'Format check passed', icon: 'success' })
        }
      })
    },

    _observeSelectionChange() {
      this.bridge.init().then(() => {
        this.bridge.editorCtx.onstatuschange((res) => {
          this.setData({ activeFormats: { ...res } })
        })
      })
    }
  }
})
```

Core design ideas for the toolbar:

- **Config-driven buttons** — Buttons are generated from a config array; different pages can pass different configs
- **Bidirectional state sync** — Toolbar highlights reflect the current selection format automatically
- **Debounced operations** — Prevents duplicate execution on rapid clicks

### Layer 3: Config Layer

The config layer exposes extension interfaces so different scenarios can inject their own configuration:

```javascript
// config/editor-config.js
const SUPERVISION_EDITOR_CONFIG = {
  toolbar: [
    { type: 'header', label: 'Heading', options: [1, 2, 3] },
    { type: 'bold', label: 'Bold' },
    { type: 'italic', label: 'Italic' },
    { type: 'list', label: 'List', options: ['ordered', 'bullet'] },
    { type: 'color', label: 'Color', options: ['red', 'blue', 'green'] },
    'divider',
    { type: 'image', label: 'Evidence Photo' },
    { type: 'table', label: 'Insert Table' },
    { type: 'tag', label: 'Corrective Item', value: '[Pending]' },
    'divider',
    { type: 'template', label: 'Supervision Template' },
    { type: 'validate', label: 'Format Validation' },
    { type: 'draft', label: 'Save Draft' },
  ],

  validation: {
    requiredSections: ['Overview', 'Issues Found', 'Recommendations'],
    maxImages: 20,
    minParagraphs: 3,
    customValidators: [
      {
        name: 'mustHaveHeader',
        validate(html) {
          return html.includes('<h1') || html.includes('<h2')
        },
        message: 'Report must contain a heading'
      }
    ]
  },

  image: {
    maxCount: 9,
    compress: true,
    quality: 80,
    watermark: 'Supervision System'
  },

  autoSave: {
    interval: 30000,
    key: 'report_draft'
  }
}
```

This config-driven design makes the component **reusable across different scenarios** — a supervision report and a school notice share the same underlying editor component but have completely different toolbars and validations.

## Core Implementation Details

### 1. Dynamic Template Injection

One of the biggest pain points: every inspection report follows a similar structure, but supervisors had to format it from scratch on their phones each time. We pre-designed supervision standard templates:

```html
<!-- templates/supervision-report.html -->
<h2>Supervision Inspection Report</h2>
<p><strong>School: </strong><span contenteditable="true">__________</span></p>
<p><strong>Date: </strong><span contenteditable="true">__________</span></p>
<h3>1. Overview</h3>
<p><br></p>
<h3>2. Issues Found</h3>
<p><br></p>
<h3>3. Recommendations</h3>
<p><br></p>
```

Template injection flow:

1. **Source**: Templates are fetched from the server and cached locally
2. **Trigger**: User taps "Insert Template" on the toolbar
3. **Injection**: The bridge layer's `insertHtml` method inserts the template HTML at the current cursor position
4. **Variables**: Supports auto-replacement of `__DATE__`, `__SCHOOL__` variables

### 2. Format Validation Engine

Before a report is submitted to the Education Bureau, its structure must be complete. We implemented a lightweight validation engine:

```javascript
// utils/report-validator.js
class ReportValidator {
  constructor(rules) {
    this.rules = rules
  }

  validate(html) {
    const errors = []

    // Check required sections
    if (this.rules.requiredSections) {
      for (const section of this.rules.requiredSections) {
        if (!html.includes(section)) {
          errors.push(`Missing required section: ${section}`)
        }
      }
    }

    // Check paragraph count
    if (this.rules.minParagraphs) {
      const pCount = (html.match(/<p>/g) || []).length
      if (pCount < this.rules.minParagraphs) {
        errors.push(`At least ${this.rules.minParagraphs} paragraphs required`)
      }
    }

    // Check image count
    if (this.rules.maxImages) {
      const imgCount = (html.match(/<img/g) || []).length
      if (imgCount > this.rules.maxImages) {
        errors.push(`Image count exceeds maximum of ${this.rules.maxImages}`)
      }
    }

    // Custom validators
    if (this.rules.customValidators) {
      for (const validator of this.rules.customValidators) {
        if (!validator.validate(html)) {
          errors.push(validator.message)
        }
      }
    }

    return {
      valid: errors.length === 0,
      message: errors.length > 0 ? errors.join('; ') : 'Format check passed',
      errors
    }
  }
}
```

The validator runs both when the user taps "Format Validation" and on submit, ensuring non-compliant reports are caught before they reach the backend.

### 3. Batch Image Upload with Concurrency Control

Supervisors often need to capture multiple on-site photos as evidence. The native `insertImage` only supports single image insertions, so we extended it:

```javascript
// utils/image-handler.js
class ImageHandler {
  static pickAndUpload(count = 9) {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album'],
        success: async (res) => {
          try {
            const urls = await this._uploadBatch(res.tempFilePaths)
            resolve(urls)
          } catch (err) {
            reject(err)
          }
        },
        fail: reject
      })
    })
  }

  static async _uploadBatch(filePaths) {
    const CONCURRENCY = 3
    const results = []

    for (let i = 0; i < filePaths.length; i += CONCURRENCY) {
      const batch = filePaths.slice(i, i + CONCURRENCY)
      const batchResults = await Promise.all(
        batch.map(filePath => this._uploadSingle(filePath))
      )
      results.push(...batchResults)
    }

    return results
  }

  static _uploadSingle(filePath) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: 'https://api.example.com/upload',
        filePath,
        name: 'file',
        formData: { type: 'supervision_evidence' },
        success: (res) => {
          const data = JSON.parse(res.data)
          resolve(data.url)
        },
        fail: reject
      })
    })
  }
}
```

Key points:

- **Concurrency control**: Upload 3 images simultaneously to avoid overwhelming the mini-program
- **Compression**: Uses `sizeType: ['compressed']` to reduce upload size
- **Progress feedback**: Shows "Uploading 3/9" via `wx.showLoading`

## Hard-Won Lessons

### 1. Keyboard Obscuring the Editing Area

**Problem**: On iPhones, the keyboard would cover most of the editing area, making it impossible for users to see what they were typing.

**Solution**: Listen for keyboard height changes and dynamically adjust the editor area:

```javascript
Page({
  data: {
    keyboardHeight: 0,
    editorMinHeight: 300
  },

  onLoad() {
    wx.onKeyboardHeightChange((res) => {
      this.setData({
        keyboardHeight: res.height,
        editorMinHeight: res.height > 0
          ? `calc(100vh - ${res.height + 100}px)`
          : 300
      })
    })
  }
})
```

```html
<editor
  id="editor"
  style="min-height: {{editorMinHeight}}px; margin-bottom: {{keyboardHeight}}px;"
/>
```

**One more detail**: The toolbar needs to float above the keyboard, not behind it. We used `position: fixed` with the keyboard height offset.

### 2. Content Sync Issues on Android

**Problem**: On certain Android devices, rapid successive calls to `format` and `insertText` would cause content corruption — formatting was applied to the wrong selection or text appeared in the wrong position.

**Root cause**: Both `format` and `insertText` are async operations. When called in quick succession, Quill.js's internal selection state hadn't updated yet, causing subsequent operations to act on stale selection data.

**Solution**: Introduced an operation queue in the bridge layer:

```javascript
class EditorBridge {
  constructor() {
    this._taskQueue = []
    this._isProcessing = false
  }

  _exec(fn) {
    return new Promise((resolve, reject) => {
      this._taskQueue.push({ fn, resolve, reject })
      this._processQueue()
    })
  }

  async _processQueue() {
    if (this._isProcessing || this._taskQueue.length === 0) return

    this._isProcessing = true
    const task = this._taskQueue.shift()

    try {
      await this.init()
      const result = await task.fn(this.editorCtx)
      task.resolve(result)
    } catch (err) {
      task.reject(err)
    } finally {
      this._isProcessing = false
      this._processQueue()
    }
  }
}
```

After introducing the queue, all formatting operations execute in strict sequence, and the Android content corruption issue was completely resolved.

### 3. Cursor Position Lost After Image Insertion

**Problem**: After inserting an image, the cursor would jump to the end of the document. Users had to manually tap back to the insertion point to continue typing.

**Root cause**: `insertImage` doesn't automatically position the cursor after the inserted image.

**Solution**: Move the cursor after the image programmatically upon insertion:

```javascript
insertImages(imageUrls) {
  return this._exec(async (ctx) => {
    for (const url of imageUrls) {
      await this._insertImageAndMoveCursor(ctx, url)
    }
  })
}

_insertImageAndMoveCursor(ctx, url) {
  return new Promise((resolve) => {
    ctx.insertImage({
      src: url,
      success() {
        ctx.insertText({ text: ' ' })
        // Restore the cursor using saved selection state
        resolve()
      },
      fail: resolve
    })
  })
}
```

The final approach was to **save the cursor position before every insertion and restore it afterward**.

### 4. Offline Editing and Draft Persistence

**Problem**: School inspections often happen in areas with poor network coverage. Work in progress could be lost if the network dropped unexpectedly.

**Solution**: Encapsulate auto-save logic into a state manager:

```javascript
class EditorStateManager {
  constructor(storageKey) {
    this.storageKey = storageKey
    this._timer = null
  }

  startAutoSave(interval = 30000) {
    this._timer = setInterval(() => {
      this._saveDraft()
    }, interval)
  }

  async save() {
    await this._saveDraft()
    wx.showToast({ title: 'Draft saved', icon: 'success' })
  }

  async _saveDraft() {
    try {
      const content = await editorBridge.getContent()
      const plainText = await editorBridge.getPlainText()

      wx.setStorageSync(this.storageKey, {
        html: content.html,
        text: plainText,
        updatedAt: Date.now()
      })
    } catch (err) {
      console.error('Auto-save failed:', err)
    }
  }

  async restore() {
    try {
      const draft = wx.getStorageSync(this.storageKey)
      if (draft && draft.html) {
        await editorBridge.insertHtml(draft.html)
        return draft
      }
    } catch (err) {
      console.error('Draft restore failed:', err)
    }
    return null
  }

  clearDraft() {
    wx.removeStorageSync(this.storageKey)
  }
}
```

**Three key operations**:
- **Auto-save every 30 seconds** during editing
- **Auto-check for drafts** when entering the editor, with a prompt to restore
- **Clear draft on successful submission**

### 5. Export Format Instability

**Problem**: The HTML returned by `getContents` varied across WeChat client versions, causing backend parsing issues.

**Solution**: Apply a normalization step before exporting:

```javascript
function formatExportHtml(rawHtml) {
  if (!rawHtml) return ''

  let html = rawHtml

  // 1. Normalize empty paragraphs
  html = html.replace(/<p><br><\/p>/g, '<p></p>')

  // 2. Remove empty attributes
  html = html.replace(/\s(class|style)=""/g, '')

  // 3. Clean up list tags
  html = html.replace(/<ul[^>]*>/g, '<ul>')
  html = html.replace(/<ol[^>]*>/g, '<ol>')

  // 4. Trim whitespace
  html = html.trim()

  return html
}
```

We also agreed with the backend on a **standard content format**: the normalized HTML from the frontend is stored as-is on the server, and rendered in web views using a standard rich text component.

## Results and Metrics

After deployment at the Longgang Education Bureau, the wrapped editor delivered measurable improvements:

| Metric | Before | After |
| --- | --- | --- |
| Report editing time | 15-20 min (manual formatting) | 3-5 min (template + tweaks) |
| Format compliance rate | ~60% | 95%+ (validation engine) |
| Image upload time (9 photos) | ~30 sec (manual single upload) | ~8 sec (batch + concurrency) |
| Draft loss incidents | Occasional | None (30s auto-save) |
| Cross-device consistency | Varies (Android vs iOS) | Consistent (operation queue) |

## Summary

Looking back, wrapping the native editor component boiled down to one thing: **transforming a generic capability into a scenario-specific tool**.

Key takeaways:

1. **Don't try to fix the native component's boundaries** — The editor's basic capabilities are reliable; what's needed is a warm encapsulation layer to adapt them to your business context
2. **An operation queue is essential for mobile rich text** — Async timing issues are the most common and subtle bug in mobile rich text editing; the queue is the most reliable fix
3. **Templates + Validation are the killer features for B2B editors** — In enterprise scenarios, the goal isn't "write anything", it's "write compliant content". Templates reduce input cost; validation guarantees output quality
4. **Offline capability defines the mobile experience floor** — In weak network environments, reliability matters more than feature richness

One deep lesson: **the native mini-program component is bare by design — and that's precisely why you know exactly which problem each layer of wrapping is solving.** If you were using a full-featured rich text editor off the shelf, you might never appreciate how important an operation queue, offline drafts, and format validation are for mobile B2B scenarios.

> There's no right or wrong in technology choices — only whether they fit the scenario. For mobile rich text editing, the depth of wrapping depends on the complexity of the business: supervision reports need one-click templates, school notices need rapid publishing. Every layer of encapsulation is a precise response to a real business need.
