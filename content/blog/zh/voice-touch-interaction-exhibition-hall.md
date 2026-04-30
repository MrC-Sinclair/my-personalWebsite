---
title: 「语音指令与触控反馈」：为数据大屏拓展沉浸式展厅交互体验
description: 从全校数据可视化监控大屏项目出发，详解如何将语音识别与触控交互融入大屏展示系统，让参观者从被动观看变为主动探索，涵盖语音指令解析、手势交互设计、多模态反馈等关键技术实现与踩坑记录。
date: '2024-06-15'
tags:
  - 语音识别
  - 触控交互
  - 数据大屏
  - ECharts
  - 展厅体验
  - Vue3
category: 前端
draft: false
---

## 背景：从"看"到"用"的转变

2022 年，我接手了**全校数据可视化监控大屏**项目的开发。项目初期需求很明确——将学校的教学数据、校园安全、设备运行等核心指标以 ECharts 图表形式呈现在一块超大屏幕上，供领导参观和日常监控使用。

第一版上线后，效果不错。大屏上跳动的数据、科技风的配色、流畅的动画，参观者进门就会被吸引。但运营一段时间后，我发现了一个问题：**大多数人停留在"看"的层面**。

具体来说，有三个痛点：

1. **信息过载**：一块屏幕上同时展示十几个图表，参观者不知道应该关注哪里
2. **缺乏参与感**：数据是自动轮播的，参观者无法主动询问"今天迟到人数多少？""哪个班级出勤率最低？"
3. **操作门槛**：传统的鼠标+键盘在大屏场景下很不自然，触摸屏又没有适配的交互逻辑

于是我们决定：**为大屏增加语音识别与触控交互能力**，让参观者从被动观看变为主动探索。

## 方案设计：语音 + 触控 + 视觉的三模态交互

### 核心交互模型

```
参观者 ──┬── 语音指令 ──→ 语音识别引擎 ──→ 指令解析 ──→ 数据查询 ──→ 图表更新
         │                                                              │
         └── 触控手势 ──→ 触控事件处理 ──→ 交互反馈 ──→ 视觉/听觉反馈 ←─┘
```

我们的设计原则是：

- **语音优先**：能说就不点，降低操作门槛
- **触控辅助**：精细操作（筛选、钻取）交给触控
- **多模态反馈**：每一次操作都要有视觉和听觉双重反馈

### 交互场景示例

| 场景 | 语音指令 | 触控操作 | 系统反馈 |
| --- | --- | --- | --- |
| 查看某班数据 | "查看三年级二班" | 点击班级名称 | 高亮该班图表 + 语音播报 |
| 数据钻取 | "迟到人数最多的班级" | 双击图表区域 | 下钻到班级详情 + 震动反馈 |
| 切换视图 | "切换为排行榜模式" | 滑动切换 | 图表切换动画 + 提示音 |
| 查看趋势 | "本周出勤率趋势" | 拖拽时间轴 | 折线图逐步绘制 + 进度提示 |

## 架构设计

### 系统整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      大屏前端（Vue3 + ECharts）                    │
│  ┌────────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ 语音交互模块 │  │ 触控交互模块  │  │ 数据展示模块 │  │ 反馈模块  │ │
│  │ ASR + NLP  │  │ 手势识别     │  │ ECharts    │  │ TTS + 动画│ │
│  └──────┬─────┘  └──────┬───────┘  └──────┬─────┘  └────┬─────┘ │
│         │                │                 │              │      │
│  ┌──────▼────────────────▼─────────────────▼──────────────▼──┐  │
│  │                    ScreenCommander 核心调度                   │  │
│  │  语义解析 → 意图匹配 → 指令路由 → 状态管理 → 反馈编排         │  │
│  └──────────────────────────┬──────────────────────────────────┘  │
└─────────────────────────────┼─────────────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────────┐
│                   后端数据服务层                                    │
│  实时数据推送 (WebSocket)  /  历史数据查询 (REST API)               │
└───────────────────────────────────────────────────────────────────┘
```

### 语音交互流程

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  语音输入  │ → │  ASR识别  │ → │  语义解析  │ → │  指令路由  │ → │  执行动作  │
│  (麦克风)  │   │  (离线)   │   │  (NLP)    │   │          │   │  (图表更新)│
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                      ↓
               "正在聆听..."            "已识别：查看三年级"   播报："已切换到三年级数据"
```

我们选择**离线语音识别方案**，原因有三：
1. 展厅网络环境不可控，离线更可靠
2. 识别响应需在 500ms 以内，在线方案延迟不稳定
3. 数据涉及学校隐私，不适合上传云端

## 关键实现

### 语音指令引擎：ScreenCommander

这是整个语音交互的核心。我们需要一个能理解中文口语化指令的轻量级语义解析引擎，而不是简单的关键词匹配。

```ts
// composables/useScreenCommander.ts
import { ref, reactive } from 'vue'

interface CommandIntent {
  action: 'query' | 'switch' | 'drill' | 'compare' | 'reset'
  target: string        // 数据对象：出勤率、迟到人数、设备状态...
  scope: string         // 范围：全校、三年级、二班...
  period: string        // 时间：今天、本周、本月...
  confidence: number    // 置信度 0-1
}

interface GrammarRule {
  pattern: RegExp
  extract: (match: RegExpMatchArray) => Partial<CommandIntent>
}

export function useScreenCommander() {
  const isListening = ref(false)
  const currentIntent = ref<CommandIntent | null>(null)
  const lastCommand = ref('')
  const feedback = reactive({
    text: '',
    type: 'listening' | 'recognized' | 'executing' | 'error' | 'done',
  })

  // 语义规则库：按优先级排列
  const grammar: GrammarRule[] = [
    {
      // "查看三年级二班出勤率"
      pattern: /(查看|显示|看看)(\S+?)(?:班|年级)?(.{1,4})/,
      extract: (m) => ({
        action: 'query',
        scope: m[2],
        target: m[3] || '总览',
      }),
    },
    {
      // "迟到人数最多的班级"
      pattern: /(.{1,4})最(多|少|高|低)(?:的)?(\S{1,6})/,
      extract: (m) => ({
        action: 'query',
        target: m[1],
        scope: `${m[3]}${m[2] === '多' || m[2] === '高' ? '最多' : '最少'}`,
      }),
    },
    {
      // "切换为排行榜模式"
      pattern: /(切换|变成|换)(?:为|成)?(.{1,6})(?:模式|视图|方式)/,
      extract: (m) => ({
        action: 'switch',
        target: m[2],
      }),
    },
    {
      // "本周出勤率趋势"
      pattern: /(本周|本月|今日|昨天)(.{1,4})(趋势|变化|走势)/,
      extract: (m) => ({
        period: m[1],
        target: m[2],
        action: 'query',
      }),
    },
    {
      // "放大/缩小"
      pattern: /(放大|缩小|放大一点|缩小一点)/,
      extract: (m) => ({
        action: m[1].includes('放大') ? 'drill' : 'reset',
        target: '视图',
      }),
    },
  ]

  function parseCommand(text: string): CommandIntent | null {
    for (const rule of grammar) {
      const match = text.match(rule.pattern)
      if (match) {
        const partial = rule.extract(match)
        return {
          action: 'query',
          target: '总览',
          scope: '全校',
          period: '今天',
          confidence: 0.85,
          ...partial,
          // 根据匹配长度计算置信度
          confidence: Math.min(0.95, 0.5 + match[0].length / text.length * 0.5),
        }
      }
    }
    return null
  }

  function executeCommand(intent: CommandIntent) {
    currentIntent.value = intent
    feedback.type = 'executing'
    feedback.text = `正在${getActionText(intent.action)}${intent.target}数据...`

    // 触发对应的数据动作（调度到业务层）
    return intent
  }

  function getActionText(action: string): string {
    const map: Record<string, string> = {
      query: '查询',
      switch: '切换',
      drill: '下钻',
      compare: '对比',
      reset: '重置',
    }
    return map[action] || '处理'
  }

  return {
    isListening,
    currentIntent,
    lastCommand,
    feedback,
    grammar,
    parseCommand,
    executeCommand,
  }
}
```

**语义规则设计的关键**：我们并不是用 NLP 大模型（那在离线场景下过于笨重），而是用**语义模板匹配**。这有几个好处：

- **可预测性**：所有能识别的指令都是事先定义的，不会有"胡猜"的情况
- **低延迟**：正则匹配纳秒级完成，ASR 识别完成后 50ms 内就能出意图
- **易维护**：非技术人员（如展厅运营人员）也能看懂和添加规则

### 语音唤醒与识别集成

我们集成离线语音识别 SDK，封装成一个 composable：

```ts
// composables/useVoiceRecognition.ts
import { ref } from 'vue'

interface RecognitionConfig {
  mode: 'wake-up' | 'continuous'     // 唤醒模式 / 连续识别
  wakeWord?: string                   // 唤醒词
  onResult: (text: string) => void    // 识别结果回调
  onStateChange?: (state: RecognitionState) => void
}

type RecognitionState = 'idle' | 'waking' | 'listening' | 'recognizing' | 'error'

export function useVoiceRecognition() {
  const state = ref<RecognitionState>('idle')
  const interimText = ref('')    // 中间识别结果（实时）
  const finalText = ref('')      // 最终识别结果
  const isSupported = ref(false)

  // 假设已集成某离线 ASR SDK
  let recognizer: any = null

  function init(config: RecognitionConfig) {
    // 语音识别 SDK 初始化
    isSupported.value = true
    // ... SDK 初始化代码 ...
  }

  function startListening() {
    state.value = 'listening'
    // 开启麦克风，开始识别
  }

  function stopListening() {
    state.value = 'idle'
    // 停止识别
  }

  function speakFeedback(text: string) {
    // 使用 Web Speech API 或离线 TTS 播报反馈
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 1.1
      utterance.pitch = 1.0
      speechSynthesis.speak(utterance)
    }
  }

  return {
    state,
    interimText,
    finalText,
    isSupported,
    init,
    startListening,
    stopListening,
    speakFeedback,
  }
}
```

### 唤醒词设计

展厅环境嘈杂，不能一直开着麦克风识别。我们设计了**两级唤醒机制**：

```
展厅静默 → "小助手" → 唤醒（绿色指示灯亮起） → "查看三年级" → 执行 → 继续聆听 5 秒
                                       ↑                     → 无指令超时 → 自动休眠
                                       └── "谢谢" / "退出" → 手动休眠
```

关键参数：
- **唤醒后持续聆听 5 秒**：给参观者足够时间说出完整指令
- **超过 5 秒无指令自动休眠**：防止误识别和隐私问题
- **唤醒词要求 3-4 个音节**：太短容易误触发，太长不方便

### 触控交互：为大屏优化的手势系统

大屏的触控和手机完全不同——手臂悬空操作，精度低、易疲劳。我们设计了一套专为大屏优化的触控方案：

```ts
// composables/useTouchInteraction.ts
import { ref, onMounted, onUnmounted } from 'vue'

interface TouchGesture {
  type: 'tap' | 'double-tap' | 'swipe' | 'hold' | 'two-finger-zoom'
  startX: number
  startY: number
  endX?: number
  endY?: number
  distance?: number    // 滑动距离（px）
  duration: number     // 操作时长（ms）
}

export function useTouchInteraction(
  elementRef: Ref<HTMLElement | null>,
  onGesture: (gesture: TouchGesture) => void
) {
  const isTouching = ref(false)
  const touchStart = ref({ x: 0, y: 0, time: 0 })
  const touchCount = ref(0)

  // 触控热区：将大屏划分为 9 宫格，每个区域对应不同功能
  function getTouchZone(x: number, y: number, width: number, height: number): string {
    const col = Math.floor((x / width) * 3)
    const row = Math.floor((y / height) * 3)
    const zones = [
      ['左上', '上中', '右上'],
      ['左中', '中央', '右中'],
      ['左下', '下中', '右下'],
    ]
    return zones[row]?.[col] || '未知'
  }

  // 大屏专用防抖：触控目标至少 80px（手机 48px，大屏需要更大）
  const MIN_TAP_DISTANCE = 80
  const HOLD_THRESHOLD = 800    // 800ms 视为长按

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 0) return
    isTouching.value = true
    touchCount.value = e.touches.length
    touchStart.value = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (!isTouching.value) return
    isTouching.value = false

    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStart.value.x
    const dy = touch.clientY - touchStart.value.y
    const duration = Date.now() - touchStart.value.time
    const distance = Math.sqrt(dx * dx + dy * dy)

    const element = elementRef.value
    if (!element) return

    const rect = element.getBoundingClientRect()
    const zone = getTouchZone(touch.clientX, touch.clientY, rect.width, rect.height)

    // 区分手势类型
    if (duration >= HOLD_THRESHOLD && distance < MIN_TAP_DISTANCE) {
      // 长按：进入钻取模式
      onGesture({ type: 'hold', startX: touch.clientX, startY: touch.clientY, distance, duration })
    } else if (distance > MIN_TAP_DISTANCE) {
      // 滑动：切换视图/页面
      const isHorizontal = Math.abs(dx) > Math.abs(dy)
      onGesture({
        type: 'swipe',
        startX: touch.clientX,
        startY: touch.clientY,
        endX: touch.clientX,
        endY: touch.clientY,
        distance,
        duration,
      })
    } else {
      // 点击：选择数据项/触发交互
      onGesture({
        type: touchCount.value === 2 ? 'double-tap' : 'tap',
        startX: touch.clientX,
        startY: touch.clientY,
        distance,
        duration,
      })
    }
  }

  onMounted(() => {
    const el = elementRef.value
    if (!el) return

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
    el.addEventListener('touchcancel', () => { isTouching.value = false })
  })

  onUnmounted(() => {
    const el = elementRef.value
    if (!el) return
    el.removeEventListener('touchstart', handleTouchStart)
    el.removeEventListener('touchend', handleTouchEnd)
  })

  return {
    isTouching,
    getTouchZone,
  }
}
```

### 多模态反馈引擎

这是用户体验的关键——语音指令发出后，系统必须在三个通道上都给反馈：

```ts
// composables/useMultimodalFeedback.ts
export function useMultimodalFeedback() {
  // 视觉反馈
  function visualFeedback(type: string, element?: HTMLElement) {
    switch (type) {
      case 'listening':
        // 麦克风图标脉冲动画
        showMicrophonePulse()
        break
      case 'recognized':
        // 指令文字浮现在屏幕中央（3秒渐隐）
        showCommandOverlay()
        break
      case 'transition':
        // 图表切换时的过渡动画
        animateChartTransition()
        break
      case 'highlight':
        // 高亮被选中的数据项
        element?.classList.add('voice-highlight')
        setTimeout(() => element?.classList.remove('voice-highlight'), 2000)
        break
    }
  }

  // 听觉反馈
  function audioFeedback(type: string) {
    const sounds: Record<string, string> = {
      wake: '/sounds/wake.mp3',           // 唤醒提示音
      success: '/sounds/success.mp3',     // 指令执行成功
      error: '/sounds/error.mp3',         // 识别失败
      transition: '/sounds/transition.mp3', // 切换过渡
    }
    if (sounds[type]) {
      const audio = new Audio(sounds[type])
      audio.volume = 0.5
      audio.play().catch(() => {
        // 自动播放可能被浏览器限制，静默失败
      })
    }
  }

  return { visualFeedback, audioFeedback }
}
```

### 核心调度：ScreenCommander 的完整工作流

把以上模块串联起来，就得到了完整的交互闭环：

```vue
<!-- 大屏交互主模块 -->
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useScreenCommander } from '~/composables/useScreenCommander'
import { useVoiceRecognition } from '~/composables/useVoiceRecognition'
import { useTouchInteraction } from '~/composables/useTouchInteraction'
import { useMultimodalFeedback } from '~/composables/useMultimodalFeedback'

const screenElement = ref<HTMLElement | null>(null)

const commander = useScreenCommander()
const voice = useVoiceRecognition()
const feedback = useMultimodalFeedback()

// 初始化语音
onMounted(() => {
  voice.init({
    mode: 'wake-up',
    wakeWord: '小助手',
    onResult: handleVoiceResult,
  })
})

// 初始化触控
useTouchInteraction(screenElement, handleTouchGesture)

// 语音指令处理
function handleVoiceResult(text: string) {
  commander.lastCommand.value = text
  feedback.visualFeedback('recognized')

  const intent = commander.parseCommand(text)
  if (!intent || intent.confidence < 0.5) {
    feedback.audioFeedback('error')
    commander.feedback.type = 'error'
    commander.feedback.text = `没听清，请再说一遍`
    return
  }

  feedback.audioFeedback('success')
  commander.executeCommand(intent)
  // 语音播报结果
  voice.speakFeedback(`已${commander.getActionText(intent.action)}${intent.target}数据`)
}

// 触控手势处理
function handleTouchGesture(gesture: any) {
  switch (gesture.type) {
    case 'hold':
      // 长按进入钻取模式
      commander.currentIntent.value = { action: 'drill', target: '详情', scope: '', period: '', confidence: 1 }
      feedback.audioFeedback('transition')
      break
    case 'swipe':
      // 滑动切换视图
      feedback.visualFeedback('transition')
      break
  }
}
</script>

<template>
  <div ref="screenElement" class="dashboard-screen" @click="voice.startListening()">
    <!-- 图表区域 -->
    <div class="chart-grid">
      <!-- ECharts 图表 -->
    </div>

    <!-- 语音交互状态指示器 -->
    <div class="voice-indicator" :class="voice.state.value">
      <div class="indicator-icon">
        <IconMicrophone :pulsing="voice.state === 'listening'" />
      </div>
      <Transition name="fade">
        <div v-if="commander.feedback.text" class="feedback-text">
          {{ commander.feedback.text }}
        </div>
      </Transition>
    </div>

    <!-- 触控提示浮层 -->
    <div class="touch-hint">
      <p>说出"小助手"唤醒语音控制</p>
      <p>长按图表查看详情</p>
    </div>
  </div>
</template>
```

## 踩坑与经验

### 1. 展厅声学环境下的语音识别

**问题**：展厅是一个典型的**混响 + 背景噪音**环境。大屏本身播放的背景音乐、参观者的交谈声、空调系统的低频噪音，让语音识别准确率从实验室的 95% 掉到了 60% 左右。

**解决方案**：

- **近场拾音**：在屏幕附近安装定向麦克风阵列，捕获 1-2 米内的语音
- **波束成形**：利用麦克风阵列的波束成形技术，定向增强前方声源，抑制侧方和后方噪音
- **自适应降噪**：在无语音输入时采样环境噪音，动态调整降噪参数
- **识别结果置信度过滤**：低于 0.6 置信度的结果直接丢弃，不执行任何操作，避免误触发

### 2. 唤醒词的误触发

**问题**：展厅解说员在介绍时频繁说"小助手"这个词，导致大屏不断被唤醒。

**解决方案**：

```
解法一：语境感知 —— 检测到连续 3 次唤醒 + 无有效指令，自动降低灵敏度 20%
解法二：视觉遮挡检测 —— 摄像头检测到屏幕前无人时，禁用语音唤醒
解法三：手动禁用 —— 展厅工作人员可通过触控面板一键关闭语音交互
```

最终我们用了**解法一 + 解法二**的组合：摄像头检测到屏幕前有参观者时才会开启唤醒监听，并且在连续误触发后自动降敏。

### 3. 大屏触控的"胖手指"问题

**问题**：手机上的触控设计经验在大屏上完全失效。手臂悬空操作时，手指的触控点偏移比在手机上前多了 50-100px，而且操作后手臂自然下垂会导致"拖拽误触"。

**解决方案**：

```
措施一：触控目标放大 —— 最小触控区域从 48px 提升到 80px
措施二：点击后延迟判定 —— touchstart 后等待 100ms 再判定点击位置，过滤"下落式误触"
措施三：触控热区引导 —— 屏幕底部显示操作指引动图，提示正确姿势
措施四：弹性模式 —— 检测到手臂疲劳（频繁短暂的 touchstart+touchmove），自动扩大触控区到 120px
```

### 4. 语音 + 触控的状态冲突

**问题**：用户同时使用语音和触控时（比如一边说"查看三年级"一边用手滑动屏幕），系统不知道以哪个为准，导致图表来回切换。

**解决方案**：引入**互斥锁**机制：

```ts
// 互斥锁：同一时刻只处理一种输入
const inputLock = {
  locked: false,
  source: '' as 'voice' | 'touch' | '',

  acquire(source: 'voice' | 'touch'): boolean {
    if (this.locked && this.source !== source) return false // 被其他源锁定
    this.locked = true
    this.source = source
    return true
  },

  release(source: 'voice' | 'touch') {
    if (this.source === source) {
      this.locked = false
      this.source = ''
    }
  },
}

// 使用
function handleVoiceCommand(text: string) {
  if (!inputLock.acquire('voice')) {
    commander.feedback.text = '请稍后，正在处理触控操作'
    return
  }
  // ... 处理语音指令 ...
  setTimeout(() => inputLock.release('voice'), 500)
}
```

### 5. 反馈时序：不要让人等待

**问题**：语音识别需要 300-500ms，数据查询需要 200-800ms，图表渲染需要 100-300ms。如果不做反馈设计，用户会有"系统死机了"的感觉。

**解决方案**：**阶梯式反馈**，让用户每一步都知道系统正在处理：

```
时间线：
0ms      用户说出 "查看三年级"
200ms    ASR 识别完成 → 屏幕显示"正在聆听..." + 麦克风图标闪烁
400ms    语义解析完成 → 显示"已识别：查看三年级数据"
600ms    数据查询中 → 显示"正在查询..." + 进度条
1000ms   数据返回 → 图表开始切换动画
1500ms   动画完成 → 语音播报"已切换到三年级数据" + 提示音
```

每个阶段不超过 500ms 的无反馈时间，用户的感知延迟就大大降低了。

### 6. 语音播报与背景音乐冲突

**问题**：展厅会播放背景音乐或解说视频，语音播报结果时完全被掩盖。

**解决方案**：

- **播报前暂时降低背景音乐音量**（让后台统一控制音量）
- **语音频段优化**：将 TTS 播报的音频频率提升到 2-4kHz 区间（人声最敏感的频段），与背景音乐（一般集中在低频）错开
- **字幕辅助**：在屏幕底部同步显示文字，即使没听清播报也能看到

## 效果与反馈

项目上线后，我们在学校展厅实际运行了三个月，收集了以下数据：

| 指标 | 优化前 | 优化后 |
| --- | --- | --- |
| 参观者平均停留时长 | 2.3 分钟 | 5.8 分钟 |
| 主动交互的参观者比例 | 8% | 67% |
| 语音指令识别成功率 | 62% | 91%（近场） |
| 指令执行平均延迟 | — | 1.2 秒 |
| 触控误触率 | 35% | 8% |
| 展厅运营人员满意度 | 6/10 | 9.5/10 |

最让我印象深刻的是：有一次学校接待外校考察团，一位校长走到大屏前，脱口而出"看看今年的升学率"，大屏立刻切换到升学率图表并开始播报，现场所有人都发出了"哇"的声音。那一刻我意识到，**技术最有价值的时刻，就是它被人完全忽视的时刻**——参观者不需要学习如何操作，只需要像和人对话一样说出需求。

## 总结

回头来看，这次"语音 + 触控"的大屏交互升级，最重要的收获不是技术本身，而是**对交互本质的理解**：

1. **好的交互是让人感觉不到的**——不需要说明书，不需要学习，像呼吸一样自然
2. **多模态不是堆砌功能**——语音、触控、视觉各自做最擅长的事，而不是互相替代
3. **反馈要抢在用户焦虑之前**——用户等待的心理阈值只有 500ms，在这个时间窗口内必须给出反馈
4. **离线优先是工程原则**——展厅网络不稳定，所有核心能力必须离线可用
5. **降级是种生存技能**——语音不好用就靠触控，触控不好用就看自动轮播，每个能力都有兜底方案

> 大屏的边界不是在物理尺寸上，而是在交互方式上。当你能用手去指、用嘴去说、用眼去看，屏幕就不再是"屏"了——它是一个你可以与之对话的智能空间。
