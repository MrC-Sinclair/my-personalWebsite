---
title: 'Building a Micro-Frontend Architecture from Scratch: Enterprise Frontend Decomposition in Practice'
description: A complete hands-on guide to building an enterprise micro-frontend architecture with Vue3 and qiankun, covering tech selection, main app setup, SSO authentication, inter-app communication, multi-framework coexistence, and real-world pitfalls.
date: '2024-10-08'
tags:
  - Micro-Frontend
  - qiankun
  - Vue3
  - Architecture
  - Enterprise
  - Frontend Architecture
category: Architecture
draft: false
---

## Introduction: Why We Needed Micro-Frontends

> "Three teams maintaining the same codebase — merge conflicts everywhere. Fixing one bug requires deploying the entire system. Different modules are so tightly coupled that no one dares to upgrade dependencies..."

This was the real situation I faced when I took over the company's frontend architecture. Our company had multiple business modules — CRM, business analytics, supply chain management — all crammed into a single SPA project. As the team grew and business complexity increased, this monolithic architecture became increasingly unsustainable.

The specific problems we faced included:

- **Team collaboration bottleneck**: 10+ developers working on the same codebase, Git conflicts became routine
- **Tech stack lock-in**: Upgrading from Vue2 to Vue3 required verifying every module
- **Deployment coupling**: Changing a single CSS style meant redeploying everything
- **Technical debt accumulation**: Shared global state and styles across all modules

Micro-frontends were born to solve these problems. **The core idea of micro-frontends is to split a frontend application into multiple independently developed, deployed, and running mini-applications, orchestrated together through a container (main application).**

## Tech Selection: Why qiankun

In early 2024, I led the company's micro-frontend technology selection. Here's how the main options compared:

| Solution | Technical Characteristics | Learning Cost | Community | Verdict |
| --- | --- | --- | --- | --- |
| **iframe** | Native solution, natural isolation | Low | None | Not recommended: poor UX (white screen, scrolling, communication) |
| **qiankun** | Based on single-spa, ready out of the box | Medium | Mature, battle-tested | **✅ Final choice** |
| **Module Federation** | Webpack 5 native | High | Relatively new | Alternative, ecosystem wasn't mature enough |
| **Micro-app** | JD.com open-source, WebComponent-like | Medium | Growing | Alternative, stability wasn't proven enough |

Core reasons for choosing **qiankun**:

1. **Out-of-the-box**: HTML entry, style isolation, JS sandbox built-in — dramatically lowering adoption cost
2. **Battle-tested**: Widely used within Ant Group, active community, abundant troubleshooting resources
3. **Framework-agnostic**: Sub-apps can be Vue, React, or even jQuery projects — perfect for incremental migration
4. **Style isolation**: Built-in `strictStyleIsolation` mode solves global style pollution

## Step 1: Main Application Architecture

### 1.1 Building the Container App

The main application (Container) is a skeleton project based on Vue3 + TypeScript, responsible for three core duties: shared layout, sub-app route distribution, and global state sharing.

```typescript
// src/micro/apps.ts - Sub-app registration configuration
import type { RegistrableApp } from 'qiankun'

export const apps: RegistrableApp<Record<string, unknown>>[] = [
  {
    name: 'crm',
    entry: '//localhost:3001',      // Development
    container: '#sub-app-container',
    activeRule: '/crm',
    props: {
      baseUrl: '/crm',
      getGlobalToken: () => localStorage.getItem('token'),
    },
  },
  {
    name: 'dashboard',
    entry: '//localhost:3002',
    container: '#sub-app-container',
    activeRule: '/dashboard',
    props: {
      baseUrl: '/dashboard',
      getGlobalToken: () => localStorage.getItem('token'),
    },
  },
  {
    name: 'supply-chain',
    entry: '//localhost:3003',
    container: '#sub-app-container',
    activeRule: '/supply-chain',
    props: {
      baseUrl: '/supply-chain',
      getGlobalToken: () => localStorage.getItem('token'),
    },
  },
]
```

### 1.2 qiankun Initialization and Lifecycle

```typescript
// src/micro/index.ts - qiankun initialization
import { registerMicroApps, start, initGlobalState } from 'qiankun'
import { apps } from './apps'
import { useUserStore } from '@/stores/user'

// 1. Register micro-apps
registerMicroApps(apps, {
  beforeLoad: [async (app) => {
    console.log(`[qiankun] ${app.name} loading`)
    const userStore = useUserStore()
    if (!userStore.hasPermission(app.name)) {
      throw new Error(`User does not have permission to access ${app.name}`)
    }
  }],
  afterMount: [async (app) => {
    console.log(`[qiankun] ${app.name} mounted`)
  }],
  afterUnmount: [async (app) => {
    console.log(`[qiankun] ${app.name} unmounted`)
    cleanupAppSideEffects(app.name)
  }],
})

// 2. Initialize global state
const globalState = {
  user: null as UserInfo | null,
  token: null as string | null,
  permissions: [] as string[],
}

const actions = initGlobalState(globalState)

// 3. Start qiankun
start({
  sandbox: {
    experimentalStyleIsolation: true,
  },
  prefetch: 'all',
})
```

### 1.3 Layout and Route Design

The main app layout uses a "sidebar + topnav + content area" structure, where the content area is the sub-app mounting container.

## Step 2: Unified Authentication and SSO

### 2.1 Why Unified Auth?

The most frustrating UX issue in micro-frontends is "having to log into every sub-app separately." Our solution was Single Sign-On (SSO) between the main app and sub-apps.

The main app handles the SSO flow:

```typescript
// src/micro/auth.ts - SSO auth integration
const SSO_LOGIN_URL = 'https://sso.company.com/login'
const SSO_TOKEN_KEY = 'sso_token'

export async function initAuth(): Promise<void> {
  // 1. Check for existing token
  const token = localStorage.getItem(SSO_TOKEN_KEY)
  if (token) {
    // 2. Validate token
    const isValid = await validateToken(token)
    if (isValid) {
      const userInfo = await fetchUserInfo(token)
      setGlobalState({ token, user: userInfo })
      return
    }
  }

  // 3. Token invalid or missing, redirect to SSO login
  const code = getQueryParam('code')
  if (code) {
    const { token: newToken, user: newUser } = await exchangeCodeForToken(code)
    localStorage.setItem(SSO_TOKEN_KEY, newToken)
    setGlobalState({ token: newToken, user: newUser })
    window.history.replaceState({}, '', window.location.pathname)
  } else {
    window.location.href = `${SSO_LOGIN_URL}?redirect=${encodeURIComponent(window.location.href)}`
  }
}
```

Sub-apps receive the token through `props` without additional authentication:

```typescript
// Sub-app (CRM) main.ts
import { renderWithQiankun } from 'vite-plugin-qiankun'

let token = ''

renderWithQiankun({
  mount(props) {
    token = props.getGlobalToken?.() || ''
    initApp()
  },
  bootstrap() {},
  unmount() {},
  update() {},
})

function initApp() {
  request.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${token}`
    return config
  })
  createApp(App).use(router).mount('#app')
}
```

## Step 3: Inter-App Communication

### 3.1 Communication Strategy

qiankun provides three communication methods:

| Method | Use Case | Pros/Cons |
| --- | --- | --- |
| **Props** | Main → Sub (one-way) | Simple, suitable for initialization data |
| **Global State** | Bidirectional | Official solution, event-driven, good for shared state |
| **CustomEvent** | Cross-app notifications | Loose coupling, good for low-frequency events |

We used a **combination** of all three:

```typescript
// Main app - shared state management
const initialState: GlobalState = {
  user: null,
  token: null,
  permissions: [],
  appEvent: null,
}

const actions = initGlobalState(initialState)

// Notify sub-apps of events
export function emitAppEvent(type: string, payload: unknown) {
  actions.setGlobalState({
    appEvent: { type, payload },
  })
}
```

### 3.2 Real-World Scenarios

```typescript
// Scenario 1: User info changes — global state auto-syncs
actions.setGlobalState({ user: updatedUserInfo })

// Scenario 2: Logout — all sub-apps receive the event
emitAppEvent('logout', { reason: 'manual' })

// Scenario 3: Permission changes — real-time update
emitAppEvent('permission-update', { roles: ['crm_admin'] })
```

## Step 4: Unified Permission System

### 4.1 Permission Model

We designed a **three-level permission model**, centrally managed by the main app and distributed to sub-apps via the communication mechanism:

```
User
  ├── Role (e.g., CRM Admin, Supply Chain Buyer)
  │   ├── Menu permissions (which pages to show)
  │   ├── Button permissions (which actions to allow)
  │   └── Data permissions (which data scope)
  └── Organization
```

### 4.2 Permission Distribution

```typescript
// Main app - fetch full permission tree after login
async function fetchAndDistributePermissions(token: string): Promise<void> {
  const permData = await api.getFullPermissionTree(token)
  actions.setGlobalState({
    token,
    user: permData.user,
    permissions: permData.permissions,
  })
}

// Sub-app (CRM) - receive and apply permissions
export function useSubAppPermission() {
  const permissions = ref<string[]>([])
  onGlobalStateChange((state) => {
    permissions.value = state.permissions
      .filter((p: string) => p.startsWith('crm:'))
  }, true)

  function hasPermission(key: string): boolean {
    return permissions.value.includes(`crm:${key}`)
  }

  return { permissions, hasPermission }
}
```

## Step 5: Multi-Framework Coexistence

### 5.1 Incremental Migration Strategy

Rather than rewriting everything at once, we adopted an **incremental migration** approach:

```
Timeline:
├── Phase 1: Main app launches with Vue3 + CRM sub-app
├── Phase 2: Business analytics (legacy Vue2 project) joins as sub-app
├── Phase 3: Supply chain (React project) joins
└── Phase 4: Micro-frontend infrastructure matures (shared components, logging, monitoring)
```

### 5.2 Vue2 Sub-App Integration

```javascript
// Vue2 sub-app - main.js
function render(props = {}) {
  const { container } = props
  router = new VueRouter({
    base: window.__POWERED_BY_QIANKUN__ ? '/dashboard' : '/',
    mode: 'history',
    routes,
  })

  instance = new Vue({
    router,
    render: (h) => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app')
}

if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

export async function mount(props) { render(props) }
export async function unmount() {
  instance.$destroy()
  instance = null
}
```

### 5.3 React Sub-App Integration

```jsx
// React sub-app - index.jsx
function render(props = {}) {
  const { container } = props
  root = ReactDOM.createRoot(
    container
      ? container.querySelector('#root')
      : document.getElementById('root')
  )
  root.render(<App globalProps={props} />)
}

if (!window.__POWERED_BY_QIANKUN__) { render() }
export async function mount(props) { render(props) }
export async function unmount() {
  root?.unmount()
  root = null
}
```

## Step 6: Real-World Pitfalls and Solutions

### Pitfall 1: Style Leakage

**Problem**: Sub-app CSS leaking into the main app or other sub-apps. One sub-app's Element UI styles would affect the main app's Element Plus components.

**Solution**: Enable experimental style isolation and scope all sub-app styles with a root element ID.

### Pitfall 2: Asset Loading 404

**Problem**: After qiankun fetches the sub-app HTML entry, relative asset paths resolve incorrectly.

**Solution**: Dynamically set `publicPath` based on runtime environment:

```javascript
// Vite project
export default defineConfig({
  base: window.__POWERED_BY_QIANKUN__ ? '/crm/' : '/',
})
```

### Pitfall 3: Memory Leaks on App Switch

**Problem**: Frequent sub-app switching causes memory growth, especially for apps with timers or WebSocket connections.

**Solution**: Thorough cleanup in `unmount` lifecycle:

```typescript
export async function unmount() {
  instance.$destroy()
  timers.forEach(clearInterval)
  ws?.close()
  window.removeEventListener('resize', resizeHandler)
  container.innerHTML = ''
}
```

### Pitfall 4: Cross-App Navigation

**Problem**: `router.push('/dashboard/sales')` from the CRM sub-app triggers CRM's own route matching instead of navigating to the dashboard sub-app.

**Solution**: Use a unified navigation method provided by the main app via props:

```typescript
function navigateToApp(appPath: string) {
  window.history.pushState({}, '', appPath)
  // qiankun automatically matches the correct sub-app
}
```

## Results

After several months of architecture transformation:

| Metric | Before | After | Improvement |
| --- | --- | --- | --- |
| Parallel development efficiency | Severely blocked | Independent dev & deploy | **+20%** |
| Maintenance cost | Tight coupling, full regression needed | Independent deployment | **-30%** |
| Deployment frequency | Weekly | On-demand, any time | **3x improvement** |
| Tech stack flexibility | Single stack | Vue3/Vue2/React co-exist | **Choose freely** |

## Summary and Recommendations

Micro-frontends are not a silver bullet. They have clear boundaries:

### When to Use

- ✅ Multiple teams working on the same system
- ✅ System contains distinct business domains (CRM, Supply Chain, Analytics)
- ✅ Different modules need independent deployment
- ✅ Legacy systems need to coexist with new ones

### When NOT to Use

- ❌ Only 1-2 developers, low business complexity
- ❌ All features are tightly coupled with no clear boundaries
- ❌ Tight deadlines with no time for infrastructure setup

### Final Thoughts

Micro-frontends are fundamentally not a technical problem — they are an **organizational problem**. Conway's Law tells us that system structure mirrors organizational communication structure. The core value of micro-frontends is enabling teams to work independently along business boundaries, not solving a particular technical challenge.

If you understand this, the choice between qiankun, Module Federation, or Micro-app is just a tool selection. **Defining organizational boundaries and business domain splits is far more important than agonizing over tech choices.**
