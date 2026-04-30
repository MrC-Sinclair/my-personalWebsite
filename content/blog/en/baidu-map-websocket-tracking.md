---
title: Integrating Baidu Maps with WebSocket for Real-Time Salesperson Tracking
description: From the real-world requirements of a business analysis system, this article details how to combine Baidu Maps with WebSocket real-time data streams to deliver salesperson route visualization, playback, and anomaly alerts — covering tech selection, architecture design, core implementation, and hard-won lessons.
date: '2024-01-10'
tags:
  - Baidu Maps
  - WebSocket
  - Real-Time Data
  - Route Tracking
  - Vue3
category: Frontend
draft: false
---

## Background: The Business Pain Point

While developing a business analysis system, we received a critical requirement: **management needed real-time visibility into sales representatives' field activities**.

Here's the scenario — a sales team of dozens of reps visits clients every day. Managers could only see visit results in daily reports, with no knowledge of the actual routes taken, how long reps stayed at each location, or whether they followed the planned schedule. Did the rep arrive at the scheduled client on time? Did they stay too long somewhere? Did they deviate from the planned route? All of this was a blind spot.

The product manager laid out clear goals:

1. Display each sales rep's **real-time location** on a map
2. Automatically draw the rep's **movement route**, with support for viewing historical tracks
3. Trigger **real-time alerts** for anomalies (area deviations, extended stops)
4. Support PC backend, DingTalk, and mobile multi-terminal viewing

## Solution Selection: Making the Right Calls

### Map SDK Selection

We evaluated Baidu Maps and AMap (AutoNavi), both dominant players in the domestic market:

| Dimension | Baidu Maps | AMap |
| --- | --- | --- |
| API Ease of Use | Well-documented, `vue-baidu-map` ecosystem available | Clean API design, active community |
| Coordinate System | BD09 (requires conversion) | GCJ02 |
| Route Drawing API | `Polyline`, `Polygon`, `DrivingRoute` | Similar capabilities |
| Enterprise Licensing | Clear pricing structure | Clear pricing structure |
| Team Familiarity | **Previous project experience** | Zero experience |

We went with Baidu Maps — the straightforward reason was the team's existing experience and a reusable map component library already built in-house.

### Real-Time Communication Selection

For real-time positioning, the frontend needed a persistent connection with the backend. The polling vs. long-connection dilemma was on the table again:

| Approach | Pros | Cons |
| --- | --- | --- |
| HTTP Polling | Simple implementation, good compatibility | High latency, server pressure, many wasted requests |
| HTTP Long Polling | Fewer requests than short polling | Connection rebuild overhead, high server resource usage |
| **WebSocket** | Full-duplex, low latency, binary support | Requires WS server support, complex connection management |
| SSE | Native reconnection, lighter one-way communication | Server-to-client only, no client-initiated messages |

WebSocket won because positioning data is **bidirectional**: the frontend not only receives location pushes but also reports coordinates and controls subscription scopes. Full-duplex was a hard requirement.

### Tech Stack Summary

```
Map Layer:    Baidu Maps JavaScript API v3.0 + vue-baidu-map wrapper
Comm Layer:   WebSocket (native WebSocket API)
Data Layer:   JSON location packets (lat/lng, timestamp, user ID, status)
View Layer:   Vue3 + Composition API, map logic abstracted into composables
```

## Architecture Design

### Overall Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (Vue3 SPA)                          │
│  ┌────────────┐    ┌──────────────┐    ┌────────────────┐   │
│  │ Map View   │    │ Route Control │    │ Alert Panel    │   │
│  │ (BMapGL)   │    │ (Playback)    │    │ (Toast/Popup)  │   │
│  └──────┬─────┘    └──────┬───────┘    └───────┬────────┘   │
│         │                  │                    │            │
│  ┌──────▼──────────────────▼────────────────────▼────────┐  │
│  │              useRealtimeTracking (composable)          │  │
│  │   ┌──────────┐  ┌──────────┐  ┌─────────────────────┐  │  │
│  │   │ Conn Mgr │  │ Cache    │  │ Aggregation & Track │  │  │
│  │   │ (Reconn) │  │ (Sliding)│  │ (Simplify/Compress) │  │  │
│  │   └─────┬────┘  └──────────┘  └─────────────────────┘  │  │
│  └─────────┼───────────────────────────────────────────────┘  │
└────────────┼───────────────────────────────────────────────────┘
             │ WebSocket (wss://)
┌────────────▼───────────────────────────────────────────────────┐
│                    Nginx / WebSocket Proxy                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    Backend WebSocket Service                     │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ Conn Mgr │  │ Session  │  │ Location   │  │ Track        │  │
│  │ (Channel)│  │ (Redis)  │  │ Broadcast  │  │ Persistence  │  │
│  └──────────┘  └──────────┘  └────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

Core design principles:

- **Connection management separated from business logic**: WebSocket lifecycle (connect, heartbeat, reconnect) is managed uniformly by the composable — business components only care about data and state
- **Frontend buffering + backend push**: The backend pushes real-time locations at 2-5 second intervals, while the frontend maintains a sliding window and draws tracks on demand
- **Lazy-loaded route data**: Only current-day tracks are loaded by default; historical routes are fetched lazily through panel filtering

### WebSocket Message Protocol

We designed a clean message protocol:

```json
// Server → Client: location update
{
  "type": "location_update",
  "data": {
    "userId": "1001",
    "lat": 22.5431,
    "lng": 114.0579,
    "speed": 0.5,
    "direction": 120,
    "timestamp": 1714464000000,
    "status": "moving" // moving | staying | offline
  }
}

// Client → Server: request historical track
{
  "type": "request_history",
  "data": {
    "userId": "1001",
    "startTime": 1714464000000,
    "endTime": 1714550400000
  }
}

// Server → Client: historical track response
{
  "type": "history_track",
  "data": {
    "userId": "1001",
    "points": [
      { "lat": 22.5431, "lng": 114.0579, "timestamp": 1714464000000 },
      { "lat": 22.5435, "lng": 114.0585, "timestamp": 1714464005000 }
    ]
  }
}
```

## Core Implementation

### WebSocket Connection Management with Auto-Reconnect

```ts
// composables/useRealtimeTracking.ts
import { reactive, ref, onUnmounted } from 'vue'

interface LocationPoint {
  userId: string
  lat: number
  lng: number
  speed: number
  direction: number
  timestamp: number
  status: 'moving' | 'staying' | 'offline'
}

export function useRealtimeTracking(options: {
  wsUrl: string
  reconnectInterval?: number
  maxReconnects?: number
}) {
  const { wsUrl, reconnectInterval = 3000, maxReconnects = 10 } = options

  const ws = ref<WebSocket | null>(null)
  const reconnectCount = ref(0)
  const isConnected = ref(false)

  // Maintain latest position for each sales rep
  const latestPositions = reactive<Record<string, LocationPoint>>({})

  // Track cache by userId (sliding window, max 5000 points)
  const trackCache = reactive<Record<string, LocationPoint[]>>({})
  const TRACK_MAX_POINTS = 5000

  // Message handler registry
  const handlers = new Map<string, (data: unknown) => void>()

  function connect() {
    if (ws.value?.readyState === WebSocket.OPEN) return

    const socket = new WebSocket(wsUrl)
    ws.value = socket

    socket.onopen = () => {
      isConnected.value = true
      reconnectCount.value = 0
      console.log('[WS] Connection established')
    }

    socket.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data)
        const handler = handlers.get(message.type)
        if (handler) {
          handler(message.data)
        }
      } catch (err) {
        console.error('[WS] Failed to parse message:', err)
      }
    }

    socket.onclose = () => {
      isConnected.value = false
      ws.value = null
      attemptReconnect()
    }

    socket.onerror = () => {
      socket.close()
    }
  }

  function attemptReconnect() {
    if (reconnectCount.value >= maxReconnects) {
      console.error('[WS] Max reconnection attempts reached')
      return
    }
    reconnectCount.value++
    console.log(`[WS] Reconnect attempt (${reconnectCount.value}/${maxReconnects})...`)
    setTimeout(() => connect(), reconnectInterval * reconnectCount.value)
  }

  function on(type: string, handler: (data: unknown) => void) {
    handlers.set(type, handler)
  }

  function send(type: string, data: unknown) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ type, data }))
    }
  }

  function handleLocationUpdate(data: LocationPoint) {
    latestPositions[data.userId] = data

    if (!trackCache[data.userId]) {
      trackCache[data.userId] = []
    }
    trackCache[data.userId].push(data)

    // Sliding window truncation
    if (trackCache[data.userId].length > TRACK_MAX_POINTS) {
      trackCache[data.userId] = trackCache[data.userId].slice(-TRACK_MAX_POINTS)
    }
  }

  on('location_update', (data) => {
    handleLocationUpdate(data as LocationPoint)
  })

  onUnmounted(() => {
    ws.value?.close()
    ws.value = null
  })

  return {
    ws,
    isConnected,
    latestPositions,
    trackCache,
    connect,
    send,
    on,
    reconnectCount,
  }
}
```

Key design decisions:

- **Sliding window cache**: Each rep retains at most 5,000 coordinate points; old data is truncated to prevent unbounded memory growth
- **Incremental reconnect delay**: The interval increases with each failed attempt (3s, 6s, 9s...), preventing all clients from hammering the server simultaneously when it recovers
- **Message routing via handler Map**: More extensible than a switch-case for different message types

### Baidu Maps Route Drawing

```ts
// composables/useBMapTracking.ts
import { ref, watch, onMounted, type Ref } from 'vue'

interface TrackOptions {
  mapInstance: Ref<any>
  trackColor?: string
  trackWidth?: number
  markerIcon?: string
}

export function useBMapTracking(options: TrackOptions) {
  const { mapInstance, trackColor = '#3b82f6', trackWidth = 4 } = options

  const overlays = ref<Array<{ userId: string; polyline: any; marker: any }>>([])

  function drawTrack(userId: string, points: Array<{ lat: number; lng: number }>) {
    if (!mapInstance.value || points.length < 2) return

    clearTrack(userId)

    const BMapGL = (window as any).BMapGL

    const path = points.map(p => new BMapGL.Point(p.lng, p.lat))

    // Draw route polyline
    const polyline = new BMapGL.Polyline(path, {
      strokeColor: trackColor,
      strokeWeight: trackWidth,
      strokeOpacity: 0.8,
      enableEditing: false,
      enableMassClear: true,
    })

    // Start point marker (circle)
    const startPoint = path[0]
    const startMarker = new BMapGL.Marker(startPoint, {
      icon: new BMapGL.Symbol(BMapGL.Symbol.CIRCLE, {
        scale: 6,
        strokeColor: trackColor,
        fillColor: '#fff',
        fillOpacity: 1,
      }),
      title: `Start`,
    })

    // End point marker with info window
    const endPoint = path[path.length - 1]
    const endMarker = new BMapGL.Marker(endPoint, {
      title: `Rep ${userId}`,
    })

    const infoWindow = new BMapGL.InfoWindow(
      `<div class="track-info">
        <p><strong>Sales Rep ID:</strong> ${userId}</p>
        <p><strong>Position:</strong> ${endPoint.lat.toFixed(4)}, ${endPoint.lng.toFixed(4)}</p>
        <p><strong>Track Points:</strong> ${points.length}</p>
      </div>`,
      { width: 260, height: 120 }
    )
    endMarker.addEventListener('click', () => {
      endMarker.openInfoWindow(infoWindow)
    })

    mapInstance.value.addOverlay(polyline)
    mapInstance.value.addOverlay(startMarker)
    mapInstance.value.addOverlay(endMarker)

    overlays.value.push({ userId, polyline, marker: endMarker })
    adjustViewport()
  }

  function clearTrack(userId: string) {
    const existing = overlays.value.filter(o => o.userId === userId)
    existing.forEach(({ polyline, marker }) => {
      if (mapInstance.value) {
        mapInstance.value.removeOverlay(polyline)
        mapInstance.value.removeOverlay(marker)
      }
    })
    overlays.value = overlays.value.filter(o => o.userId !== userId)
  }

  function clearAll() {
    overlays.value.forEach(({ polyline, marker }) => {
      if (mapInstance.value) {
        mapInstance.value.removeOverlay(polyline)
        mapInstance.value.removeOverlay(marker)
      }
    })
    overlays.value = []
  }

  function adjustViewport() {
    if (!mapInstance.value || overlays.value.length === 0) return

    const allPoints: any[] = []
    overlays.value.forEach(({ marker }) => {
      allPoints.push(marker.getPosition())
    })

    if (allPoints.length > 1) {
      mapInstance.value.setViewport(allPoints, {
        zoomFactor: 1.5,
        margins: [50, 50, 50, 50],
      })
    } else if (allPoints.length === 1) {
      mapInstance.value.centerAndZoom(allPoints[0], 15)
    }
  }

  return {
    overlays,
    drawTrack,
    clearTrack,
    clearAll,
    adjustViewport,
  }
}
```

### Track Simplification: Drawing Less to Draw Better

Sales reps report their location every 2-5 seconds. Over a full work day, this can accumulate tens of thousands of coordinate points. Drawing all of them directly with `Polyline` causes severe performance degradation. We implemented a Douglas-Peucker-based track simplification algorithm:

```ts
// utils/track-simplify.ts

interface Point {
  lat: number
  lng: number
  timestamp?: number
}

/**
 * Track simplification using perpendicular distance
 * Simplified Douglas-Peucker algorithm
 */
export function simplifyTrack(points: Point[], tolerance: number = 0.0001): Point[] {
  if (points.length <= 2) return points

  // Find the point farthest from the line connecting start and end
  let maxDist = 0
  let maxIdx = 0
  const first = points[0]
  const last = points[points.length - 1]

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last)
    if (dist > maxDist) {
      maxDist = dist
      maxIdx = i
    }
  }

  // If max distance exceeds threshold, split recursively
  if (maxDist > tolerance) {
    const left = simplifyTrack(points.slice(0, maxIdx + 1), tolerance)
    const right = simplifyTrack(points.slice(maxIdx), tolerance)
    return [...left.slice(0, -1), ...right]
  }

  return [first, last]
}

function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const { lat: x, lng: y } = point
  const { lat: x1, lng: y1 } = lineStart
  const { lat: x2, lng: y2 } = lineEnd

  const numerator = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1)
  const denominator = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2)

  return denominator === 0 ? 0 : numerator / denominator
}
```

**Result**: For a sales rep with 8,600 coordinate points in a single day, simplification reduced it to just 312 points (a 96% compression ratio) while still preserving the route's essential shape. Map rendering went from choppy to smooth.

### Vue Component Integration

```vue
<!-- Usage Example -->
<template>
  <div class="tracking-dashboard">
    <div ref="mapContainer" class="map-container" />
    <div class="sidebar">
      <h3>{{ t('tracking.onlineSales') }}</h3>
      <div v-for="pos in Object.values(latestPositions)" :key="pos.userId" class="sales-item">
        <span class="dot" :class="statusClass(pos.status)" />
        <span>{{ getSalesName(pos.userId) }}</span>
        <span class="time">{{ formatTime(pos.timestamp) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRealtimeTracking } from '~/composables/useRealtimeTracking'
import { useBMapTracking } from '~/composables/useBMapTracking'
import { simplifyTrack } from '~/utils/track-simplify'

const mapContainer = ref<HTMLElement>()
const mapInstance = ref<any>(null)

const {
  isConnected,
  latestPositions,
  trackCache,
  connect,
} = useRealtimeTracking({
  wsUrl: `wss://api.example.com/ws/tracking?token=${getToken()}`,
})

const {
  drawTrack,
  adjustViewport,
} = useBMapTracking({
  mapInstance,
  trackColor: '#3b82f6',
})

onMounted(() => {
  const BMapGL = (window as any).BMapGL
  mapInstance.value = new BMapGL.Map(mapContainer.value)
  mapInstance.value.centerAndZoom(new BMapGL.Point(114.0579, 22.5431), 12)
  mapInstance.value.enableScrollWheelZoom()

  connect()
})

watch(
  () => trackCache,
  (cache) => {
    Object.entries(cache).forEach(([userId, points]) => {
      if (points.length < 2) return
      const simplified = simplifyTrack(points, 0.00015)
      drawTrack(userId, simplified)
    })
  },
  { deep: true, flush: 'post' }
)
</script>
```

## Pitfalls and Lessons Learned

### 1. Baidu Maps Coordinate System Conversion

**Problem**: Third-party location SDKs (e.g., iOS positioning) return WGS84 coordinates, while Baidu Maps uses the BD09 coordinate system. Plotting WGS84 coordinates directly on Baidu Maps results in an offset of approximately 500-800 meters.

**Solution**: Perform the coordinate conversion server-side before pushing to clients. Since the same rep's location is consumed by many clients, doing the conversion once on the server is far more efficient. If client-side conversion is unavoidable, use Baidu Maps' `BMapGL.Convertor.translate` API for batch conversion.

### 2. Map Lag with Too Many Markers

**Problem**: Tracking 20+ sales reps simultaneously means each rep has a route line, start marker, end marker, and movement animation — the frame rate drops significantly.

**Three-pronged solution**:

1. **Track simplification** (implemented) — compress 8,600 points down to ~300
2. **Don't render off-screen routes** — use `addOverlay` with `enableMassClear` and listen to the `mapmoveend` event to dynamically compute which reps are in the current viewport. Skip drawing routes outside the viewport
3. **Marker clustering** — use `BMapGL.MarkerClusterer` when reps cluster in the same area (e.g., the same office building)

### 3. WebSocket Heartbeat and Overload Protection

**Problem**: The seemingly simple heartbeat mechanism led to two real incidents:

- First incident: Heartbeat interval was set to 30 seconds. During a network fluctuation, Nginx disconnected after 60 seconds (its `proxy_read_timeout` was configured to 60s). The client didn't detect the disconnection until the next heartbeat, resulting in a 30-second "zombie connection" window
- Second incident: When the server restarted, all clients reconnected simultaneously and sent subscription requests, overwhelming the server with thousands of concurrent requests

**Solution**:

```ts
// Heartbeat: shorten interval to 15 seconds
const HEARTBEAT_INTERVAL = 15000

function startHeartbeat() {
  heartbeatTimer = setInterval(() => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ type: 'ping' }))
    }
  }, HEARTBEAT_INTERVAL)
}

// Exponential backoff + random jitter
function attemptReconnect() {
  const baseDelay = 2000
  const jitter = Math.random() * 2000
  const delay = Math.min(baseDelay * Math.pow(1.5, retryCount), 30000) + jitter
  setTimeout(() => connect(), delay)
}
```

**Key fixes**:
- Heartbeat at 15 seconds, well below Nginx's 60-second timeout, ensuring fast detection of disconnections
- Exponential backoff with random jitter to prevent the "thundering herd" problem when the server recovers

### 4. WebSocket Authentication and Security

**Problem**: The safest way to pass auth tokens during WebSocket connection setup is through the URL, but this exposes the token in plain text in Nginx access logs.

**Solution**: Implement two-step verification — first obtain a short-lived WebSocket Ticket (5-minute validity) via an HTTP request, then use the ticket to establish the WebSocket connection. Even if the ticket leaks, an attacker has only a 5-minute window.

```ts
async function connectWithTicket() {
  // Step 1: Get a temporary ticket from the REST API
  const resp = await fetch('/api/ws/ticket', {
    headers: { Authorization: `Bearer ${token}` }
  })
  const { ticket } = await resp.json()

  // Step 2: Use the ticket to establish WebSocket
  const socket = new WebSocket(`wss://api.example.com/ws?ticket=${ticket}`)
  // ...
}
```

### 5. Mobile Map Performance

**Problem**: In DingTalk's built-in browser and Android WebView, Baidu Maps rendering performance was significantly worse than on desktop. Route movement animations were noticeably janky.

**Solution**:
- Reduce track point density on mobile: adjust simplification threshold from `0.0001` to `0.0003`
- Disable map animations temporarily: call `map.disableDragging()` during route playback
- Use `requestAnimationFrame` to control route playback pacing instead of `setInterval`

## Performance Benchmark

After optimization, we ran stress tests on the system:

| Metric | Before | After |
| --- | --- | --- |
| Simultaneous tracked reps | 20 | 50 |
| Max track points per rep | Full draw (laggy) | < 500 after simplification |
| Map FPS (20 reps moving) | ~18fps | 55-60fps |
| Track playback load time (24h) | 4-6s | 0.8-1.2s |
| WebSocket connection stability | Silent disconnections | 15s heartbeat coverage, auto-reconnect |
| Mobile page FPS | ~12fps | 35-45fps |

## Summary

This feature went through three months of iteration from requirements review to production deployment. Looking back, the key decisions that made the biggest impact were:

1. **Server-side coordinate conversion** proved more reliable than client-side conversion, eliminating cross-platform inconsistencies
2. **Track simplification wasn't optional — it was mandatory**. There's no smooth rendering without it
3. **WebSocket heartbeat and reconnection must be meticulously designed** — don't rely on library defaults
4. **Separate mobile degradation strategy** — pursue precision on desktop, prioritize usability on mobile

Whenever I think about this project, I'm reminded that drawing a single icon on a map is trivial. But turning that icon into a clear movement route, then into a real-time dashboard supporting dozens of concurrent users — every layer has its own unique pitfalls waiting to be discovered.

> There's no single right answer in architecture — only the choice that best fits your scenario. For real-time route tracking, the answer boils down to: **stable data flow, lightweight rendering, instant anomaly detection.** These twelve words capture what this project taught us.
