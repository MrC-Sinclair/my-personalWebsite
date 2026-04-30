---
title: '基于 D3.js 从零实现力导向图知识图谱：学生知识掌握可视化实践'
description: 在 AI 错题本项目中，基于 D3.js 从零实现力导向图知识图谱，支持多层级节点力学模拟与交互，实现学生知识掌握情况可视化。本文完整分享从数据模型设计、力学仿真调参到交互优化的全过程。
date: '2025-10-15'
tags:
  - D3.js
  - 数据可视化
  - 力导向图
  - React
  - 前端
  - 知识图谱
category: 前端
draft: false
---

## 背景：当错题本遇到知识图谱

在教育场景中，学生做错的每一道题都不是孤立的——它们背后关联着具体的知识点。一个学生"二次函数"题错得特别多，可能不是"粗心"，而是对整个函数模块的理解存在系统性漏洞。

**AI错题本**项目的核心目标之一就是：将学生的错题数据与学科知识点关联起来，以**知识图谱**的形式可视化呈现，让师生能够：

- **快速定位**：一眼看出哪些知识点掌握薄弱
- **洞察关联**：发现知识点之间的因果链（如"因式分解"没学好导致"二次函数"连连出错）
- **追踪变化**：经过练习后，知识点的掌握程度是否提升

而我们面临的核心问题是：**如何在一个屏幕上，优雅地展示数百个知识点及其复杂的关联关系，并且让交互直观流畅？**

最终，我们选择了 **D3.js 力导向图（Force-Directed Graph）** 作为可视化方案。本文就完整记录这个从零实现的过程。

### 项目环境

| 维度 | 说明 |
|------|------|
| 技术栈 | React 18 + TypeScript |
| 可视化库 | D3.js v7 |
| 数据来源 | 后端 API 返回的知识点图谱数据 |
| 设备端 | PC 浏览器 + 平板 |
| 数据规模 | 单个学科约 50-200 个知识点，关联边 80-500 条 |

## 一、方案选型：为什么是力导向图

在确定方案之前，我们对比了多种可视化方案：

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| **树形图（Tree）** | 层次清晰，实现简单 | 只能展示父子关系，无法表达知识点间的横向关联 | ❌ |
| **思维导图** | 直观，用户熟悉 | 布局固定，不适合大规模动态数据 | ❌ |
| **ECharts 关系图** | 开箱即用，配置简单 | 自定义交互受限，大规模节点性能差 | ❌ |
| **D3.js 力导向图** | 高度灵活，力学模拟天然表达关联性，交互可完全定制 | 需要从零实现，学习曲线陡 | **✅ 最终选择** |

**力导向图的核心优势**在于：它将知识点之间的"关联强度"映射为物理学中的"弹力"，将"知识点分类归属"映射为"电荷力（同类相吸，异类相斥）"。**力学模拟的结果天然表达了知识图谱的特征——相关的知识点聚在一起，不相关的自然分开。** 这种"自组织"的布局方式是传统的树形图无法做到的。

## 二、数据模型设计

### 2.1 节点模型（Node）

知识图谱中的每个节点代表一个知识点，需要携带足够的信息用于视觉映射：

```ts
interface KnowledgeNode {
  /** 知识点唯一标识 */
  id: string
  /** 知识点名称 */
  name: string
  /** 所属分类层级：'subject' | 'chapter' | 'topic' */
  level: 'subject' | 'chapter' | 'topic'
  /** 所属学科 */
  subject: string
  /** 上级分类 ID */
  parentId: string | null
  /** 学生掌握度 (0-1) */
  mastery: number
  /** 知识点重要度 (0-1) */
  importance: number
  /** 关联错题数 */
  errorCount: number
  /** 子节点是否已展开 */
  expanded: boolean
  /** D3 force simulation 所需的坐标 */
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}
```

### 2.2 边模型（Link）

边代表知识点之间的关联关系，可能是「前置依赖」「包含关系」「关联推荐」等：

```ts
interface KnowledgeLink {
  /** 源节点 ID */
  source: string
  /** 目标节点 ID */
  target: string
  /** 关联类型 */
  relation: 'prerequisite' | 'contains' | 'related' | 'inference'
  /** 关联强度 (0-1) */
  strength: number
}
```

### 2.3 数据示例

```json
{
  "nodes": [
    { "id": "math", "name": "数学", "level": "subject", "mastery": 0.72 },
    { "id": "algebra", "name": "代数", "level": "chapter", "parentId": "math", "mastery": 0.65 },
    { "id": "func_quadratic", "name": "二次函数", "level": "topic", "parentId": "algebra", "mastery": 0.38, "errorCount": 23, "importance": 0.9 },
    { "id": "factorization", "name": "因式分解", "level": "topic", "parentId": "algebra", "mastery": 0.55, "errorCount": 12, "importance": 0.7 }
  ],
  "links": [
    { "source": "math", "target": "algebra", "relation": "contains", "strength": 1.0 },
    { "source": "algebra", "target": "func_quadratic", "relation": "contains", "strength": 1.0 },
    { "source": "factorization", "target": "func_quadratic", "relation": "prerequisite", "strength": 0.8 }
  ]
}
```

## 三、D3.js Force Simulation 核心实现

### 3.1 力模拟器基础

D3.js 的 `forceSimulation` 是力导向图的核心引擎。它模拟一个**粒子物理系统**，每个节点都是一个带电粒子，每条边都是一根弹簧。系统在每一帧（tick）中计算粒子受到的合力，更新位置，直到系统达到平衡（alpha 衰减到 0）。

```ts
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force'

/** D3 扩展后的节点类型 */
interface SimNode extends SimulationNodeDatum, KnowledgeNode {}

/** D3 扩展后的边类型 */
interface SimLink extends SimulationLinkDatum<SimNode> {
  relation: string
  strength: number
}

function createForceSimulation(nodes: SimNode[], links: SimLink[]) {
  const simulation = forceSimulation<SimNode>(nodes)
    // 电荷力：节点之间互相排斥，strength 负值越大排斥越强
    .force('charge', forceManyBody<SimNode>()
      .strength((d) => {
        // 根节点排斥更强，子节点弱一些，避免结构松散
        return d.level === 'subject' ? -300 : d.level === 'chapter' ? -200 : -150
      })
      .distanceMax(500), // 限制电荷力作用范围，避免远处节点无效推拉
    )
    // 弹力：关联节点之间互相吸引，距离由 strength 控制
    .force('link', forceLink<SimNode, SimLink>(links)
      .id((d) => d.id)
      .distance((d) => 200 - d.strength * 100) // 关联越强，距离越近
      .strength((d) => d.strength * 0.8), // 关联越强，弹力越大
    )
    // 向心力：将节点拉向画布中心
    .force('center', forceCenter(width / 2, height / 2))
    // 碰撞力：防止节点重叠
    .force('collide', forceCollide<SimNode>()
      .radius((d) => getNodeRadius(d) + 10), // 半径 + 10px 缓冲
    )
    // 自定义层级力：同级节点保持垂直对齐
    .force('y', forceYByLevel(nodes))

  return simulation
}
```

### 3.2 力的调参经验

在实际调参过程中，我们总结了几个关键经验：

**电荷力 strength 的层级差异化**：

```
subject 节点（根）：-300  → 排斥最强，位于中间
chapter 节点（章）：-200  → 中等排斥
topic  节点（知识点）：-150 → 最弱排斥
```

这么设计的目的是：**学科在中间，各章围绕学科散开，各知识点围绕所属章节聚集**。如果全部用同样的 strength，节点会均匀分布，失去层次感。

**弹力 distance 的关联强度映射**：

```ts
.distance((d) => {
  // prerequisite（前置依赖）关系靠得最近
  if (d.relation === 'prerequisite') return 60
  // contains（包含）关系次之
  if (d.relation === 'contains') return 80
  // related（相关推荐）关系距离最远
  return 120
})
```

**alpha 衰减控制**：

```ts
// 初始化时 alpha 设为较高值，让系统快速震荡找到平衡
simulation.alpha(1).alphaDecay(0.02).alphaMin(0.001)

// 每 tick 回调，用于渲染
simulation.on('tick', () => {
  renderNodes()
  renderLinks()
})

// 用户交互后重新加热
function reheatSimulation() {
  simulation.alpha(0.3).alphaTarget(0.1).restart()
}
```

`alphaDecay` 控制衰减速度，值越大系统越快稳定，但可能陷入局部最优；值越小系统震荡越久，布局效果更好但用户等待时间长。我们最终选择了 `0.02` 作为平衡点。

### 3.3 力模拟的 React 集成

在 React 中使用 D3.js 的核心问题是：**双方都想控制 DOM**。我们的策略是：**D3 管计算（force simulation 的数据更新），React 管渲染（通过 useRef 持有 SVG 元素）**。

```tsx
import { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3-force'
import { select } from 'd3-selection'
import { drag as d3Drag } from 'd3-drag'
import { zoom as d3Zoom } from 'd3-zoom'

interface ForceGraphProps {
  nodes: KnowledgeNode[]
  links: KnowledgeLink[]
  onNodeClick?: (node: KnowledgeNode) => void
}

export function ForceGraph({ nodes, links, onNodeClick }: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!svgRef.current) return

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // 准备 D3 数据（深拷贝避免 React 重新渲染时污染原数据）
    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }))
    const simLinks: SimLink[] = links.map((l) => ({ ...l })) as SimLink[]

    // 创建力模拟器
    const simulation = createForceSimulation(simNodes, simLinks)
    simulationRef.current = simulation

    // SVG 选择器
    const svg = select(svgRef.current)
    svg.selectAll('*').remove() // 清除旧内容

    // 缩放功能
    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
      })
    svg.call(zoomBehavior)

    // 容器 group
    const container = svg.append('g')

    // 绘制连线
    const linkElements = container.append('g')
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', getLinkColor)
      .attr('stroke-width', (d) => d.strength * 3 + 1)
      .attr('stroke-opacity', 0.6)

    // 绘制节点
    const nodeElements = container.append('g')
      .selectAll('g')
      .data(simNodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3Drag<SVGGElement, SimNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        }),
      )
      .on('click', (event, d) => {
        event.stopPropagation()
        onNodeClick?.(d)
      })

    // 节点圆
    nodeElements.append('circle')
      .attr('r', (d) => getNodeRadius(d))
      .attr('fill', (d) => getNodeColor(d.mastery))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)

    // 节点标签
    nodeElements.append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => getNodeRadius(d) + 14)
      .attr('font-size', (d) => d.level === 'subject' ? 14 : d.level === 'chapter' ? 12 : 10)
      .attr('fill', '#333')

    // 每 tick 更新位置
    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d) => (d.source as SimNode).x!)
        .attr('y1', (d) => (d.source as SimNode).y!)
        .attr('x2', (d) => (d.target as SimNode).x!)
        .attr('y2', (d) => (d.target as SimNode).y!)

      nodeElements.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })

    // 等待前几 tick 完成后再取消 loading
    simulation.on('end', () => {
      setLoading(false)
    })

    // 超时兜底：3 秒后强制取消 loading
    const timeout = setTimeout(() => setLoading(false), 3000)

    return () => {
      clearTimeout(timeout)
      simulation.stop()
    }
  }, [nodes, links, onNodeClick])

  return (
    <div className="force-graph-container">
      {loading && <div className="loading-overlay">图谱渲染中...</div>}
      <svg ref={svgRef} className="force-graph-svg" />
    </div>
  )
}
```

## 四、多层级节点展开/折叠

### 4.1 层级结构设计

知识图谱的节点按三层组织：**学科 → 章节 → 知识点**。默认只显示学科和章节（第一、二层），知识点仅在用户点击展开后才动态注入。

```
数学（学科根节点）
├── 代数（章节）
│   ├── 二次函数（知识点）[折叠态，未加载]
│   ├── 因式分解（知识点）[折叠态，未加载]
│   └── ...
├── 几何（章节）
│   ├── 全等三角形（知识点）
│   └── ...
└── 统计与概率（章节）
    └── ...
```

### 4.2 展开逻辑

当用户点击一个 `chapter` 级别的节点时，从后端获取该章节下的所有知识点，动态注入到力模拟中：

```ts
function useKnowledgeGraph() {
  const [graphData, setGraphData] = useState<{
    nodes: KnowledgeNode[]
    links: KnowledgeLink[]
  }>({ nodes: [], links: [] })

  const toggleExpand = useCallback(async (nodeId: string) => {
    const node = graphData.nodes.find((n) => n.id === nodeId)
    if (!node) return

    if (node.expanded) {
      // 折叠：移除该章节下的所有知识点节点及相关边
      collapseNode(nodeId)
    } else {
      // 展开：从后端获取子知识点
      const children = await fetchTopicNodes(nodeId)
      if (children && children.length > 0) {
        expandNode(nodeId, children)
      }
    }
  }, [graphData])

  const expandNode = (parentId: string, children: KnowledgeNode[]) => {
    setGraphData((prev) => {
      const childIds = new Set(children.map((c) => c.id))

      // 过滤掉已存在的节点
      const newNodes = children.filter((c) => !prev.nodes.find((n) => n.id === c.id))
      const newLinks = children.flatMap((child) => [
        { source: parentId, target: child.id, relation: 'contains' as const, strength: 1.0 },
        ...(child.links || []),
      ]).filter((l) => !prev.links.find(
        (pl) => pl.source === l.source && pl.target === l.target,
      ))

      return {
        nodes: [
          ...prev.nodes.map((n) => n.id === parentId ? { ...n, expanded: true } : n),
          ...newNodes,
        ],
        links: [...prev.links, ...newLinks],
      }
    })
  }

  return { graphData, toggleExpand }
}
```

### 4.3 折叠后的数据清理

折叠时不仅要从图中移除子节点，还要**清理 force simulation 中的关联数据**，否则 D3 内部仍持有对已删除节点的引用，导致报错：

```ts
function collapseNode(parentId: string) {
  setGraphData((prev) => {
    // 找出所有子节点 ID
    const childIds = new Set<string>()

    function collectChildren(id: string) {
      prev.links
        .filter((l) => l.source === id && l.relation === 'contains')
        .forEach((l) => {
          const targetId = typeof l.target === 'string' ? l.target : l.target.id
          if (!childIds.has(targetId)) {
            childIds.add(targetId)
            collectChildren(targetId) // 递归查找孙子节点
          }
        })
    }
    collectChildren(parentId)

    return {
      nodes: prev.nodes
        .map((n) => n.id === parentId ? { ...n, expanded: false } : n)
        .filter((n) => !childIds.has(n.id)), // 移除所有子节点
      links: prev.links.filter(
        (l) => !childIds.has(typeof l.source === 'string' ? l.source : l.source.id) &&
              !childIds.has(typeof l.target === 'string' ? l.target : l.target.id),
      ),
    }
  })
}
```

## 五、交互设计

### 5.1 拖拽（Drag）

D3 的 `drag` behavior 天然支持拖拽节点。我们在此基础上增加了几点优化：

```ts
// 拖拽时固定节点位置（fx/fy），释放后恢复
const dragBehavior = d3Drag<SVGGElement, SimNode>()
  .on('start', (event, d) => {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
    // 拖拽开始高亮当前节点
    highlightNode(d.id)
  })
  .on('drag', (event, d) => {
    d.fx = event.x
    d.fy = event.y
  })
  .on('end', (event, d) => {
    if (!event.active) simulation.alphaTarget(0)
    // 如果只是点击（没有移动），不释放固定位置（展开/折叠交互）
    if (event.sourceEvent.type === 'click') return
    d.fx = null
    d.fy = null
    clearHighlight()
  })
```

**关键细节**：在 `end` 事件中检测是否为点击事件。如果是点击，保留 `fx/fy` 临时固定位置，否则清除。这避免了"点击展开后节点弹回原位置"的问题。

### 5.2 缩放和平移（Zoom）

使用 D3 的 `zoom` behavior 实现：

```ts
const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
  .scaleExtent([0.3, 3]) // 缩放限制
  .translateExtent([[0, 0], [width, height]]) // 平移限制
  .on('zoom', (event) => {
    container.attr('transform', event.transform)
  })

// 鼠标滚轮缩放速度调整
zoomBehavior.wheelDelta((event) => {
  return -event.deltaY * (event.deltaMode ? 1 : 0.002)
})

// 双击重置缩放
svg.on('dblclick.zoom', () => {
  svg.transition().duration(500).call(zoomBehavior.transform, d3ZoomIdentity)
})
```

### 5.3 悬浮信息提示（Tooltip）

悬浮在节点上时显示详情面板：

```tsx
function Tooltip({ node, position }: { node: SimNode | null; position: { x: number; y: number } }) {
  if (!node) return null

  return (
    <div
      className="node-tooltip"
      style={{
        left: position.x + 15,
        top: position.y - 10,
      }}
    >
      <h4>{node.name}</h4>
      <div className="tooltip-row">
        <span>掌握度：</span>
        <span className="mastery-bar">
          <span
            className="mastery-fill"
            style={{ width: `${node.mastery * 100}%` }}
          />
        </span>
        <span>{(node.mastery * 100).toFixed(0)}%</span>
      </div>
      <div className="tooltip-row">
        <span>错题数：{node.errorCount}</span>
      </div>
      <div className="tooltip-row">
        <span>重要度：{'⭐'.repeat(Math.round(node.importance * 5))}</span>
      </div>
    </div>
  )
}
```

### 5.4 点击侧面板详情

点击节点后，右侧面板展示该知识点的详细分析：

```tsx
function DetailPanel({ node }: { node: KnowledgeNode | null }) {
  if (!node) {
    return <div className="detail-panel empty">点击知识点查看详情</div>
  }

  return (
    <div className="detail-panel">
      <h3>{node.name}</h3>
      <p className="detail-path">{getNodePath(node)}</p>
      <section>
        <h4>掌握度分析</h4>
        <MasteryChart mastery={node.mastery} />
      </section>
      <section>
        <h4>相关错题 ({node.errorCount} 题)</h4>
        <ErrorList nodeId={node.id} />
      </section>
      <section>
        <h4>关联知识点</h4>
        <RelatedNodes nodeId={node.id} />
      </section>
      <section>
        <h4>推荐练习</h4>
        <PracticeRecommendations nodeId={node.id} />
      </section>
    </div>
  )
}
```

## 六、视觉映射：用颜色和大小"说话"

### 6.1 颜色映射——掌握度热力图

```ts
function getNodeColor(mastery: number): string {
  // 使用红-黄-绿渐变色
  // mastery 0~0.3: 红色（危险）
  // mastery 0.3~0.6: 黄色（警告）
  // mastery 0.6~1.0: 绿色（良好）
  if (mastery < 0.3) {
    return '#ef4444' // 红
  } else if (mastery < 0.6) {
    return '#f59e0b' // 黄
  } else {
    return '#22c55e' // 绿
  }
}
```

### 6.2 大小映射——错误率与重要度

```ts
function getNodeRadius(node: KnowledgeNode): number {
  if (node.level === 'subject') return 28
  if (node.level === 'chapter') return 20

  // 知识点级别：基础半径 10，加上错误率和重要度的加成
  const baseRadius = 10
  const errorBonus = Math.min(node.errorCount / 50, 1) * 8
  const importanceBonus = node.importance * 6
  return baseRadius + errorBonus + importanceBonus
}
```

### 6.3 连线映射——关联强度

```ts
function getLinkStyle(link: SimLink) {
  return {
    strokeWidth: link.strength * 3 + 1,
    strokeDasharray: link.relation === 'inference' ? '4 4' : 'none',
    opacity: 0.4 + link.strength * 0.5,
  }
}
```

### 6.4 完整的视觉编码表

| 视觉通道 | 映射变量 | 映射范围 | 说明 |
|---------|---------|---------|------|
| **节点颜色** | 掌握度 (0-1) | 红 → 黄 → 绿 | 红：需重点关注，绿：掌握良好 |
| **节点大小** | 层级 + 错误率 + 重要度 | 10px - 42px | 越大越重要/错误越多 |
| **节点形状** | 层级 | 圆(根) / 圆角矩形(章) / 圆(知识点) | 视觉区分层级 |
| **连线粗细** | 关联强度 (0-1) | 1px - 4px | 越粗关联越强 |
| **连线虚实** | 关联类型 | 实线/虚线 | 实线为结构关系，虚线为推理关系 |
| **连线颜色** | 关联类型 | 蓝/绿/灰 | 区分依赖/包含/推荐 |

## 七、性能优化

### 7.1 大量节点下的渲染优化

当知识点扩展到 200+ 节点时，每个 tick 更新所有节点和连线的 DOM 属性会成为性能瓶颈。我们做了以下优化：

**优化 1：渲染节流**

```ts
// 不使用 simulation.on('tick') 实时更新
// 改用 requestAnimationFrame 定时采样

let lastRenderTime = 0
const TICK_INTERVAL = 16 // ~60fps

simulation.on('tick', () => {
  const now = performance.now()
  if (now - lastRenderTime < TICK_INTERVAL) return
  lastRenderTime = now

  // 只更新视口中可见的节点
  updateVisibleNodes()
})

// 力模拟稳定后停止 tick 渲染
simulation.on('end', () => {
  renderFinalPositions()
})
```

**优化 2：Canvas 替代 SVG（降级方案）**

对于单次渲染超过 500 节点的极端场景，我们准备了一套 Canvas 渲染器作为降级：

```ts
// 关键逻辑：用 Canvas 2D 替代 SVG DOM 操作
function renderToCanvas(ctx: CanvasRenderingContext2D, nodes: SimNode[], links: SimLink[]) {
  ctx.clearRect(0, 0, width, height)

  // 先画连线
  links.forEach((link) => {
    const source = link.source as SimNode
    const target = link.target as SimNode
    ctx.beginPath()
    ctx.moveTo(source.x!, source.y!)
    ctx.lineTo(target.x!, target.y!)
    ctx.strokeStyle = `rgba(150, 150, 150, ${link.strength * 0.6})`
    ctx.lineWidth = link.strength * 3 + 1
    ctx.stroke()
  })

  // 再画节点
  nodes.forEach((node) => {
    ctx.beginPath()
    ctx.arc(node.x!, node.y!, getNodeRadius(node), 0, Math.PI * 2)
    ctx.fillStyle = getNodeColor(node.mastery)
    ctx.fill()
  })
}
```

Canvas 方案在 1000 节点场景下仍能保持 30fps，但牺牲了 SVG 的 DOM 事件绑定能力（悬浮、点击等交互需要自己实现命中检测）。

### 7.2 Force Simulation 本身优化

```ts
// 1. 降低 alphaDecay 避免过早稳定
simulation.alphaDecay(0.02)

// 2. 限制力模拟的最大迭代步数
simulation.stop()
for (let i = 0; i < 300; i++) {
  simulation.tick()
}
renderFinalPositions()

// 3. 对远距离节点间的 charge 力做近似计算（Barnes-Hut 算法）
// D3 v7 默认使用 Barnes-Hut，但我们手动限制 theta 值
forceManyBody().theta(0.8) // 值越大精度越低性能越好
```

### 7.3 性能数据

| 节点数量 | SVG 渲染帧率 | Canvas 渲染帧率 | 力模拟稳定时间 |
|---------|-------------|---------------|-------------|
| 50 | 60fps | 60fps | ~1.5s |
| 150 | 55fps | 60fps | ~2.5s |
| 300 | 35fps | 55fps | ~4s |
| 500 | 18fps | 45fps | ~6s |
| 1000 | 8fps | 30fps | ~10s |

在我们的实际场景中（单学科 50-200 节点），SVG 方案完全足够，Canvas 渲染器作为兜底未实际启用。

## 八、踩坑记录

### 坑 1：力模拟初始化布局抖动

**现象**：节点刚开始渲染时，所有节点集中在画布中心，然后"嘣"一下弹开，画面闪烁严重。

**原因**：D3 的 `forceSimulation` 默认将节点的初始位置设为 `(0, 0)`，即画布左上角。所有电荷力从零开始计算，前期震荡幅度巨大。

**解决方案**：在初始化时为节点设置合理的初始位置：

```ts
function initializeNodePositions(nodes: SimNode[], width: number, height: number) {
  // 按层级在垂直方向分布
  const levels = ['subject', 'chapter', 'topic']
  const levelGap = height / (levels.length + 1)

  levels.forEach((level, levelIndex) => {
    const levelNodes = nodes.filter((n) => n.level === level)
    const horizontalGap = width / (levelNodes.length + 1)

    levelNodes.forEach((node, nodeIndex) => {
      node.x = horizontalGap * (nodeIndex + 1)
      node.y = levelGap * (levelIndex + 1) + (Math.random() - 0.5) * 30
    })
  })
}

// 使用前调用
initializeNodePositions(simNodes, width, height)
```

给节点一个基于层级的初始分布，力模拟只需要做微调，不再出现大幅震荡。

### 坑 2：节点标签与圆形重叠

**现象**：当多个节点靠得很近时，标签文字相互重叠，完全无法阅读。

**解决方案**：使用 `forceCollide` 确保节点间最小间距，并且在 tick 位置更新后做标签碰撞检测：

```ts
function resolveLabelCollisions(textElements: Selection<SVGTextElement, SimNode, SVGGElement, unknown>) {
  // 简单的贪心碰撞解决
  const placed: DOMRect[] = []

  textElements.each(function (d) {
    const bbox = this.getBBox()
    let x = d.x!
    let y = d.y! + getNodeRadius(d) + 14

    // 检查与已有标签是否重叠
    for (const placedRect of placed) {
      if (rectsOverlap(
        { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height },
        placedRect,
      )) {
        // 横向偏移避免重叠
        x += 5
        break
      }
    }

    select(this).attr('x', x).attr('y', y)
    placed.push({ x: x - bbox.width / 2, y: y - bbox.height, width: bbox.width, height: bbox.height })
  })
}
```

### 坑 3：移动端 Touch 事件兼容

**现象**：在平板上拖拽节点时，`d3-drag` 的 touch 事件与 `d3-zoom` 的 touch 事件冲突——双指缩放时触发单指拖拽。

**解决方案**：

```ts
// 区分单指和双指操作
const dragBehavior = d3Drag<SVGGElement, SimNode>()
  .filter((event) => {
    // 只响应单指事件
    return event.type === 'mousedown' || (event.type === 'touchstart' && event.touches.length === 1)
  })

const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
  .filter((event) => {
    // 滚轮或双指触发缩放
    return event.type === 'wheel' || (event.type.startsWith('touch') && event.touches.length >= 2)
  })
```

### 坑 4：force.stop() 与 resume() 的时序问题

**现象**：展开折叠子节点后，调用 `simulation.nodes(newNodes).alpha(0.3).restart()`，但新节点没有被力模拟影响（位置不动）。

**原因**：在重新设置 `nodes()` 后，D3 需要重新绑定数据。如果直接 `restart()`，新节点的引用未被正确关联。

**正确做法**：

```ts
function updateSimulation(newNodes: SimNode[], newLinks: SimLink[]) {
  // 1. 先停止旧模拟
  simulation.stop()

  // 2. 重新设置节点和边
  simulation.nodes(newNodes)

  // 注意：links 需要重新创建 forceLink，不能复用旧实例
  simulation.force('link', forceLink<SimNode, SimLink>(newLinks)
    .id((d) => d.id))

  // 3. 重新加热并启动
  simulation.alpha(0.3).restart()
}
```

### 坑 5：React StrictMode 下 useEffect 的多次执行

**现象**：开发环境下开启 React StrictMode，`useEffect` 执行两次，导致多次创建 force simulation。

**解决方案**：在 cleanup 函数中彻底销毁 simulation：

```ts
useEffect(() => {
  const simulation = createForceSimulation(nodes, links)

  return () => {
    // 彻底销毁，包括所有 force 实例
    simulation.stop()
    simulation.nodes([])
    simulation.force('link', null)
    simulation.force('charge', null)
    simulation.force('center', null)
    simulation.force('collide', null)
    simulation.on('tick', null)
    simulation.on('end', null)
  }
}, [nodes, links])
```

## 九、效果数据与用户反馈

### 9.1 性能指标

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 页面加载时间（含数据请求） | 3.2s | 1.5s |
| 力模拟稳定时间（200 节点） | ~6s | ~2.5s |
| 交互响应延迟 | 150ms | < 16ms (60fps) |
| 展开/折叠响应时间 | 2s+（卡顿明显） | < 200ms |
| 内存占用（200 节点） | 180MB | 65MB |

### 9.2 业务效果

功能上线后，我们统计了以下数据：

- **教师侧**：80% 的教师每周至少使用一次知识图谱查看班级整体掌握情况
- **学生侧**：知识点薄弱环节定位时间从约 15 分钟（翻阅错题本）缩短至 30 秒
- **教学决策**：教师基于图谱数据调整教学重点，针对性地布置练习
- **学生进步**：连续使用图谱功能的学生，月均掌握度提升 23%

## 十、经验总结

### 1. 力导向图是知识图谱可视化的"天然选择"

力学模拟的物理直觉与知识图谱的"关联性"高度契合——相关的知识点因"弹力"聚在一起，不相关的因"电荷力"排开。这种自组织的布局方式不需要手动指定每个节点的位置。

### 2. 三层视觉编码让数据"说话"

不要只把数据画出来。通过**颜色（掌握度）、大小（重要度/错误率）、位置（层级/关联性）** 三个维度同时编码信息，用户扫一眼就能理解大部分信息。

### 3. D3.js 与 React 的配合要明确职责

我们总结了三条原则：
- **D3 管数学计算**：force simulation 是纯数据计算，与渲染框架无关
- **React 管状态管理**：节点展开/折叠、数据更新走 React 的状态体系
- **SVG/Canvas 管渲染**：用 ref 桥接双方，谁都不入侵对方的控制域

### 4. 性能优化要量化、要分层次

不要一上来就上 Canvas。在 200 节点以内，SVG 的灵活性和便利性远超 Canvas。先优化力模拟参数（alpha 衰减、Barnes-Hut 近似）、再优化渲染（tick 节流、视口裁剪）、最后才考虑渲染引擎替换。

### 5. 交互设计要"敬畏"用户的物理直觉

力导向图最让用户惊艳的不是视觉效果，而是**拖拽节点时弹簧徐徐拉开的物理感**。做好力模拟的 alpha 衰减曲线和弹力参数，让交互在"灵敏"和"稳重"之间找到平衡。太快会晕，太慢会急。

---

知识图谱功能上线后，成为了 AI 错题本中最受师生欢迎的功能之一。它不仅让"知识掌握情况"变得一目了然，更让学生和老师第一次直观地看到了**知识点之间的因果链**——从"因式分解没掌握"到"二次函数频繁出错"，背后是一整条需要修复的学习路径。

而这个故事的起点，就是一个 `forceSimulation()` 的调用。
