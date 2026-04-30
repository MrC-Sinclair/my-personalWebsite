---
title: 'Building a Force-Directed Graph Knowledge Map with D3.js: Visualizing Student Knowledge Mastery'
description: A hands-on guide to implementing a force-directed graph knowledge map from scratch using D3.js, featuring multi-level force simulation, interaction design, and real-world optimization for visualizing student knowledge mastery.
date: '2025-10-15'
tags:
  - D3.js
  - Data Visualization
  - Force-Directed Graph
  - React
  - Knowledge Graph
  - Frontend
category: Frontend
draft: false
---

## Background: When Error Analytics Meets Knowledge Graphs

In educational scenarios, every wrong answer a student makes is rarely an isolated event — it points back to specific knowledge points. If a student keeps getting "quadratic functions" wrong, it's probably not "carelessness" but a systemic weakness in an entire knowledge domain.

The core goal of the **AI Error Analytics Platform** is: connect student error data with subject knowledge points, and visualize them as a **knowledge graph** so teachers and students can:

- **Quickly identify** which knowledge areas are weak at a glance
- **Discover correlations** — see the causal chain between knowledge points (e.g., "factorization" weakness leads to frequent "quadratic function" errors)
- **Track changes** — see whether mastery improves after practice

The central challenge was: **how to elegantly display hundreds of knowledge points with their complex relationships on a single screen, while keeping interactions intuitive and smooth?**

We chose **D3.js Force-Directed Graph** as the visualization solution. This article documents the complete journey from zero to production.

### Project Environment

| Dimension | Details |
|-----------|---------|
| Tech Stack | React 18 + TypeScript |
| Visualization Library | D3.js v7 |
| Data Source | Knowledge graph data from backend API |
| Target Devices | PC browser + tablet |
| Data Scale | ~50-200 knowledge points per subject, 80-500 edges |

## 1. Why Force-Directed Graphs

Before settling on the final approach, we evaluated several visualization options:

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Tree Layout** | Clear hierarchy, simple to implement | Can only show parent-child relationships, can't express cross-domain connections | ❌ |
| **Mind Map** | Intuitive, user-friendly | Fixed layout, not suitable for dynamic large-scale data | ❌ |
| **ECharts Graph** | Ready-to-use, simple config | Limited custom interaction, poor performance at scale | ❌ |
| **D3.js Force-Directed Graph** | Highly flexible, force simulation naturally expresses relationships, fully customizable interactions | Need to build from scratch, steep learning curve | **✅ Chosen** |

The **key advantage** of force-directed graphs: they map the "correlation strength" between knowledge points to physical "spring forces" and "classification" to "charge forces (like attracts like, opposites repel)". **The resulting layout naturally expresses the characteristics of a knowledge graph — related concepts cluster together, unrelated ones drift apart.** This self-organizing property is something traditional tree layouts simply cannot achieve.

## 2. Data Model Design

### 2.1 Node Model

Each node in the knowledge graph represents a knowledge point and carries enough information for visual encoding:

```ts
interface KnowledgeNode {
  /** Unique identifier for the knowledge point */
  id: string
  /** Display name */
  name: string
  /** Level in hierarchy: 'subject' | 'chapter' | 'topic' */
  level: 'subject' | 'chapter' | 'topic'
  /** Subject this node belongs to */
  subject: string
  /** Parent node ID */
  parentId: string | null
  /** Student mastery level (0-1) */
  mastery: number
  /** Knowledge point importance (0-1) */
  importance: number
  /** Number of related errors */
  errorCount: number
  /** Whether child nodes are expanded */
  expanded: boolean
  /** D3 force simulation coordinates */
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}
```

### 2.2 Link Model

Links represent relationships between knowledge points — prerequisites, containment, related recommendations, etc.:

```ts
interface KnowledgeLink {
  /** Source node ID */
  source: string
  /** Target node ID */
  target: string
  /** Relationship type */
  relation: 'prerequisite' | 'contains' | 'related' | 'inference'
  /** Relationship strength (0-1) */
  strength: number
}
```

### 2.3 Example Data

```json
{
  "nodes": [
    { "id": "math", "name": "Mathematics", "level": "subject", "mastery": 0.72 },
    { "id": "algebra", "name": "Algebra", "level": "chapter", "parentId": "math", "mastery": 0.65 },
    { "id": "func_quadratic", "name": "Quadratic Functions", "level": "topic", "parentId": "algebra", "mastery": 0.38, "errorCount": 23, "importance": 0.9 },
    { "id": "factorization", "name": "Factorization", "level": "topic", "parentId": "algebra", "mastery": 0.55, "errorCount": 12, "importance": 0.7 }
  ],
  "links": [
    { "source": "math", "target": "algebra", "relation": "contains", "strength": 1.0 },
    { "source": "algebra", "target": "func_quadratic", "relation": "contains", "strength": 1.0 },
    { "source": "factorization", "target": "func_quadratic", "relation": "prerequisite", "strength": 0.8 }
  ]
}
```

## 3. D3.js Force Simulation Core Implementation

### 3.1 Force Simulator Basics

D3's `forceSimulation` is the core engine of force-directed graphs. It simulates a **particle physics system**: each node is a charged particle, each edge is a spring. On every tick, the system calculates the net force on each particle, updates positions, and continues until the system reaches equilibrium (alpha decays to 0).

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

/** D3 extended node type */
interface SimNode extends SimulationNodeDatum, KnowledgeNode {}

/** D3 extended link type */
interface SimLink extends SimulationLinkDatum<SimNode> {
  relation: string
  strength: number
}

function createForceSimulation(nodes: SimNode[], links: SimLink[]) {
  const simulation = forceSimulation<SimNode>(nodes)
    // Charge force: nodes repel each other
    .force('charge', forceManyBody<SimNode>()
      .strength((d) => {
        // Root nodes repel more strongly to spread the graph
        return d.level === 'subject' ? -300 : d.level === 'chapter' ? -200 : -150
      })
      .distanceMax(500),
    )
    // Link force: connected nodes attract each other
    .force('link', forceLink<SimNode, SimLink>(links)
      .id((d) => d.id)
      .distance((d) => 200 - d.strength * 100)
      .strength((d) => d.strength * 0.8),
    )
    // Centering force
    .force('center', forceCenter(width / 2, height / 2))
    // Collision force: prevent node overlap
    .force('collide', forceCollide<SimNode>()
      .radius((d) => getNodeRadius(d) + 10),
    )

  return simulation
}
```

### 3.2 Parameter Tuning Insights

**Differentiated charge strength by level:**

```
subject nodes: -300  → strongest repulsion, stay in center
chapter nodes: -200  → medium repulsion
topic   nodes: -150  → weakest repulsion
```

The purpose: **the subject stays in the center, chapters spread around it, and topics cluster around their parent chapter.** Using uniform strength would create a uniform, flat distribution.

**Link distance mapped to relationship type:**

```ts
.distance((d) => {
  if (d.relation === 'prerequisite') return 60   // prerequisites are closest
  if (d.relation === 'contains') return 80        // containment relationships
  return 120                                       // related recommendations
})
```

**Alpha decay control:**

```ts
simulation.alpha(1).alphaDecay(0.02).alphaMin(0.001)

simulation.on('tick', () => {
  renderNodes()
  renderLinks()
})

function reheatSimulation() {
  simulation.alpha(0.3).alphaTarget(0.1).restart()
}
```

`alphaDecay` controls how quickly the system stabilizes. Lower values create better layouts but longer wait times. We settled on `0.02` as the sweet spot.

### 3.3 React Integration

The core challenge when using D3.js with React is that **both want to control the DOM**. Our strategy: **D3 handles computation (force simulation data updates), React handles rendering (holding SVG elements via refs).**

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

    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }))
    const simLinks: SimLink[] = links.map((l) => ({ ...l })) as SimLink[]

    const simulation = createForceSimulation(simNodes, simLinks)
    simulationRef.current = simulation

    const svg = select(svgRef.current)
    svg.selectAll('*').remove()

    // Zoom behavior
    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
      })
    svg.call(zoomBehavior)

    const container = svg.append('g')

    // Draw links
    const linkElements = container.append('g')
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', getLinkColor)
      .attr('stroke-width', (d) => d.strength * 3 + 1)
      .attr('stroke-opacity', 0.6)

    // Draw nodes
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

    nodeElements.append('circle')
      .attr('r', (d) => getNodeRadius(d))
      .attr('fill', (d) => getNodeColor(d.mastery))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)

    nodeElements.append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => getNodeRadius(d) + 14)
      .attr('font-size', (d) => d.level === 'subject' ? 14 : d.level === 'chapter' ? 12 : 10)
      .attr('fill', '#333')

    // Update positions on each tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d) => (d.source as SimNode).x!)
        .attr('y1', (d) => (d.source as SimNode).y!)
        .attr('x2', (d) => (d.target as SimNode).x!)
        .attr('y2', (d) => (d.target as SimNode).y!)

      nodeElements.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })

    simulation.on('end', () => {
      setLoading(false)
    })

    const timeout = setTimeout(() => setLoading(false), 3000)

    return () => {
      clearTimeout(timeout)
      simulation.stop()
    }
  }, [nodes, links, onNodeClick])

  return (
    <div className="force-graph-container">
      {loading && <div className="loading-overlay">Rendering knowledge graph...</div>}
      <svg ref={svgRef} className="force-graph-svg" />
    </div>
  )
}
```

## 4. Multi-Level Node Expand/Collapse

### 4.1 Hierarchy Design

Knowledge points are organized in three levels: **Subject → Chapter → Topic**. By default, only subjects and chapters are displayed (levels 1 and 2). Topics are dynamically loaded when the user clicks to expand a chapter.

```
Mathematics (subject root)
├── Algebra (chapter)
│   ├── Quadratic Functions (topic) [collapsed, not loaded]
│   ├── Factorization (topic) [collapsed, not loaded]
│   └── ...
├── Geometry (chapter)
│   ├── Congruent Triangles (topic)
│   └── ...
└── Statistics & Probability (chapter)
    └── ...
```

### 4.2 Expand Logic

When a user clicks a `chapter`-level node, we fetch its child topics from the backend and dynamically inject them into the force simulation:

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
      collapseNode(nodeId)
    } else {
      const children = await fetchTopicNodes(nodeId)
      if (children && children.length > 0) {
        expandNode(nodeId, children)
      }
    }
  }, [graphData])

  const expandNode = (parentId: string, children: KnowledgeNode[]) => {
    setGraphData((prev) => {
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

### 4.3 Collapse and Cleanup

When collapsing, we must also clean up the force simulation's internal references to removed nodes:

```ts
function collapseNode(parentId: string) {
  setGraphData((prev) => {
    const childIds = new Set<string>()

    function collectChildren(id: string) {
      prev.links
        .filter((l) => l.source === id && l.relation === 'contains')
        .forEach((l) => {
          const targetId = typeof l.target === 'string' ? l.target : l.target.id
          if (!childIds.has(targetId)) {
            childIds.add(targetId)
            collectChildren(targetId)
          }
        })
    }
    collectChildren(parentId)

    return {
      nodes: prev.nodes
        .map((n) => n.id === parentId ? { ...n, expanded: false } : n)
        .filter((n) => !childIds.has(n.id)),
      links: prev.links.filter(
        (l) => !childIds.has(typeof l.source === 'string' ? l.source : l.source.id) &&
              !childIds.has(typeof l.target === 'string' ? l.target : l.target.id),
      ),
    }
  })
}
```

## 5. Interaction Design

### 5.1 Dragging (Drag)

D3's `drag` behavior handles node dragging natively. We added a few enhancements:

```ts
const dragBehavior = d3Drag<SVGGElement, SimNode>()
  .on('start', (event, d) => {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
    highlightNode(d.id)
  })
  .on('drag', (event, d) => {
    d.fx = event.x
    d.fy = event.y
  })
  .on('end', (event, d) => {
    if (!event.active) simulation.alphaTarget(0)
    // If this was a click (no movement), keep position fixed
    if (event.sourceEvent.type === 'click') return
    d.fx = null
    d.fy = null
    clearHighlight()
  })
```

**Key detail**: In the `end` handler, we check if the event is actually a click. If so, we keep `fx/fy` temporarily fixed to prevent the node from snapping back after "expand" is triggered.

### 5.2 Zoom and Pan

```ts
const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
  .scaleExtent([0.3, 3])
  .translateExtent([[0, 0], [width, height]])
  .on('zoom', (event) => {
    container.attr('transform', event.transform)
  })

zoomBehavior.wheelDelta((event) => {
  return -event.deltaY * (event.deltaMode ? 1 : 0.002)
})

// Double-click to reset zoom
svg.on('dblclick.zoom', () => {
  svg.transition().duration(500).call(zoomBehavior.transform, d3ZoomIdentity)
})
```

### 5.3 Hover Tooltip

A detail panel appears when hovering over a node:

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
        <span>Mastery: </span>
        <span className="mastery-bar">
          <span
            className="mastery-fill"
            style={{ width: `${node.mastery * 100}%` }}
          />
        </span>
        <span>{(node.mastery * 100).toFixed(0)}%</span>
      </div>
      <div className="tooltip-row">
        <span>Errors: {node.errorCount}</span>
      </div>
      <div className="tooltip-row">
        <span>Importance: {'⭐'.repeat(Math.round(node.importance * 5))}</span>
      </div>
    </div>
  )
}
```

### 5.4 Click Detail Panel

Clicking a node opens a side panel with detailed analysis:

```tsx
function DetailPanel({ node }: { node: KnowledgeNode | null }) {
  if (!node) {
    return <div className="detail-panel empty">Click a node to view details</div>
  }

  return (
    <div className="detail-panel">
      <h3>{node.name}</h3>
      <p className="detail-path">{getNodePath(node)}</p>
      <section>
        <h4>Mastery Analysis</h4>
        <MasteryChart mastery={node.mastery} />
      </section>
      <section>
        <h4>Related Errors ({node.errorCount})</h4>
        <ErrorList nodeId={node.id} />
      </section>
      <section>
        <h4>Related Knowledge Points</h4>
        <RelatedNodes nodeId={node.id} />
      </section>
      <section>
        <h4>Recommended Practice</h4>
        <PracticeRecommendations nodeId={node.id} />
      </section>
    </div>
  )
}
```

## 6. Visual Encoding: Let Color and Size Tell the Story

### 6.1 Color — Mastery Heat Map

```ts
function getNodeColor(mastery: number): string {
  // Red-Yellow-Green gradient
  // mastery 0~0.3: red (danger)
  // mastery 0.3~0.6: yellow (warning)
  // mastery 0.6~1.0: green (good)
  if (mastery < 0.3) {
    return '#ef4444'
  } else if (mastery < 0.6) {
    return '#f59e0b'
  } else {
    return '#22c55e'
  }
}
```

### 6.2 Size — Error Count and Importance

```ts
function getNodeRadius(node: KnowledgeNode): number {
  if (node.level === 'subject') return 28
  if (node.level === 'chapter') return 20

  const baseRadius = 10
  const errorBonus = Math.min(node.errorCount / 50, 1) * 8
  const importanceBonus = node.importance * 6
  return baseRadius + errorBonus + importanceBonus
}
```

### 6.3 Link Style — Relationship Strength

```ts
function getLinkStyle(link: SimLink) {
  return {
    strokeWidth: link.strength * 3 + 1,
    strokeDasharray: link.relation === 'inference' ? '4 4' : 'none',
    opacity: 0.4 + link.strength * 0.5,
  }
}
```

### 6.4 Complete Visual Encoding Table

| Visual Channel | Mapped Variable | Range | Description |
|---------------|----------------|-------|-------------|
| **Node Color** | Mastery (0-1) | Red → Yellow → Green | Red = needs attention, Green = mastered |
| **Node Size** | Level + Errors + Importance | 10px - 42px | Larger = more errors or more important |
| **Node Shape** | Level | Circle / Rounded Rect / Circle | Visual hierarchy differentiation |
| **Link Width** | Strength (0-1) | 1px - 4px | Thicker = stronger relationship |
| **Link Dash** | Relationship Type | Solid / Dashed | Solid = structural, Dashed = inference |
| **Link Color** | Relationship Type | Blue / Green / Gray | Distinguish dependency/inclusion/recommendation |

## 7. Performance Optimization

### 7.1 Optimizing for Large Node Counts

When the graph grows to 200+ nodes, updating all DOM attributes on every tick becomes a bottleneck.

**Optimization 1: Render throttling**

```ts
let lastRenderTime = 0
const TICK_INTERVAL = 16 // ~60fps

simulation.on('tick', () => {
  const now = performance.now()
  if (now - lastRenderTime < TICK_INTERVAL) return
  lastRenderTime = now

  updateVisibleNodes()
})

simulation.on('end', () => {
  renderFinalPositions()
})
```

**Optimization 2: Canvas fallback**

For extreme scenarios (500+ nodes), we prepared a Canvas renderer:

```ts
function renderToCanvas(ctx: CanvasRenderingContext2D, nodes: SimNode[], links: SimLink[]) {
  ctx.clearRect(0, 0, width, height)

  // Draw links first
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

  // Then draw nodes
  nodes.forEach((node) => {
    ctx.beginPath()
    ctx.arc(node.x!, node.y!, getNodeRadius(node), 0, Math.PI * 2)
    ctx.fillStyle = getNodeColor(node.mastery)
    ctx.fill()
  })
}
```

### 7.2 Force Simulation Optimizations

```ts
// 1. Lower alphaDecay for better layout
simulation.alphaDecay(0.02)

// 2. Limit iteration steps
simulation.stop()
for (let i = 0; i < 300; i++) {
  simulation.tick()
}
renderFinalPositions()

// 3. Barnes-Hut approximation for long-range forces
forceManyBody().theta(0.8)
```

### 7.3 Performance Benchmarks

| Nodes | SVG FPS | Canvas FPS | Simulation Settle Time |
|-------|---------|-----------|----------------------|
| 50 | 60fps | 60fps | ~1.5s |
| 150 | 55fps | 60fps | ~2.5s |
| 300 | 35fps | 55fps | ~4s |
| 500 | 18fps | 45fps | ~6s |
| 1000 | 8fps | 30fps | ~10s |

In our real-world scenario (50-200 nodes per subject), SVG was more than sufficient. The Canvas fallback was never actually needed.

## 8. Pitfalls and Solutions

### Pitfall 1: Initial Layout Explosion

**Problem**: All nodes start at the center and explode outward, creating a jarring visual flash.

**Cause**: D3's `forceSimulation` initializes all node positions to `(0, 0)` by default. The initial charge forces are massive.

**Solution**: Initialize nodes with reasonable starting positions:

```ts
function initializeNodePositions(nodes: SimNode[], width: number, height: number) {
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
```

### Pitfall 2: Label Overlap

**Problem**: When nodes are close together, their labels overlap and become unreadable.

**Solution**: Use `forceCollide` and implement label collision detection on each tick.

### Pitfall 3: Touch Event Conflicts on Mobile

**Problem**: On tablets, `d3-drag` touch events conflict with `d3-zoom` touch events — pinch-to-zoom triggers single-finger drag.

**Solution**: Differentiate single-touch from multi-touch:

```ts
const dragBehavior = d3Drag<SVGGElement, SimNode>()
  .filter((event) => {
    return event.type === 'mousedown' ||
      (event.type === 'touchstart' && event.touches.length === 1)
  })

const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
  .filter((event) => {
    return event.type === 'wheel' ||
      (event.type.startsWith('touch') && event.touches.length >= 2)
  })
```

### Pitfall 4: force.stop() / restart() Timing

**Problem**: After expanding/collapsing child nodes, calling `simulation.nodes(newNodes).alpha(0.3).restart()` doesn't affect new nodes — they remain stationary.

**Solution**: Recreate the link force when updating nodes:

```ts
function updateSimulation(newNodes: SimNode[], newLinks: SimLink[]) {
  simulation.stop()
  simulation.nodes(newNodes)
  // Links must be recreated, not reused
  simulation.force('link', forceLink<SimNode, SimLink>(newLinks).id((d) => d.id))
  simulation.alpha(0.3).restart()
}
```

### Pitfall 5: React StrictMode Double Execution

**Problem**: In development with React StrictMode, `useEffect` fires twice, creating duplicate simulations.

**Solution**: Thorough cleanup in the effect's return function:

```ts
useEffect(() => {
  const simulation = createForceSimulation(nodes, links)

  return () => {
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

## 9. Results and Feedback

### 9.1 Performance Metrics

| Metric | Before Optimization | After Optimization |
|--------|-------------------|-------------------|
| Page load time (incl. data fetch) | 3.2s | 1.5s |
| Simulation settle time (200 nodes) | ~6s | ~2.5s |
| Interaction response latency | 150ms | < 16ms (60fps) |
| Expand/collapse response time | 2s+ (noticeable lag) | < 200ms |
| Memory usage (200 nodes) | 180MB | 65MB |

### 9.2 Business Impact

After the feature launch:

- **Teachers**: 80% used the knowledge graph at least once per week to review class-wide mastery
- **Students**: Time to identify weak areas dropped from ~15 minutes (browsing error notebooks) to 30 seconds
- **Teaching decisions**: Teachers adjusted teaching priorities based on graph data
- **Student improvement**: Students who regularly used the graph showed a 23% monthly mastery increase

## 10. Lessons Learned

### 1. Force-Directed Graphs Are a Natural Fit for Knowledge Visualization

The physics intuition behind force simulation aligns perfectly with knowledge graph characteristics — related concepts are pulled together by "spring forces," unrelated ones are pushed apart by "charge forces." This self-organizing layout requires no manual position assignment.

### 2. Three-Layer Visual Encoding Speaks Volumes

Don't just render data. Encode information through **color (mastery level)**, **size (importance/error count)**, and **position (hierarchy/relationships)** simultaneously so users can grasp the big picture at a glance.

### 3. Clear Responsibility Division Between D3 and React

Our three principles:
- **D3 handles math**: force simulation is pure computation, framework-agnostic
- **React handles state**: expand/collapse and data updates go through React's state system
- **SVG/Canvas handles rendering**: refs bridge the two without encroaching on each other's domain

### 4. Optimize Quantitatively, Layer by Layer

Don't jump to Canvas immediately. Within 200 nodes, SVG's flexibility far outweighs its performance concerns. Optimize in this order: force simulation parameters → render throttling → viewport culling → rendering engine swap.

### 5. Honor the User's Physical Intuition

What users find most impressive about force-directed graphs isn't the visual effect — it's the **physical sensation of pulling a node and watching the springs stretch**. Tune the alpha decay curve and spring parameters to find the sweet spot between "responsive" and "stable." Too fast disorients, too slow frustrates.

---

The knowledge graph feature quickly became one of the most popular features in the AI Error Analytics platform. It not only made "knowledge mastery" instantly visible but also — for the first time — showed students and teachers the **causal chains between knowledge points**: from "weak factorization skills" to "frequent quadratic function errors" — a complete learning path in need of repair.

And it all started with a single call to `forceSimulation()`.
