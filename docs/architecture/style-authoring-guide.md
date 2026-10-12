# 风格创作指南（SOP）

> 新增一种 UI 大风格的标准流程。架构契约与红线见 [multi-style-ui.md](./multi-style-ui.md)，本文只讲「怎么动手」。
>
> 参考实现：`D:\code\codeWork\Next-generation-UI\style-lab`（其 README「场景 3：加第五种风格」是本 SOP 的原型，已适配 Nuxt SSG）。

## 0. 动笔前（在 issue / 设计稿中先回答）

1. **风格宣言**：这个风格「像什么」？一句话 + 参考图（如：像素风 = 老游戏的状态界面，角色栏 + STATUS + INVENTORY）
2. **布局轴**：全屏海报拼贴 / 居中单列 / 多栏分栏 / 命令行文本流 / 画布自由布局……**必须与已有风格不同（换轴）**，布局轴相同只换配色不算新风格
3. **tier 自评**：1 = 纯结构与样式；2 = 需要外部资源（字体、位图）；3 = 需要交互脚本
4. **页面范围**：五个页面（Index / BlogList / BlogDetail / About / Contact）一次做完还是先做 Index？先做部分页面时注册表标 `status: partial`

## 1. 七步流程

### 第 1 步：建目录

```
styles/<style-id>/          ← id 用 kebab-case 英文，如 liquid-glass
```

### 第 2 步：填 token 表

复制 `styles/_base/tokens.css` 的变量清单到 `styles/<id>/tokens.css` 填值。只填表、不新增变量；需要新变量先在 `_base` 声明（含回落值）。

记住：**不是换值、是换性质**。像素风把 `--transition` 填 `none`、`--img-rendering` 填 `pixelated`——关掉性质才像。

### 第 3 步：写页面结构组件

在 `styles/<id>/pages/` 写该风格的页面组件。组件名带风格前缀（PascalCase），如 `LiquidGlassIndex`。

- 页面结构**完全自定义**：标签、类名体系、排版结构都由该风格决定，不要参考其它风格的组件写法（防止被带偏趋同）
- 所有数据来自 composables，所有文案来自 i18n
- 区块标注 `data-section="区间名"`，配合共享层的平滑滚动

### 第 4 步：写专属组件

在 `styles/<id>/components/` 拆分该风格的组件。

- 组件名同样带风格前缀（如 `LiquidGlassWorkCard`）
- `styles/` 下组件**不走全局自动导入**，一律显式 `import`——避免跨风格同名冲突（全局 `pathPrefix: false` 生效中）
- 样式 `scoped` 或以风格根类名（如 `.style-liquid-glass`）限定作用域，禁止引用其它风格的类名

### 第 5 步：导出风格入口

`styles/<id>/index.ts` 导出页面组件映射。**页面键必须来自契约清单**
`STYLE_SUB_PATHS`（`/about` `/projects` `/blog` `/contact`），不能自造路径——
`tests/styles-structure.test.ts` 会校验这一点。

```ts
import LiquidGlassIndex from './pages/LiquidGlassIndex.vue'
import LiquidGlassAbout from './pages/LiquidGlassAbout.vue'
import LiquidGlassProjects from './pages/LiquidGlassProjects.vue'
import LiquidGlassBlog from './pages/LiquidGlassBlog.vue'
import LiquidGlassContact from './pages/LiquidGlassContact.vue'

export default {
  pages: {
    '/': LiquidGlassIndex,
    '/about': LiquidGlassAbout,
    '/projects': LiquidGlassProjects,
    '/blog': LiquidGlassBlog,
    '/contact': LiquidGlassContact,
  },
} satisfies StyleEntry
```

未做的页面键不写，薄壳路由对缺失页面返回 404。**导出 N 个键，
`pages/` 下就必须有 N 个 `.vue` 文件**（一一对应，同样由测试守住）——
这条防止「index.ts 写了映射却忘了建页面」的静默 404。
预渲染路由清单会从 `index.ts` 自动派生，不需要手工维护 `nuxt.config.ts`。

#### 子页模式（每个风格 4 个子页）

子页化后，每个风格有 5 个页面：首页（完整展示）+ 4 个子页。**子页的标准做法**：

1. **抽一个 `XxxSubPage` 外壳组件**（放 `components/`），承载子页共享的
   结构：导航 + 页脚 + 子页标题 + 内容插槽。4 个子页共用它，
   避免同一套壳写 4 遍。
2. **抽一个 `XxxSubNav` 子页导航组件**，链接指向**路由**
   （`/style/<id>/about`），不是页内锚点。注意与首页导航区分：
   首页导航是页内锚点（`#about`），子页导航是路由跳转，
   两种语义不能混用。
3. **子页文件本身是薄封装**，只指定标题与主体区块：

```vue
<template>
  <LiquidGlassSubPage :title="t('nav.about')">
    <LiquidGlassAbout />
  </LiquidGlassSubPage>
</template>
```

**这是风格内部复用，不违反「UI 不跨风格复用」红线。**
红线禁止的是 A 风格引用 B 风格的组件；同一风格内抽外壳消除重复是应该做的。

子页与首页的关系：**内容同源**。子页的区块组件应与首页共用同一批组件
（首页如果把这些区块放在单页里，就把它们抽成组件后两处共用），
不要为子页另写一套区块——否则同一份内容会有两个实现，改一处漏一处。

子页相对首页允许的差异只有**数据量**（如首页列「最新 6 条」、
博客子页列全部），数据来源仍必须是同一批 composables。

参考实现：`styles/terminal/`——`TerminalSubPage.vue`（外壳）+
`TerminalSubNav.vue`（路由导航）+ 4 个薄子页。

### 第 6 步：注册

在 `styles/registry.ts` 数组末尾加一条元信息
（`id` / `name` / `en` / `tier` / `tierLabel` / `note` / `status` / `accent` / `preview`）。
画廊页会自动列出，无需改画廊代码。

- `accent` 填该风格 `tokens.css` 的 `--c-accent` 值（画廊页用它给卡片打色彩签名）
- `status`：4 个子页都做完才是 `ready`；只做了首页填 `partial`
- `preview`：新增风格做完后跑 `scripts/gen-style-previews.mjs` 生成缩略图
  （需 dev server + `--remote-debugging-port=9222` 的 Chrome 在跑），
  然后填 `'/previews/<id>.jpg'`；还没出图时填空串，画廊卡会跳过图片不报错

### 第 7 步：验收

过一遍下文「验收清单」，全部通过才算完成。

## 2. 「不像文档」检查

拉开风格差距的不是配色，是下面这些手段（style-lab 已验证）。写新风格时对照自查：

**应该做到的：**

- [ ] **首屏撑满一屏**（如 `min-height: clamp(520px, 78vh, 820px)`）——文档的标题只占两行，海报的标题占满视线
- [ ] **标题大到不合理**（如 `clamp(58px, 9.5vw, 136px)`）——规规矩矩的字号最显旧
- [ ] **大色块对撞**——黄块紧挨黑块，而不是两个白底卡片并排
- [ ] **尺寸悬殊**——主内容占 7 栏、次内容 5 栏并下沉，而不是三等分
- [ ] **纯 CSS 几何装饰**——用 `repeating-linear-gradient` 等绘制，不依赖图片资源
- [ ] **换轴**——布局结构与其它风格根本不同（竖排 → 横排三列、单列 → 分栏）

**禁止出现的「文档感」：**

- [ ] 所有区块等宽、等距、自上而下
- [ ] 内容全部限制在同一个居中容器里
- [ ] 区块之间只靠间距分隔，没有色彩或尺寸上的强对比
- [ ] 每个区块都是「标题 + 一段话」的同一种形态

**响应式回退原则**：窄屏回退的是**布局，不是设计**——粗边框、撞色、硬阴影等风格签名必须保留。

### 子页构图六条（2026-10-11/12 实测得出，minimalism 已按前四条改造）

首页有 hero、有色块、有装饰，子页往往只剩「页头 + 一个区块」，
品质感最容易在这里塌掉。以下四条都来自真实截图，不是推测：

1. **区块头不得重复 h1**。子页的 h1 已经是「博客 / 项目集锦」，区块再挂一个同名
   eyebrow 就是重复标注；标题也不能沿用首页措辞——子页列的是全量，不叫「最新文章」。
   做法：给区块组件一个 `standalone` 开关（默认 false 保持首页语义），由子页传入。
2. **一组控件就是一个块**。标签筛选 + 关键词搜索是配套使用的，必须包在同一个容器里
   （内部 12~16px）；让它们各自成为区块网格的子项，就会被 70px 级的区块间距劈成
   三块漂浮的面板——这正是「控件摆上去」的观感来源。
3. **长列表控件必须有平铺上限**。14 篇文章带出 60 个标签，全量平铺时桌面 8 行、
   手机 15+ 行，首屏一篇文章都看不到。截断逻辑走共享层 `utils/tags.ts` 的
   `limitTags`（它保证**选中的标签一定在可见区**，否则会出现「正在筛选一个看不见的标签」）；
   「展开 / 收起」按钮才是表现层，写在风格组件里。
   **光截断不够**：14 个 chip 在 390px 宽上仍会绕 5 行，把首条正文推到折线以下，
   而且**英文比中文宽、绕得更多，这类缺陷常常只在 `en` 侧暴露**
   （实测 swiss/blog 中文 840px 勉强合格、英文 1016px 不合格）。
   窄屏（≤639px）把标签组收成**单行横向滚动条**：`flex-wrap: nowrap` + `overflow-x: auto`
   + 子项 `flex: none`，滚动条常驻可见，行尾就是展开按钮（swiss / terminal / pixel /
   neumorphism 已按此改，改后 431-640px）。
4. **窄屏 grid 的最后一个元素要显式定位**。`grid-template-columns: 1fr auto` 里若中间的
   导航显式占了 `1 / -1`，DOM 排在最后的画廊入口会被自动放置推到第 3 行、
   并落进 `1fr` 那列拉成整宽——实测看起来就是一个空的输入框。三个位置全部写死。
5. **子项写 `span N` 之前，容器必须真的给出 N 条轨道**。缺了 `grid-template-columns`，
   网格会按内容收缩出隐式轨道（实测窄到 46px），此时**没声明跨列的兄弟只占一格**——
   CJK 标题被压成逐字竖排。要么 `repeat(12, minmax(0, 1fr))` + 页头 `1 / -1`，
   要么全都显式跨列。单列堆叠同理：`minmax(0, 1fr)`，光写 `auto` 会按 max-content
   定轨，一行 nowrap 的长标题就能把整页顶出横向滚动（实测 264px）。
6. **头部动作区不能 `flex: none` 再配 `overflow: hidden`**。右侧控件一多就把标题挤到
   min-content，多出来的部分被面板裁掉——比溢出更糟：探针量不到横向溢出，
   用户也永远点不到那些筛选项。正确做法是标题 `flex: none`（不参与收缩）、
   动作区可收缩可换行，放不下时整块换到标题下一行。

**验证口径**：桌面与手机**各截一张**，并且**中英各跑一遍探针**
（`LOCALE=en node scripts/probe-subpage-layout.mjs`）。同一处缺陷可能只在
其中一个宽度或其中一个语言出现（页头布局只在 ≤767px 暴露，标签墙在英文侧才撑爆），
只看一个维度会得出错误结论。

**已经进 CI 的那部分**：`.github/workflows/deploy.yml` 的 audit job 会下载 build job 的
发布物（`.output/public`），用 `scripts/serve-static.mjs` 按生产的 Caddy 语义起来，
再以 390×844 逐页量横向溢出、h1 唯一、图片 alt、主文档 HTTP 状态、
子资源（样式表/脚本）4xx 与 **40px 命中区**，20 风格 × 5 页 × 中英两个 locale 全跑。
它不再起 `pnpm dev`——dev 的 HMR 会在 DOM 里留幽灵节点，量触控目标会出假阳性。
构图其余几条（控件成组、`span N` 的轨道、头部动作区）机器判不了，仍要靠探针与截图。

**量触控目标要量命中区，不是边框盒**：`getBoundingClientRect()` 会漏判三种真实情况——
覆盖式链接（`::after` 用 `inset: 0` 铺满整行 / 整卡）、外扩命中区（`inset` 为负）、
以及 `display: inline` 包住块级子元素时塌成 0 宽的链接。统一走
`scripts/hit-box.mjs` 的还原模型，别在探针里各自量 rect。
另外：inline 元素边框盒的高度随**字体度量**浮动（同一标题在字体加载完成前后差 6-10px），
所以外扩量不要写死 px，用 `inset: calc(50% - 20px) 0` 以自身行盒反解出「凑满 40px」的量。

## 3. 业务 / 表现判定（写代码时的自查口径）

- 能用「用户做了什么」描述的 → 业务，必须调共享层（composables / utils），禁止在风格里重新实现
- 需要用形容词描述的（"圆润地"、"硬切地"）→ 表现，归风格
- 发现自己正在写滚动逻辑、数据格式化 → 停下，收敛进共享层
- **三个必须用共享层的高频场景**（均已实现，禁止自写）：
  - 复制到剪贴板（微信号等）→ `useClipboardCopy()`（composables/useClipboardCopy.ts）
  - 导航「当前区块高亮」→ `useActiveSection()`（composables/useActiveSection.ts）
  - 内容路径转详情页 slug → `contentSlug()`（utils/content.ts）；日期格式化 → `formatDate()`（utils/format.ts）

## 4. 验收清单（PR 模板）

- [ ] 内容同源：所有文字来自 content / composables / i18n，风格组件无硬编码业务文案
- [ ] `aria-label` 等无障碍属性走 `t()`；图标按钮有 aria-label 与 tooltip
- [ ] 交互完整：无「裸交互」，遵守 AGENTS.md 交互效果规范（hover / active 按压反馈 / 状态过渡）
- [ ] `prefers-reduced-motion` 下动画尊重全局规则（`--transition: none` 类风格天然满足）
- [ ] 移动端可用：安全区域、触控目标 ≥ 40px、布局回退不丢风格签名
- [ ] 资源清理：定时器 / 监听器 / observer 在 `onUnmounted` 成对清理
- [ ] 未知路由 / 缺失页面返回 404（`createError({ statusCode: 404 })`）
- [ ] Vitest：该风格页面组件渲染测试 + 卸载无残留断言；新增共享层函数有单测
- [ ] `pnpm generate` 构建通过，该风格全部路由生成静态页
- [ ] **真实浏览器截图**（移动端 + 桌面端各一）：jsdom 不算布局，分栏 / 单列 / 溢出必须截图确认
- [ ] 注册表条目完整（id / name / en / tier / tierLabel / note / status / preview）
- [ ] **子页构图**（见 §2 子页构图六条）：eyebrow 不重复 h1、配套控件包成一块、
      长列表控件有平铺上限、窄屏页头元素显式定位、`span N` 的容器真的给出 N 条轨道、
      头部动作区不靠 `flex: none` + `overflow: hidden` 硬挤——桌面与手机各截一张确认
- [ ] **手机触控目标**：390×844 下量「命中区」（不是边框盒）≥ 40×40，
      用 `scripts/probe-touch-targets.mjs`，量出来必须是 0。
      这条已经进了 CI 闸门（见下方「验证口径」），改版后不必手工复跑
- [ ] **详情页面包屑**：用共享层 `useDetailBreadcrumb(() => props.view)` 拿 `items`，
      渲染成 `<nav aria-label="面包屑">`，末级（当前标题）标 `aria-current="page"` 且不是链接
- [ ] **代码块可读**：详情组件的 `:deep(pre)` 给了明确底色；深底的话必须加
      `:deep(.shiki span) { color: var(--shiki-dark) }`（共享层默认给的是亮色变量，
      深底上会变成深字压深底）。用 `scripts/probe-code.mjs <styleId>` 实测，
      最低 token 对比度 ≥ 4.5:1
- [ ] cspell 通过

## 5. 排错速查

| 现象                         | 原因与处理                                                       |
| ---------------------------- | ---------------------------------------------------------------- |
| 画廊里看不到新风格           | `styles/registry.ts` 未注册或 `status: planned`；强刷确认          |
| 风格路由 404                 | `index.ts` 未导出对应 slug 的页面映射，或 id 与注册表不一致        |
| 样式污染了其它风格           | 未用 scoped / 风格根类名限定作用域，或误用了全局类名               |
| 组件自动导入解析失败 / 同名冲突 | `styles/` 下组件必须显式 import，组件名带风格前缀                 |
| 切换语言后风格页文案缺失     | i18n key 未在 `zh-CN.json` / `en-US.json` 中成对声明               |
| 预渲染缺该风格页面           | 预渲染路由清单由注册表驱动，检查注册表条目与页面映射是否完整       |
| 代码块一片纯文本、没有颜色   | shiki 只输出 CSS 变量，需要共享层 `styles/_base/base.css` 的 `.shiki span` 接线（删了就静默失效）；深底风格还要自己覆盖成 `var(--shiki-dark)` |
