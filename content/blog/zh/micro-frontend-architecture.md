---
title: '从 0 到 1 搭建微前端架构：企业级前端拆分实战'
description: 基于 Vue3 + qiankun 从零搭建企业级微前端架构的完整实践分享，涵盖技术选型、主应用搭建、SSO 统一认证、主子应用通信、多框架共存等核心议题，附真实踩坑记录与解决方案。
date: '2024-10-08'
tags:
  - 微前端
  - qiankun
  - Vue3
  - 架构设计
  - 企业级
  - 前端架构
category: 架构
draft: false
---

## 引言：为什么我们需要微前端

> "三个团队维护同一个代码仓库，每次合并都要解决一堆冲突；修复一个 bug 需要部署整个系统；不同模块的开发耦合在一起，谁都不敢轻易升级依赖……"

这是我刚接手公司前端架构时面临的真实困境。公司内部有 CRM 系统、经营分析系统、供应链系统等多个业务模块，最初它们被塞进了同一个 SPA 项目中。随着团队规模扩大和业务复杂度提升，这种"巨石应用"模式越来越难以维系。

具体来说，我们面临的问题包括：

- **团队协作瓶颈**：10+ 人操作同一个代码仓库，Git 冲突成为家常便饭
- **技术栈锁定**：想升级 Vue2 到 Vue3，需要验证所有模块都兼容
- **部署耦合**：改一行样式也得全量部署，部署时间和风险同步上升
- **技术债务累积**：所有模块共用全局状态和样式，牵一发而动全身

微前端正是为了解决这些问题而生。**微前端的核心思想，是将一个前端应用拆分成多个独立开发、独立部署、独立运行的小型应用，它们通过一个主应用（容器）被组织在一起。**

## 技术选型：为什么是 qiankun

2024 年初，我主导公司微前端架构的选型，当时主流方案对比：

| 方案 | 技术特点 | 学习成本 | 社区生态 | 选型结论 |
| --- | --- | --- | --- | --- |
| **iframe** | 原生方案，天然隔离 | 低 | 无 | 不推荐：体验差（白屏、滚动、通信不便） |
| **qiankun** | 基于 single-spa，开箱即用 | 中 | 成熟，大厂验证 | **✅ 最终选择** |
| **Module Federation** | Webpack 5 原生 | 高 | 较新，文档不完善 | 备选，当时生态不够成熟 |
| **Micro-app** | 京东开源，类 WebComponent | 中 | 增长中 | 备选，但当时稳定性验证不足 |

最终选择 **qiankun** 的核心原因：

1. **开箱即用**：HTML entry、样式隔离、JS 沙箱内置，大幅降低接入成本
2. **大厂验证**：蚂蚁内部产品广泛使用，社区活跃、踩坑资料丰富
3. **框架无关**：子应用可以是 Vue、React、甚至 jQuery 项目，适合我们渐进式改造
4. **样式隔离**：内建的 `strictStyleIsolation` 模式，解决全局样式污染问题

## 第一步：主应用架构设计

### 1.1 主应用基座搭建

主应用（Container）是一个基于 Vue3 + TypeScript 的空壳项目，负责三大核心职责：公共布局、子应用路由分发、全局状态共享。

```typescript
// src/micro/apps.ts - 子应用注册配置
import type { RegistrableApp } from 'qiankun'

export const apps: RegistrableApp<Record<string, unknown>>[] = [
  {
    name: 'crm',
    entry: '//localhost:3001',      // 开发环境
    container: '#sub-app-container',
    activeRule: '/crm',
    props: {                        // 主应用传递给子应用的全局状态
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

### 1.2 qiankun 初始化与生命周期绑定

```typescript
// src/micro/index.ts - qiankun 初始化
import { registerMicroApps, start, initGlobalState } from 'qiankun'
import { apps } from './apps'
import { useUserStore } from '@/stores/user'

// 1. 注册微应用
registerMicroApps(apps, {
  beforeLoad: [async (app) => {
    console.log(`[qiankun] ${app.name} 开始加载`)
    // 加载前置检查：权限验证
    const userStore = useUserStore()
    if (!userStore.hasPermission(app.name)) {
      throw new Error(`用户无权限访问 ${app.name}`)
    }
  }],
  afterMount: [async (app) => {
    console.log(`[qiankun] ${app.name} 挂载完成`)
  }],
  afterUnmount: [async (app) => {
    console.log(`[qiankun] ${app.name} 已卸载`)
    // 清理全局副作用
    cleanupAppSideEffects(app.name)
  }],
})

// 2. 初始化全局状态
const globalState = {
  user: null as UserInfo | null,
  token: null as string | null,
  permissions: [] as string[],
}

const actions = initGlobalState(globalState)

// 3. 启动 qiankun
start({
  sandbox: {
    experimentalStyleIsolation: true,
  },
  prefetch: 'all',               // 空闲时预加载所有子应用
})
```

### 1.3 公共布局与路由设计

主应用的布局采用"侧边栏 + 顶部导航 + 内容区"结构，内容区就是子应用的挂载容器：

```vue
<!-- layouts/MicroLayout.vue -->
<template>
  <div class="micro-layout">
    <AppSidebar :menu-items="mergedMenuItems" />
    <div class="main-area">
      <AppHeader />
      <div id="sub-app-container" class="sub-app-container" />
    </div>
  </div>
</template>
```

路由层面，主应用只处理公共页面（登录页、404页），所有业务路由都分配给子应用：

```typescript
// src/router/index.ts
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/',
    component: MicroLayout,
    // 这里的 children 是 qiankun 的 activeRule 来匹配的
    // Vue Router 只负责 /crm/* 等前缀匹配到 MicroLayout
    children: [
      { path: 'crm/:pathMatch(.*)*', name: 'CRM' },
      { path: 'dashboard/:pathMatch(.*)*', name: 'Dashboard' },
      { path: 'supply-chain/:pathMatch(.*)*', name: 'SupplyChain' },
    ],
  },
]
```

## 第二步：统一身份认证与 SSO

### 2.1 为什么需要统一认证

微前端模式下，最令人头疼的问题之一是"每个子应用都要登录一次"。如果 CRM 系统登录了，切换到经营分析系统还要再登录一次，体验极其割裂。

我们的解决方案是**在主子应用之间实现单点登录（SSO）**：

```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  主应用       │     │  Auth Server │     │  子应用       │
│  (Container)  │     │  (SSO)       │     │  (Sub App)    │
└──────┬───────┘     └──────┬──────┘     └──────┬───────┘
       │                     │                    │
       │ 1. 访问 /crm/list   │                    │
       │────────────────────>│                    │
       │                     │                    │
       │ 2. Cookie 含 token  │                    │
       │<────────────────────│                    │
       │                     │                    │
       │ 3. 启动 crm 子应用  │                    │
       │─────────────────────────────────────────>│
       │                     │                    │
       │       4. props.token 传递               │
       │<─────────────────────────────────────────│
       │                     │                    │
       │ 5. 子应用用 token   │                    │
       │    请求业务 API     │                    │
```

### 2.2 具体实现

主应用负责 SSO 认证流程：

```typescript
// src/micro/auth.ts - SSO 认证整合
import type { UserInfo } from '@/types/user'

const SSO_LOGIN_URL = 'https://sso.company.com/login'
const SSO_TOKEN_KEY = 'sso_token'

export async function initAuth(): Promise<void> {
  // 1. 检查本地是否已有 token
  const token = localStorage.getItem(SSO_TOKEN_KEY)
  if (token) {
    // 2. 验证 token 有效性
    const isValid = await validateToken(token)
    if (isValid) {
      const userInfo = await fetchUserInfo(token)
      setGlobalState({ token, user: userInfo })
      return
    }
  }

  // 3. token 无效或不存在，跳转 SSO 登录页
  //    SSO 登录成功后回跳时携带 code 参数
  const code = getQueryParam('code')
  if (code) {
    const { token: newToken, user: newUser } = await exchangeCodeForToken(code)
    localStorage.setItem(SSO_TOKEN_KEY, newToken)
    setGlobalState({ token: newToken, user: newUser })
    // 清除 URL 中的 code 参数
    window.history.replaceState({}, '', window.location.pathname)
  } else {
    window.location.href = `${SSO_LOGIN_URL}?redirect=${encodeURIComponent(window.location.href)}`
  }
}
```

子应用通过 `props` 接收 token，无需额外认证：

```typescript
// 子应用 (CRM) 的 main.ts
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun'

let token = ''

renderWithQiankun({
  mount(props) {
    // 从主应用传递的 props 中获取 token
    token = props.getGlobalToken?.() || ''
    initApp()
  },
  bootstrap() {},
  unmount() {},
  update() {},
})

function initApp() {
  // axios 实例注入 token
  request.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${token}`
    return config
  })
  // 渲染应用
  createApp(App).use(router).mount('#app')
}
```

## 第三步：主子应用通信机制

### 3.1 通信方案选择

qiankun 提供了三种通信方式：

| 方式 | 适用场景 | 优缺点 |
| --- | --- | --- |
| **Props 传递** | 主应用 → 子应用（单向） | 简单直接，适合初始化数据传递 |
| **Global State (initGlobalState)** | 主子应用双向通信 | 官方方案，事件驱动，适合共享状态 |
| **自定义事件 (CustomEvent)** | 跨应用事件通知 | 松耦合，适合低频次事件通知 |

我们在项目中**组合使用**这三种方式：

```typescript
// 主应用 - 共享状态管理
// src/micro/global-state.ts
import { initGlobalState, MicroAppStateActions } from 'qiankun'
import { useUserStore } from '@/stores/user'

interface GlobalState {
  user: UserInfo | null
  token: string | null
  permissions: string[]
  appEvent: { type: string; payload: unknown } | null
}

const initialState: GlobalState = {
  user: null,
  token: null,
  permissions: [],
  appEvent: null,
}

const actions: MicroAppStateActions = initGlobalState(initialState)

// 子应用监听状态变化（在子应用的 mount 钩子中）
export function useQiankunGlobalState() {
  // 子应用通信封装，内部使用 qiankun 的 onGlobalStateChange
}

// 通知子应用发生的事件
export function emitAppEvent(type: string, payload: unknown) {
  actions.setGlobalState({
    appEvent: { type, payload },
  })
}
```

### 3.2 实战中的通信场景

```typescript
// 场景 1：用户信息变更 — 全局状态自动同步
// 当用户在 CRM 中修改了个人信息，主应用收到通知后更新全局状态
actions.setGlobalState({
  user: updatedUserInfo,
})

// 场景 2：退出登录 — 所有子应用收到事件
// 主应用广播退出事件
emitAppEvent('logout', { reason: 'manual' })
// 所有子应用监听此事件，清理本地状态
onGlobalStateChange((state) => {
  if (state.appEvent?.type === 'logout') {
    clearLocalState()
    // 由主应用处理路由跳转，子应用不需要关心
  }
})

// 场景 3：权限变更 — 实时更新
// 管理员为用户新增角色，子应用响应式更新界面
emitAppEvent('permission-update', { roles: ['crm_admin'] })
```

## 第四步：统一权限体系

### 4.1 权限模型设计

我们采用**三级权限模型**，在主应用统一管理，通过通信机制下发到各子应用：

```
用户
  ├── 角色（如：CRM管理员、供应链采购员）
  │   ├── 菜单权限（能看哪些页面）
  │   ├── 按钮权限（能点哪些按钮）
  │   └── 数据权限（能看哪些数据范围）
  └── 组织归属
```

### 4.2 权限数据下发

```typescript
// 主应用 - 登录成功后查询完整权限树
async function fetchAndDistributePermissions(token: string): Promise<void> {
  const permData = await api.getFullPermissionTree(token)

  actions.setGlobalState({
    token,
    user: permData.user,
    permissions: permData.permissions,
  })

  // 子应用根据 activeRule 前缀过滤自己相关的权限
  // 例如 crm 子应用只关心以 'crm:' 开头的权限 key
}
```

```typescript
// 子应用（CRM）- 接收并应用权限
// 封装一个 composable 统一处理子应用权限
export function useSubAppPermission() {
  const permissions = ref<string[]>([])

  // 监听主应用下发的权限变更
  onGlobalStateChange((state) => {
    permissions.value = state.permissions
      .filter((p: string) => p.startsWith('crm:'))
  }, true)

  // 检查权限
  function hasPermission(key: string): boolean {
    return permissions.value.includes(`crm:${key}`)
  }

  return { permissions, hasPermission }
}
```

### 4.3 菜单栏统一聚合

菜单数据在主应用维护，主应用从全部权限中计算当前用户的可用菜单，然后在侧边栏渲染：

```typescript
// 主应用 - 菜单数据管理
// 各子应用注册自己的菜单
const subAppMenus: Record<string, MenuItem[]> = {
  crm: [
    { path: '/crm/dashboard', label: 'CRM 概览', icon: 'dashboard' },
    { path: '/crm/leads', label: '线索管理', icon: 'leads' },
    { path: '/crm/customers', label: '客户管理', icon: 'customers' },
  ],
  dashboard: [
    { path: '/dashboard/sales', label: '销售统计', icon: 'chart' },
    { path: '/dashboard/inventory', label: '库存分析', icon: 'inventory' },
  ],
  // ...
}

// 根据用户权限过滤菜单
const mergedMenuItems = computed(() => {
  const permSet = new Set(permissions.value)
  return Object.values(subAppMenus)
    .flat()
    .filter((menu) => {
      const permKey = `menu:${menu.path.replace(/\//g, ':')}`
      return permSet.has(permKey)
    })
})
```

## 第五步：多框架多系统共存

### 5.1 渐进式改造策略

我们没有选择"一刀切"把全部系统重写，而是采用**渐进式迁移**策略：

```
时间线：
├── 第一阶段：主应用上线新框架（Vue3）+ CRM 子系统接入
├── 第二阶段：经营分析系统（老 Vue2 项目）以子应用方式接入
├── 第三阶段：供应链系统（React 项目）接入
└── 第四阶段：微前端基建完善（公共组件、日志、监控）
```

### 5.2 Vue2 子应用接入

老项目通常是 Vue2 + Webpack 栈，接入 qiankun 需要做一些改造：

```javascript
// Vue2 子应用 - main.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

let instance = null
let router = null

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

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

// qiankun 生命周期
export async function bootstrap() {
  // 只执行一次
}

export async function mount(props) {
  render(props)
}

export async function unmount() {
  instance.$destroy()
  instance = null
  router = null
}
```

### 5.3 React 子应用接入

React 子应用的改造方式类似，只是生命周期实现不同：

```jsx
// React 子应用 - index.js
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

let root = null

function render(props = {}) {
  const { container } = props
  root = ReactDOM.createRoot(
    container
      ? container.querySelector('#root')
      : document.getElementById('root')
  )
  root.render(
    <React.StrictMode>
      <App globalProps={props} />
    </React.StrictMode>
  )
}

if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

export async function bootstrap() {}
export async function mount(props) { render(props) }
export async function unmount() {
  root?.unmount()
  root = null
}
```

## 第六步：踩坑记录与解决方案

### 坑 1：样式污染

**问题**：子应用的 CSS 泄漏到主应用或其他子应用中。具体表现是某个子应用的 Element UI 样式影响了主应用的 Element Plus 组件。

**解决方案**：

```typescript
// 1. 开启 qiankun 的实验性样式隔离
start({
  sandbox: {
    experimentalStyleIsolation: true,
  },
})

// 2. 子应用主动加 CSS 前缀（更彻底）
// 在 vue.config.js 中配置
// 或者给根元素加 id，所有样式增加父级选择器
#crm-app .el-table { ... }
```

**补充**：`experimentalStyleIsolation` 对 Shadow DOM 的模拟还不够完美，遇到特殊场景（如第三方 UI 库的动态样式）需要手动处理。

### 坑 2：子应用资源加载 404

**问题**：子应用打包后，CSS/JS 资源路径使用相对路径，qiankun 从子应用 entry 获取 HTML 后，资源引用路径解析错误。

**解决方案**：

```javascript
// 子应用 publicPath 根据运行环境动态设置
// Vue CLI 项目
module.exports = {
  publicPath: window.__POWERED_BY_QIANKUN__ ? '/crm/' : '/',
}

// Vite 项目
export default defineConfig({
  base: window.__POWERED_BY_QIANKUN__ ? '/crm/' : '/',
})
```

### 坑 3：子应用切换后内存泄漏

**问题**：频繁在子应用间切换，发现浏览器内存持续增长，尤其是包含定时器、WebSocket 连接的子应用。

**解决方案**：

```typescript
// 子应用 unmount 时彻底清理
export async function unmount() {
  // 1. 销毁 Vue/React 实例
  instance.$destroy()
  // 2. 清理定时器
  timers.forEach(clearInterval)
  // 3. 断开 WebSocket
  ws?.close()
  // 4. 清理全局事件监听
  window.removeEventListener('resize', resizeHandler)
  // 5. 移除 DOM
  container.innerHTML = ''
}
```

### 坑 4：子应用路由跳转子应用

**问题**：用户在 CRM 中点击链接跳转到经营分析系统，直接使用 `router.push('/dashboard/sales')` 会触发 CRM 子应用的路由匹配。

**解决方案**：

```typescript
// 统一使用主应用提供的跳转方法
// 通过 props 传递给子应用
function navigateToApp(appPath: string) {
  // 使用 history.pushState 直接操作浏览器历史
  window.history.pushState({}, '', appPath)
  // qiankun 会自动匹配对应子应用的 activeRule
}

// 子应用中
props.navigateToApp('/dashboard/sales')
```

### 坑 5：开发环境跨域问题

**问题**：主应用在 localhost:8080，子应用在 localhost:3001，跨域请求被拦截。

**解决方案**：

```typescript
// vite.config.ts - 子应用配置跨域头
export default defineConfig({
  server: {
    port: 3001,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
})
```

## 收益与数据

经过近几个月的架构改造，我们拿到了以下数据：

| 指标 | 改造前 | 改造后 | 提升 |
| --- | --- | --- | --- |
| 团队并行开发效率 | 阻塞严重 | 独立开发、独立发布 | **提升 20%** |
| 系统维护成本 | 高耦合，改一处需全面回归 | 独立部署，风险可控 | **降低 30%** |
| 部署频率 | 每周一次 | 按需部署，随时发布 | **提升 3 倍** |
| 技术栈灵活性 | 单一技术栈 | Vue3/Vue2/React 共存 | **按需选择** |

## 总结与建议

微前端不是一个"银弹"，它有明确的适用边界。如果你正在评估是否要在项目中引入微前端，这里有一些建议：

### 适合微前端的场景

- ✅ 多个团队共同开发同一个系统
- ✅ 系统包含多个独立业务域（CRM、供应链、数据分析）
- ✅ 需要对不同模块进行独立部署和独立发布
- ✅ 存在需要长期共存的新旧系统

### 不适合微前端的场景

- ❌ 团队只有 1-2 人，业务复杂度不高
- ❌ 所有功能都紧密耦合，无法清晰划分边界
- ❌ 开发周期紧张，没有时间做基础设施搭建

### 最后的一点心得

微前端的本质不是技术问题，而是**组织问题**。**康威定律**（Conway's Law）告诉我们：系统的结构会反映组织的沟通结构。微前端的核心价值是让团队可以按照业务边界独立工作，而不是为了解决某个技术难题。

如果你理解了这一点，那么无论选择 qiankun 还是 Module Federation、Micro-app，都只是实现这个目标的工具而已。**明确组织边界与业务域划分，比纠结技术选型重要得多。**
