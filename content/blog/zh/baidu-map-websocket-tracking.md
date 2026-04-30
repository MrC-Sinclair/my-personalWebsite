---
title: 「集成百度地图与 WebSocket」：绘出业务员行动轨迹的实时追踪方案
description: 从经营分析系统的实际需求出发，详解如何将百度地图与 WebSocket 实时数据流结合，实现业务员轨迹绘制、回放与异常预警，涵盖技术选型、架构设计、核心实现与踩坑记录。
date: '2024-01-10'
tags:
  - 百度地图
  - WebSocket
  - 实时数据
  - 轨迹追踪
  - Vue3
category: 前端
draft: false
---

## 背景：从业务痛点说起

在经营分析系统的开发中，我们接到一个关键需求：**管理层需要实时掌握业务员的外勤动态**。

场景是这样的——销售团队每天有数十名业务员外出拜访客户，管理者只能在日报中看到拜访结果，对拜访过程中的路线、停留时长、是否按计划执行一无所知。业务员是否按时到达了预定客户？是否在某个地点停留过久？有没有偏离预定路线？这些信息全部是盲区。

产品经理给出的目标很明确：

1. 在地图上**实时显示**每位业务员的位置
2. 自动绘制业务员的**行动轨迹**，支持查看历史路线
3. 对异常行为（偏离区域、超时停留）触发**实时预警**
4. 支持 PC 后台、钉钉、移动端多端查看

## 方案选型：定位上报与地图渲染的决策

### 地图 SDK 选型

当时主要考虑百度地图和高德地图，两者都是国内主流选择：

| 维度 | 百度地图 | 高德地图 |
| --- | --- | --- |
| API 易用性 | 文档完善，Vue 生态有 `vue-baidu-map` | API 设计简洁，社区活跃 |
| 坐标体系 | BD09（需额外转换） | GCJ02 |
| 轨迹绘制 API | 提供 `Polyline`、`Polygon`、`DrivingRoute` | 类似能力 |
| 企业级商用授权 | 有明确报价体系 | 有明确报价体系 |
| 团队熟悉度 | **团队已有项目使用过** | 零基础 |

最终选择百度地图，最直接的原因是团队已有使用经验，且项目中已有封装好的地图组件库可复用。

### 实时通信方案选型

实现实时定位，前端需要与后端建立长连接，轮询 vs 长连接的问题又摆上桌面：

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| HTTP 轮询（短轮询） | 实现简单，兼容性好 | 延迟高，服务端压力大，频繁请求无效 |
| HTTP 长轮询 | 相比短轮询减少请求次数 | 仍然有连接重建开销，服务端资源占用高 |
| **WebSocket** | 全双工通信，低延迟，二进制支持 | 需要 ws 服务端支持，连接管理复杂 |
| SSE | 原生支持断线重连，单向更轻量 | 服务端到客户端单向，不支持客户端主动发 |

WebSocket 胜出，因为定位数据是**双向交互**的：前端不仅要接收位置推送，还要上报坐标、控制订阅范围。全双工能力是刚需。

### 技术选型总结

```
地图层:  百度地图 JavaScript API v3.0 + vue-baidu-map 封装
通信层:  WebSocket (原生 WebSocket API)
数据层:  JSON 格式定位数据包，含经纬度、时间戳、业务员 ID、状态
视图层:  Vue3 + Composition API，地图组件抽象为 composable
```

## 架构设计

### 整体数据流

```
┌─────────────────────────────────────────────────────────────┐
│                    前端 (Vue3 SPA)                           │
│  ┌────────────┐    ┌──────────────┐    ┌────────────────┐   │
│  │ 地图组件     │    │ 轨迹控制面板  │    │ 异常预警组件    │   │
│  │ (BMapGL)    │    │ (回放/筛选)   │    │ (通知/弹窗)    │   │
│  └──────┬──────┘    └──────┬───────┘    └───────┬────────┘   │
│         │                  │                    │            │
│  ┌──────▼──────────────────▼────────────────────▼────────┐  │
│  │              useRealtimeTracking (composable)          │  │
│  │   ┌──────────┐  ┌──────────┐  ┌─────────────────────┐  │  │
│  │   │ 连接管理  │  │ 坐标缓存  │  │ 数据聚合与轨迹生成  │  │  │
│  │   │ (重连)    │  │ (滑动窗口)│  │ (抽稀/压缩)        │  │  │
│  │   └─────┬────┘  └──────────┘  └─────────────────────┘  │  │
│  └─────────┼───────────────────────────────────────────────┘  │
└────────────┼───────────────────────────────────────────────────┘
             │ WebSocket (wss://)
┌────────────▼───────────────────────────────────────────────────┐
│                      Nginx / WebSocket Proxy                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                   后端 WebSocket 服务                            │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ 连接管理  │  │ 会话状态  │  │ 定位数据    │  │ 轨迹持久化   │  │
│  │ (Channel) │  │ (Redis)  │  │ 广播推送    │  │ (PostgreSQL) │  │
│  └──────────┘  └──────────┘  └────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

核心设计原则：

- **连接管理与业务逻辑分离**：WebSocket 的生命周期（建立、心跳、重连）由 composable 统一管理，业务组件只关心数据和状态
- **前端缓冲 + 后端推送**：后端以 2-5 秒为间隔推送业务员实时位置，前端维护滑动窗口按需绘制轨迹
- **轨迹数据按需加载**：默认只加载当天轨迹，历史轨迹通过面板筛选后懒加载

### WebSocket 消息协议

我们设计了一套简洁的消息协议：

```json
// 服务端 → 客户端：位置更新
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

// 客户端 → 服务端：请求历史轨迹
{
  "type": "request_history",
  "data": {
    "userId": "1001",
    "startTime": 1714464000000,
    "endTime": 1714550400000
  }
}

// 服务端 → 客户端：历史轨迹响应
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

## 关键实现

### WebSocket 连接管理与自动重连

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

  // 维护所有业务员的最新位置
  const latestPositions = reactive<Record<string, LocationPoint>>({})

  // 轨迹缓存：按 userId 存储坐标点列表（滑动窗口，最多 5000 点）
  const trackCache = reactive<Record<string, LocationPoint[]>>({})
  const TRACK_MAX_POINTS = 5000

  // 消息回调注册表
  const handlers = new Map<string, (data: unknown) => void>()

  function connect() {
    if (ws.value?.readyState === WebSocket.OPEN) return

    const socket = new WebSocket(wsUrl)
    ws.value = socket

    socket.onopen = () => {
      isConnected.value = true
      reconnectCount.value = 0
      console.log('[WS] 连接建立')
    }

    socket.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data)
        const handler = handlers.get(message.type)
        if (handler) {
          handler(message.data)
        }
      } catch (err) {
        console.error('[WS] 消息解析失败:', err)
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
      console.error('[WS] 已达最大重连次数')
      return
    }
    reconnectCount.value++
    console.log(`[WS] 尝试重连 (${reconnectCount.value}/${maxReconnects})...`)
    setTimeout(() => connect(), reconnectInterval * reconnectCount.value)
  }

  // 注册消息处理器
  function on(type: string, handler: (data: unknown) => void) {
    handlers.set(type, handler)
  }

  // 发送消息
  function send(type: string, data: unknown) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ type, data }))
    }
  }

  // 处理位置更新：维护轨迹缓存
  function handleLocationUpdate(data: LocationPoint) {
    // 更新最新位置
    latestPositions[data.userId] = data

    // 追加到轨迹缓存
    if (!trackCache[data.userId]) {
      trackCache[data.userId] = []
    }
    trackCache[data.userId].push(data)

    // 滑动窗口截断，防止内存溢出
    if (trackCache[data.userId].length > TRACK_MAX_POINTS) {
      trackCache[data.userId] = trackCache[data.userId].slice(-TRACK_MAX_POINTS)
    }
  }

  // 注册默认的位置更新处理器
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

关键设计点：

- **滑动窗口缓存**：每个业务员最多保留 5000 个坐标点，超过时截断旧数据，防止内存持续增长
- **增量重连**：重连间隔随失败次数递增（3s、6s、9s...），避免服务恢复时所有客户端同时冲击
- **消息路由模式**：通过 `handlers` Map 实现类型路由，比 `switch-case` 更易扩展

### 百度地图轨迹绘制

```ts
// composables/useBMapTracking.ts
import { ref, watch, onMounted, type Ref } from 'vue'

interface TrackOptions {
  mapInstance: Ref<any>            // BMapGL.Map 实例
  trackColor?: string
  trackWidth?: number
  markerIcon?: string
}

export function useBMapTracking(options: TrackOptions) {
  const { mapInstance, trackColor = '#3b82f6', trackWidth = 4 } = options

  // 存储当前地图上的所有轨迹线和标注点
  const overlays = ref<Array<{ userId: string; polyline: any; marker: any }>>([])

  // 绘制单个业务员轨迹
  function drawTrack(userId: string, points: Array<{ lat: number; lng: number }>) {
    if (!mapInstance.value || points.length < 2) return

    // 清除该业务员之前的轨迹
    clearTrack(userId)

    const BMapGL = (window as any).BMapGL

    // 构建坐标点数组
    const path = points.map(p => new BMapGL.Point(p.lng, p.lat))

    // 绘制轨迹线
    const polyline = new BMapGL.Polyline(path, {
      strokeColor: trackColor,
      strokeWeight: trackWidth,
      strokeOpacity: 0.8,
      enableEditing: false,
      enableMassClear: true,
    })

    // 绘制起点标记（圆形）
    const startPoint = path[0]
    const startMarker = new BMapGL.Marker(startPoint, {
      icon: new BMapGL.Symbol(BMapGL.Symbol.CIRCLE, {
        scale: 6,
        strokeColor: trackColor,
        fillColor: '#fff',
        fillOpacity: 1,
      }),
      title: `起点`,
    })

    // 绘制终点标记（含业务员头像）
    const endPoint = path[path.length - 1]
    const endMarker = new BMapGL.Marker(endPoint, {
      title: `业务员 ${userId}`,
    })

    // 为终点标记添加信息窗口
    const infoWindow = new BMapGL.InfoWindow(
      `<div class="track-info">
        <p><strong>业务员 ID：</strong>${userId}</p>
        <p><strong>坐标：</strong>${endPoint.lat.toFixed(4)}, ${endPoint.lng.toFixed(4)}</p>
        <p><strong>轨迹点数：</strong>${points.length}</p>
      </div>`,
      { width: 260, height: 120 }
    )
    endMarker.addEventListener('click', () => {
      endMarker.openInfoWindow(infoWindow)
    })

    // 添加到地图
    mapInstance.value.addOverlay(polyline)
    mapInstance.value.addOverlay(startMarker)
    mapInstance.value.addOverlay(endMarker)

    overlays.value.push({ userId, polyline, marker: endMarker })

    // 自动调整视野以包含所有轨迹
    adjustViewport()
  }

  // 清除单个业务员轨迹
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

  // 清除所有轨迹
  function clearAll() {
    overlays.value.forEach(({ polyline, marker }) => {
      if (mapInstance.value) {
        mapInstance.value.removeOverlay(polyline)
        mapInstance.value.removeOverlay(marker)
      }
    })
    overlays.value = []
  }

  // 自动调整视野
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

### 轨迹抽稀：减少不必要绘制

业务员每 2-5 秒上报一次位置，一天下来可能积累上万个坐标点。直接用 `Polyline` 绘制全部点会导致性能问题。我们实现了基于 Douglas-Peucker 算法的轨迹抽稀：

```ts
// utils/track-simplify.ts

interface Point {
  lat: number
  lng: number
  timestamp?: number
}

/**
 * 基于垂直距离的轨迹抽稀
 * Douglas-Peucker 算法简化版
 */
export function simplifyTrack(points: Point[], tolerance: number = 0.0001): Point[] {
  if (points.length <= 2) return points

  // 找到距离首尾连线最远的点
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

  // 如果最大距离大于阈值，则递归分割
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

**效果**：以某业务员一天 8600 个坐标点为例，抽稀后仅 312 个点（压缩比 96%）仍然能还原轨迹的主要形态，地图绘制性能从卡顿变为流畅。

### 与 Vue 组件集成

```vue
<!-- 使用示例 -->
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
  // 初始化百度地图
  const BMapGL = (window as any).BMapGL
  mapInstance.value = new BMapGL.Map(mapContainer.value)
  mapInstance.value.centerAndZoom(new BMapGL.Point(114.0579, 22.5431), 12)
  mapInstance.value.enableScrollWheelZoom()

  // 建立 WebSocket 连接
  connect()
})

// 当轨迹缓存更新时，重新绘制轨迹
watch(
  () => trackCache,
  (cache) => {
    Object.entries(cache).forEach(([userId, points]) => {
      if (points.length < 2) return

      // 抽稀轨迹点
      const simplified = simplifyTrack(points, 0.00015)
      drawTrack(userId, simplified)
    })
  },
  { deep: true, flush: 'post' }
)
</script>
```

## 踩坑与经验

### 1. 百度地图坐标体系转换

**问题**：第三方定位 SDK（如 iOS 定位）返回的是 WGS84 坐标，而百度地图使用 BD09 坐标系，直接绘制会有约 500-800 米的偏移。

**解决方案**：在服务端统一转换成 BD09 后再推送，前端不做坐标转换——因为同一个业务员的位置会被多个客户端消费，在服务端做一次转换更合理。如果必须在前端处理，可以使用百度地图提供的 `BMapGL.Convertor.translate` 接口批量转换。

### 2. 大量标注点导致地图卡顿

**问题**：当同时追踪 20+ 业务员时，每个业务员都包含轨迹线、起点标注、终点标注、移动动画，页面帧率明显下降。

**解决方案三板斧**：

1. **轨迹抽稀**（已实现）—— 把 8600 点压缩到 300 点
2. **视野外不绘制**—— 利用百度地图的 `addOverlay` 配合 `enableMassClear`，再结合 `mapmoveend` 事件动态计算哪些业务员在当前视野内，视野外的轨迹线延迟加载
3. **Marker 集群**—— 如果业务员在视图上聚集（如同一写字楼），使用 `BMapGL.MarkerClusterer` 进行标注点聚合

### 3. WebSocket 心跳与过载保护

**问题**：实现看似简单的心跳却踩了两次坑：

- 第一次：心跳间隔设为 30 秒，但某次网络波动导致服务端 Nginx 在 60 秒后主动断连（配置的 `proxy_read_timeout` 为 60s），客户端在断连前未发送任何请求，直到下一次心跳才感知断开，期间有 30 秒的"假连接"状态
- 第二次：服务端重启时，所有客户端同时重连并发送订阅请求，造成服务端瞬间承载数千个请求而崩溃

**解决方案**：

```ts
// 心跳：将间隔缩短到 15 秒
const HEARTBEAT_INTERVAL = 15000

function startHeartbeat() {
  heartbeatTimer = setInterval(() => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ type: 'ping' }))
    }
  }, HEARTBEAT_INTERVAL)
}

// 指数退避 + 随机抖动
function attemptReconnect() {
  const baseDelay = 2000
  const jitter = Math.random() * 2000
  const delay = Math.min(baseDelay * Math.pow(1.5, retryCount), 30000) + jitter
  setTimeout(() => connect(), delay)
}
```

**关键修复**：
- 心跳间隔 15 秒，远小于 Nginx 60 秒超时，确保连接断开时能快速感知
- 重连使用指数退避 + 随机抖动（jitter），避免服务恢复时的"惊群效应"

### 4. WebSocket 跨域与鉴权

**问题**：WebSocket 在建立连接时携带 Token 鉴权最安全的做法是在 URL 中传递，但 Token 会明文暴露在 Nginx 日志中。

**解决方案**：采用两步验证——先通过 HTTP 请求获取一个短期有效的 WebSocket Ticket（有效期 5 分钟），再用 Ticket 建立 WebSocket 连接。即使 Ticket 泄露，攻击者也只有 5 分钟窗口。

```ts
async function connectWithTicket() {
  // 第一步：从 REST API 获取临时 Ticket
  const resp = await fetch('/api/ws/ticket', {
    headers: { Authorization: `Bearer ${token}` }
  })
  const { ticket } = await resp.json()

  // 第二步：使用 Ticket 建立 WebSocket
  const socket = new WebSocket(`wss://api.example.com/ws?ticket=${ticket}`)
  // ...
}
```

### 5. 移动端地图性能

**问题**：在钉钉内置浏览器和 Android WebView 中，百度地图的渲染性能明显差于 PC 端，轨迹移动动画卡顿明显。

**解决方案**：
- 移动端降低轨迹点密度：抽稀阈值从 `0.0001` 调整为 `0.0003`
- 关闭地图动画效果：`map.disableDragging()` 在轨迹回放时临时禁用手势操作
- 使用 `requestAnimationFrame` 控制轨迹推进节奏，而不是依赖 `setInterval`

## 性能表现

在优化完成后，我们对系统进行了实际压测：

| 指标 | 优化前 | 优化后 |
| --- | --- | --- |
| 同时追踪业务员数量 | 20 人 | 50 人 |
| 单业务员最高轨迹点数 | 全量绘制（卡顿） | 抽稀后 < 500 点 |
| 地图帧率（20 人同时移动） | ~18fps | 55-60fps |
| 轨迹回放加载延迟（24h） | 4-6 秒 | 0.8-1.2 秒 |
| WebSocket 连接稳定性 | 偶发断连无感知 | 15 秒心跳兜底，断线自动重连 |
| 移动端页面帧率 | ~12fps | 35-45fps |

## 总结

这个功能从需求评审到上线，前后经历了三个月迭代。回头看，几个关键决策对最终效果影响最大：

1. **服务端统一坐标转换**比前端转换更可靠，减少了多端不一致的问题
2. **轨迹抽稀不是可选项而是刚需**，没有抽稀就谈不了流畅绘制
3. **WebSocket 的心跳 + 重连必须精细设计**，不能简单用开源库的默认配置
4. **移动端单独降级策略**——在 PC 上追求精细体验，在移动端追求可用性

写代码时我经常想，如果只是一个简单的"在地图上画个图标"，那确实不难。但从一个图标变成一条清晰的行动轨迹，再到支撑数十人并发的实时看板，每一层都有它独特的坑等着你去填。

> 技术方案没有标准答案，只有最适配当前场景的选择。对实时轨迹追踪来说，它的答案就是：**数据流要稳，地图绘制要轻，异常感知要快。** 这十二个字，就是我们这个项目最真实的总结。
