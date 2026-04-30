---
title: '「封装原生 Editor 组件」：小程序富文本编辑的二次封装实战'
description: 在教育督导工作管理小程序中，面对复杂的督导报告编辑场景，对微信原生 editor 组件进行二次封装，实现自定义工具栏、内容模板、格式校验等富文本定制能力，最终支撑项目成功中标龙岗教育局。
date: '2021-01-15'
tags:
  - 微信小程序
  - 富文本编辑
  - 组件封装
  - 移动端
  - 前端开发
category: 前端
draft: false
---

## 背景：一块"空白"的输入框

2018 年，我接手了一个教育督导工作管理小程序的开发。项目的核心场景是这样的——

督导人员每天要到各个学校进行实地巡查，检查办学行为、安全隐患、教学质量等指标。巡查结束后，需要在手机上撰写督导报告，包含文字描述、图片证据、表格数据，甚至需要引用督导标准模板中的格式规范。

但微信小程序原生提供的 `<editor>` 组件，功能其实非常"裸"：

- 提供一个空白的内容编辑区域
- 支持基本的富文本操作（加粗、斜体、标题、列表等）
- 基础图片插入能力

对于督导报告这种 **格式要求严格、内容结构复杂** 的场景，原生能力远远不够。督导人员需要的是：

1. **督导标准模板快速插入** — 不需要每次重新排格式
2. **自定义工具栏** — 按督导场景定制按钮（如插入表格、添加图片证据、标记整改项）
3. **内容格式校验** — 标题层级、段落结构、必备字段不能缺失
4. **离线保存与同步** — 学校网络不稳定，编辑内容不能丢失

这就是我决定对原生 editor 组件进行二次封装的起点。

## 原生 editor 组件的能力与局限

### 官方提供的能力

微信小程序的 `<editor>` 组件基于 Quill.js 核心，提供了一套基础的富文本编辑 API：

```js
// 初始化编辑器
const editor = wx.createSelectorQuery().select('#editor')
editor.context((res) => {
  this.editorCtx = res.context
})

// 基本格式化命令
this.editorCtx.format('bold')
this.editorCtx.format('italic')
this.editorCtx.format('header', 2)

// 插入内容
this.editorCtx.insertText({
  text: '插入文本'
})
this.editorCtx.insertImage({
  src: 'https://example.com/image.png'
})
```

### 原生能力的缺失清单

通过实际开发，我梳理出原生组件无法满足督导场景的短板：

| 需求 | 原生支持 | 问题 |
| --- | --- | --- |
| 自定义工具栏按钮 | 仅提供基础格式 | 无法添加"插入表格""标记整改项"等业务按钮 |
| 内容模板插入 | 不支持 | 督导标准模板需逐条手动排版 |
| 格式结构校验 | 不支持 | 无法保证报告结构的规范性 |
| 图片批量上传 | 仅单张插入 | 督导场景需要一次添加多张证据照片 |
| 离线编辑 | 不支持 | 学校信号差时编辑内容容易丢失 |
| 内容导出格式化 | 仅 HTML | 需要导出到后端时格式不可控 |
| 键盘适配 | 基础支持 | 复杂编辑场景键盘遮挡问题严重 |

## 封装设计：三层架构

基于上述分析，我设计了一套三层封装架构：

```
┌─────────────────────────────────────────────┐
│               UI 层（视图交互）                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 自定义工具栏 │  │ 模板选择器 │  │ 校验面板  │   │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘   │
└────────┼──────────────┼──────────────┼───────┘
         │              │              │
┌────────▼──────────────▼──────────────▼───────┐
│          API 桥接层（editor 上下文封装）        │
│  ┌─────────────┐  ┌──────────┐  ┌─────────┐  │
│  │  格式命令封装  │  │ 内容注入  │  │ 状态管理  │  │
│  └──────┬──────┘  └─────┬────┘  └─────┬───┘  │
└─────────┼───────────────┼──────────────┼──────┘
          │               │              │
┌─────────▼───────────────▼──────────────▼──────┐
│          配置层（外部扩展接口）                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ 工具栏配置  │  │ 模板配置   │  │ 校验规则配置  │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
└────────────────────────────────────────────────┘
```

### 第一层：API 桥接层

这一层是封装的**核心**，把所有对原生 editor 上下文的直接操作封装成统一的方法。这样做的好处是：上层 UI 组件不关心 editor API 的细节，只需要调用语义化的方法。

```javascript
// utils/editor-bridge.js
class EditorBridge {
  constructor(selector) {
    this.selector = selector
    this.editorCtx = null
    this._initPromise = null
  }

  /**
   * 初始化 editor 上下文
   * 返回 Promise，确保获取上下文后再执行操作
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
          reject(new Error('获取 editor 上下文失败'))
        }
      }).exec()
    })

    return this._initPromise
  }

  // ========== 文本格式化 ==========

  /** 设置标题层级 */
  setHeader(level) {
    return this._exec((ctx) => {
      if (level === 0) {
        ctx.format('header', false) // 清除标题
      } else {
        ctx.format('header', level)
      }
    })
  }

  /** 切换列表 */
  toggleList(type) {
    return this._exec((ctx) => {
      ctx.format('list', type) // 'ordered' | 'bullet' | 'check'
    })
  }

  /** 设置字体颜色 */
  setColor(color) {
    return this._exec((ctx) => {
      ctx.format('color', color)
    })
  }

  // ========== 内容操作 ==========

  /** 清除格式（纯净粘贴） */
  clearFormat() {
    return this._exec((ctx) => {
      ctx.removeFormat()
    })
  }

  /** 插入纯文本 */
  insertText(text) {
    return this._exec((ctx) => {
      ctx.insertText({ text })
    })
  }

  /** 插入 HTML 内容（如模板） */
  insertHtml(html) {
    return this._exec((ctx) => {
      ctx.insertText({ text: 'TEMP_PLACEHOLDER' })
      // 通过 replace 占位符实现 HTML 插入
      this._replaceHtml(html)
    })
  }

  /** 插入图片（支持批量） */
  insertImages(imageUrls) {
    return this._exec(async (ctx) => {
      for (const url of imageUrls) {
        ctx.insertImage({
          src: url,
          data: { uploaded: true },
          fail: (err) => {
            console.error('图片插入失败:', err)
          }
        })
        // 图片之间插入换行
        ctx.insertText({ text: '\n' })
      }
    })
  }

  // ========== 内容获取 ==========

  /** 获取编辑内容（含格式） */
  getContent() {
    return new Promise((resolve) => {
      this._exec((ctx) => {
        ctx.getContents({
          success: (res) => {
            // 清理多余的换行
            resolve(this._cleanContents(res))
          }
        })
      })
    })
  }

  /** 获取纯文本内容 */
  getPlainText() {
    return new Promise((resolve) => {
      this._exec((ctx) => {
        ctx.getText({
          success: (res) => resolve(res.text)
        })
      })
    })
  }

  // ========== 内部方法 ==========

  _exec(fn) {
    return this.init().then(fn).catch((err) => {
      console.error('[EditorBridge] 操作失败:', err)
      wx.showToast({ title: '编辑器操作失败', icon: 'none' })
    })
  }

  _cleanContents(contents) {
    // 移除首尾多余的空段落
    if (contents && contents.html) {
      contents.html = contents.html.replace(/^<p><br><\/p>/, '')
      contents.html = contents.html.replace(/<p><br><\/p>$/, '')
    }
    return contents
  }

  _replaceHtml(html) {
    // 通过 setContents 实现 HTML 替换（受限于小程序 API，实际做了兼容处理）
    // ... 具体实现略
  }
}
```

桥接层的关键设计点：

- **Promise 化**：editor 上下文的获取是异步的，把所有操作封装成 Promise 链，保证操作的时序
- **操作队列**：连续的格式操作（如先设标题、再改颜色）通过 Promise chain 串行执行，防止竞态
- **统一错误处理**：所有操作失败时给用户友好的 Toast 提示，不让开发者反复写 try-catch

### 第二层：自定义工具栏

UI 层最重要的工作是**定制一个符合督导场景的工具栏**。原生 toolbar 只有通用按钮，我们需要的是这样的布局：

```
┌────────────── 工具栏 ─────────────────┐
│ [标题] [加粗] [斜体] [列表] [颜色]      │
│ [插入图片] [插入表格] [整改项标记]       │
│ [模板] [格式校验] [保存草稿]             │
└────────────────────────────────────────┘
```

实现时，工具栏使用小程序自定义组件：

```javascript
// components/editor-toolbar/editor-toolbar.js
Component({
  properties: {
    editorSelector: { type: String, value: '#editor' }
  },

  data: {
    activeFormats: {},   // 当前选区格式状态
  },

  lifetimes: {
    attached() {
      this.bridge = new EditorBridge(this.properties.editorSelector)
      // 监听选区变化，更新工具栏高亮状态
      this._observeSelectionChange()
    }
  },

  methods: {
    // 工具栏按钮点击处理
    onToolbarTap(e) {
      const { action, payload } = e.currentTarget.dataset
      this[action] && this[action](payload)
    },

    // 设置标题
    setHeader(level) {
      this.bridge.setHeader(level).then(() => {
        this._updateActiveFormats()
      })
    },

    // 插入模板
    async insertTemplate(e) {
      const { templateId } = e.currentTarget.dataset
      wx.showLoading({ title: '插入模板中...' })

      try {
        const template = await this._getTemplate(templateId)
        await this.bridge.insertHtml(template.content)
        wx.showToast({ title: '模板插入成功', icon: 'success' })
      } catch (err) {
        wx.showToast({ title: '模板插入失败', icon: 'none' })
      } finally {
        wx.hideLoading()
      }
    },

    // 插入督导图片证据
    insertEvidenceImage() {
      const that = this
      wx.chooseImage({
        count: 9, // 最多选 9 张
        sourceType: ['camera', 'album'],
        success(res) {
          wx.showLoading({ title: '上传图片中...' })
          // 上传图片到服务器
          that._uploadImages(res.tempFilePaths).then((urls) => {
            return that.bridge.insertImages(urls)
          }).then(() => {
            wx.showToast({ title: '图片插入成功', icon: 'success' })
          }).catch(() => {
            wx.showToast({ title: '图片上传失败', icon: 'none' })
          }).finally(() => {
            wx.hideLoading()
          })
        }
      })
    },

    // 格式校验
    validateContent() {
      this.bridge.getContent().then((contents) => {
        const result = this._validateReport(contents.html)
        if (!result.valid) {
          wx.showModal({
            title: '格式检查',
            content: result.message,
            confirmText: '去修改',
            showCancel: false
          })
        } else {
          wx.showToast({ title: '格式检查通过', icon: 'success' })
        }
      })
    },

    _observeSelectionChange() {
      // 通过 editor 的 onstatuschange 事件监听选区变化
      this.bridge.init().then(() => {
        this.bridge.editorCtx.onstatuschange((res) => {
          this.setData({
            activeFormats: { ...res }
          })
        })
      })
    },

    _updateActiveFormats() {
      // 重新获取选区状态，更新工具栏高亮
      // ...
    }
  }
})
```

工具栏的核心设计思路：

- **按钮配置化**：工具栏按钮通过配置数组生成，不同页面可以传入不同的按钮配置
- **状态双向同步**：选区变化时工具栏自动高亮当前格式（如标题 2 时"标题"按钮高亮），操作后选区状态回写
- **操作防抖**：连续点击工具栏按钮时，抑制重复执行

### 第三层：配置层

配置层是对外暴露的扩展接口，不同场景可以传入不同的配置：

```javascript
// config/editor-config.js

// 督导报告编辑器配置
const SUPERVISION_EDITOR_CONFIG = {
  // 工具栏按钮配置
  toolbar: [
    { type: 'header', label: '标题', options: [1, 2, 3] },
    { type: 'bold', label: '加粗' },
    { type: 'italic', label: '斜体' },
    { type: 'list', label: '列表', options: ['ordered', 'bullet'] },
    { type: 'color', label: '颜色', options: ['red', 'blue', 'green'] },
    'divider',
    { type: 'image', label: '图片证据' },
    { type: 'table', label: '插入表格' },
    { type: 'tag', label: '整改项', value: '【待整改】' },
    'divider',
    { type: 'template', label: '督导模板' },
    { type: 'validate', label: '格式校验' },
    { type: 'draft', label: '保存草稿' },
  ],

  // 校验规则
  validation: {
    requiredSections: ['基本情况', '存在问题', '整改建议'],
    maxImages: 20,
    minParagraphs: 3,
    // 自定义校验器
    customValidators: [
      {
        name: 'mustHaveHeader',
        validate(html) {
          return html.includes('<h1') || html.includes('<h2')
        },
        message: '报告必须包含标题'
      }
    ]
  },

  // 图片处理
  image: {
    maxCount: 9,
    compress: true,
    quality: 80,
    watermark: '督导系统'
  },

  // 自动保存
  autoSave: {
    interval: 30000, // 30 秒自动保存
    key: 'report_draft'
  }
}
```

配置层的设计让组件具备了**跨场景复用的能力**。同样是 editor 封装，督导报告和校内通知的工具栏完全不同，但底层组件是同一套。

## 核心实现详解

### 1. 内容模板的动态注入

督导报告有一个明显的痛点：每次写报告的格式大同小异，但督导人员需要在手机上从零开始排版。我们预先设计了督导标准模板：

```html
<!-- templates/supervision-report.html -->
<h2>督导检查报告</h2>
<p><strong>被检查学校：</strong><span contenteditable="true">__________</span></p>
<p><strong>检查日期：</strong><span contenteditable="true">__________</span></p>
<h3>一、基本情况</h3>
<p><br></p>
<h3>二、存在问题</h3>
<p><br></p>
<h3>三、整改建议</h3>
<p><br></p>
```

模板注入流程：

1. **模板来源**：服务端下发模板列表，本地缓存常用模板
2. **注入时机**：用户点击"插入模板"按钮时
3. **注入方式**：通过桥接层的 `insertHtml` 方法将模板 HTML 插入到编辑器当前光标位置
4. **模板变量**：支持 `__DATE__`、`__SCHOOL__` 等变量自动替换

### 2. 格式校验引擎

督导报告提交到教育局之前，必须确保内容结构完整。我们实现了轻量的格式校验引擎：

```javascript
// utils/report-validator.js
class ReportValidator {
  constructor(rules) {
    this.rules = rules
  }

  /**
   * 校验报告内容
   * @param {string} html - 编辑器的 HTML 内容
   * @returns {{ valid: boolean, message: string, errors: Array }}
   */
  validate(html) {
    const errors = []

    // 检查必填章节
    if (this.rules.requiredSections) {
      for (const section of this.rules.requiredSections) {
        if (!html.includes(section)) {
          errors.push(`缺少必要章节：${section}`)
        }
      }
    }

    // 检查段落数量
    if (this.rules.minParagraphs) {
      const pCount = (html.match(/<p>/g) || []).length
      if (pCount < this.rules.minParagraphs) {
        errors.push(`正文段落不少于 ${this.rules.minParagraphs} 段`)
      }
    }

    // 检查图片数量
    if (this.rules.maxImages) {
      const imgCount = (html.match(/<img/g) || []).length
      if (imgCount > this.rules.maxImages) {
        errors.push(`图片数量不超过 ${this.rules.maxImages} 张`)
      }
    }

    // 自定义校验器
    if (this.rules.customValidators) {
      for (const validator of this.rules.customValidators) {
        if (!validator.validate(html)) {
          errors.push(validator.message)
        }
      }
    }

    return {
      valid: errors.length === 0,
      message: errors.length > 0 ? errors.join('；') : '格式检查通过',
      errors
    }
  }
}
```

这个校验器在用户点击"提交"和"格式校验"按钮时都会执行，确保不合格的报告在提交前就被拦截。

### 3. 图片批量上传与压缩

督导人员经常需要拍摄多张现场照片作为证据。原生 `insertImage` 只支持单张插入，我们将其扩展为批量操作：

```javascript
// utils/image-handler.js
class ImageHandler {
  /**
   * 批量选择并上传图片
   * @param {number} count - 可选数量
   * @returns {Promise<string[]>} 上传后的 URL 列表
   */
  static pickAndUpload(count = 9) {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count,
        sizeType: ['compressed'],  // 默认压缩
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

  /**
   * 批量上传（带并发控制）
   */
  static async _uploadBatch(filePaths) {
    const CONCURRENCY = 3 // 同时上传 3 张
    const results = []

    // 分片上传
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

关键点：

- **并发控制**：同时上传 3 张，避免一次性过多请求导致小程序卡死
- **压缩策略**：使用 `sizeType: ['compressed']`，在拍照时就让微信自动压缩，减少上传流量
- **上传进度**：用 `wx.showLoading` + 计数显示进度，如"正在上传 3/9"

## 踩坑实录

### 1. 键盘遮挡编辑区域

**问题**：在 iPhone 上，键盘弹出后直接遮挡了大半个编辑区域，用户完全看不到自己正在编辑的内容。

**解决方案**：监听键盘高度变化，动态调整编辑区域的位置。

```javascript
// 在编辑器页面中
Page({
  data: {
    keyboardHeight: 0,
    editorMinHeight: 300
  },

  onLoad() {
    // 监听键盘弹起
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
<!-- 编辑器区域动态高度 -->
<editor
  id="editor"
  style="min-height: {{editorMinHeight}}px; margin-bottom: {{keyboardHeight}}px;"
/>
```

**还有个细节**：工具栏需要在键盘弹出后固定在键盘上方，而不是被键盘遮挡。工具栏使用 `position: fixed` 配合键盘高度定位。

### 2. 内容同步异常

**问题**：在 Android 机型上，多次快速调用 `format` 和 `insertText` 后，editor 内容出现错乱 —— 格式化命令应用到错误的选区，或者插入的文字出现在错误的位置。

**根因分析**：editor 的 `format` 和 `insertText` 是异步操作，连续调用时底层 Quill.js 的 selection 状态还未更新，导致后续操作基于错误的选区信息。

**解决方案**：在桥接层引入操作队列，保证串行执行：

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

加上操作队列后，格式化操作的时序完全可控，Android 机型上的内容错乱问题彻底解决。

### 3. 图片插入后光标位置丢失

**问题**：插入图片后，光标自动跳到了文档末尾。用户需要手动点击回到刚才的插入位置才能继续输入。

**根因**：`insertImage` 在插入完成后不会自动将光标定位到图片后方。

**解决方案**：在图片插入完成后，主动将光标定位到图片后方：

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
        // 插入一个空格后恢复光标
        ctx.insertText({ text: ' ' })
        // 选中空间后方
        const selection = wx.getStorageSync('editor_selection')
        // 实际方案是配合 editorCtx.getContents 和 selectionIndex 处理
        resolve()
      },
      fail: resolve
    })
  })
}
```

这部分的处理比较棘手，最终方案是**在每次插入操作前保存光标位置，操作完成后恢复**。

### 4. 离线编辑与草稿保存

**问题**：督导人员在学校巡查时经常遇到网络信号差的情况，编辑到一半的内容如果因为网络问题丢失，影响很大。

**解决方案**：将自动保存逻辑封装到桥接层中：

```javascript
class EditorStateManager {
  constructor(storageKey) {
    this.storageKey = storageKey
    this._timer = null
  }

  // 启动自动保存
  startAutoSave(interval = 30000) {
    this._timer = setInterval(() => {
      this._saveDraft()
    }, interval)
  }

  // 触发保存
  async save() {
    await this._saveDraft()
    wx.showToast({ title: '草稿已保存', icon: 'success' })
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
      console.error('自动保存失败:', err)
    }
  }

  // 恢复草稿
  async restore() {
    try {
      const draft = wx.getStorageSync(this.storageKey)
      if (draft && draft.html) {
        await editorBridge.insertHtml(draft.html)
        return draft
      }
    } catch (err) {
      console.error('恢复草稿失败:', err)
    }
    return null
  }

  // 提交成功后清除草稿
  clearDraft() {
    wx.removeStorageSync(this.storageKey)
  }
}
```

**三个关键操作**：

- 用户编辑时，**30 秒自动保存**（写入 Storage）
- 进入编辑页面时，**自动检查是否有草稿**并提示恢复
- 报告提交成功后，**主动清除草稿**避免残留

### 5. 内容导出格式不稳定

**问题**：editor 组件通过 `getContents` 获取的内容深度解析后返回，不同版本微信客户端返回的 HTML 格式不完全一致，导致后端解析困难。

**解决方案**：在导出时对 HTML 做一层格式化处理：

```javascript
function formatExportHtml(rawHtml) {
  if (!rawHtml) return ''

  let html = rawHtml

  // 1. 统一空段落
  html = html.replace(/<p><br><\/p>/g, '<p></p>')

  // 2. 清理空属性
  html = html.replace(/\s(class|style)=""/g, '')

  // 3. 统一图片标签
  html = html.replace(/<img([^>]*)data-([^=>]+)="([^"]*)"/g, '<img$1data-$2="$3"')

  // 4. 无序列表情洁
  html = html.replace(/<ul[^>]*>/g, '<ul>')
  html = html.replace(/<ol[^>]*>/g, '<ol>')

  // 5. 清理多余的换行和空格
  html = html.trim()

  return html
}
```

此外，与服务端协定了**内容入库的标准格式**：editor 输出的 HTML 经过前端的 `formatExportHtml` 清理后，服务端存储原始 HTML，并在需要时（如 PC 端展示）用富文本组件渲染。

## 效果与数据

项目交付后，督导工作管理小程序在龙岗教育局成功落地。二次封装的 editor 组件带来的实际效果：

| 维度 | 封装前 | 封装后 |
| --- | --- | --- |
| 报告编辑效率 | 手动排版 15-20 分钟/篇 | 模板一键插入 + 微调 3-5 分钟/篇 |
| 报告格式合格率 | ~60%（排版不统一） | 95%+（校验引擎兜底） |
| 图片上传平均耗时 | 手动单张上传约 30 秒 | 批量上传 + 并发控制约 8 秒 |
| 草稿丢失率 | Ø（无草稿功能前偶发丢失） | 0%（30 秒自动保存兜底） |
| 各端编辑体验差异 | Android/iOS 表现不一致 | 统一操作队列后基本一致 |

## 总结

回过头看，对原生 editor 组件的二次封装，本质上做的是一件事：**把通用能力变成业务场景的专属工具**。

几个关键认知在这次实践中得到验证：

1. **不要试图改造原生组件的能力边界**—— editor 的基础编辑能力是可靠的，但它的"冷淡"接口需要一层温暖的封装来适配业务场景
2. **操作队列是移动端富文本编辑的刚需**—— 异步操作时序问题是移动端富文本编辑最常见也最隐蔽的坑，操作队列是最可靠的解决方案
3. **模板 + 校验是 B 端编辑器最重要的扩展**—— B 端场景的富文本编辑，核心不是"什么都能写"，而是"写出符合规范的内容"。模板降低输入成本，校验保证输出质量
4. **离线能力决定移动端体验的下限**—— 在弱网环境下，富文本编辑的可靠性比功能丰富度更重要

一个很深的感受是：**小程序原生组件虽然"裸"，但正因为裸，你才知道每一层封装在解决什么具体的问题。** 如果直接用一个全功能的富文本编辑器，你可能不会意识到操作队列、离线草稿、格式校验这些能力在移动端 B 端场景中有多重要。

> 技术选型没有对错，只有是否适配场景。对小程序富文本编辑来说，封装的深度取决于业务场景的复杂度——督导报告需要模板一键生成，校内通知需要极速发布，每一层封装都是对业务需求的精准回应。
