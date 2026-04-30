---
title: Optimizing Frontend Performance and Background Notifications with Web Worker Multithreading
description: Starting from main thread blocking issues, this article details how to leverage Web Workers to offload heavy computations and background notification delivery from the main thread, achieving smooth UX and millisecond-level message response.
date: '2025-05-20'
tags:
  - Web Worker
  - Performance Optimization
  - Multithreading
  - Notification System
  - Vue3
category: Frontend
draft: false
---

## Background: Main Thread Bottlenecks

During the development of an enterprise-level component library, we encountered two tricky problems:

1. **UI lag with large data volumes**: The JSON configuration engine in the component library performs heavy synchronous computation when parsing and rendering complex configurations, blocking the main thread and causing noticeable frame drops and jank
2. **Background notifications hijacking the main thread**: The system needed real-time background notification delivery (approval reminders, system announcements, etc.). The entire pipeline — receiving, parsing, sorting, and rendering notifications — ran on the main thread. When notifications arrived in bursts, the user's current interaction would suddenly "freeze"

Both problems share the same root cause: **under JavaScript's single-threaded model, all tasks share the same execution pipeline**. Heavy computations and UI rendering compete for main thread time slices, leading to interaction response delays.

## Solution Selection: Why Web Workers

There are three common approaches to main thread blocking:

| Approach | Pros | Cons |
| --- | --- | --- |
| `requestIdleCallback` chunking | Minimal changes, good compatibility | Only uses idle time, doesn't fundamentally solve blocking |
| `setTimeout(fn, 0)` yielding | Simple implementation | Uncontrollable scheduling, frequent context switching can hurt performance |
| **Web Worker multithreading** | True parallelism, complete isolation | Serialization overhead for communication, requires architectural design |

We chose Web Workers because:

- The notification system involves **continuously running long-connection listeners** (WebSocket / MQTT), which aren't suitable for intermittent chunked processing
- JSON configuration parsing has **unpredictable computation volume** — chunking can't guarantee completion before the next frame
- Workers are fully isolated from the main thread — computation exceptions won't crash the page, providing **built-in fault tolerance**

## Architecture Design

### Overall Layering

```
┌─────────────────────────────────────┐
│           Main Thread               │
│  ┌───────────┐  ┌────────────────┐  │
│  │  Vue Comp  │  │  Notification  │  │
│  │           │  │  UI Rendering   │  │
│  └─────┬─────┘  └───────┬────────┘  │
│        │                │           │
│  ┌─────▼────────────────▼────────┐  │
│  │       Worker Bridge           │  │
│  │   (postMessage / onmessage)   │  │
│  └─────────────┬────────────────┘  │
└────────────────┼────────────────────┘
                 │
┌────────────────▼────────────────────┐
│        Worker Thread                 │
│  ┌──────────────┐ ┌──────────────┐  │
│  │ Config Parser │ │ Notification │  │
│  │ (JSON Parse)  │ │ (MQTT/WS)    │  │
│  └──────────────┘ └──────────────┘  │
└─────────────────────────────────────┘
```

The core idea: **the main thread only handles UI rendering and user interaction; all heavy computation and I/O listening is offloaded to the Worker thread**. The two layers communicate via `postMessage`, using the structured clone algorithm for data transfer.

### Worker Bridge Communication Layer

Using `postMessage` directly has several issues: no request-response correlation, no error handling, no type constraints. So we designed a Bridge layer:

```ts
// worker-bridge.ts
interface BridgeMessage {
  id: string
  type: string
  payload: unknown
}

interface BridgeResponse {
  id: string
  type: string
  payload: unknown
  error?: string
}

export class WorkerBridge {
  private worker: Worker
  private pending = new Map<string, {
    resolve: (value: unknown) => void
    reject: (reason: string) => void
  }>()

  constructor(workerUrl: string) {
    this.worker = new Worker(workerUrl)
    this.worker.onmessage = (e: MessageEvent<BridgeResponse>) => {
      const { id, payload, error } = e.data
      const task = this.pending.get(id)
      if (!task) return
      this.pending.delete(id)
      error ? task.reject(error) : task.resolve(payload)
    }
  }

  request(type: string, payload: unknown): Promise<unknown> {
    const id = crypto.randomUUID()
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.worker.postMessage({ id, type, payload } as BridgeMessage)
    })
  }

  onNotify(callback: (payload: unknown) => void) {
    this.worker.addEventListener('message', (e: MessageEvent<BridgeResponse>) => {
      if (e.data.type === 'notification') {
        callback(e.data.payload)
      }
    })
  }

  terminate() {
    this.worker.terminate()
    this.pending.forEach(({ reject }) => reject('Worker terminated'))
    this.pending.clear()
  }
}
```

This Bridge layer provides three key capabilities:

1. **Request-response pattern**: Each request carries a unique `id`, and responses are correlated to the corresponding Promise via `id`
2. **Notification pattern**: Workers can proactively push messages to the main thread (e.g., new notification arrival), unconstrained by request-response
3. **Lifecycle management**: `terminate` automatically rejects all pending requests, preventing memory leaks

## Practice 1: JSON Configuration Parsing Engine

The component library supports JSON-driven development — users pass in a JSON Schema, and the engine dynamically renders the corresponding forms and tables. When configurations have deep nesting and many fields, synchronous parsing can block the main thread for hundreds of milliseconds.

### Worker-Side Implementation

```ts
// config-parser.worker.ts
self.onmessage = (e: MessageEvent<BridgeMessage>) => {
  const { id, type, payload } = e.data

  if (type === 'parseConfig') {
    try {
      const result = parseConfig(payload as string)
      self.postMessage({ id, type: 'parseConfig', payload: result })
    } catch (err) {
      self.postMessage({
        id,
        type: 'parseConfig',
        payload: null,
        error: (err as Error).message,
      })
    }
  }
}

function parseConfig(raw: string) {
  const config = JSON.parse(raw)
  // Recursive validation and transformation
  return normalizeConfig(config)
}

function normalizeConfig(config: Record<string, unknown>): ParsedConfig {
  // Deep traversal, type validation, default value filling...
  // This logic blocks the UI when running on the main thread
  return {
    fields: flattenFields(config),
    validations: extractValidations(config),
    layout: computeLayout(config),
  }
}
```

### Main Thread Invocation

```ts
// In a Vue component
const bridge = new WorkerBridge('/workers/config-parser.worker.js')

async function handleConfigUpload(raw: string) {
  loading.value = true
  try {
    const parsed = await bridge.request('parseConfig', raw) as ParsedConfig
    renderConfig(parsed)
  } catch (err) {
    showToast('Config parsing failed: ' + err)
  } finally {
    loading.value = false
  }
}
```

**Result**: For a complex configuration with 200+ fields, parsing time moves from ~320ms on the main thread to background execution in the Worker. The main thread UI maintains 60fps smooth responsiveness. Users only see a brief loading state — no more perceived jank.

## Practice 2: Efficient Background Notification System

The notification system's requirements: receive server pushes via MQTT long-connection, deduplicate, sort, and aggregate notifications, then render them to the UI. Notifications can arrive in bursts (e.g., batch approval completions), and must not interfere with the user's current interaction.

### Worker-Side Implementation

```ts
// notification.worker.ts
import mqtt from 'mqtt'

let client: mqtt.MqttClient | null = null
const notificationQueue: Notification[] = []

self.onmessage = (e: MessageEvent<BridgeMessage>) => {
  const { type, payload } = e.data

  if (type === 'connect') {
    connectMQTT(payload as MQTTConfig)
  }

  if (type === 'disconnect') {
    client?.end()
    client = null
  }
}

function connectMQTT(config: MQTTConfig) {
  client = mqtt.connect(config.brokerUrl, {
    clientId: config.clientId,
    clean: true,
    reconnectPeriod: 3000,
  })

  client.on('message', (_topic, message) => {
    const notification = JSON.parse(message.toString())

    // Deduplication, sorting, and aggregation done in Worker
    processNotification(notification)
  })

  client.subscribe(config.topics)
}

function processNotification(notification: Notification) {
  // Deduplication: only keep the latest for same ID
  const existingIdx = notificationQueue.findIndex(n => n.id === notification.id)
  if (existingIdx !== -1) {
    notificationQueue[existingIdx] = notification
  } else {
    notificationQueue.push(notification)
  }

  // Sort by priority and time
  notificationQueue.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority
    return b.timestamp - a.timestamp
  })

  // Aggregation: merge same-type notifications into a summary
  const aggregated = aggregateByType(notificationQueue)

  // Push to main thread for rendering
  self.postMessage({
    id: '',
    type: 'notification',
    payload: {
      total: notificationQueue.length,
      items: aggregated,
    },
  })
}
```

### Main Thread Notification Consumption

```ts
// notification-composable.ts
export function useNotification() {
  const notifications = ref<NotificationItem[]>([])
  const unreadCount = ref(0)
  const bridge = shallowRef<WorkerBridge | null>(null)

  onMounted(() => {
    bridge.value = new WorkerBridge('/workers/notification.worker.js')

    bridge.value.onNotify((payload) => {
      const data = payload as { total: number; items: NotificationItem[] }
      notifications.value = data.items
      unreadCount.value = data.total
    })

    bridge.value.request('connect', {
      brokerUrl: 'wss://mqtt.example.com',
      clientId: `user_${Date.now()}`,
      topics: ['notifications/user/*', 'notifications/system'],
    })
  })

  onUnmounted(() => {
    bridge.value?.request('disconnect', null)
    bridge.value?.terminate()
  })

  return { notifications, unreadCount }
}
```

**Result**: MQTT connection maintenance, message parsing, deduplication, and sorting all happen in the Worker thread. Even when 50 notifications arrive within 1 second, the main thread only receives one aggregated push and updates the UI once. Compared to the previous approach of processing each notification on the main thread, frame rate improves from ~15fps during notification bursts to a stable 60fps.

## Pitfalls and Lessons

### 1. Data Serialization Overhead

`postMessage` uses the structured clone algorithm for data transfer. For large objects (e.g., a queue of 10,000 notifications), serialization and deserialization overhead is non-trivial.

**Solution**: The Worker only sends the minimum dataset needed for rendering to the main thread, not the full data. The notification queue is maintained inside the Worker; only aggregated summaries and the latest N items are pushed to the main thread.

### 2. Dependency Management in Workers

Workers run in an isolated global scope and cannot directly access main thread modules. If a Worker depends on third-party libraries (like mqtt), it needs separate bundling.

**Solution**: Use Vite's Worker bundling support:

```ts
// Vite automatically handles Worker dependency bundling
const worker = new Worker(
  new URL('../workers/notification.worker.ts', import.meta.url),
  { type: 'module' }
)
```

### 3. Worker Lifecycle Management

Workers must be terminated when components unmount, otherwise memory leaks occur. But multiple components may share the same Worker instance.

**Solution**: Use a reference counting pattern, managing Worker instances uniformly at the composable layer:

```ts
// worker-pool.ts
const pool = new Map<string, { worker: WorkerBridge; refCount: number }>()

export function acquireWorker(url: string): WorkerBridge {
  const entry = pool.get(url)
  if (entry) {
    entry.refCount++
    return entry.worker
  }
  const worker = new WorkerBridge(url)
  pool.set(url, { worker, refCount: 1 })
  return worker
}

export function releaseWorker(url: string) {
  const entry = pool.get(url)
  if (!entry) return
  entry.refCount--
  if (entry.refCount <= 0) {
    entry.worker.terminate()
    pool.delete(url)
  }
}
```

### 4. Debugging Difficulties

`console.log` inside Workers is visible in DevTools, but breakpoint debugging requires setting them separately in the Sources panel's Worker thread.

**Recommendation**: Add detailed logging in Workers during development and remove before production. Chrome DevTools → Sources → Threads panel shows all Worker threads and allows setting breakpoints.

## Performance Comparison

| Metric | Before (Main Thread) | After (Worker) |
| --- | --- | --- |
| Main thread blocking during JSON config parsing | ~320ms | 0ms (background execution) |
| Frame rate during 50-notification burst | ~15fps | 60fps |
| Notification-to-UI-render latency | 200-500ms | 30-80ms |
| Time to Interactive (TTI) | 2.8s | 1.6s |

## Summary

Web Workers aren't a silver bullet, but they deliver significant benefits in these scenarios:

1. **Continuously running I/O listeners** (WebSocket / MQTT long connections) — prevents the main thread from being interrupted by frequent event callbacks
2. **Parsing tasks with unpredictable computation** (JSON Schema, template compilation) — complete isolation, no competition with UI for time slices
3. **High-frequency events requiring aggregation** (notifications, logs, real-time data) — buffer and aggregate in Workers, main thread only consumes results

Key takeaways:

- **Communication layer abstraction is essential**: Using raw `postMessage` leads to unmaintainable code. The Bridge layer provides request-response, notification, and lifecycle management capabilities
- **Minimize data transfer**: Maintain full data inside Workers, only push the minimum dataset needed for rendering to the main thread, reducing serialization overhead
- **Lifecycle management must not be overlooked**: Workers must be released when components unmount. Reference counting is suitable for multi-component sharing scenarios
- **Measure before optimizing**: Use Chrome DevTools Performance panel to confirm that the main thread bottleneck is indeed in computation/IO rather than DOM operations before introducing Workers
