---
title: "Voice Commands and Touch Feedback: Bringing Immersive Interaction to Data Dashboards"
description: From a real-world school data monitoring dashboard, this article details how voice recognition and touch interaction were integrated into a large-screen exhibit system — transforming passive viewers into active explorers. Covers voice command parsing, gesture design, multimodal feedback, and hard-won lessons.
date: '2024-06-15'
tags:
  - Voice Recognition
  - Touch Interaction
  - Data Dashboard
  - ECharts
  - Exhibition Hall
  - Vue3
category: Frontend
draft: false
---

## Background: From "Watching" to "Using"

In 2022, I took on the development of a **school-wide data visualization monitoring dashboard**. The initial requirements were straightforward — present key metrics like teaching data, campus security, and equipment status using ECharts charts on a massive screen for executive visits and daily monitoring.

The first version was visually impressive. Dancing data, tech-themed color schemes, smooth animations — visitors were drawn in the moment they entered. But after some time in operation, I noticed a problem: **most people stayed at the "watching" level**.

Specifically, three pain points emerged:

1. **Information overload**: A dozen charts on one screen left visitors unsure where to focus
2. **Lack of engagement**: Data auto-rotated on a loop — visitors couldn't ask "How many late arrivals today?" or "Which class has the lowest attendance?"
3. **High operation barrier**: Traditional mouse and keyboard felt unnatural in a large-screen setting, and touchscreens had no tailored interaction logic

So we decided: **add voice recognition and touch interaction to the dashboard** — turning passive viewers into active explorers.

## Solution Design: Voice + Touch + Visual Tri-modal Interaction

### Core Interaction Model

```
Visitor ──┬── Voice Command ──→ ASR Engine ──→ Intent Parsing ──→ Data Query ──→ Chart Update
          │                                                                      │
          └── Touch Gesture ──→ Touch Handler ──→ Interaction Feedback ──→ Visual/Audio ←─┘
```

Our design principles:

- **Voice first**: speak rather than tap — lower the barrier
- **Touch assist**: precise operations (filtering, drill-down) handled by touch
- **Multimodal feedback**: every action gets both visual and audio confirmation

### Interaction Scenarios

| Scenario | Voice Command | Touch Action | System Feedback |
| --- | --- | --- | --- |
| View class data | "Show me Grade 3 Class 2" | Tap class name | Highlight chart + voice broadcast |
| Data drill-down | "Class with most late arrivals" | Double-tap chart area | Drill-down + haptic feedback |
| Switch view | "Switch to ranking mode" | Swipe | Chart transition animation + sound |
| View trends | "This week's attendance trend" | Drag timeline | Progressive line drawing + progress |

## Architecture Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                Dashboard Frontend (Vue3 + ECharts)                │
│  ┌───────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Voice     │  │ Touch        │  │ Data     │  │ Feedback │  │
│  │ Module    │  │ Module       │  │ Display  │  │ Module   │  │
│  │ ASR + NLP │  │ Gesture      │  │ ECharts  │  │ TTS + FX │  │
│  └─────┬─────┘  └──────┬───────┘  └────┬─────┘  └────┬─────┘  │
│        │                │               │              │        │
│  ┌─────▼────────────────▼───────────────▼──────────────▼───┐  │
│  │                 ScreenCommander Core Scheduler            │  │
│  │  Semantic Parse → Intent Match → Route → State → FX     │  │
│  └────────────────────────────┬────────────────────────────┘  │
└───────────────────────────────┼────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────┐
│                   Backend Data Services                          │
│  Real-time Push (WebSocket) / Historical Query (REST API)       │
└─────────────────────────────────────────────────────────────────┘
```

### Voice Interaction Flow

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Voice In  │ → │  ASR     │ → │ Semantic │ → │ Route    │ → │ Execute  │
│ (Mic)     │   │ (Offline)│   │ (NLP)    │   │          │   │ (Chart)  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                     ↓
              "Listening..."        "Recognized: Grade 3"   "Switched to Grade 3 data"
```

We chose **offline voice recognition** for three reasons:
1. Unreliable exhibition hall network — offline is more dependable
2. Sub-500ms response requirement — online solutions have unpredictable latency
3. Data privacy — school data shouldn't be uploaded to the cloud

## Core Implementation

### Voice Command Engine: ScreenCommander

This is the heart of the voice interaction system. We needed a semantic parsing engine that could handle colloquial Chinese commands — not just simple keyword matching.

```ts
// composables/useScreenCommander.ts
import { ref, reactive } from 'vue'

interface CommandIntent {
  action: 'query' | 'switch' | 'drill' | 'compare' | 'reset'
  target: string        // Data object: attendance, lateness, device status...
  scope: string         // Scope: school-wide, Grade 3, Class 2...
  period: string        // Time: today, this week, this month...
  confidence: number    // Confidence score 0-1
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

  // Semantic grammar rules (ordered by priority)
  const grammar: GrammarRule[] = [
    {
      // "Show Grade 3 Class 2 attendance"
      pattern: /(show|view|display)\s+(.+?)\s+(attendance|data|stats)/i,
      extract: (m) => ({
        action: 'query',
        scope: m[2],
        target: m[3] || 'overview',
      }),
    },
    {
      // "Class with most/fewest late arrivals"
      pattern: /(.+?)\s+with\s+(most|fewest|highest|lowest)\s+(.+)/i,
      extract: (m) => ({
        action: 'query',
        target: m[1],
        scope: m[3],
      }),
    },
    {
      // "Switch to ranking mode"
      pattern: /(switch|change)\s+(?:to\s+)?(.+?)\s+(mode|view)/i,
      extract: (m) => ({
        action: 'switch',
        target: m[2],
      }),
    },
    {
      // "This week's attendance trend"
      pattern: /(this\s+week|today|this\s+month)\s*(.+?)\s*(trend|change)/i,
      extract: (m) => ({
        period: m[1],
        target: m[2],
        action: 'query',
      }),
    },
    {
      // "Zoom in / zoom out"
      pattern: /(zoom\s+in|zoom\s+out|magnify|shrink)/i,
      extract: (m) => ({
        action: m[1].includes('in') || m[1].includes('magnify') ? 'drill' : 'reset',
        target: 'view',
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
          target: 'overview',
          scope: 'school-wide',
          period: 'today',
          confidence: 0.85,
          ...partial,
          confidence: Math.min(0.95, 0.5 + match[0].length / text.length * 0.5),
        }
      }
    }
    return null
  }

  function executeCommand(intent: CommandIntent) {
    currentIntent.value = intent
    feedback.type = 'executing'
    feedback.text = `Querying ${intent.target} data...`
    return intent
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

**Why semantic template matching?** We didn't use a full NLP model (too heavy for offline). Semantic templates gave us:

- **Predictability**: every recognizable command is predefined — no wild guesses
- **Low latency**: regex matching completes in nanoseconds, intent is determined within 50ms of ASR completion
- **Easy maintenance**: non-technical staff (like exhibition operators) can understand and add rules

### Voice Wake-Up and Recognition Integration

We wrapped the offline voice recognition SDK into a composable:

```ts
// composables/useVoiceRecognition.ts
import { ref } from 'vue'

interface RecognitionConfig {
  mode: 'wake-up' | 'continuous'
  wakeWord?: string
  onResult: (text: string) => void
  onStateChange?: (state: RecognitionState) => void
}

type RecognitionState = 'idle' | 'waking' | 'listening' | 'recognizing' | 'error'

export function useVoiceRecognition() {
  const state = ref<RecognitionState>('idle')
  const interimText = ref('')
  const finalText = ref('')
  const isSupported = ref(false)

  let recognizer: any = null

  function init(config: RecognitionConfig) {
    isSupported.value = true
    // ... SDK initialization ...
  }

  function startListening() {
    state.value = 'listening'
    // Enable microphone, start recognition
  }

  function stopListening() {
    state.value = 'idle'
  }

  function speakFeedback(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 1.1
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

### Wake Word Design

Exhibition halls are noisy environments — we can't keep the mic on all the time. We designed a **two-stage wake mechanism**:

```
Hall silent → "Hey Assistant" → Awakened (green indicator) → "Show Grade 3" → Execute → Listen for 5s
                                          ↑                                     → Timeout → Auto-sleep
                                          └ "Thank you" / "Exit" → Manual sleep
```

Key parameters:
- **5-second listening window after wake**: enough time for visitors to speak a complete command
- **Auto-sleep on inactivity**: prevents false positives and privacy concerns
- **3-4 syllable wake word**: balanced between reliability and convenience

### Touch Interaction: Optimized for Large Screens

Large-screen touch is fundamentally different from mobile — arms are unsupported, precision is lower, fatigue sets in faster. We designed a dedicated touch system:

```ts
// composables/useTouchInteraction.ts
import { ref, onMounted, onUnmounted } from 'vue'

interface TouchGesture {
  type: 'tap' | 'double-tap' | 'swipe' | 'hold' | 'two-finger-zoom'
  startX: number
  startY: number
  endX?: number
  endY?: number
  distance?: number
  duration: number
}

export function useTouchInteraction(
  elementRef: Ref<HTMLElement | null>,
  onGesture: (gesture: TouchGesture) => void
) {
  const isTouching = ref(false)
  const touchStart = ref({ x: 0, y: 0, time: 0 })
  const touchCount = ref(0)

  // Touch zones: divide the screen into a 3x3 grid
  function getTouchZone(x: number, y: number, width: number, height: number): string {
    const col = Math.floor((x / width) * 3)
    const row = Math.floor((y / height) * 3)
    const zones = [
      ['top-left', 'top-center', 'top-right'],
      ['middle-left', 'center', 'middle-right'],
      ['bottom-left', 'bottom-center', 'bottom-right'],
    ]
    return zones[row]?.[col] || 'unknown'
  }

  const MIN_TAP_DISTANCE = 80   // Large screen: 80px vs mobile's 48px
  const HOLD_THRESHOLD = 800    // 800ms = hold gesture

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

    // Classify gesture
    if (duration >= HOLD_THRESHOLD && distance < MIN_TAP_DISTANCE) {
      onGesture({ type: 'hold', startX: touch.clientX, startY: touch.clientY, distance, duration })
    } else if (distance > MIN_TAP_DISTANCE) {
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

  return { isTouching, getTouchZone }
}
```

### Multimodal Feedback Engine

This is the key to user experience — after a voice command, the system must provide feedback across all three channels:

```ts
// composables/useMultimodalFeedback.ts
export function useMultimodalFeedback() {
  // Visual feedback
  function visualFeedback(type: string, element?: HTMLElement) {
    switch (type) {
      case 'listening':
        showMicrophonePulse()
        break
      case 'recognized':
        showCommandOverlay()
        break
      case 'transition':
        animateChartTransition()
        break
      case 'highlight':
        element?.classList.add('voice-highlight')
        setTimeout(() => element?.classList.remove('voice-highlight'), 2000)
        break
    }
  }

  // Audio feedback
  function audioFeedback(type: string) {
    const sounds: Record<string, string> = {
      wake: '/sounds/wake.mp3',
      success: '/sounds/success.mp3',
      error: '/sounds/error.mp3',
      transition: '/sounds/transition.mp3',
    }
    if (sounds[type]) {
      const audio = new Audio(sounds[type])
      audio.volume = 0.5
      audio.play().catch(() => {})
    }
  }

  return { visualFeedback, audioFeedback }
}
```

### Full Interaction Loop

Combining all modules gives us the complete interactive workflow:

```vue
<!-- Dashboard Main Module -->
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

onMounted(() => {
  voice.init({
    mode: 'wake-up',
    wakeWord: 'Hey Assistant',
    onResult: handleVoiceResult,
  })
})

useTouchInteraction(screenElement, handleTouchGesture)

function handleVoiceResult(text: string) {
  commander.lastCommand.value = text
  feedback.visualFeedback('recognized')

  const intent = commander.parseCommand(text)
  if (!intent || intent.confidence < 0.5) {
    feedback.audioFeedback('error')
    commander.feedback.type = 'error'
    commander.feedback.text = `Sorry, I didn't catch that. Please try again.`
    return
  }

  feedback.audioFeedback('success')
  commander.executeCommand(intent)
  voice.speakFeedback(`Showing ${intent.target} data`)
}

function handleTouchGesture(gesture: any) {
  switch (gesture.type) {
    case 'hold':
      commander.currentIntent.value = { action: 'drill', target: 'detail', scope: '', period: '', confidence: 1 }
      feedback.audioFeedback('transition')
      break
    case 'swipe':
      feedback.visualFeedback('transition')
      break
  }
}
</script>

<template>
  <div ref="screenElement" class="dashboard-screen" @click="voice.startListening()">
    <!-- Chart area -->
    <div class="chart-grid">
      <!-- ECharts -->
    </div>

    <!-- Voice indicator -->
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

    <!-- Touch hint overlay -->
    <div class="touch-hint">
      <p>Say "Hey Assistant" for voice control</p>
      <p>Hold to view details</p>
    </div>
  </div>
</template>
```

## Pitfalls and Lessons Learned

### 1. Voice Recognition in Exhibition Hall Acoustics

**Problem**: Exhibition halls are classic **reverberant + noisy** environments. Background music, visitor conversations, and HVAC systems dropped recognition accuracy from 95% (lab) to around 60%.

**Solutions**:

- **Near-field pickup**: directional microphone arrays installed near the screen, capturing speech within 1-2 meters
- **Beamforming**: array technology to enhance forward-direction audio while suppressing side and rear noise
- **Adaptive noise cancellation**: sample ambient noise during idle periods, dynamically adjust filters
- **Confidence threshold filtering**: discard results below 0.6 confidence to prevent false triggers

### 2. False Wake-Up Triggers

**Problem**: Exhibition guides frequently said the wake word during their presentations, repeatedly triggering the dashboard.

**Solutions**:

```
Approach 1: Context awareness — reduce sensitivity by 20% after 3 consecutive wake-ups with no valid command
Approach 2: Visual occlusion detection — disable voice wake-up when no one is in front of the screen (via camera)
Approach 3: Manual override — staff can disable voice interaction via a touch panel
```

We combined **Approach 1 + 2**: the camera detects visitors near the screen before enabling wake-up monitoring, and sensitivity auto-adjusts after repeated false triggers.

### 3. The "Fat Finger" Problem on Large Screens

**Problem**: Mobile touch design knowledge failed completely on large screens. With unsupported arms, finger touch-point offset increased by 50-100px, and the natural arm drop after touching caused accidental drag events.

**Solutions**:

```
1. Bigger touch targets — minimum area from 48px to 80px
2. Delayed tap judgment — wait 100ms after touchstart before confirming position (filters "fall-through" touches)
3. Touch zone guide — animated hints at screen bottom show proper interaction posture
4. Fatigue mode — detect frequent short touchstart+touchmove patterns, auto-expand touch area to 120px
```

### 4. Voice and Touch State Conflicts

**Problem**: When users interacted through both modalities simultaneously (e.g., saying "Show Grade 3" while swiping), the system didn't know which input to prioritize, causing chart switching oscillations.

**Solution**: Introduce a **mutex lock** mechanism:

```ts
const inputLock = {
  locked: false,
  source: '' as 'voice' | 'touch' | '',

  acquire(source: 'voice' | 'touch'): boolean {
    if (this.locked && this.source !== source) return false
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

function handleVoiceCommand(text: string) {
  if (!inputLock.acquire('voice')) {
    commander.feedback.text = 'Please wait, touch operation in progress'
    return
  }
  // ... process command ...
  setTimeout(() => inputLock.release('voice'), 500)
}
```

### 5. Feedback Timing: Don't Make People Wait

**Problem**: ASR takes 300-500ms, data queries take 200-800ms, chart rendering takes 100-300ms. Without feedback design, users feel like "the system is frozen."

**Solution**: **Staged feedback** — keep the user informed at every step:

```
Timeline:
0ms      User says "Show Grade 3"
200ms    ASR complete → display "Listening..." + microphone animation
400ms    Semantic parse complete → "Recognized: Grade 3 data"
600ms    Query in progress → "Fetching data..." + progress bar
1000ms   Data returned → chart transition animation begins
1500ms   Animation complete → voice broadcast + confirmation sound
```

No stage exceeds 500ms without feedback — perceived latency drops dramatically.

### 6. Voice Broadcast vs. Background Music

**Problem**: Exhibition halls play background music or commentary videos that completely drown out voice broadcast feedback.

**Solutions**:

- **Duck background music before speaking**: have a central audio control lower the volume
- **Optimize broadcast frequency**: shift TTS to the 2-4kHz range (most sensitive for human hearing) where background music (typically lower frequency) has less overlap
- **On-screen captions**: display text at screen bottom as a fallback if broadcast is inaudible

## Results and Feedback

After deployment, the system ran for three months in a school exhibition hall. Here's the data:

| Metric | Before | After |
| --- | --- | --- |
| Average visitor dwell time | 2.3 min | 5.8 min |
| Active interaction rate | 8% | 67% |
| Voice command accuracy | 62% | 91% (near-field) |
| Command execution latency | — | 1.2s |
| Touch mis-tap rate | 35% | 8% |
| Staff satisfaction | 6/10 | 9.5/10 |

The moment that stuck with me most: a visiting principal walked up to the screen and instinctively said, "Show me this year's graduation rate." The dashboard instantly switched to the graduation chart and began a voice response. Everyone in the room responded with a collective "Wow." That's when I realized: **technology's most valuable moment is when it's completely invisible** — visitors don't need to learn how to interact; they just speak naturally, like talking to another person.

## Summary

Looking back, the biggest takeaway from adding voice and touch interaction to this dashboard wasn't the technology itself — it was the **understanding of interaction design**:

1. **Great interaction is invisible** — no manual, no learning, as natural as breathing
2. **Multimodal doesn't mean feature stacking** — voice, touch, and visuals each do what they do best, rather than replace each other
3. **Feedback must arrive before anxiety** — users' patience threshold is 500ms; you must respond within that window
4. **Offline-first is engineering discipline** — exhibition halls have unreliable networks; all core capabilities must work offline
5. **Graceful degradation is survival** — when voice fails, fall back to touch; when touch fails, fall back to auto-rotation. Every capability needs a backup

> A screen's boundary isn't defined by its physical size — it's defined by its interaction design. When you can point at it, speak to it, and watch it respond, it stops being a "screen." It becomes a smart space you can talk to.
